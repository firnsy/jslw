/*
 * This file is part of the JavaScript Lighweight Widget framework
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

function Font(f)
{
  "use strict";

  if( !f || !(f = Font.get_filtered_object(f)) )
  {
    console.error('Invalid font object definition!');
    return false;
  }

  this.size = f.size;
  this.family = f.family;
  this.bold = f.bold;
  this.italic = f.italic;
  this.style = '';
  this.font = this.get_font();

  return this;
}


Font.get_filtered_object = function(str)
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
};


Font.prototype.check = function()
{
  "use strict";

  if( this.size <= 0 )
    this.size = 1;

  this.style = '';

  if( this.bold )
    this.style += 'bold ';

  if( this.italic )
    this.style += 'italic ';
};


Font.prototype.add_family = function(f)
{
  "use strict";

  if( f !== '' )
    this.family.push(f);

  return this;
};


Font.prototype.remove_family = function(f)
{
  "use strict";

  if( f in this.family )
    this.family.remove(f);
  else
    console.warn('Font family was not added.');

  return this;
};


Font.prototype.set_bold = function(s)
{
  "use strict";

  this.bold = s ? true : false;
  this.check();

  return this;
};


Font.prototype.set_italic = function(s)
{
  "use strict";

  this.italic = s ? true : false;
  this.check();

  return this;
};


Font.prototype.set_size = function(s)
{
  "use strict";

  s = parseInt(s, 10);

  if( s > 0 )
    this.size = s;

  return this;
};


Font.prototype.get_font = function()
{
  "use strict";

  this.check();
  this.font = this.style + this.size + 'px ' + this.family.join(',');

  return this.font;
};


Font.prototype.toString = function()
{
  "use strict";

  return '{family:' + this.family.join(',') + ', size:' + this.size + ', bold:' + this.bold + ', italic:' + this.italic + '}';
};
