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

function SlidingCheckBox(p, r, c)
{
  // call our super constructor
  this.base = Widget.prototype;
  Widget.apply(this, arguments);

  this.checked = false;

  this.type_alignment_horizontal = 'center';
  this.type_alignment_vertical = 'middle';

  // overlay
  this.overlay = null;
  this.overlay_alignment_horizontal = 'center';
  this.overlay_alignment_vertical = 'middle';
  this.overlay_image = null;

  this.drag_origin = new Vector2(0, 0);

  this.valid_events.push('state_changed');

  // turn of clipping to handle the overlay
  this.clip = false;

  this.slider = null;
}


SlidingCheckBox.prototype = new Widget();

//
// EVENTS

SlidingCheckBox.prototype.mouse_drag_start = function(x, y)
{
  this.drag_origin.set(x, y);
}

SlidingCheckBox.prototype.mouse_drag_move = function(x, y)
{
  var x_delta = x - this.drag_origin.x;

  this.drag_origin.set(x, y);

  if( this.slider instanceof Widget )
  {
    if( this.slider.bounds.x + this.slider.bounds.w + x_delta > this.bounds.w )
      this.slider.bounds.x = this.bounds.w - this.slider.bounds.w;
    else if( this.slider.bounds.x + x_delta < 0 )
      this.slider.bounds.x = 0;
    else
      this.slider.bounds.x += x_delta;

    this.set_dirty(true);
  }
}

SlidingCheckBox.prototype.mouse_drag_end = function(x, y)
{
  // fade out scrollbar
  if( this.slider instanceof Widget )
  {
    checked = ( ( this.slider.bounds.x + (this.slider.bounds.w / 2) ) > (this.bounds.w / 2) );

    if( checked )
      this.slider.slideTo( new Vector2(this.bounds.w - this.slider.bounds.w, 0), 200);
    else
      this.slider.slideTo( new Vector2(0, 0), 200);

    if( checked != this.checked )
    {
      this.checked = checked;

      //trigger check change
      if( typeof this.event_cb['state_changed'] === 'function' )
        return this.event_cb['state_changed'](this.checked);
    }
  }
}

SlidingCheckBox.prototype.mouse_click = function(x, y)
{
  // toggle the checked state
  this.checked ^= true;

  if( this.checked )
    this.slider.slideTo( new Vector2(this.bounds.w - this.slider.bounds.w, 0), 200);
  else
    this.slider.slideTo( new Vector2(0, 0), 200);

  // trigger check change
  if( typeof this.event_cb['state_changed'] === 'function' )
    return this.event_cb['state_changed'](this.checked);
}

SlidingCheckBox.prototype.add_slider = function(slider)
{
  this.slider = slider;
  this.slider.set_visibility(true);

  // TODO: use setter/getters
  if( this.checked )
    this.slider.bounds.x = this.bounds.w - this.slider.bounds.w;
  else
    this.slider.bounds.x = 0;

  this.slider.bounds.y = 0;
}

SlidingCheckBox.prototype.set_checked = function(checked)
{
  if (! checked instanceof Boolean) {
    console.log('WARN: sliding checkbox set checked must be boolean parameter');
    return;
  }
  if (this.checked == checked)
    return;

  this.checked = checked;

  if( this.checked )
    this.slider.slideTo( new Vector2(this.bounds.w - this.slider.bounds.w, 0), 200);
  else
    this.slider.slideTo( new Vector2(0, 0), 200);
}

//
// OVERLAY IMAGE (ON CHECKED)
SlidingCheckBox.prototype.set_overlay_image = function(i)
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
}


SlidingCheckBox.prototype.set_overlay_alignment = function(h, v)
{
  this.set_overlay_alignment_horizontal(h);
  this.set_overlay_alignment_vertical(v);
}


SlidingCheckBox.prototype.set_overlay_alignment_horizontal = function(type)
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


SlidingCheckBox.prototype.set_overlay_alignment_vertical = function(type)
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

SlidingCheckBox.prototype.overlay_calculate_offset = function()
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
}

SlidingCheckBox.prototype.render_widget = function(context)
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
      this.overlay_calculate_offset();

    context.drawImage(this.overlay_image, this.overlay.x, this.overlay.y, this.overlay.w, this.overlay.h);
  }

  this.render_caption(context);
}




