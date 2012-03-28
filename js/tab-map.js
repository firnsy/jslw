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

var TabMap = Widget.extend({
  constructor: function(p, x, y, w, h, c)
  {
    // call our super constructure
    this.base.apply(this, arguments);
    this._type = 'TabMap';

    this.background_image_up = null;
    this.background_image_down = null;

    this.tabs = {};
    this.active_tab = '';
    this.pressed_tab = '';
    this.show_labels = false;

    // add tab specific events
    this.valid_events.push('tab_click');

    return this;
  },

  set_show_labels: function(s) {
    this.show_labels = ( typeof s === 'boolean' ) ? s : this.show_labels;
  },

  add_tab: function(t, r, i_active, i_overlay)
  {
    if( t in this.tabs )
    {
      console.warn('Tab already exists.');
      return;
    }

    if( this._debug )
      console.log('tab added...');

    this.tabs[t] = {
      image_active:   null,
      image_overlay:  null,
      _bounds:        null
    }

    if( r )
      this.set_tab_bounds(t, r);

    if( i_active )
      this.set_tab_image_active(t, i_active);

    if( i_overlay )
      this.set_tab_image_overlay(t, i_overlay);

    // set the active tab to this if it's the first
    if( this.active_tab === '' )
      this.active_tab = t;

    return this;
  },

  set_tab_bounds: function(t, r)
  {
    if( ! ( t in this.tabs ) )
    {
      console.warn('TabMap.set_tab_bounds: Tab does not exist.');
      return;
    }

    if( ! ( r instanceof Rect ) )
    {
      console.error('TabMap.set_tab_bounds: Bounds need to be defined as a Rect.');
      return;
    }

    this.tabs[t]._bounds = r;

    return this;
  },

  set_tab_image_active: function(t, i)
  {
    if( ! ( t in this.tabs ) )
    {
      console.warn('TabMap.set_tab_image_active: Tab does not exist.');
      return;
    }

    if( i instanceof Image )
    {
      this.tabs[t]['image_active'] = i;

      if( i.src !== '' && i.complete )
        this.set_dirty(true);
    }
    else
    {
      this.tabs[t]['image_active'] = new Image();

      this.tabs[t]['image_active'].src = i;
      this.tabs[t]['image_active'].onerror = function(){ console.error('Unable to load image: ' + this.src); };

      var self = this;
      this.tabs[t]['image_active'].onload = function() { self.set_dirty(true); };
    }

    return this;
  },

  set_tab_image_overlay: function(t, i)
  {
    if( ! ( t in this.tabs ) )
    {
      console.warn('TabMap.set_tab_image_overlay: Tab does not exist.');
      return;
    }

    if( i instanceof Image )
    {
      this.tabs[t]['image_overlay'] = i;

      if( i.src !== '' && i.complete )
        this.set_dirty(true);
    }
    else
    {
      this.tabs[t]['image_overlay'] = new Image();

      this.tabs[t]['image_overlay'].src = i;
      this.tabs[t]['image_overlay'].onerror = function(){ console.error('Unable to load image: ' + this.src); };

      var self = this;
      this.tabs[t]['image_overlay'].onload = function() { self.set_dirty(true); };
    }

    return this;
  },

  //
  // PRIVATE
  //
  _mouse_down: function(x, y)
  {
    if( this._debug )
      console.log('mouse down ...');

    x = x - this._bounds.x;
    y = y - this._bounds.y;

    for( t in this.tabs )
    {
      var tab = this.tabs[t];

      if( tab._bounds instanceof Rect &&
          tab._bounds.intersects(x, y) )
      {
        this.pressed_tab = t;
        this.set_dirty(true);
        return true;
      }
    }

    return true;
  },

  _mouse_up: function(x, y)
  {
    if( this._debug )
      console.log('mouse up ...');

    x = x - this._bounds.x;
    y = y - this._bounds.y;

    for( t in this.tabs )
    {
      var tab = this.tabs[t];

      // only need to check the tab which was initially pressed
      if( t === this.pressed_tab &&
          tab._bounds instanceof Rect &&
          tab._bounds.intersects(x, y) )
      {
        // invoke the tab_click callback with active tab as parameter
        if( this.event_cb['tab_click'] )
          this.event_cb['tab_click'](t)

        this.active_tab = t;
        this.pressed_tab = '';
        this.set_dirty(true);

        return true;
      }
    }

    return true;
  },

  _tab_click: function(t) {},

  //
  // RENDERING
  _render_labels: function(context)
  {
    context.save();

    for (var tab in this.tabs)
    {
      var lx = this._bounds.x + this.tabs[tab]._bounds.x;
      var ly = this._bounds.y + this.tabs[tab]._bounds.y;

      switch( this.text_alignment_horizontal )
      {
        case 'center':
          lx += this.tabs[tab]._bounds.w / 2;
          context.textAlign = 'center';
          break;
        case 'right':
          lx += (this.tabs[tab]._bounds.w);
          context.textAlign = 'right';
          break;
        case 'left':
          context.textAlign = 'left';
          break;
      }

      switch( this.text_alignment_vertical )
      {
        case 'top':
          context.textBaseline = 'top';
          break;
        case 'middle':
          context.textBaseline = 'middle';
          ly += (this.tabs[tab]._bounds.h/2);
          break;
        case 'bottom':
          context.textBaseline = 'bottom';
          ly += (this.tabs[tab]._bounds.h);
          break;
      }

      context.font = this._font.get_font();

      if( this.font_color instanceof Color )
        context.fillStyle = this.font_color.get_rgba(this.alpha);

      context.fillText(tab, lx, ly);
    }
    context.restore();
  },

  _render_widget: function(context)
  {

    if( this.background_color instanceof Color )
    {
      context.fillStyle = this.background_color.get_rgba(this.alpha);
      context.fillRect(this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
    }

    // draw the background image
    if( this.active_tab !== '' &&
        this.tabs[this.active_tab]['image_active'] instanceof Image &&
        this.tabs[this.active_tab]['image_active'].width > 0 )
    {
      context.drawImage(this.tabs[this.active_tab]['image_active'], this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
    }

    // draw the overlay if exists
    if( this.is_pressed &&
        this.pressed_tab !== '' &&
        this.tabs[this.pressed_tab]['image_overlay'] instanceof Image &&
        this.tabs[this.pressed_tab]['image_overlay'].width > 0 )
    {
      context.drawImage(this.tabs[this.pressed_tab]['image_overlay'], this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
    }

    if( this.show_labels )
    {
      // we want to show the text for the tabs in the label locations
      this._render_labels(context);
    }
  },
});
