/*----------------------------------------------------------------------------*/
const dataSize  = 8 * 8;
const boolWidth = 10;
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
/*----------------------------------------------------------------------------*/
function Subadr () {
  var self    = this;
  this.enb    = false;
  this.adr    = 0;
  this.length = 1;
}
function Checker () {
  var self     = this;
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
  var self        = this;
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
      adr   = document.createElement( "INPUT" );
      adr.type  = "number";
      adr.min   = "0";
      adr.max   = "255";
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
    box.style.width = getLength( type ) * boolWidth;
    return;
  }
  init();
  return;
}
function Chunk ( id, type, onDrag, onDraging, onDrop ) {
  var self      = this;
  var length    = 0;
  var box       = null;
  var onDrag    = onDrag;
  var onDraging = onDraging;
  var onDrop    = onDrop;
  this.id    = id;
  this.type  = type;
  this.frame = null;
  this.adr   = null;

  function init () {
    length = getLength( self.type );
    draw();
    let drag = new Drag();
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
      onDrag( self.frame, self.adr, self.type );
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
      onDrop();
      return;
    }
  }
  this.restyle = function () {
    if ( box != null ) {
      box.className   = "can chunk " + self.type;
      box.style.width = ( boolWidth * getLength( self.type ) ) + "px";
    }

    return;
  }
  this.place   = function ( frame, adr ) {
    self.frame = frame;
    self.adr   = adr;
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
function Frame ( id=0, onClick, setSettings ) {
  var self       = this;
  var data       = new Array( dataSize );
  var box        = null;
  var messageBox = null;
  var bytes      = [];
  var onClick    = onClick;
  this.id        = id;
  this.adr       = 0;
  this.subadr    = new Subadr();
  this.cheker    = new Checker();
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
    bytes                  = [];
    box                    = document.createElement( "DIV" );
    box.className          = "can frame";
    box.id                 = "frame" + self.id;
    messageBox             = document.createElement( "DIV" );
    messageBox.className   = "can message";
    messageBox.style.width = boolWidth * dataSize;
    for ( var i=0; i<( dataSize / 8 ); i++ ) {
      let byte         = document.createElement( "DIV" );
      byte.className   = "can byte-data";
      byte.id          = "byte" + i;
      byte.style.width = boolWidth * 8;
      if ( i != ( dataSize / 8 - 1 ) ) {
        byte.className += " common";
      } else {
        byte.className += " last";
      }
      bytes.push( byte );
      messageBox.appendChild( byte );
    }
    messageBox.addEventListener( 'click', function () {
      self.setFocus();
    });
    let label       = document.createElement( "H4" );
    label.className = "can";
    label.innerHTML = self.id;
    box.appendChild( label );
    box.appendChild( messageBox );
    self.setFocus();
    return;
  };
  this.isSpace      = function ( type ) {
    let res = false;
    if ( getSpace( type ) != null ) {
      res = true;
    }
    return res;
  }
  this.resetFocus   = function () {
    messageBox.classList.remove( "focus" );
    return;
  }
  this.isFocus      = function () {
    let res = false;
    if ( messageBox.classList.contains( "focus" ) ) {
      res = true;
    }
    return res;
  }
  this.setFocus     = function () {
    onClick();
    messageBox.classList.add( "focus" );
    setSettings( self );
    return;
  }
  this.addData      = function ( id, type ) {
    let adr = getSpace( type );
    if ( adr != null ) {
      setSpace( adr, type, id );
    }
    return adr;
  }
  this.isAdrFree    = function ( adr, type ) {
    let length = getLength( type );
    
  }
  this.getSize      = function () {
    return dataSize / 8;
  }
  this.getBox       = function () {
    return box;
  }
  this.getCoords    = function ( adr, callback ) {
    setTimeout( function() {
      callback( bytes[adr].offsetLeft, bytes[adr].offsetTop );
      return;
    }, 500 );
    return { "x" : bytes[adr].offsetLeft, "y" : bytes[adr].offsetTop };
  }
  this.getHeight    = function () {
    return parseInt( messageBox.offsetHeight );
  }
  this.getByteWidth = function () {
    return boolWidth * 8;
  }
  init();
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Frame    = Frame;
module.exports.Chunk    = Chunk;
module.exports.Shadow   = Shadow;
module.exports.Settings = Settings;
/*----------------------------------------------------------------------------*/
