/*----------------------------------------------------------------------------*/
var dialog  = require('./dialog.js').dialog;
var lib     = require('./nodeLib.js').nodeLib;
var Node    = require('./node.js').Node;
var Link    = require('./primitives.js').Link;
var Help    = require('./primitives.js').Help;
var Device  = require('./primitives.js').Device;
var Option  = require('./primitives.js').Option;
var NodeAdr = require('./primitives.js').NodeAdr;
/*----------------------------------------------------------------------------*/
const scaleStep       = 0.1;
const scaleMax        = 3;
const scaleMin        = 0.5;
/*----------------------------------------------------------------------------*/
function Scheme ( id ) {
  var self     = this;
  var nodeID   = 0;             /* Counter for nodes          */
  var linkID   = 0;             /* Counter for links          */
  var state    = "idle";        /* State of scheme            */
  var prevAdr  = new NodeAdr(); /* Previus pin for connecting */
  var prevLink = null;          /* Link number for changing   */
  var scale    = 1;             /* Scale of zooming           */
  /*----------------------------------------*/
  var helpFild    = document.getElementById( "content-help" );
  var optionsFild = document.getElementById( "content-options" );
  /*----------------------------------------*/
  this.id      = 0;    /* ID number of scheme     */
  this.nodes   = [];   /* Nodes of scheme         */
  this.links   = [];   /* Links of scheme         */
  this.options = [];   /* Options of the scheme   */
  this.help    = "";   /* Help string for options */
  this.box     = null; /* Scheme element in DOM   */
  this.inFocus = null; /* Array of focus elements */
  this.device  = null; /* Data of the device      */
  /*----------------------------------------*/
  function awaitReady ( callback ) {
    setTimeout( function() {
      if ( lib.getStatus() == true ) {
        callback();
      } else {
        awaitReady( callback );
      }
    }, 10 );
    return;
  }
  function onChangeInDialog ( id, frame, chunck ) {
    self.nodes[id].options[1].value.frame  = frame;
    self.nodes[id].options[1].value.chunck = chunck;
    return;
  }
  function init ( id ) {
    dialog.initOnChange( onChangeInDialog );
    awaitReady( function () {
      self.id      = id;
      self.box     = document.getElementById( 'scheme' );
      lib.getSetup().options.forEach( function ( data, i ) {
        self.options.push( new Option( data, null ) );
        return;
      });
      self.help   = new Help( lib.getSetup().help );
      self.device = new Device();
      showSchemeOptions();
      showSchemeHelp();
      return;
    });
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
    return;
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
  function cleanHelpFild () {
    helpFild.innerHTML = "";
    return;
  }
  function cleanOptionsFild () {
    optionsFild.innerHTML = "";
    return;
  }
  function showSchemeHelp () {
    cleanHelpFild();
    helpFild.appendChild( self.help.getBox( null ) );
    return;
  }
  function showSchemeOptions () {
    cleanOptionsFild();
    self.options.forEach( function( option, i ) {
      optionsFild.appendChild( option.getBox( null ) );
      return;
    });
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
  function onNodeFocus ( adr ) {
    self.inFocus = adr;
    cleanOptionsFild();
    cleanHelpFild();
    self.nodes[adr].getOptions().forEach( function( option, i) {
      optionsFild.appendChild( option );
      return;
    });
    helpFild.appendChild( self.nodes[adr].getHelp() );
    self.nodes.forEach( function ( node, i ) {
      if ( i != adr ) {
        node.resetFocus();
      }
      return;
    });
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
    self.nodes.push( new Node( type, nodeID++, self.box, linkStart, afterDrag, beforNodeRemove, beforContextMenu, onNodeFocus ) );
    self.nodes[nodeID - 1].setFocus();
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
  this.removeNode    = function ( id ) {
    if ( id <= self.nodes.length ) {
      removeLinksOfNode( id );
      removeNode( id );
      self.resetFocus();
    }
    return;
  }
  this.removeInFocus = function () {
    self.removeNode( self.inFocus );
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
    self.inFocus = null;
    showSchemeHelp();
    showSchemeOptions();
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
  this.save          = function () {
    function SaveData () {
      this.device  = {};
      this.nodes   = [];
      this.links   = [];
    }
    let data    = new SaveData();    
    data.device = self.device.save();
    self.nodes.forEach( function ( node, i ) {
      data.nodes.push( node.save() );
      return;
    });
    self.links.forEach( function ( link, i ) {
      data.links.push( link.save() );
      return;
    });
    return data;
  }
  this.load          = function ( data ) {

    return;
  }
  /*----------------------------------------*/
  init( id );
  /*----------------------------------------*/
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Scheme = Scheme;
/*----------------------------------------------------------------------------*/
