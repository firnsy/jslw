Vector2 = function(x, y)
{
  this.set(x, y);
}

Vector2.prototype.set = function(x, y)
{
  // check if first parameter is a Vector first
  if( x instanceof Vector2 )
  {
    this.x = x.x;
    this.y = x.y;
  }
  else
  {
    this.x = x + 0;
    this.y = y + 0;
  }
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

Vector2.prototype.toString = function()
{
  return "{" + this.x + "," + this.y + "}";
}
