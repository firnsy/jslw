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

Rect = function(x, y, w, h)
{
  this.set(x, y, w, h);

  return this;
}


Rect.prototype.set = function(x, y, w, h)
{
  if( x instanceof Rect )
  {
    this.x = x.x;     // x coordinate for top-left
    this.y = x.y;     // y coordinate for top-left
    this.w = x.w;
    this.h = x.h;
    this.x2 = x.x2;   // x coordinate for bottom-right
    this.y2 = x.y2;   // y coordinate for bottom-right
  }
  else
  {
    this.x = x + 0;   // x coordinate for top-left
    this.y = y + 0;   // y coordinate for top-left
    this.w = w + 0;
    this.h = h + 0;
    this.x2 = x + w;  // x coordinate for bottom-right
    this.y2 = y + h;  // y coordinate for bottom-right
  }

  return this;
}


Rect.prototype.translate = function(x, y)
{
  if( x instanceof Vector2 )
  {
    // top-left shift
    this.x += x.x;
    this.y += x.y;

    // bottom-right shift
    this.x2 += x.x;
    this.y2 += x.y;
  }
  else
  {
    // top-left shift
    this.x += x;
    this.y += y;

    // bottom-right shift
    this.x2 += x;
    this.y2 += y;
  }

  return this;
}


Rect.prototype.scale = function(s)
{
  // can't scale if geometry will be <= 0 afterwards
  if( s < 0 && (this.w <= (s*2) || this.h <= (s*2)) )
    return;

  // top-left shift
  this.x -= s;
  this.y -= s;

  // bottom-left shift
  this.x2 += s;
  this.y2 += s;

  // dimension shift
  this.w += (s + s);
  this.h += (s + s);

  return this;
}


Rect.prototype.intersects = function(x, y)
{
  // check if first parameter is a Vector2
  if( x instanceof Vector2 )
  {
    return ( x.x >= this.x && x.x <= this.x2 &&
             x.y >= this.y && x.y <= this.y2 );
  }

  return ( x >= this.x && x <= this.x2 &&
           y >= this.y && y <= this.y2 );
}


Rect.prototype.toString = function()
{
  return '{x:' + this.x + ', y:' + this.y + ', w:' + this.w + ', h:' + this.h + '}';
}
