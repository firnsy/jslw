// rectangle object description
Rect = function(x, y, w, h)
{
  this.set(x, y, w, h);
}

Rect.prototype.set = function(x, y, w, h)
{
  if( typeof x == 'Rect' )
  {
    this.x = x.x;     // x coordinate for top-left
    this.y = x.y;     // y coordinate for top-left
    this.w = x.w;
    this.h = x.h;
    this.x2 = x.x2;   // x coordinate for bottom-right
    this.y2 = x.y2;   // y coordinate for bottom-right
  }
  else
  {
    this.x = x + 0;   // x coordinate for top-left
    this.y = y + 0;   // y coordinate for top-left
    this.w = w + 0;
    this.h = h + 0;
    this.x2 = x + w;  // x coordinate for bottom-right
    this.y2 = y + h;  // y coordinate for bottom-right
  }
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

Rect.prototype.vectorIntersects = function(v)
{
  this.pointIntersects(v.x, v.y);
}

Rect.prototype.toString = function()
{
  return "{" + this.x + "," + this.y + "," + this.w + "," + this.h + "}";
}
