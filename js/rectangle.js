// rectangle object description
Rect = function(x, y, w, h)
{
  this.set(x, y, w, h);
}

Rect.prototype.set = function(x, y, w, h)
{
  if( x instanceof Rect )
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

Rect.prototype.shrink = function(s)
{
  // can't shrink if geometry will be <= 0 afterwards
  if( this.w <= (s*2) || this.h <= (s*2) )
    return;

  this.x += s;
  this.y += s;
  this.w -= (s + s);
  this.h -= (s + s);
  this.x2 -= s;
  this.y2 -= s;
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
