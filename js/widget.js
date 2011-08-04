/*
 * This file is part of the NSM framework
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

Widget = function(p, x, y, w, h, c)
{
  if( x instanceof Rect )
    this.bounds = x;
  else
    this.bounds = new Rect(x, y, w, h);

  this.offset = new Vector2(0, 0);
  this.background_color = null;
  this.background_image = null;
  this.parent = p;


  // default member initialisation
  this.root = false;
  this.children = [];

  this.caption = '';
  this.font = '12px sans-serif';
  this.font_color = new Color('#000000');
  this.text_alignment_horizontal = 'left';
  this.text_alignment_vertical = 'middle';

  this.visible = true;
  this.alpha = 1.0;
  this.clip = true;

  this.animate = false;
  this.animate_frames = 0;
  this.animate_function = null;

  // event callbacks
  this.event_cb = {
    'system': {},
    'user': {}
  }

  // event state
  this.is_pressed = false;
  this.is_dragged = false;

  this.register_callbacks(this);

  // rendering members
  this.looping = false;
  this.loop_timer = null;
  this.canvas = null;
  this.context = null;

  this.set_parent(p);

  this.make_dirty();
}


Widget.prototype.is_root = function()
{
  return this.root;
}


Widget.prototype.get_root = function()
{
  if( this.root )
    return this;

  return this.parent.get_root();
}


Widget.prototype.set_root = function()
{
  // handles all
  this.root = true;
}


Widget.prototype.set_canvas = function(canvas)
{
  if( ! ( canvas instanceof HTMLCanvasElement ) )
  {
    console.log('ERROR: You have not supplied a canvas element.');
    return;
  }

  context = canvas.getContext("2d");

  // store for later
  this.canvas = canvas;
  this.context = context;

  var this_object = this;

  // apply our handling routines
  canvas.addEventListener("mousedown", function(e){ this_object.mouse_listener(e, this_object, "mouse_down") }, false);
  canvas.addEventListener("mouseup", function(e){ this_object.mouse_listener(e, this_object, "mouse_up") }, false);
  canvas.addEventListener("mousemove", function(e){ this_object.mouse_listener(e, this_object, "mouse_move") }, false);
  canvas.addEventListener("mouseout", function(e){ this_object.mouse_listener(e, this_object, "mouse_out") }, false);
}


Widget.prototype.set_parent = function(p)
{
  // if we have an existing parent then remove child from it
  if( this.p instanceof Widget )
  {

  }

  // add to parent object if appropriate
  if( p instanceof Widget )
  {
    this.p = p;

    p.add_child(this);
  }

}


Widget.prototype.add_child = function(c)
{
  // add child to list of children
  this.children.push(c);
}

// VISIBILITY AND TRANSITION/ANIMATION

Widget.prototype.get_visibility = function()
{
  return this.visible;
}


Widget.prototype.set_visibility = function(state)
{
  this.visible = state;
}


Widget.prototype.hide = function()
{
  this.visible = false;
  this.make_dirty();
}


Widget.prototype.show = function()
{
  this.offset.set(0, 0);
  this.visible = true;

  this.make_dirty();
}


Widget.prototype.slideToggle = function(d, s, cb)
{
  var offset = this.offset;

  // check if the widget is "in"
  if( offset.x == 0 && offset.y == 0 )
    this.slideOut(d, s, cb);
  else
    this.slideIn(d, s, cb);
}


Widget.prototype.slideIn = function(d, s, cb)
{
  var offset = this.offset;

  // check if the widget is already "in"
  if( offset.x == 0 && offset.y == 0 )
    return;

  // set sane default direction
  d = d || "left";

  // set sane default speed
  s = s || 1000;

  // set sane callback
  cb = cb || function() {};

  // calculate number of frames to animate for
  this.animate_frames = Math.ceil(s / 40);

  var delta;

  switch( d )
  {
    case "left":
      delta = new Vector2(
        Math.ceil(this.bounds.x2 / this.animate_frames),
        0
      );
      break;
    case "right":
      delta = new Vector2(
        -Math.ceil((this.parent.bounds.w - this.bounds.x) / this.animate_frames),
        0
      );
      break;
    case "up":
      delta = new Vector2(
        0,
        Math.ceil(this.bounds.y2 / this.animate_frames)
      );
      break;
    case "down":
      delta = new Vector2(
        0,
        -Math.ceil((this.parent.bounds.h - this.bounds.y) / this.animate_frames)
      );
      break;
    default:
      return;
  }

  offset.set(delta.x, delta.y);
  offset.scale(-this.animate_frames);
  var to = this;

  this.animate_cb = {
    'process': function() {
      offset.translate(delta);
    },
    'complete': function() {
      cb();
    }
  };


  this.animate = true;
  this.animate_index = 0;
  this.set_visibility(true);
  this.make_dirty();
}


Widget.prototype.slideOut = function(d, s, cb)
{
  var offset = this.offset;

  // check if we the widget is already "out"
  if( offset.x != 0 && offset.y != 0 )
    return;

  // set sane default direction
  d = d || "left";

  // set sane default speed
  s = s || 1000;

  // set sane callback
  cb = cb || function() {};

  // calculate number of frames to animate for
  this.animate_frames = s / 20;

  var delta;

  switch( d )
  {
    case "left":
      delta = new Vector2(
        -Math.ceil(this.bounds.x2 / this.animate_frames),
        0
      );
      break;
    case "right":
      delta = new Vector2(
        Math.ceil((this.parent.bounds.w - this.bounds.x) / this.animate_frames),
        0
      );
      break;
    case "up":
      delta = new Vector2(
        0,
        -Math.ceil(this.bounds.y2 / this.animate_frames)
      );
      break;
    case "down":
      delta = new Vector2(
        0,
        Math.ceil((this.parent.bounds.h - this.bounds.y) / this.animate_frames)
      );
      break;
    default:
      return;
  }

  var to = this;

  this.animate_cb = {
    'process': function() {
      offset.translate(delta);
    },
    'complete': function() {
      to.alpha = 0;
      to.set_visibility(false);
      cb();
    }
  };

  this.animate = true;
  this.animate_index = 0;
  this.set_visibility(true);
  this.make_dirty();
}


Widget.prototype.fadeToggle = function(s, cb)
{
  // check if the widget is "faded in"
  if( this.alpha == 0 )
    this.fadeIn(s, cb);
  else
    this.fadeOut(s, cb);
}


Widget.prototype.fadeIn = function(s, cb)
{
  // check if we the widget is already "out"
  if( this.alpha == 1 &&
      this.visibile )
    return;

  this.alpha = 0;

  // set sane default speed
  s = s || 1000;

  // set sane callback
  cb = cb || function() {};

  // calculate number of frames to animate for
  this.animate_frames = s / 40;

  var self = this;
  var delta = 1 / this.animate_frames;

  this.animate_cb = {
    'process': function() {
      self.alpha += delta;
    },
    'complete': function() {
      self.alpha = 1;
      cb();
    }
  };

  this.animate = true;
  this.animate_index = 0;
  this.set_visibility(true);
  this.make_dirty();
}


Widget.prototype.fadeOut = function(s, cb)
{
  // check if we the widget is already "out"
  if( this.alpha == 0 ||
      ! this.visible )
    return;

  this.alpha = 1;

  // set sane default speed
  s = s || 1000;

  // set sane callback
  cb = cb || function() {};

  // calculate number of frames to animate for
  this.animate_frames = s / 40;

  var self = this;
  var delta = 1 / this.animate_frames;

  this.animate_cb = {
    'process': function() {
      self.alpha -= delta;
    },
    'complete': function() {
      self.alpha = 0;
      self.set_visibility(false);
      cb();
    }
  };

  this.animate = true;
  this.animate_index = 0;
  this.set_visibility(true);
  this.make_dirty();
}


// STYLING
Widget.prototype.set_text_alignment = function(mode_h, mode_v)
{
  this.set_text_alignment_horizontal(mode_h);
  this.set_text_alignment_vertical(mode_v);
}


Widget.prototype.set_text_alignment_horizontal = function(mode)
{
  mode = mode || 'center';

  switch( mode )
  {
    case 'center':
    case 'left':
    case 'right':
      this.text_alignment_horizontal = mode;
      break;
    default:
      this.text_alignment_horizontal = 'center';
  }
}

Widget.prototype.set_text_alignment_vertical = function(mode)
{
  mode = mode || 'middle';

  switch( mode )
  {
    case 'top':
    case 'middle':
    case 'baseline':
      this.text_alignment_vertical = mode;
      break;
    default:
      this.text_alignment_vertical = 'middle';
  }
}


Widget.prototype.set_caption = function(t)
{
  this.caption = t;
}


Widget.prototype.set_font = function(f)
{
  this.font = f;
}


Widget.prototype.set_font_color = function(c)
{
  if( ! c instanceof Color )
  {
    console.log('ERROR: Must supply a Color object.');
    return;
  }

  this.font_color = c;
}


Widget.prototype.set_background_image = function(i)
{
  if( i instanceof Image )
  {
    this.background_image = i;

    if( i.src != '' && i.complete )
      this.make_dirty();
  }
  else
  {
    this.background_image = new Image();

    this.background_image.src = path;
    this.background_image.onerror = function(){ alert("Unable to load image: " + this.src); };

    var self = this;
    this.background_image.onload = function() { self.make_dirty(); };
  }
}


Widget.prototype.set_background_color = function(c)
{
  if( ! c instanceof Color )
  {
    console.log('ERROR: Must supply a Color object.');
    return;
  }

  this.background_color = c;
}


//
// EVENT HANDLING

Widget.prototype.add_event_listener = function(a, cb)
{
  switch( a )
  {
    case "mouse_down":
    case "mouse_up":
    case "mouse_move":
    case "mouse_click":
    case "mouse_drag_start":
    case "mouse_drag_move":
    case "mouse_drag_end":
      this.event_cb['user'][a] = cb;
      break;
    default:
      console.log('WARN: Unknown event type supplied: ' + a);
  }
}


Widget.prototype.mouse_listener = function(e, o, a)
{
  x = e.pageX - o.canvas.offsetLeft;
  y = e.pageY - o.canvas.offsetLeft;

  o.mouse_process(x, y, a);
}


Widget.prototype.mouse_process = function(x, y, a)
{
  var handled = false;

  // ignore invisible and animating widgets
  if( ! this.visible || this.animate )
    return handled;

  // children need to operate on relative point to current
  var cx = x - this.bounds.x;
  var cy = y - this.bounds.y;

  for( c in this.children )
    handled |= this.children[c].mouse_process(cx, cy, a);

  if( ! handled && this.bounds.intersects(x,y) )
  {
    // do user call back
    if( this.event_cb['system'][a] )
      handled |= this.event_cb['system'][a](x, y);

    // do user call back
    if( this.event_cb['user'][a] )
      handled |= this.event_cb['user'][a](x, y);

    // do correlated actions (eg click)
    switch( a )
    {
      case 'mouse_up':
        if( this.is_pressed )
        {
          if( this.is_dragged )
          {
            if( this.event_cb['system']['mouse_drag_end'] )
              this.event_cb['system']['mouse_drag_end'](x, y);

            if( this.event_cb['user']['mouse_drag_end'] )
              this.event_cb['user']['mouse_drag_end'](x, y);
          }
          else
          {
            if( this.event_cb['system']['mouse_click'] )
              this.event_cb['system']['mouse_click'](x, y);

            if( this.event_cb['user']['mouse_click'] )
              this.event_cb['user']['mouse_click'](x, y);
          }
        }

        this.is_pressed = false;
        this.is_dragged = false
        this.make_dirty();
        break;

      case 'mouse_down':
        this.is_pressed = true;
        this.make_dirty();
        break;

      case 'mouse_move':
        if( this.is_pressed )
        {
          if( this.is_dragged )
          {
            if( this.event_cb['system']['mouse_drag_move'] )
              this.event_cb['system']['mouse_drag_move'](x, y);

            if( this.event_cb['user']['mouse_drag_move'] )
              this.event_cb['user']['mouse_drag_move'](x, y);

          }
          else
          {
            this.is_dragged = true;

            if( this.event_cb['system']['mouse_drag_start'] )
              this.event_cb['system']['mouse_drag_start'](x, y);

            if( this.event_cb['user']['mouse_drag_start'] )
              this.event_cb['user']['mouse_drag_start'](x, y);
          }
        }
        break;
    }

    // TODO: remove when event propogation is controllable
    handled = true;
  }
  // cancel a mouse down if mouse_up occured out of widget
  else if( this.is_pressed &&
           ( a == 'mouse_up' || a == 'mouse_out' ) )
  {
    // mouse_click event does NOT occur when event closes out of widget
    this.is_pressed = false

    // mouse_drag_end event DOES occur when event closes out of widget
    if( this.is_dragged )
    {
      if( this.event_cb['system']['mouse_drag_end'] )
        this.event_cb['system']['mouse_drag_end'](x, y);

      if( this.event_cb['user']['mouse_drag_end'] )
        this.event_cb['user']['mouse_drag_end'](x, y);
    }
    this.is_dragged = false

    this.make_dirty();
  }

  return handled;
}

Widget.prototype.register_callbacks = function(o)
{
  this.event_cb['system']['mouse_down'] = ( function(scope){ return function(x, y) { scope.mouse_down(x, y); }; } )(o);
  this.event_cb['system']['mouse_up'] = ( function(scope){ return function(x, y) { scope.mouse_up(x, y); }; } )(o);
  this.event_cb['system']['mouse_click'] = ( function(scope){ return function(x, y) { scope.mouse_click(x, y); }; } )(o);
  this.event_cb['system']['mouse_move'] = ( function(scope){ return function(x, y) { scope.mouse_move(x, y); }; } )(o);
  this.event_cb['system']['mouse_drag_start'] = ( function(scope){ return function(x, y) { scope.mouse_drag_start(x, y); }; } )(o);
  this.event_cb['system']['mouse_drag_move'] = ( function(scope){ return function(x, y) { scope.mouse_drag_move(x, y); }; } )(o);
  this.event_cb['system']['mouse_drag_end'] = ( function(scope){ return function(x, y) { scope.mouse_drag_end(x, y); }; } )(o);
}

Widget.prototype.mouse_up = function(x, y) {}
Widget.prototype.mouse_down = function(x, y) {}
Widget.prototype.mouse_move = function(x, y) {}
Widget.prototype.mouse_click = function(x, y) {}
Widget.prototype.mouse_drag_start = function(x, y) {}
Widget.prototype.mouse_drag_move = function(x, y) {}
Widget.prototype.mouse_drag_end = function(x, y) {}


// PROCESS AND RENDERING

Widget.prototype.make_dirty = function()
{
  this.dirty = true;

  // this.get_root().update_no_loop();
}

Widget.prototype.set_dirty = function(s)
{
  this.dirty = s;

  if( this.dirty )
    this.get_root().update_no_loop();
}

Widget.prototype.is_dirty = function()
{
  if( ! this.visible )
    return;

  var is_dirty = this.dirty;

  for( c in this.children )
    is_dirty |= this.children[c].is_dirty();

  return is_dirty;
}

Widget.prototype.process = function()
{
  if( ! this.visible )
    return;

  // are we animating
  if( this.animate )
  {
    this.animate_index++;

    if( 'process' in this.animate_cb )
        this.animate_cb['process']();

    if( this.animate_index >= this.animate_frames )
    {
      if( 'complete' in this.animate_cb )
        this.animate_cb['complete']();

      this.animate = false;
    }

    this.dirty = true;
  }

  // track dirty states of children
  var is_dirty = this.dirty

  for( c in this.children )
    is_dirty |= this.children[c].process();

  // return aggregate dirty state
  return is_dirty;
}

Widget.prototype.render = function(context, x, y)
{
  if( ! ( context instanceof CanvasRenderingContext2D ) )
    return;

  if( ! this.visible )
    return;

  // save our context
  context.save();

  // offset the view (accounts for animations)
  context.translate(x + this.offset.x, y + this.offset.y);

  context.globalAlpha = this.alpha;

  // perform clipping as appropriate
  if( this.clip )
  {
    context.beginPath();
    context.rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
    context.clip();
    context.closePath();
  }

  // draw the widget
  this.render_widget(context);

  for( c in this.children )
    this.children[c].render(context, this.bounds.x, this.bounds.y);

  context.restore();

  this.dirty = false;
}

Widget.prototype.render_widget = function(context)
{
  // draw the widget
  if( this.background_color instanceof Color )
  {
    context.fillStyle = this.background_color.getRGBA(Math.round(this.alpha * 255));
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  if( this.background_image instanceof Image &&
      this.background_image.src != '' &&
      this.background_image.complete )
  {
    context.drawImage(this.background_image, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  this.render_caption(context);
}

Widget.prototype.render_caption = function(context)
{
  if( this.caption == '' )
    return;

  var x = this.bounds.x;
  var y = this.bounds.y;

  switch( this.text_alignment_horizontal )
  {
    case "center":
      x += this.bounds.w / 2;
      context.textAlign = "center";
      break;
    case "right":
      x += (this.bounds.w);
      context.textAlign = "right";
      break;
    case "left":
      context.textAlign = "left";
      break;
  }

  switch( this.text_alignment_vertical )
  {
    case "top":
      context.textBaseline = "top";
      break;
    case "middle":
      context.textBaseline = "middle";
      y += (this.bounds.h/2);
      break;
    case "bottom":
      context.textBaseline = "bottom";
      y += (this.bounds.h);
      break;
  }

  context.font = this.font;

  if( this.font_color instanceof Color )
    context.fillStyle = this.font_color.getRGBA(Math.round(this.alpha * 255));

  context.fillText(this.label, x, y);
}

Widget.prototype.loop_start = function()
{
  this.looping = true;
  this.update();
}

Widget.prototype.loop_stop = function()
{
  this.looping = false;
}

Widget.prototype.update = function()
{
  var is_dirty = this.process();

  if( is_dirty )
  {
    this.context.save();

    this.render(this.context, 0, 0);

    this.context.restore();
  }

  // reschedule if we're looping
  if( this.looping )
    setTimeout( ( function(scope) { return function() { scope.update(); }; } )(this), 40);
}

Widget.prototype.update_no_loop = function()
{
  var is_dirty = this.process();

  if( is_dirty )
  {
    this.context.save();

    this.render(this.context, 0, 0);

    this.context.restore();

    // reschedule if we're looping
    if( this.get_root().loop_timer == null )
      this.get_root().loop_timer = setTimeout( ( function(scope) { return function() { scope.update(); }; } )(this.get_root()), 40);
  }
}
