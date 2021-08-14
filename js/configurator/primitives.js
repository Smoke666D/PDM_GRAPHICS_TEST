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
function Link ( from, to, id ) {
  var self = this;
  /*----------------------------------------*/
  this.id   = id;
  this.from = new NodeAdr();
  this.to   = new NodeAdr();
  /*----------------------------------------*/
  this.init = function ( from, to, id ) {
    self.id   = id;
    self.from = from;
    self.to   = to;
    return;
  }
  this.delete = function () {
    return;
  }
  /*----------------------------------------*/
  this.init( from, to, id )
  return;
}
function Pin ( id, type, data ) {
  var self = this;
  /*----------------------------------------*/
  this.id         = 0;       /* ID number, unique in same node */
  this.type       = "none";  /* Input or Output or None */
  this.data       = "none";  /* Bool or Float or String */
  this.linked     = false;   /* Is Pin connected to outher pin */
  this.linkedWith = 0;       /* ID of the Link */
  this.obj        = null;    /* Object in DOM */
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
    self.jbj.classList.add( connected );
    self.obj.classList.remove( disconnected );
    return;
  }
  this.setDisconnected = function () {
    self.linked = false;
    self.jbj.classList.add( disconnected );
    self.obj.classList.remove( connected );
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
function Node ( type, id, box, pinCallback ) {
  var self     = this;
  var box      = box;
  var callback = pinCallback;
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
    for ( var i=0; i<self.obj.children.length; i++ ) {
      if ( self.obj.children[i].className == "body" ) {
        dragElement( self.obj, self.obj.children[i] );
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
          callback( adr );
        }
      })());
    }
    for ( var i=0; i<self.outputs.length; i++ ) {
      self.outputs[i].setObj( outPort.children[i] );
      outPort.children[i].addEventListener( 'click', ( function () {
        var j = i;
        return function () {
          let adr = new NodeAdr( self.id, self.outputs[j].id );
          callback( adr );
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
  this.reInit   = function () {
    self.obj = document.getElementById( 'node' + self.id );
    dragInit();
    pinsInit();
    return;
  }
  this.findPin  = function ( n ) {
    let find = false;
    let res  = "none";
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
  this.getLinks = function () {
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
  this.delete   = function () {
    return;
  }
  /*----------------------------------------*/
  init ( type, id, box );
  return;
}
function Scheme ( id ) {
  var self   = this;
  var nodeID = 0;
  var linkID = 0;
  var box    = null;
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
  function init ( id ) {
    self.id = id;
    box = document.getElementById( 'scheme' + id );
    return;
  }

  function linkStart( adr ) {
    let type = self.nodes[adr.node].findPin(adr.pin);
    if ( type == "input" ) {

    } else if ( type == "output" ) {

    } else {

    }
    console.log( adr );
  }
  /*----------------------------------------*/
  this.addNode    = function ( type ) {
    self.nodes.push( new Node( type, nodeID++, box, linkStart ) );
    for ( var i=0; i<( self.nodes.length - 1 ); i++ ) {
      self.nodes[i].reInit();
    }
    return;
  }
  this.addLink    = function ( from, to ) {
    self.links.push( new Link( from, to, linkID++ ) );
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
