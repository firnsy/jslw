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
  w.set_canvas( $("#gui")[0] );
  w.set_background_color(new Color('rgb(128, 0, 0)'));

  b2 = new ListBox(w, 150, 50, 500, 300);
  b2.set_background_color(new Color('#007f7f'));
  b2.set_item_height(40);
  b2.set_font('24px sans-serif');
  b2.set_font_color(new Color('#fff'));
  b2.add_item('item 0');
  b2.add_item('item 1');
  b2.add_item('item 2');
  b2.add_item('item 3');
  b2.add_item('item 4');
  b2.add_item('item 5');
  b2.add_item('item 6');
  b2.add_item('item 7');
  b2.add_item('item 8');
  b2.add_item('item 9');
  b2.add_item('item 10');

  w.loop_start();

//  setTimeout(function() { b11.slideLeft() } , 2500);
//  setTimeout(function() { b1.slideDown() } , 2750);
}
