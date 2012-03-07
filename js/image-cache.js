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

function ImageCache()
{
  this.cache = {};
  this.count_total = 0;
  this.count_loaded = 0;

  this.cb_on_error = function(p) {};
  this.cb_on_load = function(p) {};
  this.cb_on_loaded = function() {};
}


ImageCache.prototype.add_image = function(k, p, f)
{
  if( k in this.cache )
  {
    console.error('Key ' + k + ' is already in use!');
    return null;
  }

  if( !p || p == '' )
  {
    console.error('The supplied path ' + p + ' is invalid!');
    return null;
  }

  this.cache[k] = {
    source: p,
    image: new Image(),
    loaded: false
  }

  this.count_total++;

  if( f )
  {
    var self = this;

    this.cache[k]['image'].src = p;
    this.cache[k]['image'].onload = function(key) {
      return function() {
        self.image_loaded(key);
      }
    }(k)
  }

  return this.cache[k]['image'];
};


ImageCache.prototype.get_image = function(k)
{
  if( ! ( k in this.cache ) )
  {
    console.warn('Key ' + k + ' is not available.');
    return;
  }

  return this.cache[k]['image'];
};


ImageCache.prototype.load_all = function(cb_on_loaded, cb_on_load, cb_on_error)
{
  // add on_loaded callback if provided
  if( typeof cb_on_loaded == 'function' )
    this.cb_on_loaded = cb_on_loaded;

  // add on_load callback if provided
  if( typeof cb_on_load == 'function' )
    this.cb_on_load = cb_on_load;

  // add on_error callback if provided
  if( typeof cb_on_error == 'function' )
    this.cb_on_error = cb_on_error;

  // build up all image objects and populate
  for( k in this.cache )
  {
    if( this.cache[k]['image'].src !== this.cache[k]['source'] )
    {
      var self = this;

      this.cache[k]['image'].src = this.cache[k]['source'];
      this.cache[k]['image'].onload = function(key) {
        return function() {
          self.image_loaded(key);
        }
      }(k);

      this.cache[k]['image'].onerror = function(key) {
        return function() {
          self.image_error(key);
        }
      }(k);
    }
  }
};


ImageCache.prototype.image_loaded = function(k)
{
  if( ! k in this.cache )
  {
    console.error('Key ' + k + ' is no longer available.');
    return;
  }

  this.cache[k]['loaded'] = true;

  this.count_loaded++;

  // fire the on_load callback with total progress passed
  // pass arguments: current progress, key, image source
  this.cb_on_load(100 * this.count_loaded / this.count_total, k, this.cache[k]['image'].src);

  // fire the on_loaded callback when all images are loaded
  // pass arguments: total images loaded
  if( this.count_loaded === this.count_total )
    this.cb_on_loaded(this.count_total);
};


ImageCache.prototype.image_error = function(k)
{
   if( ! k in this.cache )
  {
    console.error('Key ' + k + ' is no longer available.');
    return;
  }

  // fire the on_error callback with total progress passed
  this.cb_on_error();
};
