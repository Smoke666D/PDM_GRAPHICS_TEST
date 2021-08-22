/*----------------------------------------------------------------------------*/
var nodeLib     = require('./nodeLib.js').nodeLib;
var dragElement = require('./drag.js').dragElement;
/*----------------------------------------------------------------------------*/
const lineTypes = {
  "bool"   : {
    color       : '#33f233',
    animation   : true,
    size        : 3,
    startSocket : 'right',
    endSocket   : 'left'
  },
  "float"  : {
    color       : '#b824bd',
    animation   : true,
    size        : 3,
    startSocket : 'right',
    endSocket   : 'left'
  },
  "string" : {
    color       : '#f2e933',
    animation   : true,
    size        : 3,
    startSocket : 'right',
    endSocket   : 'left'
  }
}
const scaleStep = 0.1;
const scaleMax  = 3;
const scaleMin  = 0.5;
/*----------------------------------------------------------------------------*/
function NodeAdr ( node = 0, pin = 0 ) {
  this.node = node;
  this.pin  = pin;
  return;
}
function Link ( from, to, start, end, type, id ) {
  var self = this;
  var box  = box;
  /*----------------------------------------*/
  this.id    = id;
  this.from  = new NodeAdr();
  this.to    = new NodeAdr();
  this.start = start;
  this.end   = end;
  this.type  = type;
  this.line  = null; /* LeaderLine object */
  this.obj   = null; /* DOM element of the line */
  /*----------------------------------------*/
  function init ( from, to, start, end, type, id ) {
    self.id    = id;
    self.from  = from;
    self.to    = to;
    self.start = start;
    self.end   = end;
    self.type  = type;
    self.draw();
    return;
  }
  /*----------------------------------------*/
  this.draw    = function () {
    if ( self.line == null ) {
      self.line   = new LeaderLine( self.start, self.end, lineTypes[self.type] );
      self.obj    = document.querySelector('.leader-line:last-of-type');
      self.obj.id = "link" + self.id;
    } else {
      self.line.position();
    }
    return;
  }
  this.setFrom = function ( from, start ) {
    if ( self.line != null ) {
      self.from  = from;
      self.start = start;
      self.line.setOptions( {"start" : self.start } );
    }
    return;
  }
  this.remove  = function () {
    if ( self.line != null ) {
      self.line.remove();
    }
    return;
  }
  /*----------------------------------------*/
  init( from, to, start, end, type, id );
  return;
}
function Pin ( id, type, data ) {
  var self = this;
  /*----------------------------------------*/
  this.id         = 0;          /* ID number, unique in same node */
  this.type       = "none";     /* Input or Output or None */
  this.data       = "none";     /* Bool or self.start.xoat or String */
  this.help       = ""
  this.expand     = false;
  this.table      = false;
  this.linked     = false;      /* Is Pin connected to outher pin */
  this.linkedWith = [];         /* ID of the Link */
  this.state      = "reserved"; /**/
  this.obj        = null;       /* Object in DOM */
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
  this.setReserved     = function () {
    self.obj.classList.remove( "disconnected" );
    self.obj.classList.remove( "connected" );
    self.obj.classList.add( "reserved" );
    this.state = "reserved";
    return;
  }
  this.setAvailable    = function ( type, data ) {
    self.obj.classList.remove( "disconnected" );
    self.obj.classList.remove( "connected" );
    self.obj.classList.remove( "available" );
    self.obj.classList.remove( "reserved" );
    if ( ( self.data == data ) && ( self.type == type ) && ( ( type == "output" ) || ( self.linked == false ) ) ) {
      self.obj.classList.add( "available" );
      this.state = "available";
    } else {
      self.obj.classList.add( "reserved" );
      this.state = "reserved";
    }
    return;
  }
  this.resetAvailable  = function () {
    self.obj.classList.remove( "available" );
    self.obj.classList.remove( "reserved" );
    if ( self.linked == false ) {
      self.obj.classList.add( "disconnected" );
      this.state = "disconnected";
    } else {
      self.obj.classList.add( "connected" );
      this.state = "connected";
    }
    return;
  }
  this.setObj          = function ( obj ) {
    self.obj = obj;
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
  /*----------------------------------------*/
  this.id      = id;    /* ID number of node               */
  this.name    = "";    /* Name of the node                */
  this.type    = type;  /* Function type of node           */
  this.inputs  = [];    /* Array of inputs pins            */
  this.outputs = [];    /* Array of outputs pins           */
  this.focus   = false; /* Is node in focus                */
  this.x       = 0;     /* Left coordinate of node box     */
  this.y       = 0;     /* Top coordinate of node box      */
  this.width   = 0;     /* Width of node box               */
  this.height  = 0;     /* Height of node box              */
  this.obj     = null;  /* DOM object of node              */
  this.shift   = 0;     /* Top shift in parent of node box */
  /*----------------------------------------*/
  function makeNode ( type ) {
    let data     = nodeLib.getNodeRecord( type );
    let pinID    = 0;
    self.width   = data.width;
    self.height  = data.height;
    self.name    = data.name;
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
    self.obj.style.width  = self.width  + "px";
    self.obj.style.height = self.height + "px";
    return;
  }
  function hide() {
    self.obj.classList.add( "hide" );
    return;
  }
  function show() {
    self.obj.classList.remove( "hide" );
    return;
  }
  function move() {
    self.shift          = self.obj.parentElement.offsetTop - self.obj.offsetTop;
    self.obj.style.top  = ( self.shift + self.x ) + "px";
    self.obj.style.left = self.y + "px";
    return;
  }
  function draw () {
    let pinCounter = 0;
    /*--------------- NODE ---------------*/
    self.obj            = document.createElement("DIV");
    self.obj.id         = 'node' + self.id;
    self.obj.className  = 'node';
    /*------------ INPUT PORT ------------*/
    let inputPort       = document.createElement("DIV");
    inputPort.className = 'port input';
    for ( var i=0; i<self.inputs.length; i++ ) {
      let pin       = document.createElement("DIV");
      pin.id        = 'pin' + pinCounter++;
      pin.className = 'pin';
      pin.title     = self.inputs[i].help;
      pin.setAttribute( 'data-toggle', 'tooltip' );
      if ( self.inputs[i].type == "none" ) {
        pin.className += " reseved";
      } else {
        pin.className += " disconnected";
      }
      inputPort.appendChild( pin );
      $( pin ).tooltip( {
        'placement' : 'left',
        'trigger'   : 'hover',
      });
    }
    /*--------------- BODY ---------------*/
    let body           = document.createElement("DIV");
    body.className     = 'body';
    let bodyText       = document.createElement("A");
    bodyText.innerHTML = 'Node' + self.id;
    body.appendChild( bodyText );
    /*----------- OUTPUT PORT ------------*/
    let outputPort       = document.createElement("DIV");
    outputPort.className = 'port output';
    for ( var i=0; i<self.outputs.length; i++ ) {
      let pin       = document.createElement("DIV");
      pin.id        = 'pin' + pinCounter++;
      pin.className = 'pin';
      pin.title     = self.outputs[i].help;
      if ( self.outputs[i].type == "none" ) {
        pin.className += " reseved";
      } else {
        pin.className += " disconnected";
      }
      outputPort.appendChild( pin );
      $( pin ).tooltip( {
        'placement' : 'right',
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
    function onDrag () {
      dragCallback( self.id );
      return;
    }
    function onDrop () {
      self.focus = false;
      self.obj.classList.remove( "focus" );
      self.x = parseInt( self.obj.style.top  );
      self.y = parseInt( self.obj.style.left );
      return;
    }
    for ( var i=0; i<self.obj.children.length; i++ ) {
      if ( self.obj.children[i].className == "body" ) {
        dragElement( self.obj, self.obj.children[i], self.shift, onDrag, onDrop );
      }
    }
    return
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
      self.inputs[i].setObj( inPort.children[i] );
      inPort.children[i].addEventListener( 'click', ( function () {
        var j = i;
        return function () {
          let adr = new NodeAdr( self.id, self.inputs[j].id );
          pinCallback( adr );
        }
      })());
    }
    for ( var i=0; i<self.outputs.length; i++ ) {
      self.outputs[i].setObj( outPort.children[i] );
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
            self.obj.classList.add( "focus" );
          } else {
            self.obj.classList.remove( "focus" );
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
  this.getPinCoordinate   = function ( n ) {
    let find = false;
    let res  = { "x" : 0, "y" : 0 };
    for ( var i=0; i<self.inputs.length; i++ ) {
      if ( self.inputs[i].id == n ) {
        let data = self.inputs[i].obj.getBoundingClientRect();
        res.x = data.left;
        res.y = data.top + data.height / 2;
        find  = true;
        break;
      }
    }
    if ( find == false ) {
      for ( var i=0; i<self.outputs.length; i++ ) {
        if ( self.outputs[i].id == n ) {
          let data = self.outputs[i].obj.getBoundingClientRect();
          res.x = data.right;
          res.y = data.top + data.height / 2;
          find  = true;
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
    self.obj.classList.add( "focus" );
    return;
  }
  this.resetFocus         = function () {
    self.focus = false;
    self.obj.classList.remove( "focus" );
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
