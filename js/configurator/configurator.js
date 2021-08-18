/*----------------------------------------------------------------------------*/
var Scheme = require('./primitives.js').Scheme;
var maker  = require('./construct.js');
/*----------------------------------------------------------------------------*/
function Configurator ( size ) {
  var self = this;
  var addButton = document.getElementById( 'addNode-button' );
  var tabBox    = document.getElementById( 'configuratorTabs'    );
  var schemeBox = document.getElementById( 'configuratorSchemes' );
  var activeSch = 0;

  this.schemes   = [];

  function setActiveScheme ( n ) {
    activeSch = n;
    return;
  }
  function init( size ) {
    let bufferTab = "";
    let bufferSch = "";
    for ( var i=0; i<size; i++ ) {
      bufferTab += maker.HTMLtab( i );
      bufferSch += maker.HTMLscheme( i );
    }
    tabBox.innerHTML    = bufferTab;
    schemeBox.innerHTML = bufferSch;
    zoomInit( schemeBox );
    for ( var i=0; i<size; i++ ) {
      self.schemes.push( new Scheme( i ) );
    }
    /*-------------------------------------------------*/
    addButton.addEventListener( 'click', function () {
      self.addNode();
    });
    /*-------------------------------------------------*/
    for ( var i=0; i<size; i++ ) {
      let tab = document.getElementById( "scheme" + i + "-tab" ).addEventListener('click', function () {
        setActiveScheme( parseInt( this.id.charAt( 6 ) ) );
      });
    }
    /*-------------------------------------------------*/
    return;
  }
  this.addNode = function () {
    self.schemes[activeSch].addNode( 0 );
    return;
  }

  init( size );
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Configurator = Configurator;
/*----------------------------------------------------------------------------*/
