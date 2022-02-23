/*----------------------------------------------------------------------------*/
var lib = require('./nodeLib.js').nodeLib;
var can = require('./can.js');
var getLength = require('./can.js').getLength;
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

  function isFree ( adr, type ) {
    let res    = true;
    let length = getLength( type );
    chunks.forEach( function ( chunk, i ) {
      if ( chunk.frame == adr.frame ) {
        for ( var j=0; j<length; j++ ) {
          let cur = adr.byte*8 + j
          if ( ( cur >= ( chunk.byte * 8 + chunk.bit ) ) && ( cur <= ( chunk.byte * 8 + chunk.bit + chunk.length ) ) ) {
            res = false;
            break;
          }
        }
      }
    });
    return res;
  }
  function onChunkDragStart ( frame, byte, bit, type ) {
    let coords = frames[frame].get.coords( byte, bit, function ( x, y ) {});
    frames[frame].set.free( byte, type );
    getAvalibleZones( frame, byte, 0, type );
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
    shadow.hide();
    frames[current.frame].set.full( current.byte, type );
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
  function checkZone () {
    
  }
  function getAvalibleZones ( startFrame, startAdr, startBit, type  ) {
    avalible = [];
    calcGlobalOffset();
    frames.forEach( function( frame, i ) {
      for ( var j=0; j<frame.get.size(); j++ ) {
        if ( type == "bool" ) {
          for ( var k=0; k<8; k++ ) {
            if ( ( frame.is.adrFree( j, k, type ) == true ) || ( ( k == startBit ) && ( i == startFrame ) && ( j == startAdr ) ) ) {
              let coords = frame.get.coords( j, k, function ( x, y ) {});
              avalible.push({
                "frame"  : i,
                "byte"   : j,
                "bit"    : k,
                "top"    : coords.y - rowPadding,
                "bottom" : coords.y + frame.get.height() + rowPadding,
                "left"   : coords.x,
                "right"  : coords.x + frame.get.byteWidth()
              });
            }  
          }
        } else {
          if ( ( frame.is.adrFree( j, 0, type ) == true ) || ( ( i == startFrame ) && ( j == startAdr ) ) ) {
            let coords = frame.get.coords( j, 0, function ( x, y ) {});
            avalible.push({
              "frame"  : i,
              "byte"   : j,
              "bit"    : 0,
              "top"    : coords.y - rowPadding,                      /* from frame */
              "bottom" : coords.y + frame.get.height() + rowPadding, /* from frame */
              "left"   : coords.x,                                   /* frome byte and bit */
              "right"  : coords.x + frame.get.byteWidth()            /* frome byte and bit */
            });
          }
        }
      }
      return;
    });
    return;
  }
  function resetSectionsFocus () {
    frames.forEach( function ( frame, i ) {
      if ( frame.focus.is() == true ) {
        settings.get( frame )
        frame.focus.reset();
      }
      return;
    });
    return;
  }
  function isSpace ( type ) {
    let res = null;
    frames.forEach( function ( frame, i ) {
      if ( frame.is.space( type ) == true ) {
        res = i;
      }
    });
    return res;
  }
  function addFrame () {
    let frame       = document.createElement( "DIV" );
    frame.className = "row";
    let cur         = frames.length;    
    frames.push( new can.Frame( cur, resetSectionsFocus, settings.set ) );
    frames.forEach( function ( frame ) { frame.adr = parseInt( frame.adr ) });
    frame.appendChild( frames[cur].get.box() );
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
        frames[chunk.frame].set.free( chunk.byte, prevType );
        chunk.frame = searchFreeFrame( chunk.type );
        let address = frames[chunk.frame].add.data( chunk.id, chunk.type );
        chunk.byte  = address.byte;
        chunk.bit   = address.bit;
      }
      frames[chunk.frame].get.coords( chunk.byte, chunk.bit, function ( x, y ) {
        chunk.move( x, y );
        if ( chunk.added == false ) {
          self.content.appendChild( chunk.getBox() );
          chunk.added = true;
        }
      });
    });
  }
  this.addChunk     = function ( id, getType, type, callback, adr=null ) {
    let newChunk = false;
    if ( ( id != null ) && ( type != null ) ) {
      let exist = false;
      chunks.forEach( function( chunk, i ) {
        if ( chunk.id == id ) {
          exist = true;
        }
      });
      if ( exist == false ) {
        if ( adr != null ) {
          if ( frames.length <= adr.frame ) {
            for ( var i=frames.length; i<( adr.frame + 1); i++ ) {
              addFrame();
            }
          }
          if ( frames[adr.frame].is.adrFree( adr.byte, adr.bit, type ) == false ) {
            adr.frame = searchFreeFrame( type );
            let buf   = frames[adr.frame].add.data( id, type );
            adr.byte  = buf.byte;
            adr.bit   = buf.bit;
          } else {
            frames[adr.frame].set.full( adr.byte, adr.bit, type );
          }
        } else {
          newChunk  = true;
          adr.frame = searchFreeFrame( type );
          let buf   = frames[adr.frame].add.data( id, type );
          adr.byte  = buf.byte;
          adr.bit   = buf.bit;
        }
        chunks.push( new can.Chunk( id, type, onChunkDragStart, onChunkDraging, onChunkDrop, getType ) );
        chunks[chunks.length - 1].place( adr.frame, adr.byte, adr.bit );
        callback();
        /*
        if ( newChunk == true ) {
          frames[adr.frame].get.coords( adr.byte, adr.bit, function( x, y ) {
            chunks[chunks.length - 1].move( x, y );
            self.content.appendChild( chunks[chunks.length - 1].getBox() );
            callback();
          });
        }*/
      }
    }
    return adr;
  }
  this.removeChunk  = function ( id ) {
    return;
  }
  this.getFrames    = function () {
    return frames;
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
  this.addCanChunk  = function ( id, typeCallback, type, adr=null, callback ) {
    return dialogs.can.addChunk( id, typeCallback, type, adr, callback );
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
