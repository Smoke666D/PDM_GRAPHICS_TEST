/*----------------------------------------------------------------------------*/
var Scheme = require('./primitives.js').Scheme;
var maker  = require('./construct.js');
/*----------------------------------------------------------------------------*/
function Configurator ( size ) {
  var self = this;
  var addButton = document.getElementById( 'addNode-button'      );
  var schemeBox = document.getElementById( 'scheme' );
  var activeSch = 0;

  this.scheme   = new Scheme( 0 );

  function redraw () {
    self.scheme.redraw();
    return;
  }
  function init( size ) {
    //zoomInit( schemeBox, redraw );
    /*-------------------------------------------------*/
    addButton.addEventListener( 'click', function () {
      self.addNode();
    });
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
