function demo()
{
  w = new Widget(null, 0, 0, 800, 480);
  w.setBackgroundColour('rgb(128, 0, 0)');

  b1 = new Widget(w, 100, 100, 100, 100);
  b1.setBackgroundColour('rgb(0, 128, 0)');
  b1.setVisibility(1);

  b11 = new Widget(b1, 95, 10, 10, 10);
  b11.setBackgroundColour('#000077');

  b2 = new Widget(w, 250, 10, 10, 100);
  b2.setBackgroundColour('#007f7f');


  var context = $("#gui")[0].getContext("2d");
//  context.scale(0.375, 0.312);

  w.render( context, 0, 0 );

  b1.hide();

  while( w.render( context, 0, 0 ) ) {}
}
