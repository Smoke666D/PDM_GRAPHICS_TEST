/*----------------------------------------------------------------------------*/
var Scheme  = require('./primitives.js').Scheme;
var nodeLib = require('./nodeLib.js').nodeLib;
/*----------------------------------------------------------------------------*/
function Configurator ( size ) {
  var self = this;
  var addButton       = document.getElementById( 'addNode-button'   );
  var zoomInButton    = document.getElementById( 'zoomIn-button'    );
  var zoomResetButton = document.getElementById( 'zoomReset-button' );
  var zoomOutButton   = document.getElementById( 'zoomOut-button'   );
  var schemeBox       = document.getElementById( 'scheme'           );
  var schemeFrame     = document.getElementById( 'scheme-frame'     );
  var nodeLibrary     = document.getElementById( 'nodeLib-list'     );
  var activeSch       = 0;
  /*----------------------------------------*/
  this.scheme   = new Scheme( 0 );
  /*----------------------------------------*/
  function redraw () {
    self.scheme.redraw();
    return;
  }
  function await ( getState, callback ) {
    let state = getState();
    setTimeout( function() {
      if ( state == true ) {
        callback();
      } else {
        await( getState, callback );
      }
    }, 1 );
    return;
  }
  function init( size ) {
    /*-------------------------------------------------*/
    schemeFrame.addEventListener( 'click', function () {
      if ( self.scheme.isMouseOnNode() == false ) {
        self.scheme.resetFocus();
      }
      return;
    });
    /*-------------------------------------------------*/
    addButton.addEventListener( 'click', function () {
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
    /*-------------------------------------------------*/
    await( nodeLib.getStatus, function () {
      let length  = nodeLib.getSectionNumber();
      let counter = 0;
      for ( var i=0; i<length; i++ ) {
        let section = nodeLib.getSection( i );
        section.records.forEach( function( record, i ) {
          let li       = document.createElement( "LI" );
          li.id        = "nodeItem" + counter;
          li.className = "item";
          let a        = document.createElement( "A" );
          a.innerHTML  = record.heading;
          a.title      = record.help;
          a.setAttribute( 'data-toggle', 'tooltip' );
          li.appendChild( a );
          nodeLibrary.appendChild( li );
          li.addEventListener( 'click', ( function () {
            let j = counter;
            return function () {
              $( "#nodeLib" ).collapse( 'hide' );
              self.addNode( j );
            };
          })());
          counter++;
          $( a ).tooltip( {
            'placement' : 'right',
            'trigger'   : 'hover',
          });
        });
      }
    });
    /*-------------------------------------------------*/
    return;
  }
  this.addNode = function ( id ) {
    self.scheme.addNode( id );
    return;
  }

  init( size );
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Configurator = Configurator;
/*----------------------------------------------------------------------------*/
