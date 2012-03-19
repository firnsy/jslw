ic = new ImageCache();

function demo_init()
{
  ic.add_image('background', 'images/Bgoverlay.png');

  ic.add_image('front', 'images/front.png');
  ic.add_image('display', 'images/Display.png');

  ic.add_image('eject', 'images/b_open.png');
  ic.add_image('eject_down', 'images/b_opend.png');

  ic.add_image('crossfade', 'images/b_crossfade.png');
  ic.add_image('crossfade_down', 'images/b_crossfaded.png');
  ic.add_image('crossfade_label', 'images/crossfade.png');

  ic.add_image('shuffle', 'images/b_shuffle.png');
  ic.add_image('shuffle_down', 'images/b_shuffled.png');
  ic.add_image('shuffle_label', 'images/shuffle.png');

  ic.add_image('repeat', 'images/b_repeat.png');
  ic.add_image('repeat_down', 'images/b_repeatd.png');
  ic.add_image('repeat_label', 'images/repeat.png');

  ic.add_image('previous', 'images/b_previous.png');
  ic.add_image('previous_down', 'images/b_previousd.png');

  ic.add_image('next', 'images/b_next.png');
  ic.add_image('next_down', 'images/b_nextd.png');

  ic.add_image('stop', 'images/b_stop.png');
  ic.add_image('stop_down', 'images/b_stopd.png');

  ic.add_image('play', 'images/b_play.png');
  ic.add_image('play_down', 'images/b_playd.png');

  ic.add_image('pause', 'images/b_pause.png');
  ic.add_image('pause_down', 'images/b_paused.png');

  ic.add_image('led', 'images/led_on.png');

  ic.load_all( demo_run );
}

function demo()
{
  demo_init();
}

function demo_run()
{
  w = new Widget(null, new Rect(0, 0, 381, 216));
  w.set_root();
  w.set_canvas( $("#gui")[0] );
  w.set_background_image( ic.get_image('background') );

  // front, display
  f = new Widget(w, new Rect(34, 0, 308, 216));
  f.set_background_image( ic.get_image('front') );

  d = new Widget(w, new Rect(53, 9, 271, 116));
  d.set_background_image( ic.get_image('display') );

  // eject
  b_eject = new Button( w, new Rect(7, 181, 28, 28) );
  b_eject.set_background_image( ic.get_image('eject') );
  b_eject.set_overlay_image( ic.get_image('eject_down') );

  // crossfade, shuffle and repeat
  b_crossfade = new Button( w, new Rect(9, 30, 19, 19) );
  b_crossfade.set_background_image( ic.get_image('crossfade') );
  b_crossfade.set_overlay_image( ic.get_image('crossfade_down') );

  w_crossfade = new Widget( w, new Rect(28, 35, 14, 14) );
  w_crossfade.set_background_image( ic.get_image('led') );
  l_crossfade = new Widget( w, new Rect(60, 38, 39, 9) );
  l_crossfade.set_background_image( ic.get_image('crossfade_label') );

  b_crossfade.add_event_listener('mouse_click', function() {
    w_crossfade.toggle_visibility();
    l_crossfade.toggle_visibility();
  });

  b_shuffle = new Button( w, new Rect(11, 55, 19, 19) );
  b_shuffle.set_background_image( ic.get_image('shuffle') );
  b_shuffle.set_overlay_image( ic.get_image('shuffle_down') );

  w_shuffle = new Widget( w, new Rect(30, 58, 14, 14) );
  w_shuffle.set_background_image( ic.get_image('led') );
  l_shuffle = new Widget( w, new Rect(62, 60, 31, 9) );
  l_shuffle.set_background_image( ic.get_image('shuffle_label') );

  b_shuffle.add_event_listener('mouse_click', function() {
    w_shuffle.toggle_visibility();
    l_shuffle.toggle_visibility();
  });

  b_repeat = new Button( w, new Rect(15, 80, 19, 19) );
  b_repeat.set_background_image( ic.get_image('repeat') );
  b_repeat.set_overlay_image( ic.get_image('repeat_down') );

  w_repeat = new Widget( w, new Rect(34, 80, 14, 14) );
  w_repeat.set_background_image( ic.get_image('led') );
  l_repeat = new Widget( w, new Rect(66, 82, 27, 9) );
  l_repeat.set_background_image( ic.get_image('repeat_label') );

  b_repeat.add_event_listener('mouse_click', function() {
    w_repeat.toggle_visibility();
    l_repeat.toggle_visibility();
  });


  // play, stop, pause, next, previous

  b_play = new Button( w, new Rect(298, 110, 32, 33) );
  b_play.set_background_image( ic.get_image('play') );
  b_play.set_overlay_image( ic.get_image('play_down') );

  b_stop = new Button( w, new Rect(266, 110, 31, 33) );
  b_stop.set_background_image( ic.get_image('stop') );
  b_stop.set_overlay_image( ic.get_image('stop_down') );

  b_previous = new Button( w, new Rect(266, 144, 31, 30) );
  b_previous.set_background_image( ic.get_image('previous') );
  b_previous.set_overlay_image( ic.get_image('previous_down') );

  b_next = new Button( w, new Rect(298, 144, 32, 30) );
  b_next.set_background_image( ic.get_image('next') );
  b_next.set_overlay_image( ic.get_image('next_down') );

  b_pause = new Button( w, new Rect(288, 137, 20, 20) );
  b_pause.set_background_image( ic.get_image('pause') );
  b_pause.set_overlay_image( ic.get_image('pause_down') );

  b_pause.add_event_listener('mouse_down', function() {
    return true;
  });

  // force update of all widgets
  w.update(true);
}
