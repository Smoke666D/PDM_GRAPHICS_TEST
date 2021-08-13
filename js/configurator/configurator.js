/*----------------------------------------------------------------------------*/
//var nodeLib = require('./nodeLib.js');
//var Node   = require('./primitives.js').Node;
//var Link   = require('./primitives.js').Link;
//var Pin    = require('./primitives.js').Pin;
var Scheme = require('./primitives.js').Scheme;
var maker  = require('./construct.js');
/*----------------------------------------------------------------------------*/
function Configurator ( size ) {
  var self = this;
  //var addButton = document.getElementById( 'addNode-button' );

  this.schemes   = [];
  this.tabBox    = null;
  this.schemeBox = null;

  this.init    = function ( size ) {
    let bufferTab = "";
    let bufferSch = "";
    self.tabBox    = document.getElementById( 'configuratorTabs'    );
    self.schemeBox = document.getElementById( 'configuratorSchemes' );
    for ( var i=0; i<size; i++ ) {
      self.schemes.push( new Scheme() );
      bufferTab += maker.HTMLtab( i );
      bufferSch += maker.HTMLscheme( i );
    }
    self.tabBox.innerHTML    += bufferTab;
    self.schemeBox.innerHTML += bufferSch;
    /*addButton.addEventListener( 'click', function () {
      self.addNode();
    });*/
  }
  this.addNode = function () {
    console.log("her");
  }

  this.init( size );
  return;
}

}
/*----------------------------------------------------------------------------*/
module.exports.Configurator = Configurator;
/*----------------------------------------------------------------------------*/
