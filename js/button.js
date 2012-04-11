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

var Button = Widget.extend({
  /**
   * @constructor
   * @extends Widget
   * Primary constructor for the Button object
   * @param {Widget} p Parent of this widget, only the root object has no parent
   * @param {Rect} r Rectangle bounding box of this widget
   * @param {Object s Object defining the style of the Button
   */
  constructor: function(p, r, s)
  {
    // call our super constructor
    this.base.apply(this, arguments);
    this._type = 'Button';

    this._layers_valid  = ['_default'];
    this._layers_active = '_default';
    this._layers = {
      _default: {
        image:    null,
        bounds:   new Rect(this._bounds),
        animate:  false,
      }
    };

    this._layer_alignment_horizontal = 'center';
    this._layer_alignment_vertical = 'middle';

    // overlay
    this._overlay = null;
    this._overlay_alignment_horizontal = 'center';
    this._overlay_alignment_vertical = 'middle';
    this._overlay_image = null;

    // turn of clipping to handle the overlay
    this._clip = false;

    return this;
  },


  setOverlayImage: function(i)
  {
    if( i instanceof Image )
    {
      this._overlay_image = i;

      if( i.naturalWidth > 0 )
      {
        this._overlay_calculate_offset();
        this.setDirty(true);
      }
    }
    else
    {
      this._overlay_image = new Image();

      this._overlay_image.src = i;
      this._overlay_image.onerror = function(){ console.error('Unable to load image: ' + this.src); };

      var self = this;
      this._overlay_image.onload = function() {
        self._overlay_calculate_offset();
        self.setDirty(true);
      };
    }

    return this;
  },


  setOverlayAlignment: function(_style)
  {
    _style = ( typeof _style === 'object' ) ? _style : {};
    _style.horizontal = _style.horizontal || _style.h || '';
    _style.vertical = _style.vertical || _style.v || '';

    var _update = false;

    if( _style.horizontal )
    {
      switch( _style.horizontal )
      {
        case 'left':
        case 'center':
        case 'right':
          this._overlay_alignment_horizontal = _style.horizontal;
          _update = true;
          break;
        default:
          console.warn('Button.setOverlayAlignment: Unknown horizontal alignment type specified.');
          break;
      }
    }

    if( _style.vertical )
    {
      switch( _style.vertical )
      {
        case 'top':
        case 'middle':
        case 'bottom':
          this._overlay_alignment_vertical = _style.vertical;
          break;
        default:
          console.warn('Button.setOverlayAlignment: Unknown vertical alignment type specified.');
          break;
      }
    }

    if( _update )
    {
      this._overlay_calculate_offset();
    }

    return this;
  },

  addLayers: function(_layers)
  {
    _layers = _layers || [];

    if( ! ( _layers instanceof Array ) )
    {
      _layers = [ _layers ];
    }

    for( var i=0, l=_layers.length; i<l; i++ )
    {
      var _id = _layers[i];

      if( this._layers_valid.indexOf(_id) == -1 )
      {
        // store the known type
        this._layers_valid.push(_id);

        // add default image for types
        this._layers[_id] = {
          image:    null,
          bounds:   new Rect(this._bounds),
          animate:  false
        }

        // if no active type defined yet then define
        if( this.layers_active == null )
        {
          this.layers_active = _id;
        }
      }
      else
      {
        console.log("Button.addLayer: ID already exists: " + _id);
      }
    }

    return this;
  },

  setActiveLayer: function(_id)
  {
    if( _id == null || _id == '' )
      _id = '_default';

    // check if we are already active
    if( this.layers_active === _id )
      return;

    if( this.layers_valid.indexOf(t_id) == -1 )
    {
      console.error('Button.setActiveLayer: ID does not exist: ' + _id);
      return this;
    }

    this.layers_active = _id;

    this.setDirty(true);

    return this;
  },


  setLayerImage: function(_id, _image)
  {
    if ( this._layers_valid.indexOf(_id) === -1 )
    {
      console.warn('Button.setLayerImage: Type ' + _id + ' is not available.');
      return this;
    }

    if( _image instanceof Image )
    {
      this._layers[_id].image = _image;

      if( _image.naturalWidth > 0 )
      {
        this._layer_calculate_offset(_id);
        this.setDirty(true);
      }
    }
    else
    {
      this._layers[_id].image = new Image();

      this._layers[_id].image.src = _image;
      this._layers[_id].image.onerror = function(){ console.warn("Unable to load image: " + this.src); };

      var self = this;
      this._layers[_id].image.onload = function() {
        self._layer_calculate_offset(_id);
        self.setDirty(true);
      };
    }

    return this;
  },

  setLayerAlignment: function(t, h, v)
  {
    _style = ( typeof _style === 'object' ) ? _style : {};

    var _update = false;

    if( _style.horizontal )
    {
      switch( _style.horizontal )
      {
        case 'left':
        case 'center':
        case 'right':
          this._layer_alignment_horizontal = _style.horizontal;
          _update = true;
          break;
        default:
          console.warn('Button.setlayerAlignment: Unknown horizontal alignment type specified.');
          break;
      }
    }

    if( _style.vertical )
    {
      switch( _style.vertical )
      {
        case 'top':
        case 'middle':
        case 'bottom':
          this._layer_alignment_vertical = _style.vertical;
          break;
        default:
          console.warn('Button.setlayerAlignment: Unknown vertical alignment type specified.');
          break;
      }
    }

    if( _update )
    {
      this._layer_calculate_offset();
    }

    return this;
  },

  getActiveLayer: function()
  {
    return this._layers_active;
  },

  setActiveLayer: function(_id)
  {
    if( _id == null || _id == '' ) {
      _id = '_default';
    }

    if( this._layers_valid.indexOf(_id) == -1 )
    {
      console.warn('Button.setActiveLayer: Layer ' + _id + ' is not available.');
      return;
    }

    // check if we're already in the active state
    if( this._layers_active === _id ) {
      return;
    }

    // set our widget state
    this._layers_active = _id;

    // FIXME:

    var type = this._layers_active;

    // TODO: if state not available for type we need have a default type

    var _layer = this._layers[_id];

    if( _layer && _layer.animate && this.animate.length == 0)
    {
      var frames_w = _layer.image.width / _layer.animate_bounds.w;
      var frames_h = _layer.image.height / _layer.animate_bounds.h;
      var frames = frames_w * frames_h;

      var delay = Math.floor(_layer.animate_speed / ANIMATE_FRAME_TIME_SPACING);
      if( delay <= 0 )
        delay = 1;

      // push the animation onto the stack
      this.animate.push({
        frames:   frames * delay,
        index:    0,
        loop:     _layer.animate_loops == -1,
        process:  function(frame) {
          if( (frame % delay) == 0 )
          {
            // advance in the x (these are noops if vertically stacked only)
            _layer.animate_bounds.x += _layer.animate_bounds.w;
            _layer.animate_bounds.x %= _layer.bounds.w;

            // advance in the y (these are noops if horizontally stacked only)
            if( _layer.animate_bounds.x === 0 ) {
              _layer.animate_bounds.y += _layer.animate_bounds.h;
              _layer.animate_bounds.y %= _layer.bounds.h;
            }
          }
        }
      });
    }
    // otherwise ensure animation stack is cleared
    else
      // TODO: this is brute force, we should only clear any button state animations
      this.animate = [];

    this.setDirty(true);

    return this;
  },


  setLayerAnimate: function(_id, s, l)
  {
    if( this._layers_valid.indexOf(_id) == -1 )
    {
      console.warn('Button.setLayerAnimate: Layer "' + _id + '" is not available.');
      return this;
    }

    var _layer = this._layers[_id];
    _layer.animate = true;
    _layer.animate_bounds = new Rect(0, 0, this._bounds.w, this._bounds.h);
    _layer.animate_speed = s;
    _layer.animate_loops = l;

    return this;
  },


  //
  // PRIVATE

  _layer_calculate_offset: function(_layers)
  {
    // resize all types if no type defined
    _layers = _layers || this._layers;

    if( ! _layers instanceof Array )
    {
      _layers = [ _layers ];
    }

    for( var i=0, l=_layers.length; i<l; i++ )
    {
      var _id = _layers[i];

      if( ! this._layers[_id] )
      {
        continue;
      }

      var _layer = this._layers[ _id ];

      if( _layer.image instanceof Image &&
          _layer.image.naturalWidth > 0 )
      {
          _layer.bounds.w = _layer.image.naturalWidth;
          _layer.bounds.h = _layer.image.naturalHeight;
      }

      // horizontal alignment
      switch( this._layer_alignment_horizontal )
      {
        case 'center':
          _layer.bounds.x -= (_layer.bounds.w - this._bounds.w) / 2;
          break;
        case 'right':
          _layer.bounds.x -= (_layer.bounds.w - this._bounds.w);
          break;
      }

      // vertical alignment
      switch( this._layer_alignment_vertical )
      {
        case 'middle':
          _layer.bounds.y -= (_layer.bounds.h - this._bounds.h) / 2;
          break;
        case 'bottom':
          _layer.bounds.y -= (_layer.bounds.h - this._bounds.h);
          break;
      }
    }
  },

  _overlay_calculate_offset: function()
  {
    if( this._overlay == null )
    {
      this._overlay = new Rect(this._bounds);
    }

    if( this._overlay_image instanceof Image &&
        this._overlay_image.naturalWidth > 0 )
    {
      this._overlay.w = this._overlay_image.width;
      this._overlay.h = this._overlay_image.height;
    }

    // horizontal alignment
    switch( this._overlay_alignment_horizontal )
    {
      case 'center':
        this._overlay.x -= (this._overlay.w - this._bounds.w) / 2;
        break;
      case 'right':
        this._overlay.x -= (this._overlay.w - this._bounds.w);
        break;
    }

    // middle alignment
    switch( this._overlay_alignment_vertical )
    {
      case 'middle':
        this._overlay.y -= (this._overlay.h - this._bounds.h) / 2;
        break;
      case 'bottom':
        this._overlay.y -= (this._overlay.h - this._bounds.h);
        break;
    }
  },

  _render_widget: function(context)
  {

    if( this.background_color instanceof Color )
    {
      context.fillStyle = this.background_color.get_rgba(Math.round(this.alpha * 255));
      context.fillRect(this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
    }

    // draw the background image
    if( this.background_image instanceof Image &&
        this.background_image.width > 0 )
    {
      context.drawImage(this.background_image, this._bounds.x, this._bounds.y, this._bounds.w, this._bounds.h);
    }

    var _layer = this._layers[ this._layers_active ];

    if( 'image' in _layer &&
        _layer.image instanceof Image &&
        _layer.image.naturalWidth > 0 )
    {
      // TODO: optimise this hack out (introduced due to late loading of images via the cache)
      if( _layer.bounds.w === 0 )
        this._type_calculate_offset();

      if( 'animate_bounds' in _layer )
      {
        context.drawImage(_layer.image,
                          _layer.animate_bounds.x,
                          _layer.animate_bounds.y,
                          _layer.animate_bounds.w,
                          _layer.animate_bounds.h,
                          this._bounds.x,
                          this._bounds.y,
                          this._bounds.w,
                          this._bounds.h);
      }
      else
      {
        context.drawImage(_layer.image,
                          this._bounds.x,
                          this._bounds.y,
                          this._bounds.w,
                          this._bounds.h);
      }
    }

    // draw the overlay if exists
    if( this.is_pressed &&
        this._overlay_image instanceof Image &&
        this._overlay_image.naturalWidth > 0 )
    {
      context.drawImage(this._overlay_image, this._overlay.x, this._overlay.y, this._overlay.w, this._overlay.h);
    }

    this._render_caption(context);
  },

});
