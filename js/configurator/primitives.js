/*----------------------------------------------------------------------------*/
var nodeLib     = require('./nodeLib.js').nodeLib;
var dragElement = require('./drag.js').dragElement;
/*----------------------------------------------------------------------------*/
const pinSize      = 10; /*px*/
const pinMountSize = 16; /*px*/
/*----------------------------------------------------------------------------*/
const lineTypes       = {
  "bool"   : {
    color       : '#33f233',
    animation   : true,
    size        : 3,
    path        : 'straight',
    startSocket : 'bottom',
    endSocket   : 'top'
  },
  "float"  : {
    color       : '#b824bd',
    animation   : true,
    size        : 3,
    path        : 'straight',
    startSocket : 'bottom',
    endSocket   : 'top'
  },
  "string" : {
    color       : '#f2e933',
    animation   : true,
    size        : 3,
    path        : 'straight',
    startSocket : 'bottom',
    endSocket   : 'top'
  }
}
const scaleStep       = 0.1;
const scaleMax        = 3;
const scaleMin        = 0.5;
const expandGroupSize = 8;
/*----------------------------------------------------------------------------*/
function NodeAdr ( node = 0, pin = 0 ) {
  this.node = node;
  this.pin  = pin;
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
  /*----------------------------------------*/
  init( from, to, start, end, type, id );
  return;
}
function Pin ( id, type, data ) {
  var self  = this;
  var mount = null;
  /*----------------------------------------*/
  this.id         = 0;          /* ID number, unique in same node    */
  this.type       = "none";     /* Input or Output or None           */
  this.data       = "none";     /* Bool or self.start.xoat or String */
  this.help       = "none";     /* Help tooltip for the pin          */
  this.expand     = false;      /* Pin in expand group               */
  this.table      = false;      /* Data of the pin from table        */
  this.linked     = false;      /* Is Pin connected to outher pin    */
  this.linkedWith = [];         /* ID of the Link                    */
  this.state      = "reserved"; /**/
  this.obj        = null;       /* Object in DOM                     */
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
  /*----------------------------------------*/
  this.setConnected    = function ( id ) {
    self.linked     = true;
    self.linkedWith.push( id );
    self.obj.classList.add( "connected" );
    self.obj.classList.remove( "disconnected" );
    this.state = "connected";
    return;
  }
  this.setDisconnected = function () {
    self.linked     = false;
    self.linkedWith = [];
    self.obj.classList.add( "disconnected" );
    self.obj.classList.remove( "connected" );
    this.state = "disconnected";
    return;
  }
  this.setFrom     = function () {
    return;
    mount.classList.add( "from" );
  }
  this.setAvailable    = function ( type, data ) {
    mount.classList.remove( "available" );
    if ( ( self.data == data ) && ( self.type == type ) && ( ( type == "output" ) || ( self.linked == false ) ) ) {
      mount.classList.add( "available" );
      this.state = "available";
    }
    return;
  }
  this.resetAvailable = function () {
    mount.classList.remove( "from" );
    mount.classList.remove( "available" );
    return;
  }
  this.setPin         = function ( obj ) {
    self.obj = obj;
    return;
  }
  this.setMount       = function ( obj ) {
    mount = obj;
    return;
  }
  /*----------------------------------------*/
  init( id, type, data );
  /*----------------------------------------*/
  return;
}
function Menu ( box, object, items = [] ) {
  var self = this;
  /*----------------------------------------*/
  this.obj   = null;
  this.exist = true;
  /*----------------------------------------*/
  function init ( box, object, items ) {
    self.draw( box, object, items );
  }
  function addLi ( ul, data ) {
    let li         = document.createElement( "LI" );
    li.className   = "item";
    let icon       = document.createElement( "DIV" );
    icon.className = "fas";
    icon.innerHTML = data.icon;
    let a          = document.createElement( "A" );
    let span       = document.createElement( "SPAN" );
    span.innerHTML = data.name;
    a.appendChild( icon );
    a.appendChild( span );
    li.appendChild( a );
    li.addEventListener( 'click', function () {
      data.callback();
    });
    ul.appendChild( li );
  }
  /*----------------------------------------*/
  this.remove = function () {
    self.obj.remove();
    self.exist = false;
    return;
  }
  this.draw   = function ( box, object, items ) {
    if ( self.obj == null ) {
      self.obj            = document.createElement( "DIV" );
      self.obj.id         = "menu-node" + self.id;
      self.obj.className  = "node-menu";
      self.obj.style.top  = object.offsetTop  + parseInt( object.style.height ) - 10 + "px";
      self.obj.style.left = object.offsetLeft + parseInt( object.style.width )  - 10 + "px";
      /*----------- UL ----------*/
      let ul       = document.createElement( "UL" );
      ul.className = "list-unstyled";
      let dataLi = {
        "name"     : "закрыть",
        "callback" : function () { self.remove(); },
        "icon"     : "<svg viewBox='0 0 352 512'><path fill='currentColor' d='M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z'></path></svg>"
      }
      addLi( ul, dataLi );
      for ( var i=0; i<items.length; i++ ) {
        addLi( ul, items[i] );
      }
      self.obj.appendChild( ul );
      box.appendChild( self.obj );
    }
    return;
  }
  /*----------------------------------------*/
  init( box, object, items );
  return;
}
function Expand () {
  var self = this;
  this.counter = 0;
  this.viewed  = 2;
  return;
}
function Node ( type, id, box, pinCallback, dragCallback, removeCallback, contextMenuCallback ) {
  var self                = this;
  var box                 = box;
  var pinCallback         = pinCallback;
  var dragCallback        = dragCallback;
  var removeCallback      = removeCallback;
  var contextMenuCallback = contextMenuCallback;
  var menu                = null;         /* Context menu */
  var menuItems           = [
    {
      "name"     : "удалить",
      "callback" : function () { menu.remove(); removeCallback( self.id ); },
      "icon"     : "<svg viewBox='0 0 448 512'><path fill='currentColor' d='M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z'></path></svg>"
    }
  ];
  var height              = 0;
  var width               = 0;
  var short               = "";
  var body                = null;
  /*----------------------------------------*/
  this.id      = id;    /* ID number of node               */
  this.name    = "";    /* Name of the node                */
  this.type    = type;  /* Function type of node           */
  this.inputs  = [];    /* Array of inputs pins            */
  this.outputs = [];    /* Array of outputs pins           */
  this.focus   = false; /* Is node in focus                */
  this.x       = 0;     /* Left coordinate in mesh         */
  this.y       = 0;     /* Top coordinate in mesh          */
  this.obj     = null;  /* DOM object of node              */
  this.shift   = 0;     /* Top shift in parent of node box */
  /*----------------------------------------*/
  function Drag () {
    var dX           = 0;
    var dY           = 0;
    var cX           = 0;
    var cY           = 0;
    var startX       = 0;
    var startY       = 0;
    var shadowX      = self.x;
    var shadowY      = self.y;
    var meshBorder   = mesh.getBorders( self.x, self.y );
    function dragStart ( e ) {
      e = e || window.event;
      e.preventDefault();
      cX = e.clientX;
      cY = e.clientY;
      startX = cX;
      startY = cY;
      mesh.moveShadow( shadowX, shadowY );
      mesh.setShadow( parseInt( self.obj.style.height ), parseInt( self.obj.style.width ) );
      document.onmouseup   = dragFinish;
      document.onmousemove = dragProcess;
      return;
    }
    function dragProcess ( e ) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      dX = cX - e.clientX;
      dY = cY - e.clientY;
      cX = e.clientX;
      cY = e.clientY;
      // Shadow calc:
      if ( ( e.clientX < meshBorder.left ) && ( shadowX > 0 ) ) {
        shadowX--;
        mesh.moveShadow( shadowX, shadowY );
        meshBorder = mesh.getBorders( shadowX, shadowY );
      } else if ( ( e.clientX > meshBorder.right ) && ( shadowX < mesh.getWidth() ) ) {
        shadowX++;
        mesh.moveShadow( shadowX, shadowY );
        meshBorder = mesh.getBorders( shadowX, shadowY );
      }
      if ( ( e.clientY < meshBorder.top ) && ( shadowY > 0 ) ) {
        shadowY--;
        mesh.moveShadow( shadowX, shadowY );
        meshBorder = mesh.getBorders( shadowX, shadowY );
      } else if ( ( e.clientY > meshBorder.bottom ) && ( shadowY < mesh.getHight() ) ) {
        shadowY++;
        mesh.moveShadow( shadowX, shadowY );
        meshBorder = mesh.getBorders( shadowX, shadowY );
      }
      // set the element's new position:
      self.obj.style.top  = ( parseInt( self.obj.style.top )  - dY ) + "px"
      self.obj.style.left = ( parseInt( self.obj.style.left ) - dX ) + "px";
      dragCallback( self.id );
      return;
    }
    function dragFinish () {
      document.onmouseup   = null;
      document.onmousemove = null;
      self.x = shadowX;
      self.y = shadowY;
      move();
      mesh.hideShadow();
      if ( ( cX != startX ) || ( cY != startY ) ) {
        startX = cX;
        startY = cY;
        self.x = parseInt( self.obj.style.top  );
        self.y = parseInt( self.obj.style.left );
      }
      return;
    }
    if ( body ) {
      body.onmousedown = dragStart;
    } else {
      self.obj.onmousedown = dragStart;
    }
    return;
  }
  /*----------------------------------------*/
  function makeNode ( type ) {
    let data  = nodeLib.getNodeRecord( type );
    let pinID = 0;
    let wN    = 0;
    if ( data.inputs.length > data.outputs.length ) {
      wN = data.inputs.length;
    } else {
      wN = data.outputs.length;
    }
    width        = wN * mesh.getBaseWidth();
    height       = mesh.getBaseHeight();
    self.name    = data.name;
    short        = data.short;
    self.inputs  = [];
    self.outputs = [];
    for ( var i=0; i<data.inputs.length; i++ ) {
      self.inputs.push( new Pin( pinID++, "input", data.inputs[i] ) );
    }
    for ( var i=0; i<data.outputs.length; i++ ) {
      self.outputs.push( new Pin( pinID++, "output", data.outputs[i] ) );
    }
    return;
  }
  function setSize () {
    self.obj.style.width  = width  + "px";
    self.obj.style.height = height + "px";
    return;
  }
  function hide () {
    self.obj.classList.add( "hide" );
    return;
  }
  function show () {
    self.obj.classList.remove( "hide" );
    return;
  }
  function move () {
    pos = mesh.getPosition( self.x, self.y );
    self.obj.style.left = pos.x + "px";
    self.obj.style.top  = pos.y + "px";
    return;
  }
  function draw () {
    let pinCounter    = 0;
    let expandCounter = 0;
    /*--------------- NODE ---------------*/
    self.obj            = document.createElement("DIV");
    self.obj.id         = 'node' + self.id;
    self.obj.className  = 'node';
    /*------------ INPUT PORT ------------*/
    //expandGroupSize
    let inputPort       = document.createElement("DIV");
    inputPort.className = 'port input';
    for ( var i=0; i<self.inputs.length; i++ ) {
      let mount               = document.createElement("DIV");
      mount.id                = 'mount' + pinCounter;
      mount.className         = 'mount';
      mount.style.height      = pinMountSize + "px";
      mount.style.width       = pinMountSize + "px";
      mount.style.marginLeft  = ( mesh.getBaseWidth() - pinMountSize ) / 2 + "px";
      mount.style.marginRight = mount.style.marginLeft;
      let pin                 = document.createElement("DIV");
      pin.id                  = 'pin' + pinCounter;
      pin.className           = 'pin ' + self.inputs[i].data;
      pin.title               = self.inputs[i].help;
      pin.style.height        = pinSize + "px";
      pin.style.width         = pinSize + "px";
      pinCounter++;
      pin.setAttribute( 'data-toggle', 'tooltip' );
      if ( self.inputs[i].type == "none" ) {
        pin.className += " reseved";
      } else {
        pin.className += " disconnected";
      }
      mount.appendChild( pin );
      inputPort.appendChild( mount );
      $( pin ).tooltip( {
        'placement' : 'top',
        'trigger'   : 'hover',
      });
    }
    /*--------------- BODY ---------------*/
    body               = document.createElement("DIV");
    body.className     = 'body';
    let bodyText       = document.createElement("A");
    bodyText.innerHTML = short;
    body.appendChild( bodyText );
    /*----------- OUTPUT PORT ------------*/
    let outputPort       = document.createElement("DIV");
    outputPort.className = 'port output';
    for ( var i=0; i<self.outputs.length; i++ ) {
      let mount               = document.createElement("DIV");
      mount.id                = 'mount' + pinCounter;
      mount.className         = 'mount';
      mount.style.height      = pinMountSize + "px";
      mount.style.width       = pinMountSize + "px";
      mount.style.marginLeft  = ( mesh.getBaseWidth() - pinMountSize ) / 2 + "px";
      mount.style.marginRight = mount.style.marginLeft;
      let pin               = document.createElement("DIV");
      pin.id                = 'pin' + pinCounter;
      pin.className         = 'pin ' + self.outputs[i].data;
      pin.title             = self.outputs[i].help;
      pin.style.height      = pinSize + "px";
      pin.style.width       = pinSize + "px";
      pinCounter++
      if ( self.outputs[i].type == "none" ) {
        pin.className += " reseved";
      } else {
        pin.className += " disconnected";
      }
      mount.appendChild( pin );
      outputPort.appendChild( mount );
      $( pin ).tooltip( {
        'placement' : 'bottom',
        'trigger'   : 'hover',
      });
    }
    /*------------- SUMMERY --------------*/
    self.obj.appendChild( inputPort );
    self.obj.appendChild( body );
    self.obj.appendChild( outputPort );
    box.appendChild( self.obj );
    return;
  }
  function dragInit () {
    let drag = new Drag();
    return;
  }
  function pinsInit () {
    let inPort  = null;
    let outPort = null;
    for ( var i=0; i<self.obj.children.length; i++ ) {
      if ( self.obj.children[i].className.search( "input" ) > 0 ) {
        inPort = self.obj.children[i];
      }
      if ( self.obj.children[i].className.search( "output" ) > 0 ) {
        outPort = self.obj.children[i];
      }
    }
    for ( var i=0; i<self.inputs.length; i++ ) {
      self.inputs[i].setMount( inPort.children[i] );
      self.inputs[i].setPin( inPort.children[i].children[0] );
      inPort.children[i].children[0].addEventListener( 'click', ( function () {
        var j = i;
        return function () {
          let adr = new NodeAdr( self.id, self.inputs[j].id );
          pinCallback( adr );
        }
      })());
    }
    for ( var i=0; i<self.outputs.length; i++ ) {
      self.outputs[i].setPin( outPort.children[i] );
      outPort.children[i].addEventListener( 'click', ( function () {
        var j = i;
        return function () {
          let adr = new NodeAdr( self.id, self.outputs[j].id );
          pinCallback( adr );
        }
      })());
    }
    return;
  }
  function clickInit () {
    for ( var i=0; i<self.obj.children.length; i++ ) {
      if ( self.obj.children[i].className == "body" ) {
        self.obj.children[i].addEventListener( 'click', function () {
          self.focus = !self.focus;
          if ( self.focus == true ) {
            body.classList.add( "focus" );
          } else {
            body.classList.remove( "focus" );
          }
          return;
        });
      }
    }
    return;
  }
  function contextInit () {
    for ( var i=0; i<self.obj.children.length; i++ ) {
      if ( self.obj.children[i].className == "body" ) {
        self.obj.children[i].addEventListener( 'contextmenu', function () {
          contextMenuCallback( self.id );
          menu = new Menu( box, self.obj, menuItems );
        });
      }
    }
    return;
  }
  function init ( type, id, box ) {
    makeNode( self.type );
    draw();
    setSize();
    move();
    dragInit();
    pinsInit();
    show();
    clickInit();
    contextInit();
    return;
  }
  /*----------------------------------------*/
  this.reInit             = function () {
    dragInit();
  }
  this.move               = function ( x, y ) {
    console.log( self.obj.style.top + "/" + self.obj.style.left );
    self.obj.style.top  = x + "px";
    self.obj.style.left = y + "px";
    self.x              = x;
    self.y              = y;
    console.log( self.obj.style.top + "/" + self.obj.style.left );
    return;
  }
  this.setPinsAvailable   = function ( type, data) {
    for ( var i=0; i<self.inputs.length; i++ ) {
      self.inputs[i].setAvailable( type, data );
    }
    for ( var i=0; i<self.outputs.length; i++ ) {
      self.outputs[i].setAvailable( type, data );
    }
    return;
  }
  this.resetPinsAvailable = function () {
    for ( var i=0; i<self.inputs.length; i++ ) {
      self.inputs[i].resetAvailable();
    }
    for ( var i=0; i<self.outputs.length; i++ ) {
      self.outputs[i].resetAvailable();
    }
    return;
  }
  this.setPinsInProgress  = function ( n ) {
    for ( var i=0; i<self.inputs.length; i++ ) {
      if ( self.inputs[i].id != n ) {
        self.inputs[i].setReserved();
      } else {
        self.inputs[i].setDisconnected();
      }
    }
    for ( var i=0; i<self.outputs.length; i++ ) {
      if ( self.outputs[i].id != n ) {
        self.outputs[i].setReserved();
      } else {
        self.outputs[i].setDisconnected();
      }
    }
    return;
  }
  this.setPinConnected    = function ( n, link ) {
    let find = false;
    for ( var i=0; i<self.inputs.length; i++ ) {
      if ( self.inputs[i].id == n ) {
        self.inputs[i].setConnected( link );
        find = true;
        break;
      }
    }
    if ( find == false ) {
      for ( var i=0; i<self.outputs.length; i++ ) {
        if ( self.outputs[i].id == n ) {
          self.outputs[i].setConnected( link );
          find = true;
          break;
        }
      }
    }
    return;
  }
  this.getPinType         = function ( n ) {
    let find = false;
    let res  = null;
    for ( var i=0; i<self.inputs.length; i++ ) {
      if ( self.inputs[i].id == n ) {
        res  = "input";
        find = true;
        break;
      }
    }
    if ( find == false ) {
      for ( var i=0; i<self.outputs.length; i++ ) {
        if ( self.outputs[i].id == n ) {
          res  = "output";
          find = true;
          break;
        }
      }
    }
    return res;
  }
  this.getPinData         = function ( n ) {
    let find = false;
    let res  = null;
    for ( var i=0; i<self.inputs.length; i++ ) {
      if ( self.inputs[i].id == n ) {
        res  = self.inputs[i].data;
        find = true;
        break;
      }
    }
    if ( find == false ) {
      for ( var i=0; i<self.outputs.length; i++ ) {
        if ( self.outputs[i].id == n ) {
          res  = self.outputs[i].data;
          find = true;
          break;
        }
      }
    }
    return res;
  }
  this.getPinState        = function ( n ) {
    let find = false;
    let res  = null;
    for ( var i=0; i<self.inputs.length; i++ ) {
      if ( self.inputs[i].id == n ) {
        res  = self.inputs[i].state;
        find = true;
        break;
      }
    }
    if ( find == false ) {
      for ( var i=0; i<self.outputs.length; i++ ) {
        if ( self.outputs[i].id == n ) {
          res  = self.outputs[i].state;
          find = true;
          break;
        }
      }
    }
    return res;
  }
  this.getPinObject       = function ( n ) {
    let find = false;
    let res  = null;
    for ( var i=0; i<self.inputs.length; i++ ) {
      if ( self.inputs[i].id == n ) {
        res  = self.inputs[i].obj;
        find = true;
        break;
      }
    }
    if ( find == false ) {
      for ( var i=0; i<self.outputs.length; i++ ) {
        if ( self.outputs[i].id == n ) {
          res  = self.outputs[i].obj;
          find = true;
          break;
        }
      }
    }
    return res;
  }
  this.getPinExpand       = function ( n ) {
    let find = false;
    let res  = null;
    for ( var i=0; i<self.inputs.length; i++ ) {
      if ( self.inputs[i].id == n ) {
        res  = self.inputs[i].expand;
        find = true;
        break;
      }
    }
    if ( find == false ) {
      for ( var i=0; i<self.outputs.length; i++ ) {
        if ( self.outputs[i].id == n ) {
          res  = self.outputs[i].expand;
          find = true;
          break;
        }
      }
    }
    return res;
  }
  this.getPinLink         = function ( n ) {
    let find = false;
    let res  = null;
    for ( var i=0; i<self.inputs.length; i++ ) {
      if ( ( self.inputs[i].id == n ) && ( self.inputs[i].linked == true ) ) {
        res  = self.inputs[i].linkedWith;
        find = true;
        break;
      }
    }
    if ( find == false ) {
      for ( var i=0; i<self.outputs.length; i++ ) {
        if ( ( self.outputs[i].id == n ) && ( self.outputs[i].linked == true ) ) {
          res  = self.outputs[i].linkedWith;
          find = true;
          break;
        }
      }
    }
    return res;
  }
  this.getLinks           = function () {
    let links = [];
    for ( var i=0; i<self.inputs.length; i++ ) {
      if ( self.inputs[i].linked == true ) {
        for ( var j=0; j<self.inputs[i].linkedWith.length; j++ ) {
          links.push( self.inputs[i].linkedWith[j] );
        }
      }
    }
    for ( var i=0; i<self.outputs.length; i++ ) {
      if ( self.outputs[i].linked == true ) {
        links.push( self.outputs[i].linkedWith[0] );
      }
    }
    return links;
  }
  this.setFocus           = function () {
    self.focus = true;
    body.classList.add( "focus" );
    return;
  }
  this.resetFocus         = function () {
    self.focus = false;
    body.classList.remove( "focus" );
    return;
  }
  this.closeMenu          = function () {
    if ( menu != null ) {
      if ( menu.exist == true ) {
        menu.remove();
      }
    }
    return;
  }
  this.remove             = function () {
    this.obj.remove();
    return;
  }
  /*----------------------------------------*/
  init ( type, id, box );
  return;
}
function Scheme ( id ) {
  var self     = this;
  var nodeID   = 0;             /* Counter for nodes          */
  var linkID   = 0;             /* Counter for links          */
  var state    = "idle";        /* State of scheme            */
  var prevAdr  = new NodeAdr(); /* Previus pin for connecting */
  var prevLink = null;          /* Link number for changing   */
  var scale    = 1;             /* Scale of zooming           */
  /*----------------------------------------*/
  this.id      = 0;    /* ID number of scheme     */
  this.nodes   = [];   /* Nodes of scheme         */
  this.links   = [];   /* Links of scheme         */
  this.box     = null; /* Scheme element in DOM   */
  this.inFocus = [];   /* Array of focus elements */
  /*----------------------------------------*/
  function init ( id ) {
    self.id  = id;
    self.box = document.getElementById( 'scheme' );
    return;
  }
  function removeNode ( id ) {
    let shift = 0;
    if ( ( self.nodes.length - 1 ) > id ) {
      shift = self.nodes[id].shift + self.nodes[id + 1].shift;
    }
    for ( var i=id+1; i<self.nodes.length; i++ ) {
      self.nodes[i].id--;
      self.nodes[i].shift -= shift;
      self.nodes[i].move( ( self.nodes[i].x - shift ), self.nodes[i].y );
      self.nodes[i].reInit();
    }
    self.nodes[id].remove();
    self.nodes.splice( id, 1 );
    nodeID--;
  }
  function setPinsAvailable ( adr, type, data ) {
    if ( type == "input" ) {
      for ( var i=0; i<self.nodes.length; i++ ) {
        if ( i == adr.node ) {
          self.nodes[i].setPinsInProgress( adr.pin );
        } else {
          self.nodes[i].setPinsAvailable( "output", data );
        }
      }
    } else if ( type == "output" ) {
      for ( var i=0; i<self.nodes.length; i++ ) {
        if ( i == adr.node ) {
          self.nodes[i].setPinsInProgress( adr.pin );
        } else {
          self.nodes[i].setPinsAvailable( "input", data );
        }
      }
    } else {

    }
  }
  function resetPinsAvailable () {
    for ( var i=0; i<self.nodes.length; i++ ) {
      self.nodes[i].resetPinsAvailable();
    }
  }
  function getPinObject ( adr ) {
    return self.nodes[adr.node].getPinObject( adr.pin );
  }
  function getPinExpand ( adr ) {
    return self.nodes[adr.node].getPinExpand( adr.pin );
  }
  function getPinData ( adr ) {
    return self.nodes[adr.node].getPinData( adr.pin );
  }
  function removeLinksOfNode ( adr ) {
    for ( var i=0; i<self.links.length; i++ ) {
      if ( ( self.links[i].from.node == adr ) || ( self.links[i].to.node == adr ) ) {
        self.removeLink( self.links[i].id );
        removeLinksOfNode( adr );
        break;
      }
    }
    return;
  }
  function zoom () {
    transformOrigin = [0, 0];
    var p       = ["webkit", "moz", "ms", "o"];
    var s       = "scale(" + scale + ")";
    var oString = ( transformOrigin[0] * 100) + "% " + ( transformOrigin[1] * 100 ) + "%";
    for ( var i=0; i<p.length; i++ ) {
      self.box.style[p[i] + "Transform"]       = s;
      self.box.style[p[i] + "TransformOrigin"] = oString;
    }
    self.box.style["transform"]       = s;
    self.box.style["transformOrigin"] = oString;
    for ( var i=0; i<self.links.length; i++ ) {
      self.links[i].draw();
    }
    return;
  }
  /* Callbacks */
  function linkStart ( adr ) {
    self.resetFocus();
    let type = self.nodes[adr.node].getPinType( adr.pin );
    let data = self.nodes[adr.node].getPinData( adr.pin );
    let link = self.nodes[adr.node].getPinLink( adr.pin );
    switch ( state ) {
      case "idle":
        console.log();
        if ( type == "output" ) {             /* If output - use previus link */
          prevLink = null;
        } else {
          prevLink = link;
        }
        setPinsAvailable( adr, type, data );  /* Show available for connection pins */
        prevAdr = adr;                        /* Save address of first pin          */
        state   = "connect";                  /* Set new state                      */
        break;
      case "connect":
        if ( ( adr.node == prevAdr.node ) && ( adr.pin == prevAdr.pin ) ) { /* Click to same pin */
          resetPinsAvailable();                                             /* Reset connection operation */
          state = "idle";
        } else {
          if ( self.nodes[adr.node].getPinState( adr.pin ) == "available" ) {
            if ( type == "input" ) {
              self.addLink( prevAdr, adr );
            } else {
              self.addLink( adr, prevAdr );
            }
            resetPinsAvailable();
            state = "idle";
          } else {
            setPinsAvailable( adr, type, data );
            prevAdr = adr;
            state   = "connect";
          }
        }
        break;
    }
    return;
  }
  function afterDrag ( adr ) {
    for ( var i=0; i<self.links.length; i++ ) {
      self.links[i].draw();
    }
    return;
  }
  function afterFocus ( adr, focus ) {
    if ( focus == true ) {
      self.inFocus.push( adr );
    } else {
      for ( var i=0; i<self.inFocus.length; i++ ) {
        if ( self.inFocus[i] == adr ) {
          self.inFocus.splice( i, 1 );
        }
      }
    }
    return;
  }
  function beforNodeRemove ( adr ) {
    self.removeNode( adr );
    return;
  }
  function beforContextMenu ( adr ) {
    for ( var i=0; i<self.nodes.length; i++ ) {
      self.nodes[i].closeMenu();
    }
    return;
  }
  /*----------------------------------------*/
  this.redraw        = function () {
    for ( var i=0; i<self.links.length; i++ ) {
      self.links[i].draw();
    }
    return;
  }
  this.addNode       = function ( type ) {
    self.nodes.push( new Node( type, nodeID++, self.box, linkStart, afterDrag, beforNodeRemove, beforContextMenu ) );
    return;
  }
  this.addLink       = function ( from, to ) {
    let currentID = 0;
    let start     = getPinObject( from );
    let end       = getPinObject( to   );
    /*
    if ( getPinExpand( to ) == true ) {
      self.nodes[to.node].expand.counter++;
      if ( self.nodes[to.node].expand.viewed == self.nodes[to.node].expand.counter ) {
        self.nodes[to.node].pinExpand();
        //self.redraw();
      }
    }
    */
    if ( prevLink == null ) {
      currentID = linkID++;
      self.links.push( new Link( from, to, start, end, getPinData( from ), currentID ) );
    } else {
      currentID = prevLink[0];
      self.links[currentID].setFrom( from, start );
    }
    self.nodes[from.node].setPinConnected( from.pin, id );
    self.nodes[to.node].setPinConnected( to.pin, id );

    return;
  }
  this.removeLink    = function ( id ) {
    let to   = self.links[id].to;
    let from = self.links[id].from;
    self.nodes[to.node].inputs[to.pin].setDisconnected();
    self.nodes[from.node].outputs[to.pin].setDisconnected();
    for ( var i=id+1; i<self.links.length; i++ ) {
      self.links[i].id--;
    }
    self.links[id].remove();
    self.links.splice( id, 1 );
    linkID--;
    /*
    if ( getPinExpand( to ) == true ) {
      self.nodes[to.node].expand.counter--;
      if ( self.nodes[to.node].expand.viewed == self.nodes[to.node].expand.counter ) {
        self.nodes[to.node].pinExpand();
      }
    }
    */
    return;
  }
  this.removeNode    = function ( adr ) {
    if ( adr <= self.nodes.length ) {
      removeLinksOfNode( adr );
      removeNode( adr );
    }
    return;
  }
  this.isMouseOnNode = function ( x, y ) {
    var res = false;
    for ( var i=0; i<self.nodes.length; i++ ) {
      if ( self.nodes[i].obj.matches(':hover') == true ) {
        res = true;
        break;
      }
    }
    return res;
  }
  this.resetFocus    = function () {
    self.inFocus = [];
    for ( var i=0; i<self.nodes.length; i++ ) {
      self.nodes[i].resetFocus();
    }
    return;
  }
  this.zoomIn        = function () {
    if ( scale < scaleMax ) {
      scale += scaleStep;
    }
    zoom();
    return;
  }
  this.zoomReset     = function () {
    scale = 1;
    zoom();
    return;
  }
  this.zoomOut       = function () {
    if ( scale > scaleMin ) {
      scale -= scaleStep;
    }
    zoom();
    return;
  }
  this.getData       = function () {
    self.links.forEach( function( link, i ) {
      link.getData();
    });

    return;
  }
  /*----------------------------------------*/
  init( id );
  /*----------------------------------------*/
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Node   = Node;
module.exports.Link   = Link;
module.exports.Pin    = Pin;
module.exports.Scheme = Scheme;
/*----------------------------------------------------------------------------*/
