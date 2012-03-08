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

var Slider = Widget.extend({
  constructor: function(p, r, c)
  {
    // call our super constructor
    this.base.apply(this,arguments);

    this.background_image_up = null;
    this.background_image_down = null;
    this.level_image = null;
    this.level = 0;
    this.margins = 0;
    this.drag_start = new Vector2(0,0);
    this.drag_delta = new Vector2(0,0);
    this.is_drag = false;

    var dirtify = function(slider) { slider.set_dirty(true); };
    this.add_event_listener('mouse_down', dirtify);
    this.add_event_listener('mouse_drag_end', dirtify);
    this.add_event_listener('mouse_drag_move', dirtify);
  }

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
      case "mouse_down":
        this.event_cb[a] = function(slider, x, y) {
          slider.background_image = slider.background_image_down;
          slider.drag_start.set(x,y);
          slider.is_drag = true;
          slider.set_dirty(true);
          cb(slider, x, y);
        };
        break;
      case "mouse_drag_end":
        this.event_cb[a] = function(slider, x, y) {
          slider.background_image = slider.background_image_up;
          slider.set_dirty(true);
          slider.is_drag = false;
          cb(slider, x, y);
        };
        break;
      case "mouse_drag_move":
        this.event_cb[a] = function(slider, x, y) {
          slider.drag_delta.set(x,y);
          slider.drag_delta.difference(slider.drag_start);

          // calc % change
          slider.level = slider.level + slider._calculate_slider_level();

          if (slider.level < 0 )
            slider.level = 0;
          else if (slider.level > 100)
            slider.level = 100;

          slider.set_dirty(true);
          console.log('slider% ' + slider.level);

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
  set_background_image_up: function(path)
  {
    this.background_image_up = new Image();

    this.background_image_up.src = path;
    this.background_image_up.onerror = function(){ alert("Unable to load image: " + this.src); };

    var self = this;
    this.background_image_up.onload = function() { self.set_dirty(true); };

    // default image is up
    this.background_image = this.background_image_up;

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

  render_widget: function(context)
  {
    // draw the fill color
    if( this.background_color instanceof Color )
    {
      context.fillStyle = this.background_color.get_rgba(Math.round(this.alpha * 255));
      context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
    }

    // draw the level bar
    if( this.level_image instanceof Image &&
        this.level > 0 ) 
    {
      var width = this.bounds.w;
      var height = this.bounds.h;
      var xorig = this.bounds.x;
      var yorig = this.bounds.y;
      var internal_height = this.bounds.h - this.margins;
      var internal_width = this.bounds.w - this.margins;

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
    // draw the background image
    if( this.background_image instanceof Image &&
        this.background_image.width > 0 )
    {
      context.drawImage(this.background_image, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
    }
  },

  /**
   * Calculates the slider level change from the delta
   */
  _calculate_slider_level: function()
  {
    if (this.bounds.w > this.bounds.h) {
      var dx = this.drag_delta.x;
      dx = 100*dx / (this.bounds.w - this.margins);
      //console.log("%w " + dx);
      return dx;
    }
    else {
      var dy = -this.drag_delta.y;
      dy = 100*dy / (this.bounds.h - this.margins);
      //console.log("%h " + dy);
      return dy;
    }
  },
});
