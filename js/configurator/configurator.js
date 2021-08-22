/*----------------------------------------------------------------------------*/
var Scheme = require('./primitives.js').Scheme;
var maker  = require('./construct.js');
/*----------------------------------------------------------------------------*/
function Configurator ( size ) {
  var self = this;
  var addButton       = document.getElementById( 'addNode-button'   );
  var zoomInButton    = document.getElementById( 'zoomIn-button'    );
  var zoomResetButton = document.getElementById( 'zoomReset-button' );
  var zoomOutButton   = document.getElementById( 'zoomOut-button'   );
  var schemeBox       = document.getElementById( 'scheme'           );
  var schemeFrame     = document.getElementById( 'scheme-frame'     );
  var activeSch       = 0;

  this.scheme   = new Scheme( 0 );

  function redraw () {
    self.scheme.redraw();
    return;
  }
  function init( size ) {
    //zoomInit( schemeBox, redraw );
    /*-------------------------------------------------*/
    schemeFrame.addEventListener( 'click', function () {
      if ( self.scheme.isMouseOnNode() == false ) {
        self.scheme.resetFocus();
      }
      return;
    });
    /*-------------------------------------------------*/
    addButton.addEventListener( 'click', function () {
      self.addNode();
      return;
    });
    /*-------------------------------------------------*/
    zoomInButton.addEventListener( 'click', function () {
      self.scheme.zoomIn();
    });
    zoomResetButton.addEventListener( 'click', function () {
      self.scheme.zoomReset();
    });
    zoomOutButton.addEventListener( 'click', function () {
      self.scheme.zoomOut();
    });
    /*
    schemeFrame.addEventListener( 'wheel', function ( zoom ) {
      if ( zoom.deltaY > 0 ) {
        self.scheme.zoomIn();
      }
      if ( zoom.deltaY < 0 ) {
        self.scheme.zoomOut();
      }
    });
    */
    /*-------------------------------------------------*/
    return;
  }
  this.addNode = function () {
    self.scheme.addNode( 0 );
    return;
  }

  init( size );
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Configurator = Configurator;
/*----------------------------------------------------------------------------*/
