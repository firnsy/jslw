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

Array.prototype.remove = function()
{
  "use strict";
  var a = arguments;
  var l = a.length;
  var i;
  var x;

  while( l && this.length )
  {
    i = a[--l];

    while( (x = this.indexOf( i )) !== -1 )
      this.splice(x, 1);
  }

  return this;
};


//
// IE HACKS
//

//
// indexOf
//
// Affects: IE 8 and below
//
if( ! Array.prototype.indexOf )
{
  Array.prototype.indexOf = function(n, i)
  {
    "use strict";
    i = i || 0;
    var l = this.length;

    while( i < l )
    {
      if( this[i] === n )
        return i;

      ++i;
    }

    return -1;
  };
}

//
// filter
//
// Affects: IE 8 and below
//
if( !Array.prototype.filter )
{
  Array.prototype.filter = function(func /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof func !== "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if( i in t )
      {
        var val = t[i]; // in case func mutates this
        if (func.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}
