Vector2 = function(x, y)
{
  this.set(x, y);
}

Vector2.prototype.set = function(x, y)
{
  this.x = x + 0;
  this.y = y + 0;
}

Vector2.prototype.shiftX = function(x)
{
  this.x += x;
}

Vector2.prototype.shiftY = function(y)
{
  this.y += y;
}

Vector2.prototype.translate = function(v)
{
  this.x += v.x;
  this.y += v.y;
}

Vector2.prototype.scale = function(s)
{
  this.x *= s;
  this.y *= s;
}


// rectangle object description
Rect = function(x, y, w, h)
{
  this.x = x + 0;       // x coordinate for top-left
  this.y = y + 0;       // y coordinate for top-left
  this.w = w + 0;
  this.h = h + 0;
  this.x2 = x + w;  // x coordinate for bottom-right
  this.y2 = y + h;  // y coordinate for bottom-right
}

Rect.prototype.setRect = function(r)
{
  this.x = r.x;
  this.y = r.y;
  this.w = r.w;
  this.h = r.h;
  this.x2 = r.x2;
  this.y2 = r.y2;
}

Rect.prototype.offset = function(x, y)
{
  this.x += x + 0;
  this.y += y + 0;
  this.x2 += x + 0;
  this.y2 += y + 0;
}

Rect.prototype.pointIntersects = function(x, y)
{
  return ( x >= this.x && x <= this.x2 &&
           y >= this.y && y <= this.y2 );
}

Rect.prototype.vectorIntersects= function(v)
{
  this.pointIntersects(v.x, v.y);
}

// implementation

Widget = function(p, x, y, w, h, c) {

  this.bounds = new Rect(x, y, w, h);
  this.offset = new Vector2(0, 0);
  this.bgcolour = "rgba(128, 128, 128, 0.5)";
  this.bgimage = new Image();
  this.parent = p;
  this.root = false;
  this.children = [];
  this.visible = true;

  this.animate = 0;
  this.animate_frames = 50;

  // rendering members
  this.updating = false;
  this.context = null;


  // add to parent object if appropriate
  if( p instanceof Widget )
  {
    p.add_child(this);
  }

  this.dirty = true;
}

Widget.prototype.set_root = function()
{
  // handles all
  this.root = true;

}

Widget.prototype.is_root = function()
{
  return this.root;
}

Widget.prototype.get_root = function()
{
  if ( this.parent == null )
    return this;

  return this.parent.get_root();
}


Widget.prototype.add_child = function(child)
{
  this.children.push(child);
}

// VISIBILITY AND TRANSITION

Widget.prototype.setVisibility = function(state)
{
  this.visible = state;
}

Widget.prototype.hide = function()
{
  this.visible = false;
  this.dirty = true;
  this.animate = 1;
  this.animate_index = this.animate_frames - 1;
  this.animate_end_state = 0;
//  this.slideLeft();
//  this.slideRight();
//  this.slideUp();
//  this.slideDown();
}

Widget.prototype.show = function()
{
  this.offset.set(0, 0);
  this.visible = true;

  this.make_dirty();
}

Widget.prototype.slideLeft = function()
{
  this.animate = 1;
  this.animate_index = 0;
  this.animate_delta_v = new Vector2(
    -(this.bounds.x2 / this.animate_frames),
    0
  );
  this.animate_end_state = 0;

  this.make_dirty();
}

Widget.prototype.slideRight = function()
{
  this.animate = 1;
  this.animate_index = 0;
  this.animate_delta_v = new Vector2(
    (this.parent.bounds.w - this.bounds.x) / this.animate_frames,
    0
  );
  this.animate_end_state = ( ! this.visible );
  this.visible = true;

  this.make_dirty();
}

Widget.prototype.slideUp = function()
{
  this.animate = 1;
  this.animate_index = 0;
  this.animate_delta_v = new Vector2(
    0,
    -(this.bounds.y2 / this.animate_frames)
  );
  this.animate_end_state = 0;

  this.make_dirty();
}

Widget.prototype.slideDown = function()
{
  this.animate = 1;
  this.animate_index = 0;
  this.animate_delta_v = new Vector2(
    0,
    (this.parent.bounds.h - this.bounds.y) / this.animate_frames
  );
  this.animate_end_state = 0;

  this.make_dirty();
}






// STYLING

Widget.prototype.set_background_image = function(path)
{
  this.bgimage.src = path;
  this.bgimage.onerror = function(){ alert("Unable to load image: " + this.src); };

  var this_object = this;
  this.bgimage.onload = function() { this_object.dirty = true; };
}

Widget.prototype.set_background_colour = function(colour)
{
  this.bgcolour = colour;
}

// PROCESS AND RENDERING

Widget.prototype.make_dirty = function()
{
  this.dirty = true;

  this.get_root().update();
}

Widget.prototype.make_clean = function()
{
  this.dirty = false;
}

Widget.prototype.set_context = function(context)
{
  if( ! ( context instanceof CanvasRenderingContext2D ) )
  {
    alert("You have not supplied the correct context.");
    return;
  }

  this.context = context;
}

Widget.prototype.is_dirty = function()
{
  if( ! this.visible )
    return;

  var is_dirty = this.dirty;

  for( c in this.children )
    is_dirty |= this.children[c].is_dirty();

  return is_dirty;
}

Widget.prototype.process = function()
{
  if( ! this.visible )
    return;

  // are we animating
  if ( this.animate )
  {
    this.animate_index++;

    this.offset.translate(this.animate_delta_v);

    if( this.animate_index > this.animate_frames )
    {
      this.visible = this.animate_end_state;
      this.animate = 0;
    }

    this.dirty = true;
  }

  // track dirty states of children
  var is_dirty = this.dirty

  for( c in this.children )
    is_dirty |= this.children[c].process();

  // return aggregate dirty state
  return is_dirty;
}

Widget.prototype.render = function(context, x, y)
{
  if( ! ( context instanceof CanvasRenderingContext2D ) )
    return;

  if( ! this.visible )
  {
    return;
  }

  // save our context
  context.save();

  // offset the view (accounts for animations)
  context.translate(x + this.offset.x, y + this.offset.y);

  // all children must be confined to parents bounds
  context.beginPath();
  context.rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  context.clip();
  context.closePath();

  // draw the widget
  if( this.bgimage.src != "" && this.bgimage.complete )
  {
    context.drawImage(this.bgimage, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }
  else
  {
    context.fillStyle = this.bgcolour;
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  }

  for( c in this.children )
    this.children[c].render(context, this.bounds.x, this.bounds.y);

  context.restore();

  this.dirty = false;
}

Widget.prototype.update = function()
{
  if ( this.updating || ! this.is_root() )
  {
    alert("I'm working.");
    return;
  }

  this.updating = true;

  var is_dirty = this.process();


  if ( is_dirty )
  {
    this.context.save();

    w.render(this.context, 0, 0);

    this.context.restore();

    // setup the render loop
    setTimeout( ( function(scope) { return function() { scope.update(); }; } )(this), 200);
  }

  this.updating = false;
}
