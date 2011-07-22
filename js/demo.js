function demo_init()
{
}

function demo()
{
  demo_init();
  demo_run();
}

function demo_run()
{
  w = new Widget(null, 0, 0, 800, 480);
  w.set_root();
  w.set_background_image('images/background.png');
  w.set_canvas( $("#gui")[0] );
// w.set_background_colour('rgb(128, 0, 0)');

  b1 = new Widget(w, 100, 100, 100, 100);
  b1.set_background_colour('rgb(0, 128, 0)');
  b1.setVisibility(1);

  b11 = new Widget(b1, 55, 20, 20, 20);
  b11.set_background_colour('#000077');
  b11.add_event_listener("mouse_up", function(){ b11.slideLeft(); return true; });

  b2 = new Widget(w, 250, 10, 10, 100);
  b2.set_background_colour('#007f7f');

  t1 = new Widget(w, 304, 429, 48, 51)
  t1.set_background_image('images/rewind_up.png');

  t2 = new Widget(w, 352, 429, 48, 51)
  t2.set_background_image('images/play_up.png');

  t3 = new Widget(w, 400, 429, 48, 51)
  t3.set_background_image('images/stop_up.png');

  t4 = new Widget(w, 448, 429, 48, 51)
  t4.set_background_image('images/forward_up.png');

  w.loop_start();

  setTimeout(function() { b2.slideRight() } , 2000);
//  setTimeout(function() { b11.slideLeft() } , 2500);
//  setTimeout(function() { b1.slideDown() } , 2750);
}
