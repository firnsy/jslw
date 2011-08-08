/*
 * This file is part of the JavaScript Lightweight Widget framework
 *
 * Copyright (C) 2010-2011, Ian Firns        <firnsy@securixlive.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License Version 2 as
 * published by the Free Software Foundation.  You may not use, modify or
 * distribute this program under any other version of the GNU General
 * Public License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
*/

//
// IMPLEMENTATION
//

Button = function(p, x, y, w, h, c)
{
  // call our super constructure
//  this.base = Widget;
//  this.base(p, x, y, w, h);
  Widget.apply(this, arguments);

  this.image_overlay = null;

  // stores type and states of button
  this.type_states = {
    'types': ['_default'],
    'active_type': '_default',
    'states': ['_default'],
    'active_state': '_default',
    'objects': {
      '_default': {
        '_default': {
            'image': new Image(),
            'bounds': new Rect(this.bounds),
        }
      }
    }
  };

  this.type_alignment_horizontal = 'center';
  this.type_alignment_vertical = 'middle';

  // overlay
  this.overlay = new Rect(this.bounds);
  this.overlay_alignment_horizontal = 'center';
  this.overlay_alignment_vertical = 'middle';

  // turn of clipping to handle the overlay
  this.clip = false;

  var this_object = this;
  this.cb = {};
}


Button.prototype = new Widget;


Button.prototype.set_image_overlay = function(path)
{
  this.image_overlay = new Image();

  this.image_overlay.src = path;
  this.image_overlay.onerror = function(){ console.error('Unable to load image: ' + this.src); };

  var this_object = this;
  this.image_overlay.onload = function() {
    this_object.overlay_calculate_offset();
    this_object.set_dirty(true);
  };

  // default image is up
//  this.image = this.image_up;
}


Button.prototype.set_overlay_alignment = function(h, v)
{
  this.set_overlay_alignment_horizontal(h);
  this.set_overlay_alignment_vertical(v);
}


Button.prototype.set_overlay_alignment_horizontal = function(type)
{
  type = type || 'left';

  switch( type )
  {
    case 'left':
    case 'center':
    case 'right':
      this.overlay_alignment_horizontal = type;
      break;
    default:
      this.overlay_alignment_horizontal = 'left';
      break;
  }

  this.overlay_calculate_offset();
}


Button.prototype.set_overlay_alignment_vertical = function(type)
{
  type = type || 'top';

  switch( type )
  {
    case 'top':
    case 'middle':
    case 'bottom':
      this.overlay_alignment_vertical = type;
      break;
    default:
      this.overlay_alignment_vertical = 'middle';
      break;
  }

  this.overlay_calculate_offset();
}

// TODO: Private
Button.prototype.overlay_calculate_offset = function()
{
  this.overlay.x = this.bounds.x;
  this.overlay.y = this.bounds.y;
  this.overlay.w = this.image_overlay.width || this.overlay.w;
  this.overlay.h = this.image_overlay.height || this.overlay.h;

  // horizontal alignment
  switch( this.overlay_alignment_horizontal )
  {
    case 'center':
      this.overlay.x -= (this.overlay.w - this.bounds.w) / 2;
      break;
    case 'bottom':
      this.overlay.x -= (this.overlay.w - this.bounds.w);
      break;
  }

  // middle alignment
  switch( this.overlay_alignment_vertical )
  {
    case 'middle':
      this.overlay.y -= (this.overlay.h - this.bounds.h) / 2;
      break;
    case 'bottom':
      this.overlay.y -= (this.overlay.h - this.bounds.h);
      break;
  }
}


Button.prototype.add_types = function(type)
{
  type = type || [];

  if( ! type instanceof Array )
    type = [ type ];

  for( t in type )
  {
    var new_type = type[t];

    if ( this.type_states['types'].indexOf(new_type) == -1 )
    {
      // store the known type
      this.type_states['types'].push(new_type);

      // add default image for types
      this.type_states['objects'][new_type] = {
        '_default': {
          'image': null,
          'bounds': new Rect(this.bounds),
          'animate': false
        }
      };

      // if no active type defined yet then define
      if( this.type_states['active_type'] == null )
        this.type_states['active_type'] = new_type;
    }
    else
      console.log("Type already exists: " + new_type);
  }
}


Button.prototype.set_active_type = function(type)
{
  if ( type == null || type == '' )
    type = '_default';

  if ( this.type_states['types'].indexOf(type) == -1 )
  {
    console.error('Type ' + type + ' is not available.');
    return;
  }

  this.type_states['active_type'] = type;
  this.set_dirty(true);
}


Button.prototype.set_type_image_default = function(type, path)
{
  if ( this.type_states['types'].indexOf(type) == -1 )
  {
    alert("Type " + type + " is not available");
    return;
  }

  this.type_states['objects'][type]['_default']['image'] = new Image();

  this.type_states['objects'][type]['_default']['image'].src = path;
  this.type_states['objects'][type]['_default']['image'].onerror = function(){ alert("Unable to load image: " + this.src); };

  var this_object = this;
  this.type_states['objects'][type]['_default']['image'].onload = function() {
    this_object.type_calculate_offset(type);
    this_object.set_dirty(true);
  };
}


Button.prototype.set_type_alignment = function(t, h, v)
{
  this.set_overlay_type_horizontal(t, h);
  this.set_overlay_type_vertical(t, v);
}


Button.prototype.set_type_alignment_horizontal = function(type, mode)
{
  if ( this.type_states['types'].indexOf(type) == -1 )
  {
    console.error('Type ' + type + ' is not available.');
    return;
  }

  mode = mode || 'left';

  switch( type )
  {
    case 'left':
    case 'center':
    case 'right':
      this.type_alignment_horizontal = mode;
      break;
    default:
      this.type_alignment_horizontal = 'left';
      break;
  }

  this.overlay_calculate_offset();
}


Button.prototype.set_type_alignment_vertical = function(mode)
{
  if ( this.type_states['types'].indexOf(type) == -1 )
  {
    console.error('Type ' + type + ' is not available.');
    return;
  }

  mode = mode || 'top';

  switch( mode )
  {
    case 'top':
    case 'middle':
    case 'bottom':
      this.type_alignment_vertical = type;
      break;
    default:
      this.type_alignment_vertical = 'middle';
      break;
  }

  this.mode_calculate_offset();
}


// TODO: Private
Button.prototype.type_calculate_offset = function(types)
{
  // resize all types if no type defined
  types = types || this.type_states['types'];

  for( t in types )
  {
    var type = types[t];

    // resize for all states include default
    var states = this.type_states['states'];

    for( s in states )
    {
      var state = states[s];

      if( ! this.type_states['objects'][type] ||
          ! this.type_states['objects'][type][state] )
        continue;

      this.type_states['objects'][type][state]['bounds'].x = this.bounds.x;
      this.type_states['objects'][type][state]['bounds'].y = this.bounds.y;

      if( this.type_states['objects'][type][state]['image'] instanceof Image )
      {
        this.type_states['objects'][type][state]['bounds'].w = this.type_states['objects'][type][state]['image'].width || this.bounds.w;
        this.type_states['objects'][type][state]['bounds'].h = this.type_states['objects'][type][state]['image'].height || this.bounds.h;
      }
      else
      {
        this.type_states['objects'][type][state]['bounds'].w = this.bounds.w;
        this.type_states['objects'][type][state]['bounds'].h = this.bounds.h;
      }

      // horizontal alignment
      switch( this.type_alignment_horizontal )
      {
        case 'center':
          this.type_states['objects'][type][state]['bounds'].x -= (this.type_states['objects'][type][state]['bounds'].w - this.bounds.w) / 2;
          break;
        case 'bottom':
          this.type_states['objects'][type][state]['bounds'].x -= (this.type_states['objects'][type][state]['bounds'].w - this.bounds.w);
          break;
      }

      // middle alignment
      switch( this.type_alignment_vertical )
      {
        case 'middle':
          this.type_states['objects'][type][state]['bounds'].y -= (this.type_states['objects'][type][state]['bounds'].h - this.bounds.h) / 2;
          break;
        case 'bottom':
          this.type_states['objects'][type][state]['bounds'].y -= (this.type_states['objects'][type][state]['bounds'].h - this.bounds.h);
          break;
      }
    }
  }
}


Button.prototype.add_states = function(state)
{
  state = state || [];

  if( ! state instanceof Array )
    state = [ state ];

  for( s in state )
  {
    var new_state = state[s];

    if ( this.type_states['states'].indexOf(new_state) == -1 )
    {
      this.type_states['states'].push(new_state);

      if( this.type_states['active_state'] = null )
        this.type_states['active_state'] = state[s];
    }
    else
      console.log("State already exists: " + s);
  }
}


Button.prototype.set_active_state = function(state)
{
  if ( state == null || state == '' )
    state = '_default';

  if ( this.type_states['states'].indexOf(state) == -1 )
  {
    alert("State " + state + " is not available");
    return;
  }

  this.type_states['active_state'] = state;
  this.set_dirty(true);
}


Button.prototype.set_state_image_default = function(state, path)
{
  if ( this.type_states['states'].indexOf(state) == -1 )
  {
    alert('State "' + state + '" is not available');
    return;
  }

  // add default image for types
  this.type_states['objects']['_default'][state] = {
    'image': new Image(),
    'bounds': new Rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h),
    'animate': false
  };

  this.type_states['objects']['_default'][state]['image'].src = path;
  this.type_states['objects']['_default'][state]['image'].onerror = function(){ alert("Unable to load image: " + this.src); };

  var this_object = this;
  this.type_states['objects']['_default'][state]['image'].onload = function() {
    this_object.type_calculate_offset();
    this_object.set_dirty(true);
  };
}


Button.prototype.set_type_state_image = function(type, state, path)
{
  if ( this.type_states['types'].indexOf(type) == -1 )
  {
    alert("Type " + type + " is not available");
    return;
  }
  else if ( this.type_states['states'].indexOf(state) == -1 )
  {
    alert("State " + state + " is not available");
    return;
  }

  // add object if not instatiated yet
  if ( ! this.type_states['objects'][type][state] )
  {
    this.type_states['objects'][type][state] = {
      'image':  new Image(),
      'bounds':  new Rect(0, 0, 0, 0)
    }
  }

//  this.type_states['objects'][type][state]['image'] = new Image();

  this.type_states['objects'][type][state]['image'].src = path;
  this.type_states['objects'][type][state]['image'].onerror = function(){ alert('Unable to load image: ' + this.src); };

  var this_object = this;
  this.type_states['objects'][type][state]['image'].onload = function() {
    this_object.type_calculate_offset(type);
    this_object.set_dirty(true);
  };
}


Button.prototype.set_image_down = function(path)
{
  this.image_down = new Image();

  this.image_down.src = path;
  this.image_down.onerror = function(){ alert("Unable to load image: " + this.src); };

  var this_object = this;
  this.image_down.onload = function() { this_object.set_dirty(true); };
}

//
// RENDERING

Button.prototype.render_widget = function(context)
{

  if( this.background_color instanceof Color )
  {
    context.fillStyle = this.background_color.getRGBA(Math.round(this.alpha * 255));
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  // draw the background image
  if( this.background_image instanceof Image &&
      this.background_image.src != '' &&
      this.background_image.complete )
  {
    context.drawImage(this.background_image, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  var type = this.type_states['active_type'];

  // draw type as appropriate
  if( type != null &&
      type != '' )
  {
    var state = ( this.type_states['active_state'] != null &&
                  this.type_states['active_state'] != '' ) ? this.type_states['active_state'] : '_default';

    // TODO: if state not available for type we need have a default type
    if( ! (state in this.type_states['objects'][type]) )
    {
      if( state in this.type_states['objects']['_default'] )
        type = '_default';
      else
        state = '_default';
    }

    if( 'image' in this.type_states['objects'][type][state] &&
        this.type_states['objects'][type][state]['image'].src != '' &&
        this.type_states['objects'][type][state]['image'].complete )
    {
      context.drawImage(this.type_states['objects'][type][state]['image'],
                        this.type_states['objects'][type][state]['bounds'].x,
                        this.type_states['objects'][type][state]['bounds'].y,
                        this.type_states['objects'][type][state]['bounds'].w,
                        this.type_states['objects'][type][state]['bounds'].h);
    }
  }

  // draw the overlay if exists
  if( this.is_pressed &&
      this.image_overlay instanceof Image &&
      this.image_overlay.src != '' &&
      this.image_overlay.complete )
  {
    context.drawImage(this.image_overlay, this.overlay.x, this.overlay.y, this.overlay.w, this.overlay.h);
  }


  this.render_caption(context);
}


