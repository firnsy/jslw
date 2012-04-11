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

  ic.add_image('volume', 'images/volume.png');
  ic.add_image('volume_led', 'images/volumeled.png');

  ic.load_all( demo_run );
}

function demo()
{
  demo_init();
}

function demo_run()
{
  w = new Widget(null, new Rect(0, 0, 381, 216))
    .setRoot()
    .setCanvas( $("#gui")[0] )
    .setBackgroundImage( ic.get_image('background') );

  // front, display
  f = new Widget(w, new Rect(34, 0, 308, 216))
    .setBackgroundImage( ic.get_image('front') );

  d = new Widget(w, new Rect(53, 9, 271, 116))
    .setBackgroundImage( ic.get_image('display') );

  // eject
  b_eject = new Button( w, new Rect(7, 181, 28, 28) )
    .setBackgroundImage( ic.get_image('eject') )
    .setOverlayImage( ic.get_image('eject_down') );

  w_crossfade = new Widget( w, new Rect(28, 35, 14, 14) )
    .setBackgroundImage( ic.get_image('led') );

  l_crossfade = new Widget( w, new Rect(60, 38, 39, 9) )
    .setBackgroundImage( ic.get_image('crossfade_label') );

  // crossfade, shuffle and repeat
  b_crossfade = new Button( w, new Rect(9, 30, 19, 19) )
    .setBackgroundImage( ic.get_image('crossfade') )
    .setOverlayImage( ic.get_image('crossfade_down') )
    .addListener('mouse_click', function() {
      w_crossfade.toggleVisibility();
      l_crossfade.toggleVisibility();
    });

  w_shuffle = new Widget( w, new Rect(30, 58, 14, 14) )
    .setBackgroundImage( ic.get_image('led') );

  l_shuffle = new Widget( w, new Rect(62, 60, 31, 9) )
    .setBackgroundImage( ic.get_image('shuffle_label') );

  b_shuffle = new Button( w, new Rect(11, 55, 19, 19) )
    .setBackgroundImage( ic.get_image('shuffle') )
    .setOverlayImage( ic.get_image('shuffle_down') )
    .addListener('mouse_click', function() {
      w_shuffle.toggleVisibility();
      l_shuffle.toggleVisibility();
    });

  w_repeat = new Widget( w, new Rect(34, 80, 14, 14) )
    .setBackgroundImage( ic.get_image('led') );

  l_repeat = new Widget( w, new Rect(66, 82, 27, 9) )
    .setBackgroundImage( ic.get_image('repeat_label') );

  b_repeat = new Button( w, new Rect(15, 80, 19, 19) )
    .setBackgroundImage( ic.get_image('repeat') )
    .setOverlayImage( ic.get_image('repeat_down') )
    .addListener('mouse_click', function() {
      w_repeat.toggleVisibility();
      l_repeat.toggleVisibility();
    });


  // play, stop, pause, next, previous

  b_play = new Button( w, new Rect(298, 110, 32, 33) )
    .setBackgroundImage( ic.get_image('play') )
    .setOverlayImage( ic.get_image('play_down') );

  b_stop = new Button( w, new Rect(266, 110, 31, 33) )
    .setBackgroundImage( ic.get_image('stop') )
    .setOverlayImage( ic.get_image('stop_down') );

  b_previous = new Button( w, new Rect(266, 144, 31, 30) )
    .setBackgroundImage( ic.get_image('previous') )
    .setOverlayImage( ic.get_image('previous_down') );

  b_next = new Button( w, new Rect(298, 144, 32, 30) )
    .setBackgroundImage( ic.get_image('next') )
    .setOverlayImage( ic.get_image('next_down') );

  b_pause = new Button( w, new Rect(288, 137, 20, 20) )
    .setBackgroundImage( ic.get_image('pause') )
    .setOverlayImage( ic.get_image('pause_down') )
    .addListener('mouse_down', function() {
      return true;
    });

  s_volume = new FramedSlider( w, new Rect(203, 157, 44, 44))
    .set_framed_image( ic.get_image('volume') )
    .set_framed_overlay_image( ic.get_image('volume_led') );

  // force update of all widgets
  w.update(true);
}
