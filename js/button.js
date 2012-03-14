/*
 * This file is part of the JavaScript Lightweight Widget framework
 *
 * Copyright (C) 2010-2012, Ian Firns        <firnsy@securixlive.com>
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

var Button = Widget.extend({
  constructor: function(p, r, c)
  {
    // call our super constructor
    this.base.apply(this, arguments);

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
              'animate': false
          }
        }
      }
    };

    this.type_alignment_horizontal = 'center';
    this.type_alignment_vertical = 'middle';

    // overlay
    this.overlay = null;
    this.overlay_alignment_horizontal = 'center';
    this.overlay_alignment_vertical = 'middle';
    this.overlay_image = null;

    // turn of clipping to handle the overlay
    this.clip = false;

    this._type = 'Button';
  },


  set_overlay_image: function(i)
  {
    if( i instanceof Image )
    {
      this.overlay_image = i;

      if( i.complete && i.width > 0 )
      {
        this.overlay_calculate_offset();
        this.set_dirty(true);
      }
    }
    else
    {
      this.overlay_image = new Image();

      this.overlay_image.src = i;
      this.overlay_image.onerror = function(){ console.error('Unable to load image: ' + this.src); };

      var self = this;
      this.overlay_image.onload = function() {
        self.overlay_calculate_offset();
        self.set_dirty(true);
      };
    }
  },


  set_overlay_alignment: function(h, v)
  {
    this.set_overlay_alignment_horizontal(h);
    this.set_overlay_alignment_vertical(v);
  },


  set_overlay_alignment_horizontal: function(type)
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
  },


  set_overlay_alignment_vertical: function(type)
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
  },

  // TODO: Private
  overlay_calculate_offset: function()
  {
    if( this.overlay == null )
      this.overlay = new Rect(this.bounds);
    else
    {
      this.overlay.x = this.bounds.x;
      this.overlay.y = this.bounds.y;
    }

    this.overlay.w = this.overlay_image.width || this.overlay.w;
    this.overlay.h = this.overlay_image.height || this.overlay.h;

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
  },


  add_types: function(type)
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
  },


  set_active_type: function(type)
  {
    if ( type == null || type == '' )
      type = '_default';

    // check if we are already active
    if (this.type_states['active_type'] === type)
      return;

    if ( this.type_states['types'].indexOf(type) == -1 )
    {
      console.error('Type ' + type + ' is not available.');
      return;
    }

    this.type_states['active_type'] = type;

    var ts = this.type_states['objects'][type][this.type_states['active_state']];

    this.set_dirty(true);
  },


  set_type_image_default: function(type, i)
  {
    if ( this.type_states['types'].indexOf(type) == -1 )
    {
      console.warn("Type " + type + " is not available");
      return;
    }

    if( i instanceof Image )
    {
      this.type_states['objects'][type]['_default']['image'] = i;

      if( i.complete && i.width > 0 )
      {
        this.type_calculate_offset();
        this.set_dirty(true);
      }
    }
    else
    {
      this.type_states['objects'][type]['_default']['image'] = new Image();

      this.type_states['objects'][type]['_default']['image'].src = i;
      this.type_states['objects'][type]['_default']['image'].onerror = function(){ console.warn("Unable to load image: " + this.src); };

      var self = this;
      this.type_states['objects'][type]['_default']['image'].onload = function() {
        self.type_calculate_offset(type);
        self.set_dirty(true);
      };
    }
  },


  set_type_alignment: function(t, h, v)
  {
    this.set_overlay_type_horizontal(t, h);
    this.set_overlay_type_vertical(t, v);
  },


  set_type_alignment_horizontal: function(type, mode)
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

    this.type_calculate_offset();
  },


  set_type_alignment_vertical: function(mode)
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

    this.type_calculate_offset();
  },


  // TODO: PRIVATE
  type_calculate_offset: function(types)
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

        // vertical alignment
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
  },


  add_states: function(state)
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

        if( this.type_states['active_state'] == null )
          this.type_states['active_state'] = state[s];
      }
      else
        console.log("State already exists: " + s);
    }
  },

  get_active_state: function()
  {
    return this.type_states['active_state'];
  },

  set_active_state: function(state)
  {
    if ( state == null || state == '' ) {
      state = '_default';
    }

    if ( this.type_states['states'].indexOf(state) == -1 )
    {
      console.warn("State " + state + " is not available");
      return;
    }

    // check if we're already in the active state
    if (this.type_states['active_state'] == state) {
      return;
    }

    // set our widget state
    this.type_states['active_state'] = state;

    // FIXME:

    var type = this.type_states['active_type'];

    // TODO: if state not available for type we need have a default type
    if( ! (state in this.type_states['objects'][type]) )
    {
      if( state in this.type_states['objects']['_default'] )
        type = '_default';
      else
        state = '_default';
    }

    var ts = this.type_states['objects'][type][state];

    if( ts && ts['animate'] && this.animate.length == 0)
    {
      var frames_w = ts['image'].width / ts['animate_bounds'].w;
      var frames_h = ts['image'].height / ts['animate_bounds'].h;
      var frames = frames_w * frames_h;

      var delay = Math.floor(ts['animate_speed'] / ANIMATE_FRAME_TIME_SPACING);
      if( delay <= 0 )
        delay = 1;

      // push the animation onto the stack
      this.animate.push({
        frames:   frames * delay,
        index:    0,
        loop:     ts['animate_loops'] == -1,
        process:  function(frame) {
          if( (frame % delay) == 0 )
          {
            // advance in the x (these are noops if vertically stacked only)
            ts['animate_bounds'].x += ts['animate_bounds'].w;
            ts['animate_bounds'].x %= ts['bounds'].w;

            // advance in the y (these are noops if horizontally stacked only)
            if( ts['animate_bounds'].x === 0 ) {
              ts['animate_bounds'].y += ts['animate_bounds'].h;
              ts['animate_bounds'].y %= ts['bounds'].h;
            }
          }
        }
      });
    }
    // otherwise ensure animation stack is cleared
    else
      // TODO: this is brute force, we should only clear any button state animations
      this.animate = [];

    this.set_dirty(true);
  },


  set_state_image_default: function(state, i)
  {
    if ( this.type_states['states'].indexOf(state) == -1 )
    {
      console.warn('State "' + state + '" is not available');
      return;
    }

    // add default image for types
    this.type_states['objects']['_default'][state] = {
      'bounds': new Rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h),
      'animate': false
    };

    if( i instanceof Image )
    {
      this.type_states['objects']['_default'][state]['image'] = i;

      if( i.complete && i.width > 0 )
      {
        this.type_calculate_offset();
        this.set_dirty(true);
      }
    }
    else
    {
      this.type_states['objects']['_default'][state]['image'] = new Image(),


      this.type_states['objects']['_default'][state]['image'].src = i;
      this.type_states['objects']['_default'][state]['image'].onerror = function(){ console.warn("Unable to load image: " + this.src); };

      var self = this;
      this.type_states['objects']['_default'][state]['image'].onload = function() {
        self.type_calculate_offset();
        self.set_dirty(true);
      };
    }
  },


  set_state_image_animate: function(state, s, l)
  {
    if ( this.type_states['states'].indexOf(state) == -1 )
    {
      console.warn('State "' + state + '" is not available');
      return;
    }

    var ts = this.type_states['objects']['_default'][state];
    ts['animate'] = true;
    ts['animate_bounds'] = new Rect(0, 0, this.bounds.w, this.bounds.h);
    ts['animate_speed'] = s;
    ts['animate_loops'] = l;
  },


  set_type_state_image: function(type, state, i)
  {
    if ( this.type_states['types'].indexOf(type) == -1 )
    {
      console.warn("Type " + type + " is not available");
      return;
    }
    else if ( this.type_states['states'].indexOf(state) == -1 )
    {
      console.warn("State " + state + " is not available");
      return;
    }

    // add object if not instatiated yet
    if ( ! this.type_states['objects'][type][state] )
    {
      this.type_states['objects'][type][state] = {
        'image':  null,
        'bounds':  new Rect(0, 0, 0, 0)
      }
    }

    if( i instanceof Image )
    {
      this.type_states['objects'][type][state]['image'] = i;

      if( i.complete && i.width > 0 )
      {
        this.type_calculate_offset();
        this.set_dirty(true);
      }
    }
    else
    {
      if( this.type_states['objects'][type][state]['image'] == null )
        this.type_states['objects'][type][state]['image'] = new Image();

      this.type_states['objects'][type][state]['image'].src = i;
      this.type_states['objects'][type][state]['image'].onerror = function(){ console.warn('Unable to load image: ' + this.src); };

      var self = this;
      this.type_states['objects'][type][state]['image'].onload = function() {
        self.type_calculate_offset(type);
        self.set_dirty(true);
      };
    }
  },


  set_image_down: function(path)
  {
    this.image_down = new Image();

    this.image_down.src = path;
    this.image_down.onerror = function() { console.warn('Unable to load image: ' + this.src); };

    var self = this;
    this.image_down.onload = function() { self.set_dirty(true); };
  },

  //
  // RENDERING

  render_widget: function(context)
  {

    if( this.background_color instanceof Color )
    {
      context.fillStyle = this.background_color.get_rgba(Math.round(this.alpha * 255));
      context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
    }

    // draw the background image
    if( this.background_image instanceof Image &&
        this.background_image.width > 0 )
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

      var ts = this.type_states['objects'][type][state];

      if( 'image' in ts &&
          ts['image'] instanceof Image &&
          ts['image'].width > 0 )
      {
        // TODO: optimise this hack out (introduced due to late loading of images via the cache)
        if( ts['bounds'].w === 0 )
          this.type_calculate_offset();

        if( 'animate_bounds' in ts )
        {
          context.drawImage(ts['image'],
                            ts['animate_bounds'].x,
                            ts['animate_bounds'].y,
                            ts['animate_bounds'].w,
                            ts['animate_bounds'].h,
                            this.bounds.x,
                            this.bounds.y,
                            this.bounds.w,
                            this.bounds.h);
        }
        else
        {
          context.drawImage(ts['image'],
                            this.bounds.x,
                            this.bounds.y,
                            this.bounds.w,
                            this.bounds.h);
        }
      }
    }

    // draw the overlay if exists
    if( this.is_pressed &&
        this.overlay_image instanceof Image &&
        this.overlay_image.src != '' &&
        this.overlay_image.complete )
    {
      context.drawImage(this.overlay_image, this.overlay.x, this.overlay.y, this.overlay.w, this.overlay.h);
    }

    this.render_caption(context);
  },
});
