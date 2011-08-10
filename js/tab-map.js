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

TabMap = function(p, x, y, w, h, c)
{
  // call our super constructure
  this.base = Widget;
  this.base(p, x, y, w, h);

  this.background_image_up = null;
  this.background_image_down = null;

  this.tabs = {};
  this.active_tab = '';
  this.pressed_tab = '';

  // register callbacks
  this.register_callbacks(this);
}

TabMap.prototype = new Widget;

TabMap.prototype.add_tab = function(t, r, i_active, i_overlay)
{
  if( t in this.tabs )
  {
    console.warn('Tab already exists.');
    return;
  }

  this.tabs[t] = {
    'image_active': null,
    'image_overlay': null,
    'bounds': null
  }

  if( r )
    this.set_tab_bounds(t, r);

  if( i_active )
    this.set_tab_image_active(t, i_active);

  if( i_overlay )
    this.set_tab_image_overlay(t, i_overlay);

  // set the activ tab to this if it's the first
  if( this.active_tab === '' )
    this.active_tab = t;
}

TabMap.prototype.set_tab_bounds = function(t, r)
{
  if( ! ( t in this.tabs ) )
  {
    console.warn('Tab does not exist.');
    return;
  }

  if( ! ( r instanceof Rect ) )
  {
    console.error('Bounds need to be defined as a Rect.');
    return;
  }

  this.tabs[t]['bounds'] = r;
}


TabMap.prototype.set_tab_image_active = function(t, i)
{
  if( ! ( t in this.tabs ) )
  {
    console.warn('Tab does not exist.');
    return;
  }

  if( i instanceof Image )
  {
    this.tabs[t]['image_active'] = i;

    if( i.src != '' && i.complete )
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
}


TabMap.prototype.set_tab_image_overlay = function(t, i)
{
  if( ! ( t in this.tabs ) )
  {
    console.warn('Tab does not exist.');
    return;
  }

  if( i instanceof Image )
  {
    this.tabs[t]['image_overlay'] = i;

    if( i.src != '' && i.complete )
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
}


TabMap.prototype.mouse_down = function(x, y)
{
  x = x - this.bounds.x;
  y = y - this.bounds.y;

  for( t in this.tabs )
  {
    var tab = this.tabs[t];

    if( tab['bounds'] instanceof Rect )
    {
      if( tab['bounds'].intersects(x, y) )
      {
        this.pressed_tab = t;
        this.set_dirty(true);
        return;
      }
    }
  }
}

TabMap.prototype.mouse_up = function(x, y)
{
  x = x - this.bounds.x;
  y = y - this.bounds.y;

  for( t in this.tabs )
  {
    var tab = this.tabs[t];

    if( tab['bounds'] instanceof Rect )
    {
      if( tab['bounds'].intersects(x, y) )
      {
        this.active_tab = t;
        this.set_dirty(true);
        return;
      }
    }
  }
}

//
// RENDERING

TabMap.prototype.render_widget = function(context)
{

  if( this.background_color instanceof Color )
  {
    context.fillStyle = this.background_color.get_rgba(this.alpha);
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  // draw the background image
  if( this.active_tab != '' &&
      this.tabs[this.active_tab]['image_active'] instanceof Image &&
      this.tabs[this.active_tab]['image_active'].width > 0 )
  {
    context.drawImage(this.tabs[this.active_tab]['image_active'], this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  // draw the overlay if exists
  if( this.is_pressed &&
      this.pressed_tab != '' &&
      this.tabs[this.pressed_tab]['image_overlay'] instanceof Image &&
      this.tabs[this.pressed_tab]['image_overlay'].width > 0 )
  {
    context.drawImage(this.tabs[this.pressed_tab]['image_overlay'], this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

//  this.render_caption(context);
}

