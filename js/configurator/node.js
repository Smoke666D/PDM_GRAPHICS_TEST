/*----------------------------------------------------------------------------*/
var Option  = require('./primitives.js').Option;
var NodeAdr = require('./primitives.js').NodeAdr;
var lib     = require('./nodeLib.js').nodeLib;
var Pin     = require('./primitives.js').Pin;
var dialog  = require('./dialog.js').dialog;
/*----------------------------------------------------------------------------*/
const pinSize      = 10; /*px*/
const pinMountSize = 16; /*px*/
/*----------------------------------------------------------------------------*/
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
function Node ( type, id, box, pinCallback, dragCallback, removeCallback, contextMenuCallback, focusCallBack ) {
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
  var dragFlag            = false;
  var help                = "";
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
  this.options = [];    /* Options of the node             */
  /*----------------------------------------*/
  function Drag () {
    var dX         = 0;
    var dY         = 0;
    var cX         = 0;
    var cY         = 0;
    var startX     = 0;
    var startY     = 0;
    var shadowX    = self.x;
    var shadowY    = self.y;
    var meshBorder = mesh.getBorders( self.x, self.y );
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
      dragCallback( self.id );
      mesh.hideShadow();
      if ( ( cX != startX ) || ( cY != startY ) ) {
        startX   = cX;
        startY   = cY;
        dragFlag = true;
      }
      return;
    }
    /*----------------------------------------*/
    if ( body ) {
      body.onmousedown     = dragStart;
    } else {
      self.obj.onmousedown = dragStart;
    }
    return;
  }
  /*----------------------------------------*/
  function makeNode ( type ) {
    let data  = lib.getNodeRecord( type );
    let pinID = 0;
    let wN    = 0;
    help = data.help;
    self.inputs  = [];
    self.outputs = [];
    self.options = [];
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
    data.inputs.forEach( function ( input, i ) {
      self.inputs.push( new Pin( pinID++, "input", input ) );
      return;
    });
    data.outputs.forEach( function ( output, i ) {
      self.outputs.push( new Pin( pinID++, "output", output ) );
      return;
    });
    data.options.forEach( function ( option, i) {
      self.options.push( new Option( option, self.id  ) );
      return;
    });
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
    /*--------------- NODE ---------------*/
    self.obj            = document.createElement( "DIV" );
    self.obj.id         = 'node' + self.id;
    self.obj.className  = 'node';
    /*------------ INPUT PORT ------------*/
    //expandGroupSize
    let inputPort       = document.createElement("DIV");
    inputPort.className = 'port input';
    for ( var i=0; i<self.inputs.length; i++ ) {
      let mount                = document.createElement("DIV");
      mount.id                 = 'mount' + pinCounter;
      mount.className          = 'mount';
      mount.style.height       = pinMountSize + "px";
      mount.style.width        = pinMountSize + "px";
      mount.style.borderRadius = pinMountSize + "px";
      mount.style.marginLeft   = ( mesh.getBaseWidth() - pinMountSize ) / 2 + "px";
      mount.style.marginRight  = mount.style.marginLeft;
      let pin                  = document.createElement("DIV");
      pin.id                   = 'pin' + pinCounter;
      pin.className            = 'pin ' + self.inputs[i].data;
      pin.style.height         = pinSize + "px";
      pin.style.width          = pinSize + "px";
      pin.style.borderRadius   = pinSize + "px";
      pin.title                = self.inputs[i].help;
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
      self.outputs[i].setMount( outPort.children[i] );
      self.outputs[i].setPin( outPort.children[i].children[0] );
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
          if ( dragFlag == false ) {
            self.focus = !self.focus;
            if ( self.focus == true ) {
              self.setFocus();
            } else {
              self.resetFocus();
            }
          } else {
            dragFlag   = false;
            if ( self.focus == false ) {
              self.setFocus();
            }
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
  function dialogInit () {
    function getType () {
      let type = "byte";
      self.options.forEach( function ( option, i ) {
        if ( option.name == "type" ) {
          type = option.value;
        }
      });
      return type;
    }
    let res = null;
    self.options.forEach( function ( option, i ) {
      if ( option.name == "adr" ) {
        switch ( option.select ) {
          case "canAdr":
            res = "can";
            break;
       } 
      }
    });
    if ( res != null ) {
      switch ( res ) {
        case "can" :
          dialog.addCanChunk( self.id, getType );
          break;
      }
    } 
    return;
  }
  function init ( type, id, box ) {
    makeNode( self.type ); /* Get data from library */
    draw();                /* Draw UI of Node       */
    setSize();             /* Set size of tje box   */
    move();                /* Move node box in mesh */
    dragInit();            /* Init drag and drop    */
    pinsInit();            /* Draw pins PU          */
    show();                /* Show UI readynode box */
    clickInit();           /* Add clixk events      */
    contextInit();         /* Add context menu      */
    dialogInit();          /* Add chunks in dialogs */
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
    self.inputs.forEach( function ( input, i ) {
      if ( input.id == n ) {
        input.setFrom();
      }
      return;
    });
    self.outputs.forEach( function ( output, i ) {
      if ( output.id == n ) {
        output.setFrom();
      }
    });
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
    focusCallBack( self.id );
    return;
  }
  this.resetFocus         = function () {
    self.focus = false;
    body.classList.remove( "focus" );
    return;
  }
  this.getOptions         = function () {
    let out = [];
    self.options.forEach( function ( option, i ) {
      let pin = null;
      if ( self.outputs.length > 0 ) {
        pin = self.outputs[0];
      } else if ( self.inputs.length > 0 ) {
        pin = self.inputs[0];
      }
      out.push( option.getBox( pin ) );
    });
    return out;
  }
  this.getHelp            = function () {
    let out       = document.createElement( "DIV" );
    let txt       = document.createElement( "A" );
    out.className = "pr-2 pl-2";
    txt.innerHTML = help;
    out.appendChild( txt );
    return out;
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
  this.save               = function () {
    let opt = [];
    self.options.forEach( function ( option, i ) {
      opt.push( {"value" : option.value} );
      return;
    });
    return {
      'id'      : self.id,
      'name'    : self.name,
      'options' : opt,
      'x'       : self.x,
      'y'       : self.y
    };
  }
  /*----------------------------------------*/
  init ( type, id, box );
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Node = Node;
/*----------------------------------------------------------------------------*/