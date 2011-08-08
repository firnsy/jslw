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

Clock = function(p, x, y, w, h, c)
{
  // call our super constructure
  this.base = Widget;
  this.base(p, x, y, w, h);

  this.seconds = false;

  this.time_interval = 60 * 1000;
  this.timer_id = null;

  this.register_callbacks(this);
}


Clock.prototype = new Widget;


Clock.prototype.set_interval = function(t)
{
  t = parseInt(t);

  if( t > 0 )
    this.time_interval = t * 1000;
}


Clock.prototype.update_time = function()
{
  var d = new Date();

  var h = '00' + d.getHours();
  var m = '00' + d.getMinutes();
  var s = '00' + d.getSeconds();

  var i = (60 - ( s % 60 )) * 1000;

  this.set_caption(h.slice(-2) + ':' + m.slice(-2));
  this.set_dirty(true);

  var self = this;
  this.timer_id = setTimeout( function() { self.update_time(); }, i );
}
