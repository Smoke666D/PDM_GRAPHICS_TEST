/*----------------------------------------------------------------------------*/
var nodeLib     = require('./nodeLib.js').nodeLib;
var maker       = require('./construct.js');
var dragElement = require('./drag.js').dragElement;
/*----------------------------------------------------------------------------*/
const lineTypes = {
  "bool"   : {
    color      : '#33f233',
    animation  : true,
    size       : 3
  },
  "float"  : {
    color      : '#b824bd',
    animation  : true,
    size       : 3
  },
  "string" : {
    color      : '#f2e933',
    animation  : true,
    size       : 3
  }
}
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
  this.obj   = null;
  /*----------------------------------------*/
  function overInit () {
    console.log( self.obj );
  }
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
    if ( self.obj == null ) {
      self.obj = new LeaderLine( self.start, self.end, lineTypes[self.type] )
    } else {
      self.obj.position();
    }
    return;
  }
  this.setFrom = function ( from, start ) {
    if ( self.obj != null ) {
      self.from  = from;
      self.start = start;
      self.obj.setOptions( {"start" : self.start } );
    }
    return;
  }
  this.delete  = function () {
    if ( self.obj != null ) {
      self.obj.remove();
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
  this.linked     = false;      /* Is Pin connected to outher pin */
  this.linkedWith = [];         /* ID of the Link */
  this.state      = "reserved"; /**/
  this.obj        = null;       /* Object in DOM */
  /*----------------------------------------*/
  function init ( id, type, data ) {
    self.id         = id;
    self.type       = type;
    self.data       = data;
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
    if ( ( self.type == type ) && ( self.data == data ) && ( self.linked == false ) ) {
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
function Node ( type, id, box, pinCallback, dropCallback ) {
  var self         = this;
  var box          = box;
  var pinCallback  = pinCallback;
  var dropCallback = dropCallback;
  /*----------------------------------------*/
  this.id      = id;    /* ID number of node               */
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
    self.obj.style.top  = self.shift + self.x + "px";
    self.obj.style.left = self.y + "px";
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
      if ( self.inputs[i].type == "none" ) {
        pin.className += " reseved";
      } else {
        pin.className += " disconnected";
      }
      inputPort.appendChild( pin );
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
      if ( self.outputs[i].type == "none" ) {
        pin.className += " reseved";
      } else {
        pin.className += " disconnected";
      }
      outputPort.appendChild( pin );
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
      dropCallback( self.id );
      return;
    }
    function onDrop () {
      self.focus = false;
      self.obj.classList.remove( "focus" );
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
  function init ( type, id, box ) {
    makeNode( self.type );
    draw();
    setSize();
    move();
    dragInit();
    pinsInit();
    show();
    clickInit();
    return;
  }
  /*----------------------------------------*/
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
  this.delete             = function () {
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
  function delNode ( id ) {
    for ( var i=id+1; i<self.nodes.length; i++ ) {
      self.nodes[i].id--;
    }
    self.nodes[id].delete();
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
  /* Callbacks */
  function linkStart ( adr ) {
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
  function afterDrop ( adr ) {
    for ( var i=0; i<self.links.length; i++ ) {
      self.links[i].draw();
    }
    return;
  }
  function afterFocus ( objectType, adr, focus ) {
    if ( focus == true ) {
      self.inFocus.push( { "type" : objectType, "adr" : adr } );
    } else {
      for ( var i=0; i<self.inFocus.length; i++ ) {
        if ( ( self.inFocus[i].type == objectType ) && ( self.inFocus[i].adr == adr ) ) {
          self.inFocus.splice( i, 1 );
        }
      }
    }
    return;
  }
  /*----------------------------------------*/
  this.redraw     = function () {
    for ( var i=0; i<self.links.length; i++ ) {
      self.links[i].draw();
    }
    return;
  }
  this.addNode    = function ( type ) {
    self.nodes.push( new Node( type, nodeID++, self.box, linkStart, afterDrop ) );
    return;
  }
  this.addLink    = function ( from, to ) {
    let currentID = 0;
    let start     = getPinObject( from );
    let end       = getPinObject( to   );
    if ( prevLink == null ) {
      currentID = linkID++;
      self.links.push( new Link( from, to, start, end, getPinData( from ), id ) );
    } else {
      currentID = prevLink[0];
      self.links[currentID].setFrom( from, start );
    }
    self.nodes[from.node].setPinConnected( from.pin, id );
    self.nodes[to.node].setPinConnected( to.pin, id );
    return;
  }
  this.removeLink = function ( id ) {
    let to   = self.links[id].to;
    let from = self.links[id].from;
    self.nodes[to.node].inputs[to.pin].setDisconnected();
    self.nodes[from.node].outputs[to.pin].setDisconnected();
    for ( var i=id+1; i<self.links.length; i++ ) {
      self.links[i].id--;
    }
    self.links[id].delete();
    self.links.splice( id, 1 );
    linkID--;
    return;
  }
  this.removeNode = function ( id ) {
    if ( id <= self.nodes.length ) {
      let links = self.nodes[id].getLinks();
      for ( var i=0; i<links.length; i++ ) {
        self.removeLink( links[i] );
      }
      delNode( id );
    }
    return;
  }
  this.resetFocus = function () {
    self.inFocus = [];
    for ( var i=0; i<self.nodes.length; i++ ) {
      self.nodes[i].resetFocus();
    }
    for ( var i=0; i<self.links.length; i++ ) {
      self.links[i].resetFocus();
    }
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
