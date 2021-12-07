/*----------------------------------------------------------------------------*/
var lib = require('./nodeLib.js').nodeLib;
var can = require('./can.js');
/*----------------------------------------------------------------------------*/
const rowPadding = 5;
/*----------------------------------------------------------------------------*/
function ChunkShadow () {
  var self = this;
  var box  = null;
}
function ExternalDialog () {
  var self     = this;
  this.title   = "";
  this.content = document.createElement( "DIV" );
  var names    = [];
  var sections = [];

  this.make = function () {
    self.title             = "Переферийные устройства";
    self.content           = document.createElement( "DIV" );
    lib.getExternal().forEach( function ( device, i ) {
      let index = names.indexOf( device.class );
      if ( index == -1 ) {
        names.push( device.class );
        let sec        = document.createElement( "DIV" );
        let text       = document.createElement( "H5" );
        text.innerHTML = device.class;
        text.className = "none-text";
        sec.appendChild( text );
        sections.push( sec );
        index = names.indexOf( device.class );
      }
      let line          = document.createElement( "DIV" );
      let box           = document.createElement( "LABEL" );
      let checker       = document.createElement( "INPUT" );
      let span          = document.createElement( "SPAN" );
      let label         = document.createElement( "LABEL" );
      line.className    = "row unselect";
      box.className     = "switch";
      checker.type      = "checkbox";
      checker.id        = device.name;
      checker.className = "check-input";
      span.className    = "slider";
      label.htmlFor     = device.name;
      label.className   = "sliderLabel";
      label.innerHTML   = device.name;
      box.appendChild( checker );
      box.appendChild( span );
      line.appendChild( box );
      line.appendChild( label );
      sections[index].appendChild( line );
      return;
    });
    self.content.innerHTML = "";
    sections.forEach( function ( section, i ) {
      self.content.appendChild( section );
      return;
    });
    self.action = function () {
      let out      = [];
      lib.getExternal().forEach( function ( device, i ) {
        let checker = document.getElementById( device.name );
        if ( checker.checked == true ) {
          out.push( device );
        }
        return;
      });
      lib.setupExternal( out );
      return;
    }
    return;
  }
}
function CanDialog () {
  var self     = this;
  var names    = [];
  var frames   = [];
  var chunks   = [];
  var avalible = [];
  var settings = new can.Settings();
  var shadow   = new can.Shadow();
  var offsetY  = 0;
  var offsetX  = 0;
  var current  = null;
  var onChange = null;
  this.title   = "";
  this.content = document.createElement( "DIV" );
  this.action  = null;
  this.data    = null;

  function onChunkDragStart ( frame, adr, type ) {
    let coords = frames[frame].getCoords( adr, function ( x, y ) {});
    frames[frame].setFree( adr, type );
    getAvalibleZones( frame, adr, type );
    current = null;
    shadow.setWidth( type );
    shadow.move( coords.x, coords.y );
    shadow.show();
    return;
  }
  function onChunkDraging ( x, y ) {
    avalible.forEach( function ( zone, i ) {
      if ( ( x > ( zone.left + offsetX ) ) && ( x < ( zone.right + offsetX ) ) ) {
        if ( ( y > ( zone.top + offsetY ) ) && ( y < ( zone.bottom + offsetY ) ) ) {
          shadow.move( zone.left, ( zone.top + rowPadding ) );
          current = zone;
        }
      }
    });
    return;
  }
  function onChunkDrop ( adr, type ) {
    if ( typeof( onChange ) == "function" ) {
      onChange( adr, current.frame, current.byte );
    }
    frames[current.frame].setFull( current.byte, type );
    return { "x" : current.left, "y" : ( current.top + rowPadding ), "frame" : current.frame, "adr" : current.byte };
  }
  function calcGlobalOffset () {
    offsetY = document.getElementById( "dialogModal-body" ).offsetTop +
              document.getElementById( "contentBox" ).offsetTop       +
              document.getElementById( "modalBox" ).offsetTop;
    offsetX = document.getElementById( "dialogModal-body" ).offsetLeft +
              document.getElementById( "contentBox" ).offsetLeft       +
              document.getElementById( "modalBox" ).offsetLeft;
    return;
  }
  function getAvalibleZones ( startFrame, startAdr, type  ) {
    avalible = [];
    calcGlobalOffset();
    frames.forEach( function( frame, i ) {
      for ( var j=0; j<frame.getSize(); j++ ) {
        if ( ( frame.isAdrFree( j, type ) == true ) || 
             ( ( i == startFrame ) && ( j == startAdr ) ) ) {
          let coords = frame.getCoords( j, function ( x, y ) {});
          avalible.push({
            "frame"  : i,
            "byte"   : j,
            "top"    : coords.y - rowPadding,
            "bottom" : coords.y + frame.getHeight() + rowPadding,
            "left"   : coords.x,
            "right"  : coords.x + frame.getByteWidth()
          });
        }
      }
      return;
    });
    return;
  }
  function resetSectionsFocus () {
    frames.forEach( function ( frame, i ) {
      if ( frame.isFocus() == true ) {
        settings.get( frame )
        frame.resetFocus();
      }
      return;
    });
    return;
  }
  function isSpace ( type ) {
    let res = null;
    frames.forEach( function ( frame, i ) {
      if ( frame.isSpace( type ) == true ) {
        res = i;
      }
    });
    return res;
  }
  function addFrame () {
    let frame       = document.createElement( "DIV" );
    frame.className = "row";
    let cur = frames.length;
    frames.push( new can.Frame( cur, resetSectionsFocus, settings.set ) );
    frame.appendChild( frames[cur].getBox() );
    self.content.appendChild( frame );
    return frames.length - 1;
  }
  function searchFreeFrame ( type ) {
    let adr = isSpace( type );
    if ( adr == null ) {
      adr = addFrame();
    }
    return adr;
  }
  this.initOnChange = function ( callback ) {
    onChange = callback;
  }
  this.make         = function () {
    self.title       = "CAN шина";
    self.content     = document.createElement( "DIV" );
    let bar          = document.createElement( "DIV" );
    bar.className    = "row";
    let button       = document.createElement( "BUTTON" );
    button.innerHTML = "+";
    button.className = "small";
    button.addEventListener( 'click', function () {
      addFrame();
    });
    bar.appendChild( button );
    self.content.appendChild( bar );
    self.content.appendChild( shadow.getBox() );
    self.content.appendChild( settings.draw() );
    self.action = function () {
      return;
    }
    return;
  }
  this.redraw       = function () {
    chunks.forEach( function( chunk, i ) {
      let prevType = chunk.type;
      chunk.restyle();
      if ( prevType != chunk.type ) {
        frames[chunk.frame].setFree( chunk.adr, prevType );
        chunk.frame = searchFreeFrame( chunk.type );
        chunk.adr   = frames[chunk.frame].addData( chunk.id, chunk.type );
      }
      frames[chunk.frame].getCoords( chunk.adr, function ( x, y ) {
        chunk.move( x, y );
      });
    });
  }
  this.addChunk     = function ( id, getType ) {
    let type = getType();
    if ( ( id != null ) && ( type != null ) ) {
      let exist = false;
      chunks.forEach( function( chunk, i ) {
        if ( chunk.id == id ) {
          exist = true;
        }
      });
      if ( exist == false ) {
        let adr = searchFreeFrame( type );
        chunks.push( new can.Chunk( id, type, onChunkDragStart, onChunkDraging, onChunkDrop, getType ) );
        let pointer = frames[adr].addData( id, type );
        frames[adr].getCoords( pointer, function( x, y ) {
          chunks[chunks.length - 1].place( adr, pointer );
          self.content.appendChild( chunks[chunks.length - 1].getBox() );
        });
      }
    }
    return;
  }
  this.removeChunk  = function ( id ) {
    return;
  }
}
function MbDialog () {
  var self = this;
  this.title   = "";
  this.content = document.createElement( "DIV" );
  this.action  = null;
  this.data    = null;
  this.make = function () {
    self.title             = "ModBUS шина";
    self.content           = document.createElement( "DIV" );
    self.content.innerHTML = "No data!"
    self.action = function () {
      return;
    }
  }
}
function Dialogs () {
  var self      = this;
  this.external = new ExternalDialog();
  this.can      = new CanDialog();
  this.mb       = new MbDialog();
  this.init     = function () {
    self.external.make();
    self.can.make();
    self.mb.make();
    return;
  }
  return;
}
function Modal () {
  var self    = this;
  var dialogs = new Dialogs();
  var currant = "ext";
  var title   = document.getElementById( "dialogModal-title" );
  var body    = document.getElementById( "dialogModal-body"  );
  var button  = document.getElementById( "modal-button"      );
  function init () {
    lib.awaitReady( function () {
      dialogs.init();
      button.addEventListener( 'click', function () {
        buttonEvent( currant );
      });
      self.showExternal();
      document.getElementById( "bus-button" ).addEventListener( 'click', function () {
        if ( lib.getSetup().hardware.can == true ) {
          self.showCan();
          $("#dialogModal").modal('toggle');
        } else if ( lib.hardware.mb == true ) {
          self.showMb();
          $("#dialogModal").modal('toggle');
        }
        return;
      });
      return;
    });
    return;
  }
  function clean () {
    title.innerHTML = "";
    body.innerHTML  = "";
    return;
  }
  function buttonEvent ( adr ) {
    switch ( adr ) {
      case "ext":
        dialogs.external.action();
        break;
      case "can":
        dialogs.can.action();
        break;
      case "mb":
        dialogs.mb.action();
        break;
    }
    return;
  }
  function draw ( dialog, data=null ) {
    clean();
    dialog.data     = data;
    title.innerHTML = dialog.title;
    body.appendChild( dialog.content );
    return;
  }
  this.initOnChange = function ( callback ) {
    dialogs.can.initOnChange( callback );
    return;
  }
  this.showExternal = function () {
    currant = "ext";
    draw( dialogs.external );
    return;
  }
  this.addCanChunk  = function ( id, typeCallback ) {
    dialogs.can.addChunk( id, typeCallback );
    return;
  }
  this.showCan      = function () {
    currant = "can";
    dialogs.can.redraw();
    draw( dialogs.can );
    return;
  }
  this.showMb       = function ( id=null, type=null ) {
    currant = "mb";
    draw( dialogs.mb );
    return;
  }

  init();
  return;
}
/*----------------------------------------------------------------------------*/
let dialog = new Modal();
/*----------------------------------------------------------------------------*/
module.exports.dialog = dialog;
