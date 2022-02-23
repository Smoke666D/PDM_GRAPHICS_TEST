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
function Scheme ( id ) {
  var self     = this;
  var nodeID   = 0;             /* Counter for nodes                 */
  var linkID   = 0;             /* Counter for links                 */
  var state    = "idle";        /* State of scheme ( idle, connect ) */
  var prevAdr  = new NodeAdr(); /* Previus pin for connecting        */
  var prevLink = null;          /* Link number for changing          */
  /*----------------------------------------*/
  var helpFild    = document.getElementById( "content-help" );
  var optionsFild = document.getElementById( "content-options" );
  /*----------------------------------------*/
  this.id      = 0;           /* ID number of scheme      */
  this.nodes   = [];          /* Nodes of scheme          */
  this.links   = [];          /* Links of scheme          */
  this.options = [];          /* Options of the scheme    */
  this.help    = "";          /* Help string for options  */
  this.box     = null;        /* Scheme element in DOM    */
  this.device  = null;        /* Data of the device       */
  this.zoom    = new Zoom();  /* Zoom operations          */
  this.focus   = new Focus(); /* Focus elements structure */
  /*----------------------------------------*/
  function Zoom () {
    var   scale     = 1;   /* Scale of zooming */
    const scaleStep = 0.1;
    const scaleMax  = 3;
    const scaleMin  = 0.5;
    function calc () {
      transformOrigin = [0, 0];
      const p       = ["webkit", "moz", "ms", "o"];
      var   s       = "scale(" + scale + ")";
      var   oString = ( transfoyarnrmOrigin[0] * 100) + "% " + ( transformOrigin[1] * 100 ) + "%";
      p.forEach( function ( pp ) {
        self.box.style[pp + "Transform"]       = s;
        self.box.style[pp + "TransformOrigin"] = oString;
        return;
      });
      self.box.style["transform"]       = s;
      self.box.style["transformOrigin"] = oString;
      self.links.forEach( function ( link ) {
        link.draw();
        return;
      });
      return;
    }
    this.in    = function () {
      if ( scale < scaleMax ) {
        scale += scaleStep;
      }
      calc();
      return;
    }
    this.reset = function () {
      scale = 1;
      calc();
      return;
    }
    this.out   = function () {
      if ( scale > scaleMin ) {
        scale -= scaleStep;
      }
      calc();
      return;
    }
  }
  function Focus () {
    var self      = this;
    this.elements = [];
    this.add      = function ( id ) {
      var exist = false;
      self.elements.forEach( function ( element ) {
        if ( element == id ) {
          exist = true;
        }
        return;
      });
      if ( exist == false ) {
        self.elements.push( id );
      }
      return;
    }
    this.set      = function ( id ) {
      self.elements.length = 0;
      self.elements.push( id );
      return;
    }
    this.remove   = function ( id ) {
      let mark = null;
      self.elements.forEach( function ( element, i ) {
        if ( element == id ) {
          mark = i;
        }
      });
      if ( mark != null ) {
        for ( i=mark; i<(self.elements.length - 1); i++ ) {
          self.elements[i] = self.elements[i + 1];
        }
        self.elements.length--;
      }
      return;
    }
    this.reset    = function () {
      self.elements.length = 0;
      return;
    }
    this.is       = function ( id ) {
      let res = false;
      self.elements.forEach( function ( element ) {
        if ( element == id ) {
          res = true;
        }
      });
      return res;
    }
    this.do       = function ( callback ) {
      self.elements.forEach( function ( element ) {
        callback( element );
      });
      return;
    }
    this.last     = function () {
      let res = null;
      if ( self.elements.length > 0 ) {
        res = self.elements[self.elements.length - 1];
      }
      return res;
    }
    return;
  }
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
          self.nodes[i].set.pinsInProgress( adr.pin );
        } else {
          self.nodes[i].set.pinsAvailable( "output", data );
        }
      }
    } else if ( type == "output" ) {
      for ( var i=0; i<self.nodes.length; i++ ) {
        if ( i == adr.node ) {
          self.nodes[i].set.pinsInProgress( adr.pin );
        } else {
          self.nodes[i].set.pinsAvailable( "input", data );
        }
      }
    } else {

    }
  }
  function resetPinsAvailable () {
    self.nodes.forEach( function ( node ) {
      node.resetPinsAvailable();
      return;
    });
    return;
  }
  function getPinObject ( adr ) {
    let res = null;
    if ( adr.node < self.nodes.length ) {
      res = self.nodes[adr.node].get.pinObject( adr.pin );
    }
    return res;
  }
  function getPinData ( adr ) {
    let res = null;
    if ( adr.node < self.nodes.length ) {
      res = self.nodes[adr.node].get.pinData( adr.pin );
    }
    return res;
  }
  function removeLinksOfNode ( adr ) {
    for ( var i=0; i<self.links.length; i++ ) {
      if ( ( self.links[i].from.node == adr ) || ( self.links[i].to.node == adr ) ) {
        self.removeLink( self.links[i].id );
        break;
      }
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
    let type = self.nodes[adr.node].get.pinType( adr.pin );
    let data = self.nodes[adr.node].get.pinData( adr.pin );
    let link = self.nodes[adr.node].get.pinLink( adr.pin );
    switch ( state ) {
      case "idle":
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
        if ( ( ( self.nodes[adr.node].get.pinType( adr.pin ) == self.nodes[prevAdr.node].get.pinType( prevAdr.pin ) ) ) ||
             ( adr.node == prevAdr.node ) ) {
          resetPinsAvailable();                                             /* Reset connection operation */
          prevAdr = adr;
          if ( type == "output" ) {             /* If output - use previus link */
            prevLink = null;
          } else {
            prevLink = self.nodes[adr.node].get.pinLink( adr.pin );
          }
          setPinsAvailable( adr, type, data );  /* Show available for connection pins */
        } else {
          if ( ( adr.node == prevAdr.node ) && ( adr.pin == prevAdr.pin ) ) { /* Click to same pin */
            resetPinsAvailable();                                             /* Reset connection operation */
            state = "idle";
          } else {
            
            if ( self.nodes[adr.node].get.pinState( adr.pin ) == "available" ) {
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
  function onNodeFocus ( adr, add=false ) {
    if ( add == false ) {
      self.focus.set( adr );
    } else {
      self.focus.add( adr );
    }
    cleanOptionsFild();
    cleanHelpFild();
    self.nodes[adr].get.options().forEach( function( option, i) {
      optionsFild.appendChild( option );
      return;
    });
    helpFild.appendChild( self.nodes[adr].get.help() );
    if ( add == false ) {
      self.nodes.forEach( function ( node, i ) {
        if ( i != adr ) {
          node.focus.reset();
        }
        return;
      });
    }
    return;
  }
  function beforNodeRemove ( adr ) {
    self.removeNode( adr );
    return;
  }
  function onNodeUnlink ( adr ) {
    removeLinksOfNode( adr );
    return;
  }
  function beforContextMenu ( adr ) {
    for ( var i=0; i<self.nodes.length; i++ ) {
      self.nodes[i].closeMenu();
    }
    return;
  }
  /*----------------------------------------*/
  this.clean         = function () {
    self.resetFocus();
    self.links.forEach( function ( link ) {
      link.remove();
      return;
    });
    self.links = [];
    self.nodes.forEach( function ( node ) {
      node.remove();
      return;
    });
    self.nodes = [];
    return
  }
  this.redraw        = function () {
    for ( var i=0; i<self.links.length; i++ ) {
      self.links[i].draw();
    }
    return;
  }
  this.addNode       = function ( type, onFinish, options=null ) {
    self.nodes.push( new Node( type, nodeID++, self.box, linkStart, afterDrag, beforNodeRemove, onNodeUnlink, beforContextMenu, onNodeFocus, onFinish, options ) );
    self.nodes[nodeID - 1].focus.set();
    return;
  }
  this.addLink       = function ( from, to ) {
    let currentID = 0;
    let start     = getPinObject( from );
    let end       = getPinObject(  to  );
    if ( ( start != null ) && ( end != null ) ) {
      if ( prevLink == null ) {
        currentID = linkID++;
        self.links.push( new Link( from, to, start, end, getPinData( from ), currentID ) );
      } else {
        currentID = prevLink[0];
        self.links[currentID].setFrom( from, start );
      }
      self.nodes[from.node].set.pinConnected( from.pin, id );
      self.nodes[to.node].set.pinConnected( to.pin, id );
    } else {
      console.log( "error on link: " + from.node + " to " + to.node );
    }
    return;
  }
  this.removeLink    = function ( id ) {
    let to   = self.links[id].to;
    let from = self.links[id].from;
    self.nodes[to.node].inputs[to.pin].set.disconnected();
    self.nodes[from.node].outputs[to.pin].set.disconnected();
    for ( var i=id+1; i<self.links.length; i++ ) {
      self.links[i].id--;
    }
    self.links[id].remove();
    self.links.splice( id, 1 );
    linkID--;
    return;
  }
  this.removeNode    = function ( id ) {
    if ( id <= self.nodes.length ) {
      removeLinksOfNode( id );
      removeNode( id );
      if ( self.focus.elements.length == 0 ) {
        self.resetFocus();
      }
    }
    return;
  }
  this.removeInFocus = function () {
    self.focus.do( function ( adr ) {
      self.removeNode( adr );
      return;
    });
    self.focus.reset();
    self.resetFocus();
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
    self.focus.reset();
    showSchemeHelp();
    showSchemeOptions();
    for ( var i=0; i<self.nodes.length; i++ ) {
      self.nodes[i].focus.reset();
    }
    return;
  }
  this.getData       = function () {
    self.links.forEach( function( link, i ) {
      link.getData();
    });

    return;
  }
  this.unlink        = function () {
    if ( self.focus.last() == null ) {
      self.nodes.forEach( function ( node ) {
        removeLinksOfNode( node.id );
      });
    } else {
      self.focus.do( function ( id ) {
        removeLinksOfNode( id );
      });
    }
    return;
  }
  this.cancel        = function () {
    if ( state == "connect" ) {
      resetPinsAvailable();
      state = "idle";
    } else {
      self.resetFocus();
    }
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
    self.nodes.forEach( function ( node ) {
      data.nodes.push( node.save() );
      return;
    });
    self.links.forEach( function ( link ) {
      data.links.push( link.save() );
      return;
    });
    return data;
  }
  this.load          = function ( data ) {
    let checker      = true;
    const schemeKeys = ["device", "nodes", "links"];
    const nodeKeys   = ["id", "name", "options", "x", "y"];
    const linkKeys   = ["id", "from", "to"];
    function check ( data0, data1 ) {
      var res  = true;
      data0.forEach( function ( key0 ) {
        let checker = false;
        data1.forEach( function ( nKey1 ) {
          if ( nKey1 == key0 ) {
            checker = true;
          }
        });
        if ( checker == false ) {
          res = false;
        }
      });
      return res;
    }

    checker = check( Object.keys( data ), schemeKeys );
    if ( checker == true ) {
      checker = self.device.check( data.device );
      if ( checker == true ) {
        data.nodes.forEach( function ( node ) {
          if ( check( Object.keys( node ), nodeKeys ) == false ) {
            checker = false
          }
          return;
        });
        if ( checker == true ) {
          data.links.forEach( function ( link ) {
            if ( check( Object.keys( link ), linkKeys ) == false ) {
              checker = false;
            }
            return;
          });
          if ( checker == true ) {
            self.clean();
            self.device.load( data.device );

            data.nodes.forEach( function ( node ) {
              self.addNode( lib.getTypeByName( node.name ), function() { }, node.options );
              self.nodes[nodeID - 1].move( node.x, node.y );
              self.nodes[nodeID - 1].update();
            });
            data.links.forEach( function ( link ) {
              self.addLink( link.from, link.to );
            });
          } else {
            console.log( "Wrong file structure. Link section error" );  
          }
        } else {
          console.log( "Wrong file structure. Node section error" );  
        }
      } else {
        console.log( "Wrong file structure. Device section error" );  
      }  
    } else {
      console.log( "Wrong file structure" );
    }
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
