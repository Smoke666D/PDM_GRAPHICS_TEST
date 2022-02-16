/*----------------------------------------------------------------------------*/
var lib    = require('./nodeLib.js').nodeLib;
var dialog = require('./dialog.js').dialog;
/*----------------------------------------------------------------------------*/
const stringLength = 16;
/*----------------------------------------------------------------------------*/
const lineTypes       = {
  "bool"   : {
    color       : '#33f233',
    animation   : true,
    size        : 3,
    startPlug   : 'behind',
    endPlug     : 'behind',
    path        : 'straight',
    startSocket : 'bottom',
    endSocket   : 'top'
  },
  "byte"   : {
    color       : '#f2333c',
    animation   : true,
    size        : 3,
    startPlug   : 'behind',
    endPlug     : 'behind',
    path        : 'straight',
    startSocket : 'bottom',
    endSocket   : 'top'
  },
  "short"  : {
    color       : '#33f2e9',
    animation   : true,
    size        : 3,
    startPlug   : 'behind',
    endPlug     : 'behind',
    path        : 'straight',
    startSocket : 'bottom',
    endSocket   : 'top'
  },
  "float"  : {
    color       : '#b824bd',
    animation   : true,
    size        : 3,
    startPlug   : 'behind',
    endPlug     : 'behind',
    path        : 'straight',
    startSocket : 'bottom',
    endSocket   : 'top'
  },
  "date"   : {
    color       : '#f28a33',
    animation   : true,
    size        : 3,
    startPlug   : 'behind',
    endPlug     : 'behind',
    path        : 'straight',
    startSocket : 'bottom',
    endSocket   : 'top'
  },
  "string" : {
    color       : '#f2e933',
    animation   : true,
    size        : 3,
    startPlug   : 'behind',
    endPlug     : 'behind',
    path        : 'straight',
    startSocket : 'bottom',
    endSocket   : 'top'
  }
}
/*----------------------------------------------------------------------------*/
function NodeAdr ( node = 0, pin = 0 ) {
  this.node = node;
  this.pin  = pin;
  return;
}
function Device () {
  var self    = this;
  const keys  = [ "id", "speed", "keypad" ];
  this.id     = 0;
  this.speed  = 500;
  this.keypad = "blink8"
  this.save  = function () {
    return {
      'id'     : self.id,
      'speed'  : self.speed,
      'keypad' : self.keypad
    };
  }
  this.check = function ( data ) {
    let res = true;
    keys.forEach( function ( key, i ) {
      let cheker = false;
      Object.keys( data ).forEach( function ( dkey, j ) {
        if ( key == dkey ) {
          cheker = true;
        }
      });
      if ( cheker == false ) {
        console.log( key );
        res = false;
      }
      return;
    });
    return res;
  }
  this.load  = function ( data ) {
    self.id     = data.id;
    self.speed  = data.speed;
    self.keypad = data.keypad;
    return;
  }
  return;
}
function Link ( from, to, start, end, type, id ) {
  var self  = this;
  var box   = box;   /* Object of scheme in DOM   */
  var start = start; /* Object of from pin in DOM */
  var end   = end;   /* Object of to pin in DOM   */
  var type  = type;  /* Line type (data type)     */
  var line  = null;  /* LeaderLine object         */
  var obj   = null;  /* DOM element of the line   */
  /*----------------------------------------*/
  this.id    = id;            /* ID number of the link   */
  this.from  = new NodeAdr(); /* Coordinates of from pin */
  this.to    = new NodeAdr(); /* Coordinates of to pin   */
  /*----------------------------------------*/
  function Focus () {
    var self = this;
    this.state = false;
    this.set   = function () {
      self.state = true;
      return;
    }
    this.reset = function () {
      self.state = false;
      return;
    }
    return;
  }
  function init ( from, to, start, end, type, id ) {
    self.id    = id;
    self.from  = from;
    self.to    = to;
    type       = type;
    start      = start;
    end        = end;
    self.draw();
    return;
  }
  /*----------------------------------------*/
  this.draw    = function () {
    if ( line == null ) {
      line   = new LeaderLine( start, end, lineTypes[type] );
      obj    = document.querySelector('.leader-line:last-of-type');
      obj.id = "link" + self.id;
      obj.classList.add( "link" );
    } else {
      line.position();
    }
    return;
  }
  this.setFrom = function ( from, start ) {
    if ( line != null ) {
      from  = from;
      start = start;
      line.setOptions( {"start" : start } );
    }
    return;
  }
  this.getData = function () {
    return {
      "id"   : self.id,
      "from" : self.from,
      "to"   : self.to,
    };
  }
  this.remove  = function () {
    if ( line != null ) {
      line.remove();
    }
    return;
  }
  this.save    = function () {
    return {
      'id'   : self.id,
      'from' : self.from,
      'to'   : self.to
    };
  }
  /*----------------------------------------*/
  init( from, to, start, end, type, id );
  return;
}
function Pin ( id, type, data ) {
  var self  = this;
  var mount = null;
  /*----------------------------------------*/
  this.id         = 0;           /* ID number, unique in same node    */
  this.type       = "none";      /* Input or Output or None           */
  this.data       = "none";      /* Bool or self.start.xoat or String */
  this.help       = "none";      /* Help tooltip for the pin          */
  this.table      = false;       /* Data of the pin from table        */
  this.linked     = false;       /* Is Pin connected to outher pin    */
  this.linkedWith = [];          /* ID of the Link                    */
  this.state      = "reserved";  /**/
  this.obj        = null;        /* Object in DOM                     */
  this.set        = new Set();   /**/
  this.reset      = new Reset(); /**/
  /*----------------------------------------*/
  function Set () {
    this.connected    = function () {
      self.linked     = true;
      self.linkedWith.push( id );
      self.obj.classList.add( "connected" );
      self.obj.classList.remove( "disconnected" );
      this.state = "connected";
      return;
    }
    this.disconnected = function () {
      self.linked     = false;
      self.linkedWith = [];
      self.obj.classList.add( "disconnected" );
      self.obj.classList.remove( "connected" );
      this.state = "disconnected";
      return;
    }
    this.from         = function () {
      mount.classList.add( "from" );
      return;
    }
    this.available    = function ( type, data ) {
      mount.classList.remove( "available" );
      if ( ( self.type == type ) && ( ( type == "output" ) || ( self.linked == false ) ) ) {
        if ( ( self.data == data ) || 
             ( self.data == "any" ) || 
             ( data == "any" ) || 
             ( ( data == "number" ) && ( isNumber( self.data ) == true ) ) ||
             ( ( self.data == "number" ) && ( isNumber( data ) == true ) ) ) {
          mount.classList.add( "available" );
          self.state = "available";       
        }
      }
      return;
    }
    this.type         = function ( newType ) {
      if ( self.data != newType ) {
        self.obj.classList.remove( self.data );
        self.data = newType;
        self.obj.classList.add( self.data );
      }
      return;
    }
    this.pin          = function ( obj ) {
      self.obj = obj;
      return;
    }
    this.mount        = function ( obj ) {
      mount = obj;
      return;
    }
  }
  function Reset () {
    this.available = function () {
      mount.classList.remove( "from" );
      mount.classList.remove( "available" );
      return;
    }
  }
  /*----------------------------------------*/
  function init ( id, type, data ) {
    self.id         = id;
    self.type       = type;
    self.data       = data.type;
    self.help       = data.help;
    self.expand     = data.expand;
    self.linked     = false;
    self.linkedWith = [];
    return;
  }
  function isNumber ( data ) {
    let res = false;
    if ( ( data == "byte"  ) || ( data == "float" ) || ( data == "short" ) ) {
      res = true;
    }
    return res;
  }
  /*----------------------------------------*/
  init( id, type, data );
  /*----------------------------------------*/
  return;
}
function Option ( data, param = null ) {
  var self    = this;
  var box     = null;
  var param   = param;
  this.pin    = null;
  this.name   = data.name;
  this.text   = data.text;
  this.type   = data.type;
  this.value  = data.value;
  this.select = data.select;
  function numberInputCheck ( obj ) {
    if ( obj.value < obj.min ) {
      obj.value = obj.min;
    } else if ( obj.value > obj.max ) {
      obj.value = obj.max;
    } else {
      obj.value = Math.trunc( obj.value );
    }
    return;
  }
  function stringInputCheck ( obj ) {
    if ( obj.value.length > stringLength ) {
      obj.value = obj.value.slice( 0, stringLength );
    }
  }
  function selectLine ( size ) {
    let out = [];
    for ( var i=0; i<size; i++ ) {
      out.push( i );
    }
    return out;
  }
  function makeBoolInput () {
    let out = document.createElement( "SELECT" );
    let op1 = document.createElement( "OPTION" );
    let op2 = document.createElement( "OPTION" );
    op1.innerHTML = "false";
    op2.innerHTML = "true";
    if ( self.value == true ) {
      op2.selected = 'selected';
    }
    out.appendChild( op1 );
    out.appendChild( op2 );
    out.addEventListener( 'change', function () {
      if ( op2.selected == true ) {
        self.value = true;
      } else {
        self.value = false;
      }
      return;
    });
    return out;
  }
  function makeByteInput () {
    let out   = document.createElement( "INPUT" );
    out.type  = "number";
    out.min   = "0";
    out.max   = "255";
    out.value = self.value;
    out.addEventListener( 'change', function () {
      numberInputCheck( out );
      self.value = out.value;
      return;
    });
    return out;
  }
  function makeShortInput () {
    let out   = document.createElement( "INPUT" );
    out.type  = "number";
    out.min   = "0";
    out.max   = "65535";
    out.value = self.value;
    out.addEventListener( 'change', function () {
      numberInputCheck( out );
      self.value = out.value;
      return;
    });
    return out;
  }
  function makeFloatInput () {
    let out   = document.createElement( "INPUT" );
    out.type  = "number";
    out.value = self.value;
    out.addEventListener( 'change', function () {
      self.value = out.value;
      return;
    });
    return out;
  }
  function makeStringInput () {
    let out   = document.createElement( "INPUT" );
    out.type  = "text";
    out.value = self.value;
    out.addEventListener( 'change', function () {
      stringInputCheck( out );
      self.value = out.value;
      return;
    });
    return out;
  }
  function makeSelectInput () {
    function onClick () {
      if ( ( self.name == "type" ) && ( self.pin != null ) ) {
        self.pin.set.type( self.value );
      }
      return;
    }
    let out = null;
    out = document.createElement( "SELECT" );
    self.select.forEach( function ( item, i ) {
      let opt       = document.createElement( "OPTION" );
      opt.innerHTML = item;
      if ( self.value == item ) {
        opt.selected = true;
      }
      out.addEventListener( 'change', function () {
        self.value = out.value;
        onClick();
        return;
      });
      out.value = self.value;
      onClick();
      out.appendChild( opt );
    });
    return out;
  }
  function makeDialogButton ( type ) {
    let out       = document.createElement( "BUTTON" );
    out.innerHTML = "...";
    out.addEventListener( 'click', function () {
      switch ( type ) {
        case "external":
          dialog.showExternal();
          break;
        case "canAdr":
          dialog.showCan();
          break;
        case "mbAdr":
          dialog.showMb( param, self.pin.data );
          break;
      }
      $("#dialogModal").modal('toggle');
    });
    return out;
  }
  function makeInput () {
    let out = null;
    switch ( self.type ) {
      case "bool":
        out = makeBoolInput();
        break;
      case "byte":
        out = makeByteInput();
        break;
      case "short":
        out = makeShortInput();
        break;
      case "float":
        out = makeFloatInput();
        break;
      case "select":
        out = makeSelectInput();
        break;
      case "string":
        out = makeStringInput();
        break;
      case "din":
        self.select = selectLine( lib.getHardware().din );
        out = makeSelectInput();
        break;
      case "dout":
        self.select = selectLine( lib.getHardware().dout );
        out = makeSelectInput();
        break;
      case "ain":
        self.select = selectLine( lib.getHardware().ain );
        out = makeSelectInput();
        break;
      case "aout":
        self.select = selectLine( lib.getHardware().aout );
        out = makeSelectInput();
        break;
      case "sw":
        self.select = selectLine( lib.getHardware().sw );
        out = makeSelectInput();
        break;
      case "led":
        self.select = selectLine( lib.getHardware().led );
        out = makeSelectInput();
        break;
      case "dialog":
        out = makeDialogButton( self.select );
        break;
      default:
        out = document.createElement( "DIV" );
        out.innerHTML = "error";
        break;
    }
    return out;
  }
  function draw () {
    box             = document.createElement( "DIV" );
    box.className   = 'row';
    let col1        = document.createElement( "DIV" );
    col1.className  = "col-6 " + self.type + '-text';;
    let col2        = document.createElement( "DIV" );
    col2.className  = "col-6";
    let label       = document.createElement( "A" );
    label.innerHTML = self.text;
    let input       = makeInput();
    col1.appendChild( label );
    col2.appendChild( input );
    box.appendChild( col1 );
    box.appendChild( col2 );
    return;
  }
  this.update = function () {
    if ( self.type == "select" ) {
      if ( ( self.name == "type" ) && ( self.pin != null ) ) {
        self.pin.set.type( self.value );
      }
    }
    return;
  }
  this.getBox = function ( target=null ) {
    if ( target != null ) {
      self.pin = target;
    }
    draw();
    return box;
  }
  return;
}
function Help ( text ) {
  var self = this;
  var box  = null;

  this.text = text;

  function draw () {
    box           = document.createElement( "DIV" );
    let txt       = document.createElement( "A" );
    box.className = "pr-2 pl-2";
    txt.innerHTML = self.text;
    box.appendChild( txt );
    return;
  }

  this.getBox = function () {
    return box;
  }

  draw();
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Link    = Link;
module.exports.Pin     = Pin;
module.exports.NodeAdr = NodeAdr;
module.exports.Help    = Help;
module.exports.Device  = Device;
module.exports.Option  = Option;
/*----------------------------------------------------------------------------*/

