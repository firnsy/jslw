// INITIALISATION
Widget = function(p, x, y, w, h, c)
{

  this.bounds = new Rect(x, y, w, h);
  this.offset = new Vector2(0, 0);
  this.bgcolour = '';
  this.background_image = null;

  this.parent = p;
  this.root = false;
  this.id = 0;

  this.label = '';
  this.label_font = '12px sans-serif';
  this.label_style = '#000000';
  this.label_alignment_horizontal = 'left';
  this.label_alignment_vertical = 'middle';

  this.children = [];
  this.visible = true;

  this.animate = false;
  this.animate_frames = 0;
  this.animate_function = null;

  this.alpha = 1.0;

  this.clip = true;

  // callbacks
  this.cb = {};

  // event state
  this.is_pressed = false;

  // rendering members
  this.looping = false;
  this.canvas = null;
  this.context = null;

  // add to parent object if appropriate
  if( p instanceof Widget )
    p.add_child(this);

  this.make_dirty();
}

Widget.prototype.set_root = function()
{
  // handles all
  this.root = true;
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

Widget.prototype.set_canvas = function(canvas)
{
  if( ! ( canvas instanceof HTMLCanvasElement ) )
  {
    alert("You have not supplied a canvas element.");
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
//  canvas.addEventListener("mousemove", function(e){ this_object.mouse_listener(e, this_object, "mouse_move") }, false);
}

Widget.prototype.add_event_listener = function(a, cb)
{
  switch( a )
  {
    case "mouse_down":
    case "mouse_up":
    case "mouse_move":
    case "mouse_click":
      this.cb[a] = cb;
      break;
    default:
      alert("Unknown event type supplied: " + a);
  }
}

Widget.prototype.add_child = function(child)
{
  // add child to list of children
  this.children.push(child);
}

// VISIBILITY AND TRANSITION/ANIMATION

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

  // set sane default speed
  s = s || 1000;

  // set sane callback
  cb = cb || function() {};

  // calculate number of frames to animate for
  this.animate_frames = s / 40;

  var to = this;
  var delta = 1 / this.animate_frames;

  this.animate_cb = {
    'process': function() {
      to.alpha += delta;
    },
    'complete': function() {
      to.alpha = 1;
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

  // set sane default speed
  s = s || 1000;

  // set sane callback
  cb = cb || function() {};

  // calculate number of frames to animate for
  this.animate_frames = s / 40;

  var to = this;
  var delta = 1 / this.animate_frames;

  this.animate_cb = {
    'process': function() {
      to.alpha -= delta;
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


// STYLING
Widget.prototype.set_label_alignment = function(mode_h, mode_v)
{
  this.set_label_alignment_horizontal(mode_h);
  this.set_label_alignment_vertical(mode_v);
}

Widget.prototype.set_label_alignment_horizontal = function(mode)
{
  mode = mode || 'center';

  switch( mode )
  {
    case 'center':
    case 'left':
    case 'right':
      this.label_alignment_horizontal = mode;
      break;
    default:
      this.label_alignment_horizontal = 'center';
  }
}

Widget.prototype.set_label_alignment_vertical = function(mode)
{
  mode = mode || 'middle';

  switch( mode )
  {
    case 'top':
    case 'middle':
    case 'baseline':
      this.label_alignment_vertical = mode;
      break;
    default:
      this.label_alignment_vertical = 'middle';
  }
}

Widget.prototype.set_label = function(text)
{
  this.label = text;
}

Widget.prototype.set_label_font = function(font)
{
  this.label_font = font;
}

Widget.prototype.set_label_style = function(style)
{
  this.label_style = style;
}


Widget.prototype.set_background_image = function(path)
{
  this.background_image = new Image();

  this.background_image.src = path;
  this.background_image.onerror = function(){ alert("Unable to load image: " + this.src); };

  var this_object = this;
  this.background_image.onload = function() { this_object.make_dirty(); };
}

Widget.prototype.set_background_colour = function(colour)
{
  this.bgcolour = colour;
}


// EVENT HANDLING
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

  if( ! handled && this.bounds.pointIntersects(x,y) )
  {
    // do call back
    if( this.cb[a] )
      handled = this.cb[a](x, y);

    // do correlated actions (eg click)
    switch( a )
    {
      case "mouse_up":
        if( this.is_pressed && this.cb["mouse_click"] )
          this.cb["mouse_click"](x, y);

        this.is_pressed = false;
        this.make_dirty();
        break;
      case "mouse_down":
        this.is_pressed = true;
        this.make_dirty();
        break;
    }

    // TODO: remove when event propogation is controllable
    handled = true;
  }
  // cancel a mouse down if mouse_up occured out of widget
  else if( this.is_pressed && a == "mouse_up" )
  {
    this.is_pressed = false
    this.make_dirty();
  }

  return handled;
}


// PROCESS AND RENDERING

Widget.prototype.make_dirty = function()
{
  this.dirty = true;

//  this.get_root().update();
}

Widget.prototype.make_clean = function()
{
  this.dirty = false;
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

  if( this.alpha > 0 && this.alpha < 1 )
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
  this.render_label(context);

  for( c in this.children )
    this.children[c].render(context, this.bounds.x, this.bounds.y);

  context.restore();

  this.dirty = false;
}

Widget.prototype.render_widget = function(context)
{
  // draw the widget
  if( this.bgcolour != '' )
  {
    context.fillStyle = this.bgcolour;
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  if( this.background_image instanceof Image &&
      this.background_image.src != '' &&
      this.background_image.complete )
  {
    context.drawImage(this.background_image, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

}

Widget.prototype.render_label = function(context)
{
  if( this.label == '' )
    return;

  var x = this.bounds.x;
  var y = this.bounds.y;

  switch( this.label_alignment_horizontal )
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

  switch( this.label_alignment_vertical )
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


  context.font = this.label_font;
  context.fillStyle = this.label_style;
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

  if ( is_dirty )
  {
    this.context.save();

    this.render(this.context, 0, 0);

    this.context.restore();
  }

  // reschedule if we're looping
  if ( this.looping )
    setTimeout( ( function(scope) { return function() { scope.update(); }; } )(this), 40);
}
