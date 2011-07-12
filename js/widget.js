// rectangle object description
Rect = function(x, y, w, h)
{
  this.x = x;       // x coordinate for top-left
  this.y = y;       // y coordinate for top-left
  this.w = w;
  this.h = h;
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
  this.x += x;
  this.y += y;
  this.x2 += x;
  this.y2 += y;
}


// implementation

Widget = function(p, x, y, w, h, c) {

  this.bounds = new Rect(x, y, w, h);
  this.bgcolour = "rgba(128, 128, 128, 0.5)";
  this.children = [];
  this.par = null;
  this.visible = true;
  this.root = 1;  // root widget

  this.visible_transition = 0;
  this.visible_transition_frames = 30;
  this.visible_transition_index = 0;
  this.visible_transition_delta_x = 0;
  this.visible_transition_delta_y = 0;

  // add to parent object if appropriate
  if( p instanceof Widget )
  {
    this.par = p;
    p.addChild(this);
  }
  else if ( p == null )
  {
    // add mouse handling

    this.root = 1;
  }
}

Widget.prototype.addChild = function(child)
{
  this.children.push(child);
}

Widget.prototype.setVisibility = function(state)
{
  this.visible = state;
}

Widget.prototype.hide = function()
{
  this.visible_transition = 1;
  this.visible_transition_index = 0;
  this.visible_transition_delta_x = -(this.bounds.x2 / this.visible_transition_frames);
}

Widget.prototype.show = function()
{

}

Widget.prototype.setBackgroundImage = function(path)
{

}

Widget.prototype.setBackgroundColour = function(colour)
{
  this.bgcolour = colour;
}

Widget.prototype.render = function(context, x, y)
{
  if( ! ( context instanceof CanvasRenderingContext2D ) )
    return;

  if( ! this.visible )
    return;

  // save our context
  context.save();

  // all children objects are draw relative to parent
  if ( this.visible_transition )
  {
    this.visible_transition_index++;

    context.translate(x + (this.visible_transition_index * this.visible_transition_delta_x), y + (this.visible_transition_index * this.visible_transition_delta_y));

    if( this.visible_transition_index >= this.visible_transition_frames )
      this.visible_transition = 0;
  }
  else
    context.translate(x, y);

  // all children must be confined to parents bounds
  context.beginPath();
  context.rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
  context.clip();
  context.closePath();

  context.fillStyle = this.bgcolour;
  context.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);

  var transition = this.visible_transition;

  for (c in this.children)
    transition += this.children[c].render(context, this.bounds.x, this.bounds.y);

  context.restore();

  if ( this.root && transition )
  {
    alert('woot');
  }

  return transition;
}

