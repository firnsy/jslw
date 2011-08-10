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

ListBox = function(p, x, y, w, h, c)
{
  // call our super constructure
  this.base = Widget;
  this.base(p, x, y, w, h);

  this.background_image_up = null;
  this.background_image_down = null;

  this.list = Array();
  this.item_index = 0;
  this.list_offset = 0;
  this.list_offset_max = 0;
  this.item_index_active = -1;
  this.item_height = 20;
  this.item_bounds = new Rect(this.bounds);
  this.item_bounds.scale(-10);
  this.active_font = this.font;
  this.active_font_color = new Color('#000');
  this.active_color = new Color('#fff');

  this.item_visible_count = Math.floor(this.item_bounds.h / this.item_height) + 1;

  this.drag_origin = new Vector2(0,0);

  this.slider = null;

  // register callbacks
  this.register_callbacks(this);
}

ListBox.prototype = new Widget;

ListBox.prototype.add_item = function(item, index)
{
  item = item || '';

  this.list.push(item);
  this.list_offset_max = Math.max(0, (this.item_height * this.list.length) - this.item_bounds.h);
}


//
// EVENTS

ListBox.prototype.mouse_drag_start = function(x, y)
{
  this.drag_origin.set(x, y);
  this.drag_stride = this.bounds.h / (this.list.length - this.item_visible_count + 1) / 2;

  // fade in scrollbar
  if( this.slider instanceof Widget )
  {
    this.slider.set_visibility(true);
    this.slider.fadeIn(200);
  }

}


ListBox.prototype.mouse_drag_move = function(x, y)
{
  var y_delta = this.drag_origin.y - y;

  this.drag_origin.set(x, y);

  if( this.list_offset + y_delta >= 0 &&
      this.list_offset + y_delta < this.list_offset_max )
  {
    this.list_offset += y_delta;

    if( this.slider instanceof Widget )
      this.slider.bounds.y = 10 + this.list_offset * ((this.item_bounds.h - this.slider.bounds.h) / this.list_offset_max);

    this.set_dirty(true);
  }
}


ListBox.prototype.mouse_drag_end = function(x, y)
{
  // fade out scrollbar
  if( this.slider instanceof Widget )
  {
    this.slider.fadeOut(200);
  }
}


ListBox.prototype.mouse_click = function(x, y)
{
  var index = Math.floor((this.list_offset + (y - this.item_bounds.y)) / this.item_height);

  if( index < this.list.length )
    this.item_index_active = index;
}

//
// STYLING

ListBox.prototype.add_slider = function(slider)
{
  this.slider = slider;
  this.slider.set_visibility(false);

  // TODO: use setter/getters
  this.slider.bounds.x = this.bounds.w - this.slider.bounds.w;
  this.slider.bounds.y = 10 + this.list_offset * ((this.item_bounds.h - this.slider.bounds.h) / this.list_offset_max);

}


ListBox.prototype.set_item_height = function(height)
{
  // set sane default
  height = height || 20;

  // validate
  if( height <= 0 )
  {
    console.log('Invalid height: ' + height + '. Height must be unsigned integer greater than 0 pixels');
    return;
  }

  this.item_height = height;
  this.item_visible_count = Math.floor(this.item_bounds.h / this.item_height) + 1;
  this.list_offset_max = Math.max(0, (this.item_height * this.list.length) - this.item_bounds.h);
}


ListBox.prototype.set_active_font = function(f)
{
  if( ! f instanceof Font )
  {
    console.log('ERROR: Must supply a Font object.');
    return;
  }

  this.active_font = f;
}


ListBox.prototype.active_font_color = function(c)
{
  if( ! c instanceof Color )
  {
    console.log('ERROR: Must supply a Color object.');
    return;
  }

  this.active_font_color = c;
}


ListBox.prototype.active_color = function(c)
{
  if( ! c instanceof Color )
  {
    console.log('ERROR: Must supply a Color object.');
    return;
  }

  this.active_style = c;
}


//
// RENDERING
ListBox.prototype.render_widget = function(context)
{
  // draw the widget
  if( this.background_color instanceof Color )
  {
    context.fillStyle = this.background_color.get_rgba(this.alpha);
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  if( this.background_image instanceof Image &&
      this.background_image.width > 0 )
  {
    context.drawImage(this.background_image, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  context.textBaseline = 'middle';
  context.font = this.font.get_font();

  if( this.font_color instanceof Color )
    context.fillStyle = this.font_color.get_rgba(this.alpha);

  var item_stride = Math.min(this.item_visible_count + 1, this.list.length);
  var item_y = this.item_bounds.y - (this.list_offset % this.item_height ) + (this.item_height / 2);

  var item_index_start = Math.floor(this.list_offset / this.item_height);

  context.save();

  context.beginPath();
  context.rect(this.item_bounds.x, this.item_bounds.y, this.item_bounds.w, this.item_bounds.h);
  context.clip();
  context.closePath();

  for( var i=0; i<item_stride; i++ )
  {
    var index = i + item_index_start;
    var item = this.list[index];

    if( index == this.item_index_active )
    {
      context.save();

      // set active background decals and draw
      if( this.active_color instanceof Color )
        context.fillStyle = this.active_color.get_rgba(this.alpha);

      context.fillRect(this.item_bounds.x, item_y-(this.item_height / 2), this.item_bounds.w, this.item_height);

      // set active font decals and draw
      context.font = this.active_font.get_font();

      if( this.active_font_color instanceof Color )
        context.fillStyle = this.active_font_color.get_rgba(this.alpha);

      context.fillText(item, this.item_bounds.x, item_y);

      context.restore();
    }
    else
      context.fillText(item, this.item_bounds.x, item_y);

    item_y += this.item_height;
  }

  context.restore();
}
