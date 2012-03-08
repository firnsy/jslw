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
  w = new Widget(null, new Rect(0, 0, 800, 480));
  w.set_root();
  w.set_canvas( $("#gui")[0] );
  w.set_background_color(new Color('rgb(128, 0, 0)'));

  b1 = new Widget(w, new Rect(10, 10, 40, 40));
  b1.set_background_color(new Color('#00ff00'));

  b11 = new Widget(w, new Rect(70, 10, 40, 40));
  b11.set_background_color(new Color('#00ff00'));

  b2 = new ListBox(w, new Rect(150, 50, 500, 300));
  b2.set_background_color(new Color('#007f7f'));
  b2.set_item_height(40);
  b2.set_font(new Font('24px sans-serif'));
  b2.set_active_font('24px sans-serif');
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

  // force update of all widgets
  w.update(true);

 setTimeout(function() { b11.slideOut('right', 400) } , 2500);
 setTimeout(function() { b1.slideOut('down', 400); } , 2750);
}
