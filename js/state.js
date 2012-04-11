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

var State = Base.extend({ // INSTANCE INTERFACE

  //
  // MEMBERS
  //

  _id:        'unknown',

  _objects:   {},

  /**
   * @constructor
   * Primary constructor for the Widget object
   * @param {Widget} p Parent of this widget, only the root object has no parent
   * @param {Rect} r Rectangle bounding box of this widget
   * @param {Object} [s="{}"] Object representing the style of this Widget
   */
  constructor: function(p, r, s)
  {
    if( arguments.length === 0 )
      return;

    if( ! ( r instanceof Rect ) )
    {
      console.error('Bounds for widget must be of type Rect:' + p.toString());
      return;
    }
  },

  addObject: function(_id, _object)
  {
    if( this._states[_state] )
    {
      return;
    }

    if( typeof _object !== 'object' )
    {
      console.error('State.addState: Can only create states on object properties.');
      return;
    }

    this._objects[_id] = {
      _handle:    _object,
      _watchers:  {
        _id: [],
      }.
    }
  },

  removeObject: function(_id)
  {
    if( ! this._objects[_id] )
    {
      console.warn('State.removeObject: Object does not exist.');
      return;
    }

    for( var s in this._objects[_id]._watchers )
    {
      this._removeStateWatcher(_state, s);
    }
  },

  addWatcher: function(_id, _property, _cb)
  {
    if( ! this._objects[_id] )
    {
      console.warn('State.addWatcher: Object does not exist.');
      return;
    }

    return _watcher_id;
  },

  removeWatcher: function(_id, _watcher_id)
  {
    if( ! this._objects[_id] )
    {
      console.warn('State.addWatcher: Object does not exist.');
      return;
    }
  },
}, { // CLASS INTERFACE

});
