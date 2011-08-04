/*
 * This file is part of the NSM framework
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

Vector2 = function(x, y)
{
  this.set(x, y);
}


Vector2.prototype.set = function(x, y)
{
  // check if first parameter is a Vector2
  if( x instanceof Vector2 )
  {
    this.x = x.x;
    this.y = x.y;
  }
  else
  {
    this.x = x + 0;
    this.y = y + 0;
  }

  return this;
}


Vector2.prototype.translate = function(x, y)
{
  // check if first parameter is a Vector2
  if( x instanceof Vector2 )
  {
    this.x += x.x;
    this.y += x.y;
  }
  else
  {
    this.x += x;
    this.y += y;
  }

  return this;
}


Vector2.prototype.scale = function(s)
{
  this.x *= s;
  this.y *= s;

  return this;
}


Vector2.prototype.toString = function()
{
  return '{x:' + this.x + ', y:' + this.y + '}';
}
