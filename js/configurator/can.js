/*----------------------------------------------------------------------------*/
const dataSize  = 8;  /* pc */
const boolWidth = 10; /* px */
/*----------------------------------------------------------------------------*/
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
function getLengthByte ( type ) {
  let out = null;
  switch ( type ) {
    case 'bool':
      out = 1;
      break;
    case 'byte':
      out = 1;
      break;
    case 'short':
      out = 2;
      break;
  }
  return out;
}
/*----------------------------------------------------------------------------*/
function Subadr () {
  this.enb    = false;
  this.adr    = 0;
  this.length = 1;
}
function Checker () {
  this.enb     = false;
  this.timeout = 10;
}
function Pointer ( adr, length, id ) {
  var self    = this;
  this.id     = id;     /* ID of the node      */
  this.adr    = adr;    /* Address in th frame */
  this.length = length; /* Length of the data  */
}
function Settings () {
  var adr         = null;
  var chekerEnb   = null;
  var checkerTime = null;
  var subadrEnb   = null;
  var subadr      = null;

  this.draw = function () {
    function drawText ( text ) {
      let label       = document.createElement( "SPAN" );
      label.innerHTML = text;
      return label;
    }
    function addElement ( text, item ) {
      let col1 = document.createElement( "DIV" );
      let col2 = document.createElement( "DIV" );
      col1.className = "can col-setting";
      col2.className = "can col-setting";
      col1.appendChild( drawText( text ) );
      col2.appendChild( item );
      labelLine.appendChild( col1 );
      inputLine.appendChild( col2 );
      return;
    }
    function drawAdress () {
      adr      = document.createElement( "INPUT" );
      adr.type = "number";
      adr.min  = "0";
      adr.max  = "255";
      return addElement( "адрес", adr );
    }
    function drawCheckerEnb () {
      let box             = document.createElement( "LABEL" );
      chekerEnb           = document.createElement( "INPUT" );
      let span            = document.createElement( "SPAN" );
      box.className       = "switch shift-down";
      chekerEnb.type      = "checkbox";
      chekerEnb.id        = "checkerEnb";
      chekerEnb.className = "check-input";
      span.className      = "slider";
      box.appendChild( chekerEnb );
      box.appendChild( span );
      return addElement( "проверка", box );
    }
    function drawCheckerTimeout () {
      checkerTime      = document.createElement( "INPUT" );
      checkerTime.type = "number";
      checkerTime.min  = "0";
      checkerTime.max  = "65535";
      return addElement( "период", checkerTime );
    }
    function drawSubAddressEnb () {
      let box             = document.createElement( "LABEL" );
      subadrEnb           = document.createElement( "INPUT" );
      let span            = document.createElement( "SPAN" );
      box.className       = "switch shift-down";
      subadrEnb.type      = "checkbox";
      subadrEnb.id        = "checkerEnb";
      subadrEnb.className = "check-input";
      span.className      = "slider";
      box.appendChild( subadrEnb );
      box.appendChild( span );
      return addElement( "субадрес", box );
    }
    function drawSubAdress () {
      subadr      = document.createElement( "INPUT" );
      subadr.type = "number";
      subadr.min  = "0";
      subadr.max  = "255";
      return addElement( "субадрес", subadr );
    }

    let box             = document.createElement( "DIV" );
    let labelLine       = document.createElement( "DIV" );
    let inputLine       = document.createElement( "DIV" );
    labelLine.className = "row";
    inputLine.className = "row";

    drawAdress();
    drawCheckerEnb();
    drawCheckerTimeout();
    drawSubAddressEnb();
    drawSubAdress();

    box.appendChild( labelLine );
    box.appendChild( inputLine );
    return box;
  }
  this.set  = function ( frame ) {
    adr.value         = frame.adr;
    chekerEnb.checked = frame.cheker.enb;
    checkerTime.value = frame.cheker.timeout;
    subadrEnb.checked = frame.subadr.enb;
    subadr.value      = frame.subadr.adr;
    return;
  }
  this.get  = function ( frame ) {
    frame.adr            = adr.value;
    frame.cheker.enb     = chekerEnb.checked;
    frame.cheker.timeout = checkerTime.value;
    frame.subadr.enb     = subadrEnb.checked;
    frame.subadr.adr     = subadr.value;
    return;
  }
}
function Shadow () {
  var self = this;
  var box  = null;
  function draw () {
    box           = document.createElement( "DIV" );
    box.className = "can shadow hide";
  }
  function init () {
    draw();
    self.move( 0, 0 );
    return;
  }
  this.getBox   = function () {
    return box;
  }
  this.hide     = function () {
    box.classList.add( "hide" );
    return;
  }
  this.show     = function () {
    box.classList.remove( "hide" );
    return;
  }
  this.move     = function ( x, y ) {
    box.style.top  = y + "px";
    box.style.left = x + "px";
  }
  this.setWidth = function ( type ) {
    box.style.width = ( getLength( type ) * boolWidth ) + "px";
    return;
  }
  init();
  return;
}
function Chunk ( id, type, onDrag, onDraging, onDrop, getType ) {
  var self      = this;
  var box       = null;
  var drag      = null;
  var onDrag    = onDrag;
  var onDraging = onDraging;
  var onDrop    = onDrop;
  var getType   = getType;

  this.id     = id;
  this.type   = type;
  this.frame  = null;
  this.byte   = null;
  this.bit    = null;
  this.added  = false;
  this.length = getLength( self.type );

  function init () {
    draw();
    drag = new Drag();
    return;
  }
  function draw () {
    box             = document.createElement( "DIV" );
    let label       = document.createElement( "SPAN" );
    label.innerHTML = self.id;
    box.appendChild( label );
    self.restyle();
    return;
  }
  function Drag () {
    var dX = 0;
    var dY = 0;
    var cX = 0;
    var cY = 0;
    box.onmousedown = dragStart;
    function dragStart ( e ) {
      e = e || window.event;
      e.preventDefault();
      cX = e.clientX;
      cY = e.clientY;
      document.onmouseup   = dragFinish;
      document.onmousemove = dragProcess;
      onDrag( self.frame, self.byte, self.bit, self.type );
      return;
    }
    function dragProcess ( e ) {
      e = e || window.event;
      e.preventDefault();
      dX = cX - e.clientX;
      dY = cY - e.clientY;
      cX = e.clientX;
      cY = e.clientY;
      box.style.left = ( parseInt( box.style.left ) - dX ) + "px";
      box.style.top  = ( parseInt( box.style.top )  - dY ) + "px"
      onDraging( cX, cY );
      return;
    }
    function dragFinish () {
      document.onmouseup   = null;
      document.onmousemove = null;
      coords     = onDrop( self.id, self.type );
      self.byte  = coords.adr;
      self.frame = coords.frame;
      self.move( coords.x, coords.y );
      return;
    }
  }
  this.restyle = function () {
    if ( box != null ) {
      self.type       = getType();
      self.length     = getLength( self.type );
      box.className   = "can chunk " + self.type;
      box.style.width = ( boolWidth * getLength( self.type ) ) + "px";
    }
    return;
  }
  this.place   = function ( frame, byte, bit = 0 ) {
    self.frame = frame;
    self.byte  = byte;
    self.bit   = bit;
    return;
  }
  this.move    = function ( x, y ) {
    box.style.top  = y + "px";
    box.style.left = x + "px";
    return;
  }
  this.getBox  = function () {
    return box;
  }
  init();
}
function Bit ( id, parrent ) {
  var self    = this;
  var box     = null;
  var parrent = parrent;
  var id      = id;
  this.free   = true;
  this.get    = new Get();
  function Get () {
    this.box = function () {
      return box;
    }
  }
  function draw () {
    box             = document.createElement( "DIV" );
    box.className   = "can bit";
    if ( id != 7 ) {
      box.className += " bordered";
    } else {
      box.className += " last";
    }
    box.id          = "bit" + id;
    box.style.width = boolWidth + "px";
    parrent.appendChild( box );
    return;
  }
  function init () {
    draw();
    return;
  }
  init();
  return;
}
function Byte ( id ) {
  var self  = this;
  var box   = null;
  var id    = id;
  
  this.bits = [];
  this.get  = new Get();
  function Get () {
    this.box = function () {
      return box;
    }
    return;
  }
  function draw () {
    box             = document.createElement( "DIV" );
    box.className   = "can byte-data";
    box.id          = "byte" + id;
    box.style.width = ( boolWidth * 8 ) + "px";
    for ( var i=0; i<8; i++ ) {
      self.bits.push( new Bit( i, box ) );
    }
    if ( id != ( dataSize - 1 ) ) {
      box.className += " common";
    } else {
      box.className += " last";
    }
    return;
  }
  function expand () {
    box.style.width = ( boolWidth * 16 ) + "px";
  }
  function shrink () {
    box.style.width = ( boolWidth * 8 ) + "px";
  }
  function init () {
    draw();
    box.addEventListener( "mouseover", function () {
      //expand();
    });
    box.addEventListener( "mouseleave", function () {
      //shrink();
    });
    return;
  }
  this.reset   = function () {
    pointer = null;
    if ( box != null ) {
      box.parentNode.removeChild( box );
      box = null;
    }
    return;
  }
  init();
  return;
}
function Frame ( id=0, onClick, setSettings ) {
  var self       = this;
  var box        = null;
  var messageBox = null;
  var bytes      = [];
  var onClick    = onClick;
  this.id        = id;
  this.adr       = id;
  this.subadr    = new Subadr();
  this.cheker    = new Checker();
  this.pointers  = [];
  this.set       = new Set();
  this.get       = new Get();
  this.add       = new Add();
  this.focus     = new Focus();
  this.is        = new Is();
  function Set () {
    this.full = function ( byte, bit, type ) {
      let length = getLength( type );
      let sub    = 0;
      let start  = bit;
      for ( var i=0; i<getLengthByte( type ); i++ ) {
        if ( i > 0 ) {
          start = 0;
        }
        if ( length > ( 8 - start ) ) {
          sub     = 8 - start;
          length -= 8 - start;
        } else {
          sub = length;
        }
        for ( var j=0; j<sub; j++ ) {
          bytes[byte + i].bits[start + j].free = false;
        }
      }
      return;
    }
    this.free = function ( byte, bit, type ) {
      let length = getLengthByte( type );
      let sub    = 0;
      let start  = bit;
      for ( var i=0; i<getLengthByte( type ); i++ ) {
        if ( i > 0 ) {
          start = 0;
        }
        if ( length > ( 8 - start ) ) {
          sub     = 8 - start;
          length -= 8 - start;
        } else {
          sub = length;
        }
        for ( var j=0; j<sub; j++ ) {
          bytes[byte + i].bits[start + j].free = true;
        }
      }
      return;
    }
  }
  function Get () {
    this.size = function () {
      return dataSize;
    }
    this.box  = function () {
      return box;
    }
    this.coords = function ( byte, bit, callback ) {
      setTimeout( function() {
        callback( bytes[byte].bits[bit].get.box().offsetLeft, bytes[byte].bits[bit].get.box().offsetTop );
        return;
      }, 500 );    
      return { "x" : bytes[byte].bits[bit].get.box().offsetLeft, "y" : bytes[byte].bits[bit].get.box().offsetTop };
    }
    this.height = function () {
      return parseInt( messageBox.offsetHeight );
    }
    this.byteWidth = function () {
      return ( boolWidth * 8 );
    }
    this.space = function ( type ) {
      let adr = null;
      let sub = 1;
      for ( var byte=0; byte<dataSize; byte++ ) {
        if ( getLength( type ) < 8 ) {
          sub = 8
        } else {
          sub = 1
        }
        for ( var bit=0; bit<sub; bit++ ) {
          if ( self.is.adrFree( byte, bit, type ) == true ) {
            adr = { "byte" : byte, "bit" : bit };
            break;
          }
        }
        if ( adr != null ) {
          break;
        }
      }
      return adr;
    }
  }
  function Add () {
    this.data = function ( id, type ) {
      let adr  = self.get.space( type );
      if ( adr != null ) {
        self.set.full( adr.byte, adr.bit, type );
      }
      return adr;
    }
  }
  function Focus () {
    this.is = function () {
      let res = false;
      if ( messageBox.classList.contains( "focus" ) ) {
        res = true;
      }
      return res;
    }
    this.set   = function () {
      onClick();
      messageBox.classList.add( "focus" );
      setSettings( self );
      return;
    }
    this.reset = function () {
      messageBox.classList.remove( "focus" );
      return;
    }
  }
  function Is () {
    this.adrFree = function ( byte, bit, type ) {
      let res     = false;
      let acc     = 0;
      let length  = getLengthByte( type );
      let fullLen = getLength( type );
      let start   = bit;
      let sub     = 0;
      if ( ( ( byte + length ) <= dataSize ) ) {
        for ( var i=0; i<length; i++ ) {
          if ( i > 0 ) {
            start = 0;
          }
          if ( fullLen > ( 8 - start ) ) {
            fullLen -= 8 - start;
            sub      = 8 - start;
          } else {
            sub = fullLen + start;
          }
          for ( var j=start; j<sub; j++ ) {
            if ( bytes[byte + i].bits[j].free == true ) {
              acc++;
            }
          }
          start = 0;
        }
        if ( acc >= getLength( type ) ) {
          res = true;
        }
      }
      return res;
    }
    this.space = function ( type ) {
      let res = false;
      if ( self.get.space( type ) != null ) {
        res = true;
      }
      return res;
    }
  }
  function init () {
    clean();
    draw();
    return;
  }
  function clean () {
    bytes.forEach( function ( byte ) {
      byte.reset();
      return;
    });
    return;
  }
  function draw () {
    bytes                  = [];
    box                    = document.createElement( "DIV" );
    box.className          = "can frame";
    box.id                 = "frame" + self.id;
    messageBox             = document.createElement( "DIV" );
    messageBox.className   = "can message";
    messageBox.style.width = ( boolWidth * dataSize * 8 + 2 ) + "px";
    for ( var i=0; i<dataSize; i++ ) {
      bytes.push( new Byte( i ) );
      messageBox.appendChild( bytes[i].get.box() );
    }
    messageBox.addEventListener( 'click', function () {
      self.focus.set();
    });
    let label       = document.createElement( "H4" );
    label.className = "can";
    label.innerHTML = self.id;
    box.appendChild( label );
    box.appendChild( messageBox );
    self.focus.set();
    return;
  };
  init();
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Frame     = Frame;
module.exports.Chunk     = Chunk;
module.exports.Shadow    = Shadow;
module.exports.Settings  = Settings;
module.exports.getLength = getLength;
/*----------------------------------------------------------------------------*/
