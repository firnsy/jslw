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

var CheckBox = Widget.extend({
  /**
   * Primary constructor for the CheckBox object
   * @param {Widget} p Parent of this CheckBox
   * @param {Rect} r Rectangle bounding box of this CheckBox
   * @param {Color} c Color of this CheckBox
   */
  constructor: function (p, r, c)
  {
    // call our super constructor
    this.base.apply(this, arguments);
    this._type = 'CheckBox';

    this.checked = false;

    this.set_text_alignment_horizontal('center');
    this.set_text_alignment_vertical('middle');

    // overlay
    this.overlay = null;
    this.set_overlay_alignment_horizontal('center');
    this.set_overlay_alignment_vertical('middle');
    this.overlay_image = null;

    // turn of clipping to handle the overlay
    this.clip = false;
  },

  //
  // OVERLAY IMAGE (ON CHECKED)
  set_overlay_image: function(i)
  {
    if( i instanceof Image )
    {
      this.overlay_image = i;

      if( i.complete && i.width > 0 )
      {
        this._overlay_calculate_offset();
        this.set_dirty(true);
      }
    }
    else
    {
      this.overlay_image = new Image();

      this.overlay_image.src = i;
      this.overlay_image.onerror = function() {
        console.error('Unable to load image: ' + this.src);
      };

      var self = this;
      this.overlay_image.onload = function() {
        self._overlay_calculate_offset();
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

    this._overlay_calculate_offset();
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

    this._overlay_calculate_offset();
  },

  //
  // PRIVATE METHODS
  //

  _overlay_calculate_offset: function()
  {
    if( this.overlay == null )
      this.overlay = new Rect(this.bounds);
    else
    {
      this.overlay.x = this.bounds.x;
      this.overlay.y = this.bounds.y;
    }

    if( this.overlay_image )
    {
      this.overlay.w = this.overlay_image.width;
      this.overlay.h = this.overlay_image.height;
    }
    else
    {
      this.overlay.w = this.overlay.w;
      this.overlay.h = this.overlay.h;
    }

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

    // draw the check if exists && checked
    if( this.checked &&
        this.overlay_image instanceof Image &&
        this.overlay_image.src != '' &&
        this.overlay_image.complete )
    {
      // TODO: optimise this hack out (introduced due to late loading of images via the cache)
      if( this.overlay == null )
        this._overlay_calculate_offset();

      context.drawImage(this.overlay_image, this.overlay.x, this.overlay.y, this.overlay.w, this.overlay.h);
    }

    this.render_caption(context);
  }
});
