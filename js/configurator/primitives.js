/*----------------------------------------------------------------------------*/
var nodeLib = require('./nodeLib.js');
/*----------------------------------------------------------------------------*/
function NodeAdr () {
  var self  = this;
  this.node = 0;
  this.pin  = 0;
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
function Pin () {
  var self = this;
  /*----------------------------------------*/
  this.id         = 0;       /* ID number, unique in same node */
  this.type       = "none";  /* Input or Output or None */
  this.data       = "none";  /* Bool or Float or String */
  this.linked     = false;   /* Is Pin connected to outher pin */
  this.linkedWith = 0;       /* ID of the Link */
  /*----------------------------------------*/
  this.init = function ( id, type, data ) {
    self.id         = id;
    self.type       = type;
    self.data       = data;
    self.linked     = false;
    self.linkedWith = 0;
    return;
  }
  this.setConnected = function ( id ) {
    self.linked     = true;
    self.linkedWith = id;
    return;
  }
  this.setDisconnected = function () {
    self.linked = false;
    return;
  }
  /*----------------------------------------*/
  return;
}
function Node ( type, id ) {
  var self   = this;
  /*----------------------------------------*/
  this.id     = 0;  /*  */
  this.type   = 0;
  this.input  = [];
  this.output = [];
  this.x      = 0;
  this.y      = 0;
  this.width  = 0;
  this.height = 0;
  /*----------------------------------------*/
  function makeNode ( type ) {
    let data  = nodeLib.getNodeRecord( type );
    let pinID = 0;
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
  /*----------------------------------------*/
  this.init     = function ( type, id ) {
    self.id   = id;
    self.type = type;
    makeNode( self.type );
    return;
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
  this.init ( type, id );
  return;
}
function Scheme ( box ) {
  var self   = this;
  var nodeID = 0;
  var linkID = 0;
  /*----------------------------------------*/
  this.nodes = [];
  this.links = [];
  this.box   = null;
  /*----------------------------------------*/
  function delNode ( id ) {
    for ( var i=id+1; i<self.nodes.length; i++ ) {
      self.nodes[i].id--;
    }
    self.nodes[id].delete();
    self.nodes.splice( id, 1 );
    nodeID--;
  }
  /*----------------------------------------*/
  this.init       = function ( box ) {
    self.box = box;
    return;
  }
  this.addNode    = function ( type ) {
    self.nodes.push( new Node( type, nodeID++ ) );
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
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Node   = Node;
module.exports.Link   = Link;
module.exports.Pin    = Pin;
module.exports.Scheme = Scheme;
/*----------------------------------------------------------------------------*/
