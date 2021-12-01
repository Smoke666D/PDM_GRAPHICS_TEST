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
  var content         = document.getElementById( 'content'          );
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
  function drawLibMenu () {
    await( nodeLib.getStatus, function () {
      let length  = nodeLib.getSectionNumber();
      let counter = 0;
      for ( var i=0; i<length; i++ ) {
        let section    = nodeLib.getSection( i );
        let li         = document.createElement( "LI" );
        let a          = document.createElement( "A" );
        let span       = document.createElement( "SPAN" );
        span.innerHTML = section.name;
        a.setAttribute( 'for',           ( section.key + "-section" )       );
        a.setAttribute( 'data-target',   ( "#" + section.key + "-section" ) );
        a.setAttribute( 'data-toggle',   "collapse"                         );
        a.setAttribute( 'aria-expanded', "false"                            );
        a.setAttribute( 'class',         "dropdown-toggle"                  );
        let ul       = document.createElement( "UL" );
        ul.id        = section.key + "-section";
        ul.className = "collapse list-unstyled";
        a.appendChild( span );
        li.appendChild( a );
        li.appendChild( ul );
        nodeLibrary.appendChild( li );
        section.records.forEach( function( record, i ) {
          let li         = document.createElement( "LI" );
          li.id          = "nodeItem" + counter;
          li.className   = "item";
          let span       = document.createElement( "SPAN" );
          span.innerHTML = record.heading;
          span.title     = record.help;
          span.setAttribute( 'data-toggle', 'tooltip' );
          li.appendChild( span );
          ul.appendChild( li );
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
    schemeFrame.addEventListener( 'scroll', function() {
      self.scheme.redraw();
    });
    content.addEventListener( 'scroll', function () {
      self.scheme.redraw();
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
    drawLibMenu();
    /*-------------------------------------------------*/
    return;
  }
  /*----------------------------------------*/
  this.addNode = function ( id ) {
    self.scheme.addNode( id );
    return;
  }
  this.save    = function () {

  }
  init( size );
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Configurator = Configurator;
/*----------------------------------------------------------------------------*/
