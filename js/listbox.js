ListBox = function(p, x, y, w, h, c)
{
  // call our super constructure
  this.base = Widget;
  this.base(p, x, y, w, h);

  this.background_image_up = null;
  this.background_image_down = null;

  this.list = Array();
  this.item_index = 0;
  this.list_offset = 0;
  this.list_offset_max = 0;
  this.item_index_active = 4;
  this.item_height = 20;
  this.active_font_style = '#000';
  this.active_style = '#fff';
  this.text_offset = 5;
  this.item_visible_count = Math.floor(this.bounds.h / this.item_height) + 1;

  this.drag_origin = new Vector2(0,0);

  // register callbacks
  this.register_callbacks(this);
}

ListBox.prototype = new Widget;


ListBox.prototype.add_item = function(item, index)
{
  item = item || '';

//if( index
//index = index || 0;

  this.list.push(item);
  this.list_offset_max = Math.max(0, (this.item_height * this.list.length) - this.bounds.h);
}


//
// EVENTS


ListBox.prototype.mouse_drag_start = function(x, y)
{
  this.drag_origin.set(x, y);
  this.drag_stride = this.bounds.h / (this.list.length - this.item_visible_count + 1) / 2;

  // fade in scrollbar
}


ListBox.prototype.mouse_drag_move = function(x, y)
{
  var y_delta = y - this.drag_origin.y;

  this.drag_origin.set(x, y);

  if( this.list_offset + y_delta >= 0 &&
      this.list_offset + y_delta < this.list_offset_max )
  {
    this.list_offset += y_delta;
    this.make_dirty();
  }
}


ListBox.prototype.mouse_drag_end = function(x, y)
{
  // fade out scrollbar
}


//
// STYLING

ListBox.prototype.set_item_height = function(height)
{
  // set sane default
  height = height || 20;

  // validate
  if( height <= 0 )
  {
    console.log('Invalid height: ' + height + '. Height must be unsigned integer greater than 0 pixels');
    return;
  }

  this.item_height = height;
  this.item_visible_count = Math.floor(this.bounds.h / this.item_height) + 1;
  this.list_offset_max = Math.max(0, (this.item_height * this.list.length) - this.bounds.h);
}


ListBox.prototype.active_font_style = function(font)
{
  this.active_font_style = font;
}


ListBox.prototype.active_style = function(style)
{
  this.active_style = style;
}


//
// RENDERING
ListBox.prototype.render_widget = function(context)
{
  // draw the widget
  if( this.bgcolour != '' )
  {
    context.fillStyle = this.bgcolour;
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  if( this.background_image instanceof Image &&
      this.background_image.src != '' &&
      this.background_image.complete )
  {
    context.drawImage(this.background_image, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  context.textBaseline = 'middle';
  context.font = this.text_font;
  context.fillStyle = this.text_style;

  var item_stride = Math.min(this.item_visible_count, this.list.length);
  var item_y = this.bounds.y - (this.list_offset % this.item_height ) + (this.item_height / 2);

  var item_index_start = Math.floor(this.list_offset / this.item_height);

  for( var i=0; i<item_stride; i++ )
  {
    var index = i + item_index_start;
    var item = this.list[index];

    if( index == this.item_index_active )
    {
      context.save();

      context.fillStyle = this.active_style;
      context.fillRect(this.bounds.x, item_y-(this.item_height / 2), this.bounds.w, this.item_height);

      context.fillStyle = this.active_font_style;
      context.fillText(item, this.bounds.x + this.text_offset, item_y);

      context.restore();
    }
    else
      context.fillText(item, this.bounds.x + this.text_offset, item_y);

    item_y += this.item_height;
  }
}
