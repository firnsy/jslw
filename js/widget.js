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

var Widget = Base.extend({

  //
  // MEMBERS
  //

  _type:      'Widget',

  _parent:    null,
  _root:      null,
  _is_root:   false,
  _children:  [],

  _visible:   true,
  _tag:       '',

  _bounds:    null,

  _id:        'unknown',
  _debug:     false,

  /**
   * @constructor
   * Primary constructor for the Widget object
   * @param {Widget} p Parent of this widget, only the root object has no parent
   * @param {Rect} r Rectangle bounding box of this widget
   * @param {Object} [s="{}"] Object representing the style of this Widget
   */
  constructor: function(p, r, s)
  {
    if( arguments.length === 0 )
      return;

    if( ! ( r instanceof Rect ) )
    {
      console.error('Bounds for widget must be of type Rect:' + p.toString());
      return;
    }

    this._bounds = r;
    this._offset = new Vector2(0, 0);

    // track widget heirarchy
    this._is_root = false;
    this._parent = null;
    this._children = [];

    this.set_parent(p);

    // animate stack
    this.animate = [];

    // event callbacks
    this.valid_events = [
      'mouse_up',
      'mouse_down',
      'mouse_click',
      'mouse_move',
      'mouse_drag_start',
      'mouse_drag_move',
      'mouse_drag_end'
    ];

    this.event_cb = {};

    // event state
    this.is_pressed = false;
    this.is_dragged = false;
    this.is_touch = false;

    // extend style defaults
    s = ( typeof s === 'object' ) ? s : {};
    s.font = s.font || new Font('12px sans-serif');
    s.font_color = s.font_color || new Color('#000000');
    s.text_alignment_horizontal = s.text_alignment_horizontal || 'center';
    s.text_alignment_vertical = s.text_alignment_vertical || 'middle';
    s.background_image = s.background_image || null;
    s.caption = s.caption || '';

    // apply styles
    this.caption     = s.caption;
    this._font       = s.font;
    this._font_color = s.font_color;
    this.set_text_alignment_horizontal( s.text_alignment_horizontal );
    this.set_text_alignment_vertical( s.text_alignment_vertical );

    this.background_image = s.background_image;

    // process/render state
    this._visible = true;
    this.dirty = true;
    this.alpha = 1.0;
    this.clip = true;
    this.scale = 1.0;

    this.looping = false;
    this._loop_timer = null;
    this.canvas = null;
    this.context = null;

    this._debug = false;

    // border
    this._border_width = 0;
    this._border_radius = 0;

    // text margins
    this.right_margin = 0;
    this.left_margin = 0;
    this.top_margin = 0;
    this.bottom_margin = 0;

    // multi line support
    this.multi_line_text_enabled = false;
    this.text_height = this._font.get_height();
  },


  //
  // PUBLIC METHODS
  //

  debug: function()
  {
    this._debug = true;
    console.log('Debugging...');

    return this;
  },

  id: function(_id)
  {
    this._id = ( typeof _id == 'string' ) ? _id : 'unknown';

    return this;
  },

  /**
   *
   */
  get_root: function()
  {
    if( this._is_root )
      return this;
    else if( ! ( this._parent instanceof Widget ) )
      return null;
    else
      return this._parent.get_root();
  },

  is_root: function()
  {
    return this._is_root;
  },

  /**
   *
   */
  set_root: function()
  {
    if( this._parent instanceof Widget )
      console.warn('Widget.set_root: This widget has a parent.');

    this._is_root = true;

    return this;
  },

  /**
   * set the parent widget for this
   */
  set_parent: function(p)
  {
    // add widget as parent object if appropriate
    if( p instanceof Widget )
    {
      this._parent = p;
      this._root = p.get_root();

      p.add_child(this);
    }
    else
      this._root = this;

    return this;
  },

  /**
   * Add a child widget to this
   */
  add_child: function(c)
  {
    // add child to list of children
    if( c instanceof Widget )
      this._children.push(c);
    else
      console.error('Widget.add_child: Non widget instance provided.');

    return this;
  },


  get_ancestor_length: function()
  {
    return 1 + ( this._parent instanceof Widget ? this._parent.get_ancestor_length() : 0 );
  },

  //
  // VISIBILITY AND TRANSITION/ANIMATION
  //

  /**
   * set the scale of the object. The minimum scale we can see
   * is 1 pixel so if the bounds x scale is less than 1 pixel
   * then we can't see it
   */
  set_scale: function(s)
  {
    if( s > 0 )
      this.scale = s;
    else
      console.error('Widget.set_scale: Scale must a positive real number.');

    return this;
  },

  /**
   * Ask the question can we be seen? If our scale or
   * alpha are small enough then we can't. Also if the
   * visible boolean is false we are not rendered
   */
  get_visibility: function()
  {
    return this._visible &&
           ( this.alpha > 0 ) &&
           ( this.scale > 0 );
  },

  /**
   * Sets the visible state
   */
  set_visibility: function(state)
  {
    this._visible = ( state ) ? true : false;

    return this;
  },

  toggle_visibility: function()
  {
    this._visible = ! this._visible;

    return this;
  },

  /**
   * Hide the widget by setting its visible to false
   */
  hide: function()
  {
    this._visible = false;
    this.set_dirty(true);

    return this;
  },

  /**
   * Show the widget by setting it's visibility to true
   * and moving it back to it's original location, should
   * possibly set the alpha to 1 as well?
   */
  show: function()
  {
    this._offset.set(0, 0);
    this._visible = true;

    this.set_dirty(true);

    return this;
  },

  /**
   * remove the animations array
   */
  clearAnimations: function()
  {
    this.animate = [];

    return this;
  },

  //
  // ANIMATION TRANSITIONS
  //

  slideToggle: function(d, s, cb)
  {
    var offset = this._offset;

    // check if the widget is "in"
    if( offset.x === 0 && offset.y === 0 )
      this.slideOut(d, s, cb);
    else
      this.slideIn(d, s, cb);

    return this;
  },

  /**
   * Animate the widget sliding it somewhere on the screen
   */
  slideTo: function(o, s, cb)
  {
    // set sane default speed
    s = parseInt(s);
    if( s === 0 || s === 'NaN' )
      s = 1000;

    // set sane callback
    if( typeof cb !== 'function' )
      cb = function() {};

    // calculate number of frames to animate for
    var animate_frames = Math.ceil(s / ANIMATE_FRAME_TIME_SPACING);

    var delta = new Vector2(
      Math.ceil((o.x - this._bounds.x) / animate_frames),
      Math.ceil((o.y - this._bounds.y) / animate_frames)
    );

    var self = this;

    this.animate.push({
      frames:   animate_frames,
      index:    0,
      loop:     false,
      process:  function() {
        self._bounds.translate(delta);
      },
      complete: function() {
        self._bounds.x = o.x;
        self._bounds.y = o.y;
        cb();
      }
    });

    this.set_visibility(true);
    this.set_dirty(true);

    return this;
  },

  /**
   * Another slide animation this is to return the widget to the
   * current view, we assume someone has slid it out earlier
   */
  slideIn: function(d, s, t, cb)
  {
    // check if the widget is already "in" and showing
    if( this._offset.x === 0 && this._offset.y === 0 && this._visible)
      return;

    // set sane default direction
    d = d || "left";

    // set sane default speed
    s = parseInt(s);
    if( s === 0 || s === 'NaN' )
      s = 1000;

    // set sane tween
    t = t || Tween.linearEaseNone;

    // set sane callback
    if( typeof cb !== 'function' )
      cb = function() {};

    // calculate number of frames to animate for
    var tween;
    var offset = this._offset;

    switch( d )
    {
      case 'left':
        tween = new Tween({ x: -this._bounds.w })
          .easing(t)
          .to({ x: 0}, s)
          .on_update( function(o) {
            offset.x = o.x;
          })
          .start(0);
        break;
      case 'right':
        tween = new Tween({ x: this._bounds.w })
          .easing(t)
          .to({ x: 0 }, s)
          .on_update( function(o) {
            offset.x = o.x;
          })
          .start(0);
        break;
      case 'up':
        tween = new Tween({ y: -this._bounds.h })
          .easing(t)
          .to({ y: 0 }, s)
          .on_update( function(o) {
            offset.y = o.y;
          })
          .start(0);
        break;
      case 'down':
        tween = new Tween({ y: this._bounds.h })
          .easing(t)
          .to({ y: 0 }, s)
          .on_update( function(o) {
            offset.y = o.y;
          })
          .start(0);
        break;
      default:
        return;
    }

    // push this animation on the animate stack
    this.animate.push({
      frames:   tween.length(),
      index:    0,
      loop:     false,
      process:  function(i) {
        tween.update(i);
      },
      complete: function() {
        offset.set(0, 0);
        cb();
      }
    });

    this.set_visibility(true);
    this.set_dirty(true);

    return this;
  },

  /**
   * Probably the last of the slidy animations this one slides the widget out
   * of site
   */
  slideOut: function(d, s, t, cb)
  {
    // check if we the widget is already "out"
    if( this._offset.x !== 0 || this._offset.y !== 0 )
      return;

    // set sane default direction
    d = d || 'left';

    // set sane default speed
    s = parseInt(s);
    if( s === 0 || s === 'NaN' )
      s = 1000;

    // set sane tween
    t = t || Tween.linearEaseNone;

    // set sane callback
    if( typeof cb !== 'function' )
      cb = function() {};

    // calculate number of frames to animate for
    var animate_frames = Math.ceil(s / ANIMATE_FRAME_TIME_SPACING);

    var tween;
    var offset = this._offset;

    switch( d )
    {
      case 'left':
        tween = new Tween({ x: 0 })
          .easing(t)
          .to({ x: -this._bounds.w }, s)
          .on_update( function(o) {
            offset.x = o.x;
          })
          .start(0);
        break;
      case 'right':
        tween = new Tween({ x: 0 })
          .easing(t)
          .to({ x: this._bounds.w }, s)
          .on_update( function(o) {
            offset.x = o.x;
          })
          .start(0);
        break;
      case 'up':
        tween = new Tween({ y: 0 })
          .easing(t)
          .to({ y: -this._bounds.h }, s)
          .on_update( function(o) {
            offset.y = o.y;
          })
          .start(0);
        break;
      case 'down':
        tween = new Tween({ y: 0 })
          .easing(t)
          .to({ y: -this._bounds.h }, s)
          .on_update( function(o) {
            offset.y = o.y;
          })
          .start(0);
        break;
      default:
        return;
    }

    var self = this;

    // push this animation on the animate stack
    this.animate.push({
      frames:   animate_frames,
      index:    0,
      loop:     false,
      process:  function(i) {
        tween.update(i);
      },
      complete: function() {
        self.set_visibility(false);
        cb();
      }
    });

    this.set_visibility(true);
    this.set_dirty(true);

    return this;
  },

  /**
   * Toggles the alpha state of the widget to
   * fade in or out
   */
  fadeToggle: function(s, t, cb)
  {
    // check if the widget is "faded in"
    if( this.alpha === 0 )
      this.fadeIn(s, cb);
    else
      this.fadeOut(s, cb);

    return this;
  },

  /**
   * Fade the widget into view
   */
  fadeIn: function(s, t, cb)
  {
    // check if the widget has fully faded in
    if( this.alpha === 1 &&
        this.visibile )
      return;

    this.alpha = 0;

    // set sane default speed
    s = parseInt(s);
    if( s === 0 || s === 'NaN' )
      s = 1000;

    // set sane callback
    if( typeof cb !== 'function' )
      cb = function() {};

    // calculate number of frames to animate for
    var animate_frames = Math.ceil(s / ANIMATE_FRAME_TIME_SPACING);

    var self = this;
    var delta = 1 / animate_frames;

    this.animate.push({
      frames:   animate_frames,
      index:    0,
      loop:     false,
      process:  function() {
        self.alpha += delta;
      },
      complete: function() {
        self.alpha = 1;
        cb();
      }
    });

    this.set_visibility(true);
    this.set_dirty(true);

    return this;
  },

  /**
   * Fade the widget out of view
   */
  fadeOut: function(s, t, cb)
  {
    // check if we the widget is already "out"
    if( ( this.alpha === 0 ) || ( ! this._visible ) )
      return;

    this.alpha = 1;

    // set sane default speed
    s = s || 1000;

    // set sane callback
    cb = cb || function() {};

    // calculate number of frames to animate for
    var animate_frames = s / ANIMATE_FRAME_TIME_SPACING;

    var self = this;
    var delta = 1 / animate_frames;

    this.animate.push({
      frames:   animate_frames,
      index:    0,
      loop:     false,
      process:  function() {
        self.alpha -= delta;
      },
      complete: function() {
        self.alpha = 0;
        self.set_visibility(false);
        cb();
      }
    });

    this.set_visibility(true);
    this.set_dirty(true);

    return this;
  },


  //
  // STYLING
  //

  /**
   * Set the text alignment in the widget,
   * allows for any of the 9 ordinal points
   *        * * *
   *        * * *
   *        * * *
   */
  set_text_alignment: function(h, v)
  {
    this.set_text_alignment_horizontal(h);
    this.set_text_alignment_vertical(v);

    return this;
  },

  /**
   * sets the horizontal text alignment, center, left or right
   */
  set_text_alignment_horizontal: function(m)
  {
    switch( m )
    {
      case 'center':
      case 'left':
      case 'right':
        this.text_alignment_horizontal = m;
        break;
      default:
        console.error('Invalid alignment mode specified: ' + m)
    }

    return this;
  },

  /**
   * Sets the vertical text alignment top, middle, baseline
   */
  set_text_alignment_vertical: function(m)
  {
    switch( m )
    {
      case 'top':
      case 'middle':
      case 'baseline':
        this.text_alignment_vertical = m;
        break;
      default:
        console.error('Invalid alignment mode specified: ' + m)
    }

    return this;
  },

  /**
   * Sets the text caption to render for this widget
   */
  set_caption: function(t)
  {
    // set the caption if we have a string
    if( typeof t === 'string' )
      this.caption = t;

    return this;
  },

  /**
   * Returns the widgets text caption
   */
  get_caption: function()
  {
    return this.caption;
  },

  /**
   * Sets the text font
   */
  set_font: function(f)
  {
    if( f instanceof Font )
      this._font = f;
    else
      console.error('Widget.set_font: Must supply a Font object.');

    return this;
  },

  /**
   * Sets the text font color
   */
  set_font_color: function(c)
  {
    if( c instanceof Color )
      this._font_color = c;
    else
      console.error('Widget.set_font_color: Must supply a Color object.');

    return this;
  },

  /**
   * Sets the widget's background image
   */
  set_background_image: function(i)
  {
    if( i instanceof HTMLImageElement )
    {
      this.background_image = i;

      if( i.naturalWidth > 0 )
        this.set_dirty(true);
    }
    else if( typeof i === "string" )
    {
      this.background_image = new Image();

      this.background_image.src = i;
      this.background_image.onerror = function(){ alert("Unable to load image: " + this.src); };

      var self = this;
      this.background_image.onload = function() { self.set_dirty(true); };
    }
    else
      console.error('Widget.set_background_image: Must supply an HTMLImageElement or valid path.');

    return this;
  },

  /**
   * Sets the solid fill background color, we should also offer a set background
   * gradient to allow for gradient fills
   */
  set_background_color: function(c)
  {
    if( c instanceof Color )
      this.background_color = c;
    else
      console.error('Widget.set_backgound_color: Must supply a Color object.');

    return this;
  },

  /**
   * Set the border line width (0 == no border)
   */
  set_border_width: function(borderWidth)
  {
    this._border_width = ( parseInt(borderWidth) >= 0 ) ? parseInt(borderWidth) : 0;
  },

  /**
   * Set the border corner radius, also used to clip fill color
   */
  set_border_radius: function(borderRadius)
  {
    this._border_radius = ( parseInt(borderRadius) >= 0 ) ? parseInt(borderRadius): 0;
  },

  set_margins: function(leftMargin, rightMargin, topMargin, bottomMargin)
  {
    this.left_margin = leftMargin;
    this.right_margin = rightMargin;
    this.top_margin = topMargin;
    this.bottom_margin = bottomMargin;
  },

  set_left_margin: function(leftMargin)
  {
    this.left_margin = leftMargin;
  },

  set_right_margin: function(rightMargin)
  {
    this.right_margin = rightMargin;
  },

  set_top_margin: function(topMargin)
  {
    this.top_margin = topMargin;
  },

  set_bottom_margin: function(bottomMargin)
  {
    this.bottom_margin = bottomMargin;
  },

  set_multi_line_text: function(enabled)
  {
    this.multi_line_text_enabled = enabled;
  },

  fill_multi_line_text: function(context, text, x, y)
  {
    var currentLine = 0;
    var lineHeight = this.text_height;

    text = text.replace(/(\r\n|\n\r|\r|\n)/g, '\n');
    lines = text.split('\n');

    var printLine = function(str)
    {
      context.fillText(str, x, y + (currentLine * lineHeight));
      currentLine++;
    };

    for (var i = 0; i < lines.length; ++i)
    {
      var line = lines[i];
      var lineWidth = context.measureText(line).width;

      if(lineWidth > this._bounds.w)
      {
        // TODO. Handle this case.
      }
      else
      {
        printLine(line);
      }
    }
  },

  /**
   * Setup the canvas element and attach the event listeners
   */
  set_canvas: function(canvas)
  {
    if( ! ( canvas instanceof HTMLCanvasElement ) )
    {
      console.error('Widget.set_canvas: You have not supplied a canvas element.');
      return;
    }

    context = canvas.getContext("2d");

    // store for later
    this.canvas = canvas;
    this.context = context;

    var self = this;

    // apply our generic listener's to the canvas DOM
    canvas.addEventListener('touchstart', function(e){ self._touch_listener(e, self, 'touch_start') }, false);
    canvas.addEventListener('touchmove', function(e){ self._touch_listener(e, self, 'touch_move') }, false);
    canvas.addEventListener('touchend', function(e){ self._touch_listener(e, self, 'touch_end') }, false);
    canvas.addEventListener('touch', function(e){ self._touch_listener(e, self, 'touch') }, false);
    canvas.addEventListener('touchcancel', function(e){ self._touch_listener(e, self, 'touch_cancel') }, false);
    canvas.addEventListener('mousedown', function(e){ self._mouse_listener(e, self, 'mouse_down') }, false);
    canvas.addEventListener('mouseup', function(e){ self._mouse_listener(e, self, 'mouse_up') }, false);
    canvas.addEventListener('mousemove', function(e){ self._mouse_listener(e, self, 'mouse_move') }, false);
    canvas.addEventListener('mouseout', function(e){ self._mouse_listener(e, self, 'mouse_out') }, false);

    return this;
  },

  /**
   * Sets the widget dirty, if it is visible try to
   * kick off a new update
   */
  set_dirty: function(s, u)
  {
    if( this.dirty === s )
      return this;

    u = ( typeof u === 'boolean' ) ? u : true;

    this.dirty = s;

    if( this.dirty && this._visible )
    {
//        this._root.set_dirty();
        this._root.update();
    }

    return this;
  },

  is_dirty: function()
  {
    if( ! this._visible )
      return;

    var is_dirty = this.dirty;

    for( c in this._children )
      is_dirty |= this._children[c].is_dirty();

    return is_dirty;
  },


  //
  update: function(f)
  {
    // call root parent if child (ie rendering always occurs from the root node)
    if( ! this.is_root() )
    {
      console.error('Widget.update: Called from a non-root widget.');
      return;
    }

    f = f || false;

    // skip this update if we have a pending/scheduled update
    if( this._loop_timer != null )
      return;

    if( this._process() || f )
    {
      this.context.save();

      this.context.scale(this.scale, this.scale);

      this._render(this.context, 0, 0);

      this.context.restore();

      // reschedule if we're looping
      var self = this;

      if( this._loop_timer == null )
        this._loop_timer = setTimeout( function(){ self._loop_timer = null; self.update(); }, ANIMATE_FRAME_TIME_SPACING);
    }
  },

  
  toString: function()
  {
    return this._type + ' { root: ' + this._is_root + ', visible: ' + this._visible +  ', bounds: ' + this._bounds.toString() + ', children: ' + this._children.length + ' }';
  },

  //
  // EVENT HANDLING
  //

  /**
   *
   */
  add_event_listener: function(a, cb)
  {
    if( this.valid_events.indexOf(a) === -1 )
    {
      console.warn('Widget.add_event_listener: Invalid event type supplied: ' + a);
      return;
    }

    // assume we're a touch interface if using touch events
    if( a.startsWith('touch_') )
      this.is_touch = true;

    this.event_cb[a] = cb;

    return this;
  },

  /**
   * Handle a mouse move event
   *
   * @param e Mouse event object
   * @param o Widget object handling mouse move
   * @param a event type string [mousemove,mousedown,mouseup...]
   */
  _mouse_listener: function(e, o, a)
  {
    if( this._debug )
      console.log('DEBUG (' + this._id + '): got mouse.');

    if (this.is_touch) return;

    var x = (e.pageX - o.canvas.offsetLeft) / this.scale;
    var y = (e.pageY - o.canvas.offsetTop) / this.scale;

    o._mouse_process(x, y, a);
  },

  /**
   * Handle a touch event
   *
   * @param e Touch event object
   * @param o Widget object handling mouse move
   * @param a event type string [touch_start,touch_move,touch_end...]
   */
  _touch_listener: function(e, o, a)
  {
    if( this._debug )
      console.log('DEBUG: got touch.');

    e.preventDefault();
    var touches = e.changedTouches;
    var first = touches[0];
    var mouse_type = '';

    switch( a )
    {
      case 'touch_start':
        mouse_type = 'mouse_down';
        break;
      case 'touch_move':
        mouse_type = 'mouse_move';
        break;
      case 'touch_end':
        mouse_type = 'mouse_up';
        break;
      case 'touch_cancel':
        mouse_type = 'mouse_out';
        break;
      default: {
        console.warn('Widget.touch_listener: Unhandled touch type ' + e.type);
        return;
      }
    }

    var x = (first.pageX - o.canvas.offsetLeft) / this.scale;
    var y = (first.pageY - o.canvas.offsetTop) / this.scale;

    o._mouse_process(x, y, mouse_type);
  },

  /**
   *
   */
  _mouse_process: function(x, y, a)
  {
    var handled = false;

    // ignore invisible widgets
    if( ! this._visible || this.alpha === 0 )
      return handled;

    // shortcut mouse moves if the mouse is up
    // we are a touch framework...
    if( this.is_touch && !this.is_pressed && a == 'mouse_move')
      return handled;

    // if we don't intersect not should our kids, just say no!
    // we could check the clipping but I say no you can't play
    // with the kids outside the parent area...
    if( ! this._bounds.intersects(x,y) )
    {
      // continue to track a button press appropriately
      if( this.is_pressed && a === 'mouse_up' )
      {
        this.is_pressed = false;
        this.set_dirty(true);
      }

      return handled;
    }

    // children need to operate on relative point to current
    var cx = x - this._bounds.x;
    var cy = y - this._bounds.y;

    for( var c = this._children.length - 1; c >= 0; c-- )
    {
      handled |= this._children[ c ]._mouse_process(cx, cy, a);

      // stop processing children if already handled
      if( handled )
        break;
    }

    if( ! handled )
    {
      // execute the system call back
      if( typeof this[a] === 'function' )
        handled |= this[a](x, y);

      // execute the user call back
      if( typeof this.event_cb[a] === 'function' )
        handled |= this.event_cb[a](this, x, y);

      // perform correlated actions (eg click)
      switch( a )
      {
        case 'mouse_up':
          handled |= this._mouse_up(x, y);

          if( this.is_pressed )
          {
            if( this.is_dragged )
            {
              // execute the system callback
              handled |= this._mouse_drag_end(x, y);

              // execute the user callback
              if( this.event_cb['mouse_drag_end'] )
                handled |= this.event_cb['mouse_drag_end'](this, x, y);
            }
            else
            {
              // execute the system callback
              handled |= this._mouse_click(x, y);

              // execute the user callback
              if( this.event_cb['mouse_click'] )
                handled |= this.event_cb['mouse_click'](this, x, y);
            }
          }

          this.is_pressed = false;
          this.is_dragged = false
          this.set_dirty(true);
          break;

        case 'mouse_down':
          handled |= this._mouse_down(x, y);

          this.is_pressed = true;
          this.pressed_x = x;
          this.pressed_y = y;
          this.set_dirty(true);
          break;

        case 'mouse_move':
          handled |= this._mouse_move(x, y);

          if( this.is_pressed )
          {
            var x_delta = Math.abs(x - this.pressed_x);
            var y_delta = Math.abs(y - this.pressed_y);

            if( this.is_dragged )
            {
              // execute the system callback
              handled |= this._mouse_drag_move(x, y);

              // execute the user callback
              if( this.event_cb['mouse_drag_move'] )
                handled |= this.event_cb['mouse_drag_move'](this, x, y);

            }
            else if( x_delta > 5 || y_delta > 5 )
            {
              this.is_dragged = true;

              // execute the system callback
              handled |= this._mouse_drag_start(x, y);

              // execute the user callback
              if( this.event_cb['mouse_drag_start'] )
                handled |= this.event_cb['mouse_drag_start'](this, x, y);
            }
          }

          break;
      }
    }
    // cancel a mouse down if mouse_up occured out of widget
    else if( this.is_pressed &&
             ( a === 'mouse_up' || a === 'mouse_out' ) )
    {
      // mouse_click event does NOT occur when event closes out of widget
      this.is_pressed = false;

      // mouse_drag_end event DOES occur when event closes out of widget
      if( this.is_dragged )
      {
        this._mouse_drag_end(x, y);

        if( this.event_cb['mouse_drag_end'] )
          this.event_cb['mouse_drag_end'](this, x, y);
      }

      this.is_dragged = false;
      this.set_dirty(true);
    }

    return handled;
  },

  _mouse_up: function(x, y) {},
  _mouse_down: function(x, y) {},
  _mouse_move: function(x, y) {},
  _mouse_click: function(x, y) {},
  _mouse_drag_start: function(x, y) {},
  _mouse_drag_move: function(x, y) {},
  _mouse_drag_end: function(x, y) {},


  //
  // PROCESS AND RENDERING
  //

  _process: function()
  {
    if( ! this._visible )
      return;

    // TODO: animations stack should perhaps use an associative array
    // with a helper function to add and remove animations from the stack.
    // this will allow finer control/separation of intra and inter widget
    // animations

    // are we animating
    // check if have any animations on the animate stack
    if( this.animate.length > 0 )
    {
      for( var a in this.animate )
      {
        // call process function passing current frame index as appropriate
        if( 'process' in this.animate[a] )
          this.animate[a]['process'](this.animate[a]['index']);

        // increment the our frame index
        this.animate[a]['index']++;

        // wrap the frames if we are looping
        if( this.animate[a]['loop'] )
          this.animate[a]['index'] %= this.animate[a]['frames'];

        if( this.animate[a]['index'] >= this.animate[a]['frames'] )
        {
          if( 'complete' in this.animate[a] )
            this.animate[a]['complete']();

          delete this.animate[a];
        }
      }

      // filter out all completed (ie deleted/undefined) animations
      this.animate = this.animate.filter( function(v){ return (v !== undefined); } );

      // mark this control as dirty due to an animation occuring
      this.dirty = true;

      // mark the parent of this widget dirty also, but don't force an update since
      // we're in the middle of an update
//      if( this._parent )
//        this._parent.set_dirty(true, false);
    }

    // track dirty states of children
    var is_dirty = this.dirty

    for( c in this._children )
      is_dirty |= this._children[c]._process();

    // return aggregate dirty state
    return is_dirty;
  },

  _render: function(context, x, y)
  {
    if( ! ( context instanceof CanvasRenderingContext2D ) ||
        ! this._visible )
      return;

    // save our context
    context.save();

    // offset the view (accounts for animations)
    context.translate(x + this._offset.x, y + this._offset.y);

    if( this.alpha > 0 && this.alpha < 1 )
      context.globalAlpha = this.alpha;

    // perform clipping as appropriate
    if( this.clip )
    {
      context.beginPath();
      context.rect(this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
      context.clip();
      context.closePath();
    }

    // draw the widget if we're actually dirty
    // if( this.dirty )
      this._render_widget(context);

    // post process traversal
    for( c in this._children )
      this._children[c]._render(context, this._bounds.x, this._bounds.y);

    context.restore();

    this.dirty = false;
  },

  /**
   * Render the widget, called after we have done the updates.
   * So we have finished the animations and we now know if the widget is
   * visible that is the alpha > 0 scale > 0 and visible is true.
   * Here we clip and then call the render_widget and then render
   * all of our children.
   * Once we are done we can set dirty to false because we've rendered the
   * current changes.
   */
  _render_widget: function(context)
  {
    // draw the widget
    if( this.background_color instanceof Color )
    {
      context.fillStyle = this.background_color.get_rgba(this.alpha);
      context.fillRect(this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
    }

    if( this.background_image instanceof Image &&
        this.background_image.naturalWidth !== 0 )
    {
      context.drawImage(this.background_image, this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
    }

    this._render_caption(context);
  },

  /**
   * Render the widget's text caption
   */
  _render_caption: function(context)
  {
    if( this.caption === '' )
      return;

    var x = this._bounds.x;
    var y = this._bounds.y;

    switch( this.text_alignment_horizontal )
    {
      case 'center':
        x += this._bounds.w / 2;
        context.textAlign = 'center';
        break;
      case 'right':
        x += (this._bounds.w) - this.right_margin;
        context.textAlign = 'right';
        break;
      case 'left':
        x += this.left_margin;
        context.textAlign = 'left';
        break;
    }

    switch( this.text_alignment_vertical )
    {
      case 'top':
        y += this.top_margin;
        context.textBaseline = 'top';
        break;
      case 'middle':
        context.textBaseline = 'middle';
        y += (this._bounds.h/2);
        break;
      case 'bottom':
        context.textBaseline = 'bottom';
        y += (this._bounds.h) - this.bottom_margin;
        break;
    }

    context.font = this._font.get_font();

    if( this._font_color instanceof Color )
      context.fillStyle = this._font_color.get_rgba(this.alpha);

    if(this.multi_line_text_enabled)
      this.fill_multi_line_text(context, this.caption, x, y);
    else
      context.fillText(this.caption, x, y);
  },

  /**
   * render a rounded corner rectangle
   */
  draw_round_rectangle: function(context)
  {
    context.beginPath();

    // set pen
    context.lineWidth = this._border_width;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'black';

    if( this.background_color instanceof Color )
      context.fillStyle = this.background_color.get_rgba(this.alpha);
    else
      context.fillStyle = 'rgba(0,0,0,0)';

    var w = this._bounds.w;
    var h = this._bounds.h;
    var x = this._bounds.x;
    var y = this._bounds.y;

    // left side
    context.moveTo(x, y + this._border_radius);
    context.arcTo(x, y + h, x + this._border_radius, y + h, this._border_radius);

    // bottom
    context.arcTo(x + w, y + h, x + w, y + h - this._border_radius, this._border_radius);

    // right side
    context.arcTo(x + w, y, x + w - this._border_radius, y, this._border_radius);

    // top
    context.arcTo(x, y, x, y + this._border_radius, this._border_radius);
    context.stroke();
    context.fill();
    context.closePath();
  },

  /**
   * Render a non-rounded corner rectangle
   */
  draw_square_rectangle: function(context)
  {
    context.beginPath();
    // set pen
    context.lineWidth = this._border_width;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'black';

    if( this.background_color instanceof Color )
      context.fillStyle = this.background_color.get_rgba(this.alpha);

    var w = this._bounds.w;
    var h = this._bounds.h;
    var x = this._bounds.x;
    var y = this._bounds.y;

    context.moveTo(x, y);

    context.lineTo(x, y + h);       // left
    context.lineTo(x + w, y + h);   // bottom
    context.lineTo(x + w, y);       // right
    context.lineTo(x, y);           // top

    context.stroke();
    context.closePath();
  },


});
