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

//
// CONSTANTS
//

var ANIMATE_FRAME_TIME_SPACING = 40;    // time between animation frames in milliseconds

//
// ARRAY UTILTIES
//

if( typeof Array.prototype.remove !== 'function' )
{
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
      {
        this.splice(x, 1);
      }
    }

    return this;
  };
};


//
// indexOf
//
// Affects: IE 8 and below
//
if( typeof Array.prototype.indexOf !== 'function' )
{
  Array.prototype.indexOf = function(n, i)
  {
    "use strict";
    i = i || 0;
    var l = this.length;

    while( i < l )
    {
      if( this[i] === n )
      {
        return i;
      }

      ++i;
    }

    return -1;
  };
};

//
// filter
//
// Affects: IE 8 and below
//
if( typeof Array.prototype.filter !== 'function' )
{
  Array.prototype.filter = function(func /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
    {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof func !== "function")
    {
      throw new TypeError();
    }

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if( i in t )
      {
        var val = t[i]; // in case func mutates this
        if (func.call(thisp, val, i, t))
        {
          res.push(val);
        }
      }
    }

    return res;
  };
};

//
// NUMBER UTILITIES
//

/*
 * Clamp a number to the specified range
*/
if( typeof Number.prototype.clamp !== 'function' )
{
  Number.prototype.clamp = function(_low, _high)
  {
    "use strict";

    if ( (typeof _low === 'number') && this < _low )
    {
      return _low;
    }
    else if ( (typeof _high === 'number') && this > _high )
    {
      return _high;
    }
    else
    {
      return this;
    }
  };
};


//
// OBJECT UTILTIES
//

/*
if( typeof Object.prototype.watch !== 'function' ) {
  Object.prototype.watch = function (prop, handler) {
    var oldval = this[prop], newval = oldval,
    getter = function () {
      return newval;
    },
    setter = function (val) {
      oldval = newval;
      return newval = handler.call(this, prop, oldval, val);
    };
    if( delete this[prop])
    { // can't watch constants
      if( Object.defineProperty ) // ECMAScript 5
      {
        Object.defineProperty(this, prop, {
          get: getter,
          set: setter,
          enumerable: false,
          configurable: true
        });
      }
      else if( Object.prototype.__defineGetter__ &&
               Object.prototype.__defineSetter__ )
      { // legacy
        Object.prototype.__defineGetter__.call(this, prop, getter);
        Object.prototype.__defineSetter__.call(this, prop, setter);
      }
    }
  };
};


if( typeof Object.prototype.unwatch !== 'function' )
{
  Object.prototype.unwatch = function (prop)
  {
    var val = this[prop];
    delete this[prop]; // remove accessors
    this[prop] = val;
  };
}
*/

//
// STRING UTILTIES
//

if( typeof String.prototype.startsWith !== 'function' ) {
  String.prototype.startsWith = function (str)
  {
    return this.slice(0, str.length) == str;
  };
};



