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

TextEdit = function(p, x, y, w, h, c)
{
  // call our super constructure
  this.base = Widget;
  this.base(p, x, y, w, h);
}

TextEdit.prototype.add_event_listener = function(a, cb)
{
  var this_object = this;

  switch(a)
  {
    case "mouse_down":
      this.cb[a] = function(x,y) {
        this_object.background_image = this_object.background_image_down;
        this_object.make_dirty();
        cb(x,y);
      };
      break;
    case "mouse_up":
      this.cb[a] = function(x,y) {
        this_object.background_image = this_object.background_image_up;
        this_object.make_dirty();
        cb(x,y);
      };
      break;
    case "mouse_move":
      this.cb[a] = cb;
      break;
    default:
      alert("Unknown event type supplied: " + a);
  }
}


TextEdit.prototype.set_background_image_up = function(path)
{
  this.background_image_up = new Image();

  this.background_image_up.src = path;
  this.background_image_up.onerror = function(){ alert("Unable to load image: " + this.src); };

  var this_object = this;
  this.background_image_up.onload = function() { this_object.make_dirty(); };

  // default image is up
  this.background_image = this.background_image_up;
}

TextEdit.prototype.set_background_image_down = function(path)
{
  this.background_image_down = new Image();

  this.background_image_down.src = path;
  this.background_image_down.onerror = function(){ alert("Unable to load image: " + this.src); };

  var this_object = this;
  this.background_image_down.onload = function() { this_object.make_dirty(); };
}
