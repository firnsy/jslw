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

/*
 *     Converts INT to HEX
 *         If Prototype library is loaded, use theirs, else use ours.
 *         */
Number.prototype.toColorPart = function()
{
  return ((this < 16 ? '0' : '') + this.toString(16));
}

/*
 *     Constructor
 *         @String c : hexadecimal, shorthand hex, or rgb()
 *             #returns : Object reference to instance or false
 *             */
Color = function(c)
{
  if( !c || !(c = Color.getFilteredObject(c)) )
    return false;

  this.original = c;
  this.r = c.r;
  this.g = c.g;
  this.b = c.b;
  this.a = 1.0;
  this.check();
  this.gray = Math.round(.3*this.r + .59*this.g + .11*this.b);
  this.hex = this.getHex();
  this.rgb = this.getRGB();
  return this;
}

/*
 *     Screens color strings.
 *         @String str : hexadecimal, shorthand hex, or rgb()
 *             #returns : Object {r: XXX, g: XXX, b: XXX} or false
 *             */
Color.getFilteredObject = function(str)
{
  if( /^#?([\da-f]{3}|[\da-f]{6})$/i.test(str) )
  {
    function _(s,i)
    {
      return parseInt(s.substr(i,2), 16);
    }

    str = str.replace(/^#/, '').replace(/^([\da-f])([\da-f])([\da-f])$/i, "$1$1$2$2$3$3");

    return {r:_(str,0), g:_(str,2), b:_(str,4)}
  }
  else if( /^rgb *\( *\d{0,3} *, *\d{0,3} *, *\d{0,3} *\)$/i.test(str) ) {
    str = str.match(/^rgb *\( *(\d{0,3}) *, *(\d{0,3}) *, *(\d{0,3}) *\)$/i);

    return {r:parseInt(str[1]), g:parseInt(str[2]), b:parseInt(str[3])};
  }

  return false;
}

/*
 *     Checks the internal RGB registers for out of range values.
 *         Resets out of range values.
 *             #returns : Object reference to instance
 *             */
Color.prototype.check = function()
{
  if( this.r>255 )
    this.r=255;
  else if( this.r<0 )
    this.r=0;

  if( this.g>255 )
    this.g=255;
  else if( this.g<0 )
    this.g=0;

  if( this.b>255 )
    this.b=255;
  else if( this.b<0 )
    this.b=0;

  return this;
}

/*
 *     Resets color to the original color passed to the constructor.
 *         #returns : Object reference to instance
 *         */
Color.prototype.revert = function()
{
  this.r=this.original.r;
  this.g=this.original.g;
  this.b=this.original.b;

  return this;
}

/*
 *     Inverts the color.
 *         Black to White, vice versa
 *             #returns : Object reference to instance
 *             */
Color.prototype.invert = function()
{
  this.check();
  this.r = 255-this.r;
  this.g = 255-this.g;
  this.b = 255-this.b;

  return this;
}

/*
 *     Lightens the color.
 *         @Int amount : 1-254 -- RGB amount to lighten the color
 *             #returns : Object reference to instance
 *             */
Color.prototype.lighten = function(amount)
{
  var amount = parseInt(amount);

  this.r += amount;
  this.g += amount;
  this.b += amount;

  return this;
}

/*
 *     Darkens the color.
 *         @Int amount : 1-254 -- RGB amount to darken the color
 *             #returns : Object reference to instance
 *             */
Color.prototype.darken = function(amount)
{
  var amount = parseInt(amount);

  this.r -= amount;
  this.g -= amount;
  this.b -= amount;

  return this;
}

/*
 *     Converts the color to Grayscale
 *         #returns : Object reference to instance
 *         */
Color.prototype.grayscale = function()
{
  this.check();
  this.gray = Math.round(.3*this.r + .59*this.g + .11*this.b);
  this.r=this.gray;
  this.g=this.gray;
  this.b=this.gray;

  return this;
}

/*
 *     Convenience function for lightening color.
 *         @Int amount : amount to lighten color
 *             @Bool returnRGB : true uses RGB return string, false uses HEX return string.
 *                 #returns : String color
 *                 */
Color.prototype.getLighter = function(amount, returnRGB)
{
  return this.lighten(amount).check()[returnRGB ? 'getRGB' : 'getHex']();
}

/*
 *     Convenience function for darkening color.
 *         @Int amount : amount to darken color
 *             @Bool returnRGB : true uses RGB return string, false uses HEX return string.
 *                 #returns : String color
 *                 */
Color.prototype.getDarker = function(amount, returnRGB)
{
  return this.darken(amount).check()[returnRGB ? 'getRGB' : 'getHex']();
}

/* 
 *     Convenience function for grayscaling color. 
 *         @Bool returnRGB : true uses RGB return string, false uses HEX return string. 
 *             #returns : String color 
 *             */ 
Color.prototype.getGrayscale = function(returnRGB)
{
  this.grayscale();

  return (returnRGB ? ('rgb('+this.gray+','+this.gray+','+this.gray+')') : this.gray.toColorPart().replace(/^([\da-f]{2})$/i, "#$1$1$1")); 
} 

/*
 *     Convenience function for inverting color.
 *         @Bool returnRGB : true uses RGB return string, false uses HEX return string.
 *             #returns : String color
 *             */
Color.prototype.getInverted = function(returnRGB)
{
  return this.invert()[returnRGB ? 'getRGB' : 'getHex']();
}

/*
 *     Gets the rgb(x,x,x) value of the color
 *         #returns : String rgb color
 *         */
Color.prototype.getRGB = function()
{
  this.check();
  this.rgb = 'rgb('+this.r+','+this.g+','+this.b+')';

  return this.rgb;
}

/*
 *     Gets the rgb(x,x,x) value of the color
 *         #returns : String rgb color
 *         */
Color.prototype.getRGBA = function(alpha)
{
  alpha = alpha || this.alpha;

  this.check();

  return 'rgba('+this.r+','+this.g+','+this.b+','+alpha+')';
}


/*
 *     Gets the hex value of the color
 *         @Bool shorthandReturnAcceptable : true will return #333 instead of #333333
 *             #returns : String hex color
 *             */
Color.prototype.getHex = function(shorthandReturnAcceptable)
{
  this.check();
  this.hex = '#' + this.r.toColorPart() + this.g.toColorPart() + this.b.toColorPart();

  if( shorthandReturnAcceptable )
    return this.hex.replace(/^#([\da-f])\1([\da-f])\2([\da-f])\3$/i, "#$1$2$3");

  return this.hex;
}

Color.prototype.toString = function()
{
  return '{r:' + this.r + ', g:' + this.g + ', b:' + this.b+ '}';
}
