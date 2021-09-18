/*----------------------------------------------------------------------------*/
const dataSize = 8 * 8;
/*----------------------------------------------------------------------------*/
function Subadr () {
  var self    = this;
  this.enb    = false;
  this.adr    = 0;
  this.length = 0;
}
function Checker () {
  var self     = this;
  this.enb     = false;
  this.timeout = 0;
}
function Pointer ( adr, length, id ) {
  var self    = this;
  this.id     = id;     /* ID of the node      */
  this.adr    = adr;    /* Address in th frame */
  this.length = length; /* Length of the data  */
}
function Frame () {
  var self    = this;
  var data    = new Array( dataSize );
  var box     = null;

  this.adr      = 0;
  this.subadr   = new Subadr();
  this.cheker   = new Checker();
  this.pointers = [];

  function init () {
    clean();
    draw();
    return;
  }
  function clean () {
    data.forEach( function ( bit, i ) {
      bit = 0;
      return;
    });
    return;
  }
  function getLength ( type ) {
    let out = 0;
    switch ( type ) {
      case 'bool':
        out = 1;
        break;
      case 'byte':
        out = 8;
        break;
      case 'short':
        out = 16;
        break;
    }
    return out;
  }
  function getSpace ( type ) {
    let length = getLength( type );
    let count  = 0;
    let adr    = 0;
    data.forEach( function ( bit, i ) {
      if ( bit == 0 ) {
        count++;
        if ( count >= length ) {
          break;
        }
      } else {
        adr = i;
      }
      return;
    });
    if ( adr >= ( dataSize - 1 ) ) {
      adr = null;
    }
    return adr;
  }
  function setSpace ( adr, type, id ) {
    let length = getLength( type );
    for ( var i=0; i<length; i++ ) {
      data[i + adr] = 1;
    }
    self.pointers.push( new Pointer( adr, length, id ) );
    return;
  }
  function draw () {
    box           = document.createElement( "DIV" );
    box.className = "can frame";
    for ( var i=0; i<( dataSize / 8 ); i++ ) {
      let byte       = document.createElement( "DIV" );
      byte.className = "can byte";
      for ( var j=0; j<8; j++ ) {
        let bit       = document.createElement( "DIV" );
        bit.className = "can bit";
        byte.appendChild( bit );
      }
      box.appendChild( byte );
    }
    return;
  };

  this.addData      = function ( type, id ) {
    let adr = getSpace( type );
    if ( adr != null ) {
      setSpace( adr, type, id );
      drawData( adr, type );
    }
    return;
  }
  this.getBox  = function () {
    console.log( box );
    return box;
  }
  init();
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Frame = Frame;
/*----------------------------------------------------------------------------*/
