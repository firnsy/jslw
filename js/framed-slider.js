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

var FramedSlider = Widget.extend({
  constructor: function(p, r, s)
  {
    // call our super constructor
    this.base.apply(this, arguments);
    this._type = 'Slider';

    this.background_image_up = null;
    this.background_image_down = null;
    this.level_image = null;
    this.level = 0;
    this.margins = 5;
    this.drag_start = new Vector2(0,0);
    this.drag_delta = new Vector2(0,0);
    this.is_drag = false;

    this._current_frame = 0;

    var dirtify = function(slider) { slider.set_dirty(true); };

    this
      .add_event_listener('mouse_down', dirtify)
      .add_event_listener('mouse_drag_end', dirtify)
      .add_event_listener('mouse_drag_move', dirtify);

    return this;
  },

  //
  // PUBLIC METHODS
  //

  /**
   * Set the slider level, the slider is a 0..100 based index
   */
  set_level: function(l)
  {
    // no update while setting
    if( this.is_drag )
      return;

    if( l < 0 )
      l = 0;
    else if( l > 100 )
      l = 100;

    // only update on change
    if( this.level != l ) {
      this.level = l;
      this.set_dirty(true);
    }

    return this;
  },

  /**
   * Set the slider margins, the bit that is outside the slider area
   */
  set_margins: function(m)
  {
    this.margins = m;

    return this;
  },

  /**
   * Override the add event listener to make sure we add
   * the change background image to the slider on mouse
   * up/down and that we force a redraw on move so the
   * level is changed
   * 
   */
  add_event_listener: function(a, cb)
  {
    switch(a)
    {
      case 'mouse_down':
        this.event_cb[a] = function(slider, x, y) {
          slider.background_image = slider.background_image_down;
          slider.drag_start.set(x,y);
          slider.is_drag = true;
          slider.set_dirty(true);
          cb(slider, x, y);
        };
        break;
      case 'mouse_drag_end':
        this.event_cb[a] = function(slider, x, y) {
          slider.background_image = slider.background_image_up;
          slider.set_dirty(true);
          slider.is_drag = false;
          cb(slider, x, y);
        };
        break;
      case 'mouse_drag_move':
        this.event_cb[a] = function(slider, x, y) {
          slider.drag_delta.set(x,y);
          slider.drag_delta.difference(slider.drag_start);

          // calc % change
          slider.level = slider.level + slider._calculate_slider_level();

          if (slider.level < 0 )
            slider.level = 0;
          else if (slider.level > 100)
            slider.level = 100;

          slider._current_frame = Math.round(slider._slider_frames * slider.level / 100);

          slider.set_dirty(true);
          console.log('slider % ' + slider.level + ", frame: " + slider._current_frame);

          // new start point
          slider.drag_start.set(x,y);
          cb(slider, x, y);
        };
        break;
      default:
        // call the base class for all other events
        this.base.add_event_listener.call(this, a, cb);
    }

    return this;
  },

  /**
   * Sets the default state image
   */
  set_framed_image: function(i)
  {
    if( i instanceof HTMLImageElement )
    {
      this._framed_background_image = i;
      this._calculate_slider_frames();
      this.set_dirty(true);
    }
    else
    {
      this._framed_background_image = new Image();

      this._framed_background_image.src = i;
      this._framed_background_image.onerror = function(){ alert("Unable to load image: " + this.src); };

      var self = this;
      this._framed_background_image.onload = function() {
        self._calculate_slider_frames();
        self.set_dirty(true);
      };
    }

    return this;
  },

  /**
   * Sets the on pressed image
   */
  set_background_image_down: function(path)
  {
    this.background_image_down = new Image();

    this.background_image_down.src = path;
    this.background_image_down.onerror = function(){ alert("Unable to load image: " + this.src); };

    var self = this;
    this.background_image_down.onload = function() { self.set_dirty(true); };

    return this;
  },

  /**
   * Sets the on pressed image
   */
  set_level_image: function(path)
  {
    this.level_image = new Image();

    this.level_image.src = path;
    this.level_image.onerror = function(){ alert("Unable to load image: " + this.src); };

    var self = this;
    this.level_image.onload = function() { self.set_dirty(true); };

    return this;
  },

  //
  // PRIVATE
  //

  _calculate_slider_frames: function()
  {
    if( this._framed_background_image instanceof Image &&
        this._framed_background_image.naturalWidth > 0 )
    {
      this._slider_frames = Math.floor(this._framed_background_image.naturalWidth / this._bounds.w) *
        Math.floor(this._framed_background_image.naturalHeight / this._bounds.h)

      console.log("Frames: " + this._slider_frames);
    }
  },



  /**
   * Calculates the slider level change from the delta
   */
  _calculate_slider_level: function()
  {
    if (this._bounds.w > this._bounds.h) {
      var dx = this.drag_delta.x;
      dx = 100*dx / (this._bounds.w - this.margins);
      //console.log("%w " + dx);
      return dx;
    }
    else {
      var dy = -this.drag_delta.y;
      dy = 100*dy / (this._bounds.h - this.margins);
      //console.log("%h " + dy);
      return dy;
    }
  },

  _render_widget: function(context)
  {
    // draw the fill color
    if( this.background_color instanceof Color )
    {
      context.fillStyle = this.background_color.get_rgba(Math.round(this.alpha * 255));
      context.fillRect(this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
    }
    /*
    // draw the level bar
    if( this.level_image instanceof Image &&
        this.level > 0 ) 
    {
      var width = this._bounds.w;
      var height = this._bounds.h;
      var xorig = this._bounds.x;
      var yorig = this._bounds.y;
      var internal_height = this._bounds.h - this.margins;
      var internal_width = this._bounds.w - this.margins;

      // we are going to assume that the long axis is the drag axis.
      if (width > height) { 
        width = internal_width* (this.level/100.0);
        xorig = xorig + this.margins / 2;
      }
      else { 
        yorig = yorig + this.margins / 2;
        height = internal_height* (this.level/100.0);
        yorig = yorig + internal_height - height;
      }

      context.drawImage(this.level_image, xorig, yorig, width, height);
    }
    */

    // draw the background image
    if( this._framed_background_image instanceof Image &&
        this._framed_background_image.naturalWidth !== 0 )
    {
      context.drawImage(this._framed_background_image,
        0,
        this._bounds.h * this._current_frame,
        this._bounds.w,
        this._bounds.h,
        this._bounds.x,
        this._bounds.y,
        this._bounds.w,
        this._bounds.h);
    }
  },

});
