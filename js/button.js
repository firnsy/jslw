Button = function(p, x, y, w, h, c)
{
  // call our super constructure
  this.base = Widget;
  this.base(p, x, y, w, h);

  this.background_image_up = null;
  this.background_image_down = null;

  var this_object = this;
  this.cb = {
    "mouse_down": function() {
      this_object.background_image = this_object.background_image_down;
      this_object.make_dirty();
    },
    "mouse_up": function() {
      this_object.background_image = this_object.background_image_up;
      this_object.make_dirty();
    }
  };
}

Button.prototype = new Widget;

Button.prototype.add_event_listener = function(a, cb)
{
  var this_object = this;

  switch(a)
  {
    case "mouse_down":
      this.cb[a] = function(x,y) {
        this_object.background_image = this_object.background_image_down;
        this_object.make_dirty();
        cb(x,y);
      };
      break;
    case "mouse_up":
      this.cb[a] = function(x,y) {
        this_object.background_image = this_object.background_image_up;
        this_object.make_dirty();
        cb(x,y);
      };
      break;
    case "mouse_move":
      this.cb[a] = cb;
      break;
    default:
      alert("Unknown event type supplied: " + a);
  }
}


Button.prototype.set_background_image_up = function(path)
{
  this.background_image_up = new Image();

  this.background_image_up.src = path;
  this.background_image_up.onerror = function(){ alert("Unable to load image: " + this.src); };

  var this_object = this;
  this.background_image_up.onload = function() { this_object.make_dirty(); };

  // default image is up
  this.background_image = this.background_image_up;
}

Button.prototype.set_background_image_down = function(path)
{
  this.background_image_down = new Image();

  this.background_image_down.src = path;
  this.background_image_down.onerror = function(){ alert("Unable to load image: " + this.src); };

  var this_object = this;
  this.background_image_down.onload = function() { this_object.make_dirty(); };
}
