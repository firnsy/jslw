cache = {
  "images": [],
  "images_loaded": 0
};

function demo_init()
{
  i = new Image();
  i.src = 'images/background.png';
  i.onerror = function() { alert("Unable to load image: " + this.src) };
}

function demo_init_complete()
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
  w.set_context( $("#gui")[0].getContext("2d") );
// w.set_background_colour('rgb(128, 0, 0)');

  b1 = new Widget(w, 100, 100, 100, 100);
  b1.set_background_colour('rgb(0, 128, 0)');
  b1.setVisibility(1);

  b11 = new Widget(b1, 95, 10, 10, 10);
  b11.set_background_colour('#000077');

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

  w.update();

  setTimeout(function() { b2.slideRight() } , 2000);
//  setTimeout(function() { b11.slideLeft() } , 2500);
//  setTimeout(function() { b1.slideDown() } , 2750);
}
