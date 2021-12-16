/*----------------------------------------------------------------------------*/
var Scheme    = require( './scheme.js' ).Scheme;
var nodeLib   = require( './nodeLib.js' ).nodeLib;
var workspace = require( './workspace.js' ).workspace;
var config    = require( './workspace.js' ).config;
var remote    = require('electron').remote;
/*----------------------------------------------------------------------------*/
const fileOptions = {
  defaultPath : remote.app.getPath( 'documents' ) + "/sheme.json",
  title       : "Сохранить схему как...",
  filters     : [{ name : "Файл схемы, *.json", extensions : ["json"] }]
};
/*----------------------------------------------------------------------------*/
function HotKey ( first, key, callback ) {
  this.first    = first;
  this.key      = key;
  this.callback = callback;
  return;
}
function Shortcut () {
  var shortcuts = [];
  this.add     = function ( first, key, callback ) {
    if ( ( ( first == "altKey" ) || ( first == "shiftKey" ) || ( first == "ctrlKey" ) || ( first == null ) ) &&
         ( typeof( callback ) == 'function' ) &&
         ( ( ( key.length == 1 ) && ( typeof( key ) == 'string') ) || 
             ( key == "Delete" )     ||
             ( key == "Escape" )     ||
             ( key == "F1" )         ||
             ( key == "F2" )         ||
             ( key == "F3" )         ||
             ( key == "F4" )         ||
             ( key == "F5" )         ||
             ( key == "F6" )         ||
             ( key == "F7" )         ||
             ( key == "F8" )         ||
             ( key == "F9" )         ||
             ( key == "F10" )        ||
             ( key == "F11" )        ||
             ( key == "F12" )        ||
             ( key == "ArrowUp" )    ||
             ( key == "ArrowDown" )  ||
             ( key == "ArrowLeft" )  ||
             ( key == "ArrowRight" ) ) ) {
      shortcuts.push( new HotKey( first, key, callback ) );  
    } else {
      console.log( "Wrong shortcut format");
    }
    return;
  }
  this.process = function ( event ) {
    shortcuts.forEach( function( sch, i ) {
      if ( ( ( ( sch.first == "altKey"   ) && ( event.altKey   == true  ) && ( event.shiftKey == false ) && ( event.ctrlKey == false ) ) ||
             ( ( sch.first == "shiftKey" ) && ( event.altKey   == false ) && ( event.shiftKey == true  ) && ( event.ctrlKey == false ) ) ||
             ( ( sch.first == "ctrlKey"  ) && ( event.altKey   == false ) && ( event.shiftKey == false ) && ( event.ctrlKey == true  ) ) ||
             ( ( sch.first == null       ) && ( event.altKey   == false ) && ( event.shiftKey == false ) && ( event.ctrlKey == false ) ) ) &&
           ( event.key == sch.key ) ) {
        sch.callback();
      }
      
    });
    return;
  }
  return;
}
/*----------------------------------------------------------------------------*/
function Configurator ( size ) {
  var self            = this;
  var zoomInButton    = document.getElementById( 'zoomIn-button'    );
  var zoomResetButton = document.getElementById( 'zoomReset-button' );
  var zoomOutButton   = document.getElementById( 'zoomOut-button'   );
  var saveButton      = document.getElementById( 'saveFile-button'  );
  var loadButton      = document.getElementById( 'openFile-button'  );
  let delButton       = document.getElementById( 'delete-button'    );
  let cancelButton    = document.getElementById( 'cancel-button'    );
  let undoButton      = document.getElementById( 'undo-button'      );
  let redoButton      = document.getElementById( 'redo-button'      );
  var schemeBox       = document.getElementById( 'scheme'           );
  var schemeFrame     = document.getElementById( 'scheme-frame'     );
  var nodeLibrary     = document.getElementById( 'nodeLib-list'     );
  var content         = document.getElementById( 'content'          );
  var activeSch       = 0;
  var shortcuts       = new Shortcut();
  /*----------------------------------------*/
  this.scheme = new Scheme( 0 );
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
  function save () {
    remote.dialog.showSaveDialog( remote.getCurrentWindow(), fileOptions ).then( function ( value ) {
      if ( value.canceled == false ) {
        workspace.save( self.scheme, value.filePath );
      }
    });
    return;
  }
  function open () {
    remote.dialog.showOpenDialog( remote.getCurrentWindow(), fileOptions ).then( function ( value ) {
      if ( value.canceled == false ) {
        workspace.load( value.filePaths[0], function (data) {
          self.scheme.load( data );
        });
      }
    });
    return;
  }
  function del () {
    self.scheme.removeInFocus();
    return;
  }
  function cancel () {
    self.scheme.cancel();
    return;
  }
  function undo () {
    return;
  }
  function redo () {
    return;
  }
  function moveLeft () {
    if ( self.scheme.inFocus != null ) {
      if ( self.scheme.nodes[self.scheme.inFocus].x > 0 ) {
        self.scheme.nodes[self.scheme.inFocus].move( self.scheme.nodes[self.scheme.inFocus].x - 1, self.scheme.nodes[self.scheme.inFocus].y );
        self.scheme.redraw();
      }
    }
    return;
  }
  function moveRight () {
    if ( self.scheme.inFocus != null ) {
      if ( self.scheme.nodes[self.scheme.inFocus].x < xSize ) {
        self.scheme.nodes[self.scheme.inFocus].move( self.scheme.nodes[self.scheme.inFocus].x + 1, self.scheme.nodes[self.scheme.inFocus].y );
        self.scheme.redraw();
      }
    }
    return;
  }
  function moveDown () {
    if ( self.scheme.inFocus != null ) {
      if ( self.scheme.nodes[self.scheme.inFocus].y < ySize ) {
        self.scheme.nodes[self.scheme.inFocus].move( self.scheme.nodes[self.scheme.inFocus].x, self.scheme.nodes[self.scheme.inFocus].y + 1 );
        self.scheme.redraw();
      }
    }
    return;
  }
  function moveUp () {
    if ( self.scheme.inFocus != null ) {
      if ( self.scheme.nodes[self.scheme.inFocus].y > 0 ) {
        self.scheme.nodes[self.scheme.inFocus].move( self.scheme.nodes[self.scheme.inFocus].x, self.scheme.nodes[self.scheme.inFocus].y - 1 );
        self.scheme.redraw();
      }
    }
    return;
  }
  function focusNext () {
    if ( self.scheme.nodes.length > 0 ) {
      if ( self.scheme.inFocus == null ) {
        self.scheme.nodes[0].focus.set();
      } else {
        if ( self.scheme.inFocus == ( self.scheme.nodes.length - 1 ) ) {
          self.scheme.nodes[self.scheme.inFocus].focus.reset();
          self.scheme.nodes[0].focus.set();
          self.scheme.inFocus = 0;
        } else {
          self.scheme.nodes[self.scheme.inFocus].focus.reset();
          self.scheme.inFocus++;
          self.scheme.nodes[self.scheme.inFocus].focus.set();
        }
      }
    }
    return;
  }
  function focusPrev () {
    if ( self.scheme.nodes.length > 0 ) {
      if ( self.scheme.inFocus == null ) {
        self.scheme.nodes[0].focus.set();
      } else {
        if ( self.scheme.inFocus == 0 ) {
          self.scheme.nodes[self.scheme.inFocus].focus.reset();
          self.scheme.nodes[self.scheme.nodes.length-1].focus.set();
          self.scheme.inFocus = self.scheme.nodes.length - 1;
        } else {
          self.scheme.nodes[self.scheme.inFocus].focus.reset();
          self.scheme.inFocus--;
          self.scheme.nodes[self.scheme.inFocus].focus.set();
        }
      }
    }
    return;
  }
  function init( size ) {
    workspace.init( function(){} );
    /*-------------------------------------------------*/
    shortcuts.add( "ctrlKey", "s",          function() { save()       });
    shortcuts.add( "ctrlKey", "o",          function() { open();      });
    shortcuts.add( "ctrlKey", "z",          function() { undo()       });
    shortcuts.add( "ctrlKey", "y",          function() { redo()       });
    shortcuts.add( null,      "Delete",     function() { del();       });
    shortcuts.add( "ctrlKey", "ArrowUp",    function() { moveUp();    });
    shortcuts.add( "ctrlKey", "ArrowDown",  function() { moveDown();  });
    shortcuts.add( "ctrlKey", "ArrowLeft",  function() { moveLeft()   });
    shortcuts.add( "ctrlKey", "ArrowRight", function() { moveRight()  });
    shortcuts.add( "altKey",  "ArrowUp",    function() { focusNext(); });
    shortcuts.add( "altKey",  "ArrowDown",  function() { focusPrev(); });
    shortcuts.add( null,      "Escape",     function() { cancel();    })
    shortcuts.add( null,      "F1",         function() { console.log("get help"); })
    shortcuts.add( "ctrlKey", "a",          function() { console.log("select all"); });
    
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
      return;
    });
    content.addEventListener( 'scroll', function () {
      self.scheme.redraw();
      return;
    });
    /*-------------------------------------------------*/
    zoomInButton.addEventListener( 'click', function () {
      self.scheme.zoom.in();
      return;
    });
    zoomResetButton.addEventListener( 'click', function () {
      self.scheme.zoom.reset();
      return;
    });
    zoomOutButton.addEventListener( 'click', function () {
      self.scheme.zoom.out();
      return;
    });
    /*-------------------------------------------------*/
    delButton.addEventListener( 'click', function () {
      del();
      return;
    });
    cancelButton.addEventListener( 'click', function () {
      cancel();
      return;
    });
    undoButton.addEventListener( 'click', function () {
      undo();
      return;
    })
    redoButton.addEventListener( 'click', function () {
      redo();
      return;
    });
    /*-------------------------------------------------*/
    saveButton.addEventListener( 'click', function () {
      save();
      return;
    });
    loadButton.addEventListener( 'click', function () {
      open();
      return;
    });
    /*-------------------------------------------------*/
    document.onkeyup = function ( event ) {
      shortcuts.process( event );
    }
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
  init( size );
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Configurator = Configurator;
/*----------------------------------------------------------------------------*/
