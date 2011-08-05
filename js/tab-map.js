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

  // register callbacks
  this.register_callbacks(this);
}


TabMap.prototype.add_tab = function(t, r, i_up, i_down)
{
  if( t in this.tabs )
  {
    console.warn('Tab already exists.');
    return;
  }

  this.tabs[t] = {
    'image_up': null
    'image_down': null
    'bounds': null
  }

  if( r )
    this.set_tab_bounds(t, i);

  if( i_up )
    this.set_tab_image_up(t, i);

  if( i_down )
    this.set_tab_image_down(t, i);

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


TabMap.prototype.set_tab_image_up = function(t, i)
{
  if( ! ( t in this.tabs ) )
  {
    console.warn('Tab does not exist.');
    return;
  }

  if( i instanceof Image )
  {
    this.tabs[t]['image'] = i;

    if( i.src != '' && i.complete )
      this.make_dirty();
  }
  else
  {
    this.tabs[t]['image_up'] = new Image();

    this.tabs[t]['image_up'].src = path;
    this.tabs[t]['image_up'].onerror = function(){ console.error('Unable to load image: ' + this.src); };

    var self = this;
    this.tabs[t]['image_up'].onload = function() { self.make_dirty(); };
  }
}


TabMap.prototype.set_tab_image_down = function(t, i)
{
  if( ! ( t in this.tabs ) )
  {
    console.warn('Tab does not exist.');
    return;
  }

  if( i instanceof Image )
  {
    this.tabs[t]['image'] = i;

    if( i.src != '' && i.complete )
      this.make_dirty();
  }
  else
  {
    this.tabs[t]['image_down'] = new Image();

    this.tabs[t]['image_down'].src = path;
    this.tabs[t]['image_down'].onerror = function(){ console.error('Unable to load image: ' + this.src); };

    var self = this;
    this.tabs[t]['image_down'].onload = function() { self.make_dirty(); };
  }
}


TabMap.prototype.mouse_down = function(x, y)
{
  for( t in this.tabs )
  {
    var tab = this.tabs[t];

    if( tab['bounds'] instanceof Rect )
    {
      if( tab['bounds'].intersects(x, y) )
      {
        this.background_image = this.tabs[t]['image_down'];
        this.set_dirty(true);
        return;
      }
    }
  }
}

TabMap.prototype.mouse_up = function(x, y)
{
  for( t in this.tabs )
  {
    var tab = this.tabs[t];

    if( tab['bounds'] instanceof Rect )
    {
      if( tab['bounds'].intersects(x, y) )
      {
        this.active_tab = t;
        this.background_image = this.tabs[t]['image_up'];
        this.set_dirty(true);
        return;
      }
    }
  }
}


