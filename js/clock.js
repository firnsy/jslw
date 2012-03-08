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

var Clock = Widget.extend({
  constructor: function(p, r, c, u)
  {
    // call our super constructor
    this.base.apply(this, arguments);

    this.seconds = false;
    this.utc = true;

    this._timer_id = null;
  },

  update_time: function()
  {
    var d = new Date();

    var h = '00' + ( this.utc ) ? d.getUTCHours() : d.getHours();
    var m = '00' + ( this.utc ) ? d.getUTCMinutes() : d.getMinutes();
    var s = '00' + ( this.utc ) ? d.getUTCSeconds() : d.getSeconds();

    this.set_caption(h.slice(-2) + ':' + m.slice(-2));
    this.set_dirty(true);

    var i = (60 - ( s % 60 )) * 1000;
    var self = this;
    this._timer_id = setTimeout( function() { self.update_time(); }, i );
  },
});
