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
  /**
   * @constructor
   * Primary constructor for the Widget object
   * @param {Widget} p Parent of this widget, only the root object has no parent
   * @param {Rect} r Rectangle bounding box of this widget
   * @param {Color} c Color of this Widget
   */
  constructor: function(p, r, c)
  {
    if( arguments.length === 0 )
      return;

    this.set_parent(p);

    if( ! ( r instanceof Rect ) )
    {
      console.error('Bounds for widget must be of type Rect:' + p.toString());
      return;
    }

    this.bounds = r;

    if( c instanceof Color )
      this.background_color = c;
    else
      this.background_color = null;

    this.offset = new Vector2(0, 0);
    this.background_image = null;

    //
    // default member initialisation

    // track widget heirarchy
    this.root = false;
    this._parent = null;
    this.children = [];

    // base characteristics
    this.caption = '';
    this.font = new Font('12px sans-serif');
    this.font_color = new Color('#000');
    this.set_text_alignment_horizontal('left');
    this.set_text_alignment_vertical('middle');

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

    this.register_callbacks(this);

    // process/render state
    this.visible = true;
    this.dirty = false;
    this.alpha = 1.0;
    this.clip = true;
    this.scale = 1.0;

    this.looping = false;
    this.loop_timer = null;
    this.canvas = null;
    this.context = null;

    // border
    this.has_border = false;
    this.border_width = 1;
    this.radius = 0;

    // text margins
    this.right_margin = 0;
    this.left_margin = 0;
    this.top_margin = 0;
    this.bottom_margin = 0;

    // multi line support
    this.multi_line_text_enabled = false;
    this.text_height = this.get_text_height();
  },

  _parent: null,
  root:   null,


  //
  // PUBLIC METHODS
  //

  /**
   *
   */
  get_root: function()
  {
    if( this.root )
      return this;
    else if( ! ( this._parent instanceof Widget ) )
      return null;
    else
      return this._parent.get_root();
  },

  is_root: function()
  {
    return this.root;
  },

  /**
   *
   */
  set_root: function()
  {
    if( this._parent instanceof Widget )
      console.warn('set_root: This widget has a parent.');

    this.root = true;

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
      this.root_widget = this.get_root();

      p.add_child(this);
    }

    return this;
  },

  /**
   * Add a child widget to this
   */
  add_child: function(c)
  {
    // add child to list of children
    if( c instanceof Widget )
      this.children.push(c);
    else
      console.error("add_child: Non widget instance provided.");

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
      console.error('Scale must a positive real number.');

    return this;
  },

  /**
   * Ask the question can we be seen? If our scale or
   * alpha are small enough then we can't. Also if the
   * visible boolean is false we are not rendered
   */
  get_visibility: function()
  {
    return this.visible &&
           ( this.alpha > 0 ) &&
           ( this.scale > 0 );
  },

  /**
   * Sets the visible state
   */
  set_visibility: function(state)
  {
    this.visible = ( state ) ? true : false;

    return this;
  },


  /**
   * Hide the widget by setting its visible to false
   */
  hide: function()
  {
    this.visible = false;
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
    this.offset.set(0, 0);
    this.visible = true;

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
    var offset = this.offset;

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
      Math.ceil((o.x - this.bounds.x) / animate_frames),
      Math.ceil((o.y - this.bounds.y) / animate_frames)
    );

    var self = this;

    this.animate.push({
      frames:   animate_frames,
      index:    0,
      loop:     false,
      process:  function() {
        self.bounds.translate(delta);
      },
      complete: function() {
        self.bounds.x = o.x;
        self.bounds.y = o.y;
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
  slideIn: function(d, s, cb)
  {
    var offset = this.offset;

    // check if the widget is already "in" and showing
    if( offset.x === 0 && offset.y === 0 && this.visible)
      return;

    // set sane default direction
    d = d || "left";

    // set sane default speed
    s = parseInt(s);
    if( s === 0 || s === 'NaN' )
      s = 1000;

    // set sane callback
    if( typeof cb !== 'function' )
      cb = function() {};

    // calculate number of frames to animate for
    var animate_frames = Math.ceil(s / ANIMATE_FRAME_TIME_SPACING);

    var delta;

    switch( d )
    {
      case "left":
        delta = new Vector2(
          Math.ceil(this.bounds.x2 / animate_frames),
          0
        );
        break;
      case "right":
        delta = new Vector2(
          -Math.ceil((this._parent.bounds.w - this.bounds.x) / animate_frames),
          0
        );
        break;
      case "up":
        delta = new Vector2(
          0,
          Math.ceil(this.bounds.y2 / animate_frames)
        );
        break;
      case "down":
        delta = new Vector2(
          0,
          -Math.ceil((this._parent.bounds.h - this.bounds.y) / animate_frames)
        );
        break;
      default:
        return;
    }

    offset.set(delta);
    offset.scale(-animate_frames);

    // push this animation on the animate stack
    this.animate.push({
      frames:   animate_frames,
      index:    0,
      loop:     false,
      process:  function() {
        offset.translate(delta);
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
  slideOut: function(d, s, cb)
  {
    var offset = this.offset;

    // check if we the widget is already "out"
    if( offset.x !== 0 || offset.y !== 0 )
      return;

    // set sane default direction
    d = d || "left";

    // set sane default speed
    s = parseInt(s);
    if( s === 0 || s === 'NaN' )
      s = 1000;

    // set sane callback
    if( typeof cb !== 'function' )
      cb = function() {};

    // calculate number of frames to animate for
    var animate_frames = Math.ceil(s / ANIMATE_FRAME_TIME_SPACING);

    var offset_final;

    switch( d )
    {
      case "left":
        offset_final = new Vector2(
          -Math.ceil(this.bounds.x2),
          0
        );
        break;
      case "right":
        offset_final = new Vector2(
          Math.ceil(this._parent.bounds.w - this.bounds.x),
          0
        );
        break;
      case "up":
        offset_final = new Vector2(
          0,
          -Math.ceil(this.bounds.y2)
        );
        break;
      case "down":
        offset_final = new Vector2(
          0,
          Math.ceil(this._parent.bounds.h - this.bounds.y)
        );
        break;
      default:
        return;
    }

    var delta = new Vector2(offset_final);
    delta.scale(1 / animate_frames);

    // push this animation on the animate stack
    this.animate.push({
      frames:   animate_frames,
      index:    0,
      loop:     false,
      process:  function() {
        offset.translate(delta);
      },
      complete: function() {
        offset = offset_final;
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
  fadeToggle: function(s, cb)
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
  fadeIn: function(s, cb)
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
  fadeOut: function(s, cb)
  {
    // check if we the widget is already "out"
    if( ( this.alpha === 0 ) || ( ! this.visible ) )
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
    {
      this.font = f;
      this.get_text_height();
    }
    else
      console.error('set_font: Must supply a Font object. Got ' + f.toString());

    return this;
  },

  /**
   * Sets the text font color
   */
  set_font_color: function(c)
  {
    if( ! c instanceof Color )
    {
      console.log('ERROR: Must supply a Color object.');
      return;
    }

    this.font_color = c;

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

      if( i.src != '' && i.complete )
        this.set_dirty(true);
    }
    else
    {
      this.background_image = new Image();

      this.background_image.src = i;
      this.background_image.onerror = function(){ alert("Unable to load image: " + this.src); };

      var self = this;
      this.background_image.onload = function() { self.set_dirty(true); };
    }

    return this;
  },

  /**
   * Sets the solid fill background color, we should also offer a set background
   * gradient to allow for gradient fills
   */
  set_background_color: function(c)
  {
    if( ! c instanceof Color )
    {
      console.error('set_backgound_color: Must supply a Color object.');
      return;
    }

    this.background_color = c;

    return this;
  },

  /**
   * Set the border flag, toggles rendering of the border
   */
  set_border: function(hasBorder)
  {
    this.has_border = hasBorder;
  },

  /**
   * Set the border line width
   */
  set_border_width: function(borderWidth)
  {
    this.border_width = borderWidth;
  },

  /**
   * Set the border corner radius, also used to clip fill color
   */
  set_radius: function(radius)
  {
    this.radius = radius;
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
    var currentLine = 0; lineHeight = this.text_height;
    text = text.replace(/(\r\n|\n\r|\r|\n)/g, "\n");
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
      if(lineWidth > this.bounds.w)
      {
        // TODO. Handle this case.
      }
      else
      {
        printLine(line);
      }
    }
  },

  get_text_height: function()
  {
    var body = document.getElementsByTagName("body")[0];
    var heightEl = document.createElement("div");
    var heightNode = document.createTextNode("M");
    heightEl.appendChild(heightNode);
    heightEl.setAttribute("style", this.font);
    body.appendChild(heightEl);
    var result = heightEl.offsetHeight;
    body.removeChild(heightEl);
    return result;
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
      console.log('WARN: Invalid event type supplied: ' + a);
      return;
    }

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
  mouse_listener: function(e, o, a)
  {
    if (this.is_touch) return;

    var x = (e.pageX - o.canvas.offsetLeft) / this.scale;
    var y = (e.pageY - o.canvas.offsetTop) / this.scale;

    o.mouse_process(x, y, a);
  },

  /**
   * Handle a touch event
   *
   * @param e Touch event object
   * @param o Widget object handling mouse move
   * @param a event type string [touch_start,touch_move,touch_end...]
   */
  touch_listener: function(e, o, a)
  {
    e.preventDefault();
    var touches = e.changedTouches;
    this.is_touch = true;
    var first = touches[0];
    var mouse_type = "";

    //console.log('touch type ' + e.type);

    switch(a)
    {
      case "touch_start":
        mouse_type = "mouse_down";
        break;
      case "touch_move":
        mouse_type="mouse_move";
        break;
      case "touch_end":
        mouse_type="mouse_up";
        break;
      case "touch_cancel":
        mouse_type="mouse_out";
        break;
      default: {
        console.log('unhandled touch type ' + e.type);
        return;
      }
    }

    var x = (first.pageX - o.canvas.offsetLeft) / this.scale;
    var y = (first.pageY - o.canvas.offsetTop) / this.scale;

    o.mouse_process(x, y, mouse_type);
  },

  /**
   * 
   */
  mouse_process: function(x, y, a)
  {
    var handled = false;

    // ignore invisible widgets
    if( ! this.visible || this.alpha === 0 )
      return handled;

    // shortcut mouse moves if the mouse is up
    // we are a touch framework...
    if (!this.is_pressed && a == 'mouse_move')
      return handled;

    // if we don't intersect not should our kids, just say no!
    // we could check the clipping but I say no you can't play
    // with the kids outside the parent area...
    if (! this.bounds.intersects(x,y))
      return handled;

    // children need to operate on relative point to current
    var cx = x - this.bounds.x;
    var cy = y - this.bounds.y;

    for( var c = this.children.length - 1; c >= 0; c-- )
    {
      handled |= this.children[ c ].mouse_process(cx, cy, a);

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
          if( this.is_pressed )
          {
            if( this.is_dragged )
            {
              // execute the system callback
              handled |= this.mouse_drag_end(x, y);

              // execute the user callback
              if( this.event_cb['mouse_drag_end'] )
                handled |= this.event_cb['mouse_drag_end'](this, x, y);
            }
            else
            {
              // execute the system callback
              handled |= this.mouse_click(x, y);

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
          this.is_pressed = true;
          this.pressed_x = x;
          this.pressed_y = y;
          this.set_dirty(true);
          break;

        case 'mouse_move':
          if( this.is_pressed )
          {
            var x_delta = Math.abs(x - this.pressed_x);
            var y_delta = Math.abs(y - this.pressed_y);
            if( this.is_dragged )
            {
              // execute the system callback
              handled |= this.mouse_drag_move(x, y);

              // execute the user callback
              if( this.event_cb['mouse_drag_move'] )
                handled |= this.event_cb['mouse_drag_move'](this, x, y);

            }
            else if( x_delta > 20 || y_delta > 20 )
            {
              this.is_dragged = true;

              // execute the system callback
              handled |= this.mouse_drag_start(x, y);

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
             ( a == 'mouse_up' || a == 'mouse_out' ) )
    {
      // mouse_click event does NOT occur when event closes out of widget
      this.is_pressed = false;

      // mouse_drag_end event DOES occur when event closes out of widget
      if( this.is_dragged )
      {
        this.mouse_drag_end(x, y);

        if( this.event_cb['mouse_drag_end'] )
          this.event_cb['mouse_drag_end'](this, x, y);
      }

      this.is_dragged = false;
      this.set_dirty(true);
    }

    return handled;
  },

  /**
   * 
   */
  register_callbacks: function(o)
  {
  },

  mouse_up: function(x, y) {},
  mouse_down: function(x, y) {},
  mouse_move: function(x, y) {},
  mouse_click: function(x, y) {},
  mouse_drag_start: function(x, y) {},
  mouse_drag_move: function(x, y) {},
  mouse_drag_end: function(x, y) {},


  //
  // PROCESS AND RENDERING
  //

  /**
   * Setup the canvas element and attach the event listeners
   */
  set_canvas: function(canvas)
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

    var self = this;

    // apply our generic listener's to the canvas DOM
    canvas.addEventListener("touchstart", function(e){ self.touch_listener(e, self, 'touch_start') }, false);
    canvas.addEventListener("touchmove", function(e){ self.touch_listener(e, self, 'touch_move') }, false);
    canvas.addEventListener("touchend", function(e){ self.touch_listener(e, self, 'touch_end') }, false);
    canvas.addEventListener("touch", function(e){ self.touch_listener(e, self, 'touch') }, false);
    canvas.addEventListener("touchcancel", function(e){ self.touch_listener(e, self, 'touch_cancel') }, false);
    canvas.addEventListener("mousedown", function(e){ self.mouse_listener(e, self, 'mouse_down') }, false);
    canvas.addEventListener("mouseup", function(e){ self.mouse_listener(e, self, 'mouse_up') }, false);
    canvas.addEventListener("mousemove", function(e){ self.mouse_listener(e, self, "mouse_move") }, false);
    canvas.addEventListener("mouseout", function(e){ self.mouse_listener(e, self, "mouse_out") }, false);

    return this;
  },

  /**
   * Sets the widget dirty, if it is visible try to 
   * kick off a new update
   */
  set_dirty: function(s)
  {
    this.dirty = s;

    if( this.dirty )
      this.get_root().update();

    return this;
  },

  is_dirty: function()
  {
    if( ! this.visible )
      return;

    var is_dirty = this.dirty;

    for( c in this.children )
      is_dirty |= this.children[c].is_dirty();

    return is_dirty;
  },

  process: function()
  {
    if( ! this.visible )
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

      this.dirty = true;
    }

    // track dirty states of children
    var is_dirty = this.dirty

    for( c in this.children )
      is_dirty |= this.children[c].process();

    // return aggregate dirty state
    return is_dirty;
  },

  render: function(context, x, y)
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

    // post process traversal
    for( c in this.children )
      this.children[c].render(context, this.bounds.x, this.bounds.y);

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
  render_widget: function(context)
  {
    // draw the widget
    if( this.background_color instanceof Color )
    {
      context.fillStyle = this.background_color.get_rgba(this.alpha);
      context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
    }

    if( this.background_image instanceof Image &&
        this.background_image.src != '' &&
        this.background_image.complete )
    {
      context.drawImage(this.background_image, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
    }

    this.render_caption(context);
  },

  /**
   * Render the widget's text caption
   */
  render_caption: function(context)
  {
    if( this.caption === '' )
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
        x += (this.bounds.w) - this.right_margin;
        context.textAlign = "right";
        break;
      case "left":
        x += this.left_margin;
        context.textAlign = "left";
        break;
    }

    switch( this.text_alignment_vertical )
    {
      case "top":
        y += this.top_margin;
        context.textBaseline = "top";
        break;
      case "middle":
        context.textBaseline = "middle";
        y += (this.bounds.h/2);
        break;
      case "bottom":
        context.textBaseline = "bottom";
        y += (this.bounds.h) - this.bottom_margin;
        break;
    }

    context.font = this.font.get_font();

    if( this.font_color instanceof Color )
      context.fillStyle = this.font_color.get_rgba(this.alpha);

    if(this.multi_line_text_enabled)
    {
      this.fill_multi_line_text(context, this.caption, x, y);
    }
    else
    {
      context.fillText(this.caption, x, y);
    }
  },

  /**
   * render a rounded corner rectangle
   */
  draw_round_rectangle: function(context)
  {
    context.beginPath();
    // set pen
    context.lineWidth = this.border_width;
    context.lineCap = "round";
    context.lineJoin = "round";
    if (this.border_width == 0) {
      context.strokeStyle = "transparent";
    }
    else {
      context.strokeStyle = "black";
    }
    if( this.background_color instanceof Color ) {
      context.fillStyle = this.background_color.get_rgba(this.alpha);
    }
    else {
      context.fillStyle = 'rgba(0,0,0,0)';
    }
    var width = this.bounds.w;
    var height = this.bounds.h;
    var xPos = this.bounds.x;
    var yPos = this.bounds.y;
    // left side
    context.moveTo(xPos, yPos + this.radius);
    context.arcTo(xPos, yPos + height, xPos + this.radius, yPos + height, this.radius);
    // bottom
    context.arcTo(xPos + width, yPos + height, xPos + width, yPos + height - this.radius, this.radius);
    // right side
    context.arcTo(xPos + width, yPos, xPos + width - this.radius, yPos, this.radius);
    // top
    context.arcTo(xPos, yPos, xPos, yPos + this.radius, this.radius);
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
    context.lineWidth = this.border_width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "black";
    if( this.background_color instanceof Color ) {
      context.fillStyle = this.background_color.get_rgba(this.alpha);
    }
    var width = this.bounds.w;
    var height = this.bounds.h;
    var xPos = this.bounds.x;
    var yPos = this.bounds.y;
    // left side
    context.moveTo(xPos, yPos);
    context.lineTo(xPos, yPos + height);
    // bottom
    context.lineTo(xPos + width, yPos + height);
    // right side
    context.lineTo(xPos + width, yPos);
    // top
    context.lineTo(xPos, yPos);
    context.stroke();
    context.closePath();
  },


  //
  update: function(f)
  {
    // call root parent if child (ie rendering always occurs from the root node)
    if( ! this.is_root() )
    {
      var r = this.get_root();
      if( r )
        r.update(f);
      else
        console.log('No root found for Widget: ' + this.toString());
    }

    f = f || false;

    // skip this update if we have a pending/scheduled update
    if( this.loop_timer != null )
      return;

    if( this.process() || f )
    {
      this.context.save();

      this.context.scale(this.scale, this.scale);

      this.render(this.context, 0, 0);

      this.context.restore();

      // reschedule if we're looping
      var self = this;

      if( this.loop_timer == null )
        this.loop_timer = setTimeout( function(){ self.loop_timer = null; self.update(); }, ANIMATE_FRAME_TIME_SPACING);
    }
  }
});
