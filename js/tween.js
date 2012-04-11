/*
 * This file is part of the JavaScript Lightweight Widget framework
 *
 * Equations adapted from Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html
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

/**
 */

var Tween = Base.extend({

  constructor: function( object )
  {
    this._object         = object;

    this._v_begin        = {};
    this._v_delta        = {};
    this._v_end          = {};
    this._duration       = 1000;
    this._frames         = 0;
    this._start_frame    = 0;

    this._easing_func    = Tween.bounceEaseInOut;
    this._on_update_func = null;
  },

  to: function(properties, duration)
  {
    if( duration !== null ) {
      this._frames = Math.ceil(duration / ANIMATE_FRAME_TIME_SPACING);
    }

    for( var p in properties ) {
      if( this._object[ p ] === null )
        continue;

      this._v_end[ p ] = properties[ p ];
    }

    return this;
  },

  start: function(_frame)
  {
    this._start_frame = _frame ? _frame : 0;

    for( var p in this._v_end ) {
      if( this._object[ p ] === null )
        continue;

      this._v_begin[ p ] = this._object[ p ];
      this._v_delta[ p ] = this._v_end[ p ] - this._object[ p ];
    }

    return this;
  },

  length: function()
  {
    return this._frames;
  },

  easing: function( easing )
  {
    this._easing_func = easing;
    return this;
  },

  update: function( frame )
  {
    var property, elapsed, value;

    if( frame < this._start_frame )
      return true;

    elapsed = ( frame - this._start_frame ) / this._frames;
    elapsed = elapsed > 1 ? 1 : elapsed;

    if( elapsed < 1 )
    {
      value = this._easing_func( elapsed );

      for( p in this._v_delta )
        this._object[ p ] = this._v_begin[ p ] + this._v_delta[ p ] * value;
    }
    else
    {
      for( p in _v_delta )
        this._object[ p ] = this._v_end[ p ];
    }

    if( this._on_update_func !== null )
      this._on_update_func(this._object);

    if( elapsed == 1 )
      return false;

    return true;
  },

  on_update: function( func )
  {
    this._on_update_func = func;
    return this;
  },
}, {

  linearEaseNone: function(k)
  {
    return k;
  },

  quadraticEaseIn: function(k)
  {
    return k * k;
  },

  quadraticEaseOut: function(k)
  {
    return - k * ( k - 2 );
  },

  quadraticEaseInOut: function(k)
  {
    if( ( k *= 2 ) < 1 )
      return 0.5 * k * k;

    return - 0.5 * ( --k * ( k - 2 ) - 1 );
  },

  cubicEaseIn: function(k)
  {
    return k * k * k;
  },

  cubicEaseOut: function(k)
  {
    return --k * k * k + 1;
  },

  cubicEaseInOut: function(k)
  {
    if( ( k *= 2 ) < 1 )
      return 0.5 * k * k * k;

    return 0.5 * ( ( k -= 2 ) * k * k + 2 );
  },

  quarticEaseIn: function(k)
  {
    return k * k * k * k;
  },

  quarticEaseOut: function(k)
  {
     return - ( --k * k * k * k - 1 );
  },

  quarticEaseInOut: function(k)
  {
    if( ( k *= 2 ) < 1 )
      return 0.5 * k * k * k * k;

    return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
  },

  quinticEaseIn: function(k)
  {
    return k * k * k * k * k;
  },

  quinticEaseOut: function(k)
  {
    return ( k = k - 1 ) * k * k * k * k + 1;
  },

  quinticEaseInOut: function(k)
  {
    if( ( k *= 2 ) < 1 )
      return 0.5 * k * k * k * k * k;

    return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
  },

  sinusoidalEaseIn: function(k)
  {
    return - Math.cos( k * Math.PI / 2 ) + 1;
  },

  sinusoidalEaseOut: function(k)
  {
    return Math.sin( k * Math.PI / 2 );
  },

  sinusoidalEaseInOut: function(k)
  {
    return - 0.5 * ( Math.cos( Math.PI * k ) - 1 );
  },

  exponentialEaseIn: function(k)
  {
    return k == 0 ? 0 : Math.pow( 2, 10 * ( k - 1 ) );
  },

  exponentialEaseOut: function(k)
  {
    return k == 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1;
  },

  exponentialEaseInOut: function(k)
  {
    if( k == 0 || k == 1 )
      return k;

    if( ( k *= 2 ) < 1 )
      return 0.5 * Math.pow( 2, 10 * ( k - 1 ) );

    return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
  },

  circularEaseIn: function(k)
  {
    return - ( Math.sqrt( 1 - k * k ) - 1 );
  },

  circularEaseOut: function(k)
  {
    return Math.sqrt( 1 - --k * k );
  },

  circularEaseInOut: function(k)
  {
    if( ( k /= 0.5 ) < 1)
      return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);

    return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
  },

  elasticEaseIn: function(k)
  {
    var s, a = 0.1, p = 0.4;

    if( k == 0 || k == 1 )
      return k;

    if( !p )
      p = 0.3;

    if( !a || a < 1 )
    {
      a = 1;
      s = p / 4;
    }
    else
      s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );

    return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
  },

  elasticEaseOut: function(k)
  {
    var s, a = 0.1, p = 0.4;

    if( k == 0 || k == 1 )
      return k;

    if( k == 1 )
      return 1;

    if( !p )
      p = 0.3;

    if( !a || a < 1 )
    {
      a = 1;
      s = p / 4;
    }
    else
      s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );

    return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
  },

  elasticEaseInOut: function(k)
  {
    var s, a = 0.1, p = 0.4;

    if( k == 0 || k == 1 )
      return k;

    if( !p )
      p = 0.3;

    if( !a || a < 1 )
    {
      a = 1;
      s = p / 4;
    }
    else
      s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );

    if ( ( k *= 2 ) < 1 )
      return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

    return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

  },

  backEaseIn: function(k)
  {
    var s = 1.70158;

    return k * k * ( ( s + 1 ) * k - s );
  },

  backEaseOut: function(k)
  {
    var s = 1.70158;
    return ( k = k - 1 ) * k * ( ( s + 1 ) * k + s ) + 1;
  },

  backEaseInOut: function(k)
  {
    var s = 1.70158 * 1.525;
    if( ( k *= 2 ) < 1 )
      return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );

    return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
  },

  bounceEaseIn: function(k)
  {
    return 1 - Tween.bounceEaseOut( 1 - k );
  },

  bounceEaseOut: function(k)
  {

    if ( ( k /= 1 ) < ( 1 / 2.75 ) )
      return 7.5625 * k * k;
    else if ( k < ( 2 / 2.75 ) )
      return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
    else if ( k < ( 2.5 / 2.75 ) )
      return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
    else
      return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
  },

  bounceEaseInOut: function(k)
  {
    if ( k < 0.5 )
      return Tween.bounceEaseIn( k * 2 ) * 0.5;

    return Tween.bounceEaseOut( k * 2 - 1 ) * 0.5 + 0.5;
  },
});
