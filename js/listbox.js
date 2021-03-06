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

var ListBox = Widget.extend({

  /**
   * @param p parent object
   * @param r rectangle object
   * @param c color object
   */
  constructor: function(p, r, s)
  {
    // call our super constructor
    this.base.apply(this, arguments);
    this._type = 'ListBox';

    this.background_image_up = null;
    this.background_image_down = null;

    // storage for the list objects
    this._list = Array();

    // define the maximum number of items the list can hold
    // n = 0 : unlimited
    // n > 0 : fifo list of length n
    this._max_items = 0;
    this._list_offset = 0;
    this._list_offset_max = 0;

    // index of the active item
    this._item_index_active = -1;

    //
    this._item_height = 20;
    this._item_bounds = new Rect(this._bounds).scale(-10);

    this.setActiveFont( this._font );
    this.setActiveFontColor( this._font_color );
    this.setActiveColor('#fff');

    // number of items visible in the list
    this._item_visible_count = Math.ceil(this._item_bounds.h / this._item_height);

    this._drag_origin = new Vector2(0, 0);

    this.slider = null;

    return this;
  },

  //
  // ITEMS
  //
  set_max_items: function(_items)
  {
    _items = parseInt(_items, 10)

    if( _items > 0 )
    {
      this._max_items = _items;
    }
    else
    {
      console.error('Maximum items for ListBox must be greater than or equal to zero');
    }

    return this;
  },

  /**
   * Add an item to the beginning of the list
   */
  insert_item: function(_item, _data)
  {
    var _object = {
      item: _item || '',
      data: _data || '',
    };

    this._list.unshift(_object);

    if ( ( this._max_items > 0 ) &&
         ( this._list.length > this._max_items ) ) {
      this._list.pop();
    }

    this._list_offset_max = Math.max(0, (this._item_height * this._list.length) - this._item_bounds.h);
    this.setDirty(true);

    return this._list.length;
  },

  /**
   * Add an item to the end of the list
   */
  add_item: function(_item, _data)
  {
    var _object = {
      item: _item || '',
      data: _data || '',
    };

    this._list.push(_object);

    if ( (this._max_items > 0) &&
        (this._list.length > this._max_items) ) {
      this._list.shift();
    }

    this._list_offset_max = Math.max(0, (this._item_height * this._list.length) - this._item_bounds.h);
    this.setDirty(true);
    return this._list.length;
  },

  /**
   * Add an item to the end of the list if it is different to the current last item
   */
  add_new_item: function(item,data)
  {
    if (this._list.length == 0 || this._list[this._list.length - 1] != item) {
      this.add_item(item,data);
    }

    return this;
  },

  clear_items: function()
  {
    this._list = [];
    this._item_index_active = -1;

    this.setDirty(true);
    return this._list.length;
  },

  /**
   * 
   */
  get_item_text: function(index)
  {
    if (index == null) return null;
    if (index >= this._list.length || index < 0) return null
    return this._list[index];
  },

  get_active_item_text: function()
  {
    return this.get_item_text(this._item_index_active);
  },

  get_item_data: function(index)
  {
    if (index == null) return null;
    if (index >= this.data.length || index < 0) return null
    return this.data[index];
  },

  get_active_item_data: function()
  {
    return this.get_item_data(this._item_index_active);
  },

  /**
   * If the current selection is equal to the index parameter then 
   * unselect the current active item
   */
  toggle_item_selection: function(index)
  {
    if (index == this._item_index_active) {
      this._item_index_active = -1;
      this.setDirty(true);
    }

    return this._item_index_active;
  },

  /**
   * Deletes the item at index specified
   * Moves the active item index.
   * if the deletion is the active item reset the active item
   * if the deletion is before the active item decrement the active item
   */
  clear_item: function(index)
  {
    if (index == null) return null;
    if (index >= this.data.length || index < 0) return null;
    if (this._item_index_active == index) {
      this._item_index_active = -1;
    }
    else if (this._item_index_active > index) {
      this._item_index_active--;
    }

    this._list.splice(index,1);
    this.data.splice(index,1);
    this.setDirty(true);

    return this;
  },

  /**
   * Deletes the current active item
   */
  clear_active_item: function()
  {
    return this.clear_item(this._item_index_active);
  },


  //
  // STYLING
  //

  add_slider: function(slider)
  {
    if( slider instanceof Slider )
    {
      this.slider = slider;
      this.slider.setVisibility(false);

      // TODO: use setter/getters
      this.slider._bounds.x = this._bounds.w - this.slider._bounds.w;
      this.slider._bounds.y = 10 + this._list_offset * ((this._item_bounds.h - this.slider._bounds.h) / this._list_offset_max);
    }

    return this;
  },

  set_item_height: function(height)
  {
    // set sane default
    height = height || 20;

    // validate
    if( height <= 0 )
    {
      console.log('Invalid height: ' + height + '. Height must be unsigned integer greater than 0 pixels');
      return;
    }

    this._item_height = height;
    this._item_visible_count = Math.floor(this._item_bounds.h / this._item_height) + 1;
    this._list_offset_max = Math.max(0, (this._item_height * this._list.length) - this._item_bounds.h);

    return this;
  },

  setActiveFont: function(font)
  {
    // ensure a font object is built
    if( ! ( font instanceof Font ) )
      font = new Font(font);

    this.active_font = font;

    return this;
  },

  setActiveFontColor: function(color)
  {
    // ensure a color object is built
    if( ! ( color instanceof Color ) )
      color = new Color(color);

    this.active_font_color = color;

    return this;
  },

  setActiveColor: function(color)
  {
    // ensure a color object is built
    if( ! ( color instanceof Color ) )
      color = new Color(color);

    this.active_color = color;

    return this;
  },

  //
  // PRIVATE
  //

  //
  // EVENTS
  //

  _mouse_drag_start: function(x, y)
  {
    this.drag_origin.set(x, y);

    // fade in scrollbar
    if( this.slider instanceof Widget )
    {
      this.slider
        .setVisibility(true)
        .fadeIn(200);
    }

  },

  _mouse_drag_move: function(x, y)
  {
    var y_delta = this.drag_origin.y - y;

    this.drag_origin.set(x, y);

    if( this._list_offset + y_delta >= 0 &&
        this._list_offset + y_delta < this._list_offset_max )
    {
      this._list_offset += y_delta;

      if( this.slider instanceof Widget )
        this.slider._bounds.y = 10 + this._list_offset * ((this._item_bounds.h - this.slider._bounds.h) / this._list_offset_max);

      this.setDirty(true);
    }

    return this;
  },

  _mouse_drag_end: function(x, y)
  {
    // fade out scrollbar
    if( this.slider instanceof Widget )
      this.slider.fadeOut(200);

    return this;
  },

  _mouse_click: function(x, y)
  {
    var index = Math.floor((this._list_offset + (y - this._item_bounds.y)) / this._item_height);

    if( index < this._list.length )
    {
      this._item_index_active = index;
    }

    return this;
  },

  //
  // RENDERING
  //

  _render_widget: function(context)
  {
    // draw the widget
    if( this.background_color instanceof Color )
    {
      context.fillStyle = this.background_color.get_rgba(this.alpha);
      context.fillRect(this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
    }

    if( this.background_image instanceof Image &&
        this.background_image.naturalWidth > 0 )
    {
      context.drawImage(this.background_image, this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
    }

    context.textBaseline = 'middle';
    context.font = this._font.getFont();

    if( this.font_color instanceof Color )
      context.fillStyle = this.font_color.getRGBA(this.alpha);

    var item_stride = Math.min(this.item_visible_count + 1, this._list.length);
    var item_y = this._item_bounds.y - (this._list_offset % this._item_height ) + (this._item_height / 2);

    var item_index_start = Math.floor(this._list_offset / this._item_height);

    context.save();

    context.beginPath();
    context.rect(this._item_bounds.x, this._item_bounds.y, this._item_bounds.w, this._item_bounds.h);
    context.clip();
    context.closePath();

    for( var i=0; i<item_stride; i++ )
    {
      var index = i + item_index_start;
      var item = this._list[index];

      if( index == this._item_index_active )
      {
        context.save();

        // set active background decals and draw
        if( this.active_color instanceof Color )
          context.fillStyle = this.active_color.getRGBA(this.alpha);

        context.fillRect(this._item_bounds.x, item_y-(this._item_height / 2), this._item_bounds.w, this._item_height);

        // set active font decals and draw
        context.font = this.active_font.getFont();

        if( this.active_font_color instanceof Color )
          context.fillStyle = this.active_font_color.getRGBA(this.alpha);

        context.fillText(item, this._item_bounds.x, item_y);

        context.restore();
      }
      else
        context.fillText(item, this._item_bounds.x, item_y);

      item_y += this._item_height;
    }

    context.restore();
  },
});
