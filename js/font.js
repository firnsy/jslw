/*
 * This file is part of the JavaScript Lighweight Widget framework
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

var Font = Base.extend({ // INSTANCE INTERFACE

  //
  // MEMBERS
  _size:     12,
  _family:   'sans-serif',
  _bold:     false,
  _italic:   false,
  _height:  0,

  //
  // CONSTRUCTOR
  constructor: function(font)
  {
    "use strict";

    if( !font || !(font = Font._getFilteredObject(font)) )
    {
      console.error('Font: Invalid font object definition!');
      return false;
    }

    this._family = font.family;
    this._size   = font.size;
    this._bold   = font.bold;
    this._italic = font.italic;

    this._update();

    return this;
  },

  //
  // PUBLIC METHODS

  addFamily: function(family)
  {
    "use strict";

    if( family !== '' )
    {
      this._family.push(family);
      this._update();
    }
    else
      console.warn('Font.add_family: Font family was not added.');

    return this;
  },

  removeFamily: function(family)
  {
    "use strict";

    if( family in this._family )
    {
      this._family.remove(family);
      this._update();
    }
    else
      console.warn('Font.remove_family: Font family does not exist.');

    return this;
  },

  setBold: function(_state)
  {
    "use strict";

    this._bold = (typeof _state === 'boolean' ) ? _state : false;
    this._update();

    return this;
  },

  setItalic: function(_state)
  {
    "use strict";

    this._italic = (typeof state === 'boolean' ) ? _state : false;
    this._update();

    return this;
  },

  setSize: function(_size)
  {
    "use strict";

    _size = parseInt(_size, 10);

    if( _size > 0 )
    {
      this._size = _size;
      this._update();
    }
    else
      console.warn('Font.set_size: Size must be a postive integer');

    return this;
  },

  getHeight: function()
  {
    "use strict";

    return this._height;
  },

  getFont: function()
  {
    "use strict";

    return this._font;
  },

  toString: function()
  {
    "use strict";

    return '{family:' + this._family.join(',') + ', size:' + this._size + ', bold:' + this._bold + ', italic:' + this._italic + '}';
  },

  //
  // PRIVATE METHODS

  _update: function()
  {
    "use strict";

    var _style = '';

    if( this._bold )
      _style += 'bold ';

    if( this._italic )
      _style += 'italic ';

    this._font = _style + this._size + 'px ' + this._family.join(',');

    // calculate the height
    var body = document.getElementsByTagName("body")[0];
    var height_element = document.createElement("div");
    var height_node = document.createTextNode("M");

    height_element.appendChild(height_node);
    height_element.setAttribute('style', this._font);
    body.appendChild(height_element);
    this._height = height_element.offsetHeight;
    body.removeChild(height_element);
  },

}, { // INSTANCE INTERFACE
  _getFilteredObject: function(str)
  {
    "use strict";

    if( /^(bold|italic)? *(bold|italic)? *(\d+)px *([\w, \-]+)$/i.test(str) )
    {
      str = str.match(/^(bold|italic)? *(bold|italic)? *(\d+)px *([\w, \-]+)$/i);

      return {
        bold: ( str[1] === 'bold' || str[2] === 'bold' ) ? true : false,
        italic: ( str[1] === 'italic' || str[2] === 'italic' ) ? true : false,
        size: parseInt(str[3], 10),
        family: ( str[4] && str[4] !== '' ) ? str[4].split(',') : [ 'sans-serif' ]
      };
    }

    return false;
  },
});
