/*----------------------------------------------------------------------------*/
var nodeLib     = require('./nodeLib.js').nodeLib;
var maker       = require('./construct.js');
var dragElement = require('./drag.js').dragElement;
/*----------------------------------------------------------------------------*/
function NodeAdr ( node = 0, pin = 0 ) {
  this.node = node;
  this.pin  = pin;
  return;
}
function Link ( from, to, start, end, id, box ) {
  var self = this;
  var box  = box;
  /*----------------------------------------*/
  this.id    = id;
  this.from  = new NodeAdr();
  this.to    = new NodeAdr();
  this.start = start;
  this.end   = end;
  this.obj   = null;
  /*----------------------------------------*/
  function createBox () {
    self.obj              = document.createElement("DIV");
    self.obj.id           = "link" + id;
    self.obj.className    = "link";
    /* From */
    let line0       = document.createElement("DIV");
    line0.id        = "line0"
    line0.className = "line";
    self.obj.appendChild( line0 );
    /* To */
    let line1       = document.createElement("DIV");
    line1.id        = "line1";
    line1.className = "line";
    self.obj.appendChild( line1 );
    /* Vertical */
    let line2       = document.createElement("DIV");
    line2.id        = "line2";
    line2.className = "line";
    self.obj.appendChild( line2 );
    box.appendChild( self.obj );
    return;
  }
  function recalcBox () {
    self.obj.style.height = Math.abs( self.start.y - self.end.y ) + 'px';
    self.obj.style.top    = Math.min( self.start.y, self.end.y )  + 'px';
    self.obj.style.left   = Math.min( self.start.x, self.end.x )  + 'px';
    self.obj.style.width  = Math.abs( self.start.x - self.end.x ) + 'px';
    return;
  }
  function redraw () {
    if ( self.obj != null ) {
      for ( var i=0; i<self.obj.children.length; i++ ) {
        switch ( self.obj.children[i].id ) {
          case "line0":
            if ( self.start.y < self.end.y ) {
              self.obj.children[i].style.top  = '0px';
            } else {
              self.obj.children[i].style.top  = parseInt( self.obj.style.height ) - 1 + "px";
            }
            if ( self.start.x < self.end.x ) {
              self.obj.children[i].style.left = '0px';
            } else {
              self.obj.children[i].style.left = parseInt( self.obj.style.width ) / 2  + 'px';
            }
            self.obj.children[i].style.width  = parseInt( self.obj.style.width ) / 2 + "px";
            break;
          case "line1":
            if ( self.start.y < self.end.y ) {
              self.obj.children[i].style.top    = parseInt( self.obj.style.height ) - 1 + "px";
            } else {
              self.obj.children[i].style.top = '0px';
            }
            if ( self.start.x < self.end.x ) {
              self.obj.children[i].style.left   = parseInt( self.obj.style.width ) / 2  + 'px';
            } else {
              self.obj.children[i].style.left   = '0px';
            }
            self.obj.children[i].style.width  = parseInt( self.obj.style.width ) / 2  + "px";
            break;
          case "line2":
            self.obj.children[i].style.top    = "0px";
            self.obj.children[i].style.left   = parseInt( self.obj.style.width ) / 2 + 'px';
            self.obj.children[i].style.height = self.obj.style.height;;
            break;
        }
      }
    }
    return;
  }
  function draw () {
    createBox();
    recalcBox();
    redraw();
    return;
  }
  function init ( from, to, start, end, id, box ) {
    self.id    = id;
    self.from  = from;
    self.to    = to;
    self.start = start;
    self.end   = end;
    box        = box;
    draw();
    return;
  }
  /*----------------------------------------*/
  this.move   = function ( start, end ) {
    self.start = start;
    self.end   = end;
    recalcBox();
    redraw();
    return;
  }
  this.delete = function () {
    return;
  }
  /*----------------------------------------*/
  init( from, to, start, end, id );
  return;
}
function Pin ( id, type, data ) {
  var self = this;
  /*----------------------------------------*/
  this.id         = 0;          /* ID number, unique in same node */
  this.type       = "none";     /* Input or Output or None */
  this.data       = "none";     /* Bool or self.start.xoat or String */
  this.linked     = false;      /* Is Pin connected to outher pin */
  this.linkedWith = 0;          /* ID of the Link */
  this.state      = "reserved"; /**/
  this.obj        = null;       /* Object in DOM */
  /*----------------------------------------*/
  function init ( id, type, data ) {
    self.id         = id;
    self.type       = type;
    self.data       = data;
    self.linked     = false;
    self.linkedWith = 0;
    return;
  }
  /*----------------------------------------*/
  this.setConnected    = function ( id ) {
    self.linked     = true;
    self.linkedWith = id;
    self.obj.classList.add( "connected" );
    self.obj.classList.remove( "disconnected" );
    this.state = "connected";
    return;
  }
  this.setDisconnected = function () {
    self.linked = false;
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
  this.id      = id;  /*  */
  this.type    = type;
  this.inputs  = [];
  this.outputs = [];
  this.x       = 0;
  this.y       = 0;
  this.width   = 0;
  this.height  = 0;
  this.obj     = null;
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
    self.obj.style.top  = self.x + "px";
    self.obj.style.left = self.y + "px";
  }
  function draw () {
    let text       = maker.HTMLnode( id, type, self.inputs, self.outputs );
    box.innerHTML += text;
    self.obj       = document.getElementById( 'node' + self.id );
  }
  function dragInit () {
    function callback () {
      dropCallback( self.id );
      return;
    }
    for ( var i=0; i<self.obj.children.length; i++ ) {
      if ( self.obj.children[i].className == "body" ) {
        dragElement( self.obj, self.obj.children[i], callback );
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
  function init ( type, id, box ) {
    makeNode( self.type );
    draw();
    setSize();
    //move();
    dragInit();
    pinsInit();
    show();
    return;
  }
  /*----------------------------------------*/
  this.reInit             = function () {
    self.obj = document.getElementById( 'node' + self.id );
    dragInit();
    pinsInit();
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
        links.push( self.inputs[i].linkedWith );
      }
    }
    for ( var i=0; i<self.outputs.length; i++ ) {
      if ( self.outputs[i].linked == true ) {
        links.push( self.outputs[i].linkedWith );
      }
    }
    return links;
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
  var box      = null;          /* Scheme element in DOM      */
  var state    = "idle";        /* State of scheme            */
  var prevAdr  = new NodeAdr(); /* Previus pin for connecting */
  var prevLink = null;          /* Link number for changing   */
  /*----------------------------------------*/
  this.id    = 0;
  this.nodes = [];
  this.links = [];
  /*----------------------------------------*/
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
  function init ( id ) {
    self.id = id;
    box = document.getElementById( 'scheme' + id );
    return;
  }
  function getPinCoordinate ( adr ) {
    return self.nodes[adr.node].getPinCoordinate( adr.pin );
  }
  function linkStart ( adr ) {
    let type = self.nodes[adr.node].getPinType( adr.pin );
    let data = self.nodes[adr.node].getPinData( adr.pin );
    let link = self.nodes[adr.node].getPinLink( adr.pin );
    switch ( state ) {
      case "idle":
        prevLink = link;
        setPinsAvailable( adr, type, data );
        prevAdr = adr;
        state = "connect";
        break;
      case "connect":
        if ( ( adr.node == prevAdr.node ) && ( adr.pin == prevAdr.pin ) ) {
          resetPinsAvailable();
          state = "idle";
        } else {
          if ( self.nodes[adr.node].getPinState( adr.pin ) == "available" ) {
            self.addLink( prevAdr, adr );
            resetPinsAvailable();
          } else {
            setPinsAvailable( adr, type, data );
            prevAdr = adr;
            state = "connect";
          }
        }
        break;
    }
    return;
  }
  function setupLink ( from, to, id ) {
    let start = getPinCoordinate( from );
    let end   = getPinCoordinate( to   );
    self.links.push( new Link( from, to, start, end, id, box ) );
    self.nodes[from.node].setPinConnected( from.pin, id );
    self.nodes[to.node].setPinConnected( to.pin, id );
  }
  function afterDrop ( adr ) {
    var cons = self.nodes[adr].getLinks();
    console.log( cons );
    console.log( self.links );
    for ( var i=0; i<cons.length; i++ ) {
      let start = getPinCoordinate( self.links[cons[i]].from );
      let end   = getPinCoordinate( self.links[cons[i]].to   );
      self.links[cons[i]].move( start, end );
    }
    return;
  }
  /*----------------------------------------*/
  this.addNode    = function ( type ) {
    self.nodes.push( new Node( type, nodeID++, box, linkStart, afterDrop ) );
    for ( var i=0; i<( self.nodes.length - 1 ); i++ ) {
      self.nodes[i].reInit();
    }
    return;
  }
  this.addLink    = function ( from, to ) {
    if ( prevLink == null ) {
      let currentID = linkID++;
      setupLink( from, to, currentID );
    } else {
      setupLink( from, to, prevLink );
    }
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
