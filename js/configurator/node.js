/*----------------------------------------------------------------------------*/
var Option  = require('./primitives.js').Option;
var NodeAdr = require('./primitives.js').NodeAdr;
var lib     = require('./nodeLib.js').nodeLib;
var Pin     = require('./primitives.js').Pin;
var dialog  = require('./dialog.js').dialog;
/*----------------------------------------------------------------------------*/
var shiftKey = new ShiftKey();
/*----------------------------------------------------------------------------*/
const pinSize      = 10; /*px*/
const pinMountSize = 16; /*px*/
/*----------------------------------------------------------------------------*/
function ShiftKey () {
  var state = false;
  this.set = function () {
    state = true;
  }
  this.reset = function () {
    state = false;
  }
  this.get = function () {
    return state;
  }
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
      self.remove();
      return;
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
function Node ( type, id, box, pinCallback, dragCallback, removeCallback, unlinkCallback, contextMenuCallback, focusCallBack, onInitFinish, options=null ) {
  var self                = this;
  var box                 = box;
  var pinCallback         = pinCallback;
  var dragCallback        = dragCallback;
  var removeCallback      = removeCallback;
  var unlinkCallback      = unlinkCallback;
  var contextMenuCallback = contextMenuCallback;
  var menu                = null;         /* Context menu */
  var menuItems           = [
    {
      "name"     : "отсоеденить",
      "callback" : function () { unlinkCallback( self.id ) },
      "icon"     : "<svg viewBox='0 0 512 512'><path fill='currentColor' d='M304.083 405.907c4.686 4.686 4.686 12.284 0 16.971l-44.674 44.674c-59.263 59.262-155.693 59.266-214.961 0-59.264-59.265-59.264-155.696 0-214.96l44.675-44.675c4.686-4.686 12.284-4.686 16.971 0l39.598 39.598c4.686 4.686 4.686 12.284 0 16.971l-44.675 44.674c-28.072 28.073-28.072 73.75 0 101.823 28.072 28.072 73.75 28.073 101.824 0l44.674-44.674c4.686-4.686 12.284-4.686 16.971 0l39.597 39.598zm-56.568-260.216c4.686 4.686 12.284 4.686 16.971 0l44.674-44.674c28.072-28.075 73.75-28.073 101.824 0 28.072 28.073 28.072 73.75 0 101.823l-44.675 44.674c-4.686 4.686-4.686 12.284 0 16.971l39.598 39.598c4.686 4.686 12.284 4.686 16.971 0l44.675-44.675c59.265-59.265 59.265-155.695 0-214.96-59.266-59.264-155.695-59.264-214.961 0l-44.674 44.674c-4.686 4.686-4.686 12.284 0 16.971l39.597 39.598zm234.828 359.28l22.627-22.627c9.373-9.373 9.373-24.569 0-33.941L63.598 7.029c-9.373-9.373-24.569-9.373-33.941 0L7.029 29.657c-9.373 9.373-9.373 24.569 0 33.941l441.373 441.373c9.373 9.372 24.569 9.372 33.941 0z'></path></svg>"
    },{
      "name"     : "удалить",
      "callback" : function () { removeCallback( self.id ); },
      "icon"     : "<svg viewBox='0 0 448 512'><path fill='currentColor' d='M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z'></path></svg>"
    }
  ];
  var height              = 0;
  var width               = 0;
  var short               = "";
  var body                = null;
  var dragFlag            = false;
  var help                = "";
  var init                = new Init();
  /*----------------------------------------*/
  this.id      = id;          /* ID number of node               */
  this.name    = "";          /* Name of the node                */
  this.type    = type;        /* Function type of node           */
  this.inputs  = [];          /* Array of inputs pins            */
  this.outputs = [];          /* Array of outputs pins           */
  this.x       = 0;           /* Left coordinate in mesh         */
  this.y       = 0;           /* Top coordinate in mesh          */
  this.obj     = null;        /* DOM object of node              */
  this.header  = null;        /* DOM of header in Node body      */
  this.shift   = 0;           /* Top shift in parent of node box */
  this.options = [];          /* Options of the node             */
  this.focus   = new Focus(); /* Is node in focus                */
  this.get     = new Get();
  this.set     = new Set();
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
      cX         = e.clientX;
      cY         = e.clientY;
      startX     = cX;
      startY     = cY;
      shadowX    = self.x;
      shadowY    = self.y;
      meshBorder = mesh.getBorders( shadowX, shadowY );
      mesh.moveShadow( self.x, self.y );
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
      self.move( shadowX, shadowY );
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
  function Get () {
    this.pinType   = function ( n ) {
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
    this.pinData   = function ( n ) {
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
    this.pinState  = function ( n ) {
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
    this.pinObject = function ( n ) {
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
    this.pinExpand = function ( n ) {
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
    this.pinLink   = function ( n ) {
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
    this.links     = function () {
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
    this.options   = function () {
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
    this.help      = function () {
      let out       = document.createElement( "DIV" );
      let txt       = document.createElement( "A" );
      out.className = "pr-2 pl-2";
      txt.innerHTML = help;
      out.appendChild( txt );
      return out;
    }
  }
  function Set () {
    this.pinsAvailable   = function ( type, data ) {
      for ( var i=0; i<self.inputs.length; i++ ) {
        self.inputs[i].set.available( type, data );
      }
      for ( var i=0; i<self.outputs.length; i++ ) {
        self.outputs[i].set.available( type, data );
      }
      return;
    }
    this.pinsInProgress  = function ( n ) {
      self.inputs.forEach( function ( input, i ) {
        if ( input.id == n ) {
          input.set.from();
        }
        return;
      });
      self.outputs.forEach( function ( output, i ) {
        if ( output.id == n ) {
          output.set.from();
        }
      });
      return;
    }
    this.pinConnected    = function ( n, link ) {
      let find = false;
      for ( var i=0; i<self.inputs.length; i++ ) {
        if ( self.inputs[i].id == n ) {
          self.inputs[i].set.connected( link );
          find = true;
          break;
        }
      }
      if ( find == false ) {
        for ( var i=0; i<self.outputs.length; i++ ) {
          if ( self.outputs[i].id == n ) {
            self.outputs[i].set.connected( link );
            find = true;
            break;
          }
        }
      }
      return;
    }
    this.option          = function ( n, value ) {
      if ( typeof( n ) == 'number' ) {
        if ( n <= self.options.length ) {
          self.options[n].value = value;
        } else {
          console.log( "Wrong option address" );
        }
      } else {
        console.log( "Wrong n type");
      }
      return;
    }
  }
  function Focus () {
    this.state = false;
    this.set   = function ( add = false ) {
      self.state = true;
      body.classList.add( "focus" );
      focusCallBack( self.id, add );
      return;
    }
    this.reset = function () {
      self.state = false;
      body.classList.remove( "focus" );
      return;
    }
  }
  function Init () {
    this.drag    = function () {
      let drag = new Drag();
      return;
    }
    this.pins    = function () {
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
        self.inputs[i].set.mount( inPort.children[i] );
        self.inputs[i].set.pin( inPort.children[i].children[0] );
        inPort.children[i].children[0].addEventListener( 'click', ( function () {
          var j = i;
          return function () {
            let adr = new NodeAdr( self.id, self.inputs[j].id );
            pinCallback( adr );
          }
        })());
      }
      for ( var i=0; i<self.outputs.length; i++ ) {
        self.outputs[i].set.mount( outPort.children[i] );
        self.outputs[i].set.pin( outPort.children[i].children[0] );
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
    this.click   = function () {
      for ( var i=0; i<self.obj.children.length; i++ ) {
        if ( self.obj.children[i].className == "body" ) {
          self.obj.children[i].addEventListener( 'click', function () {
            if ( dragFlag == false ) {
              if ( self.focus.status == false ) {
                self.focus.set( shiftKey.get() );
              }
            } else {
              dragFlag   = false;
              if ( self.focus.state == false ) {
                self.focus.set( false );
              }
            }
            return;
          });
        }
      }
      return;
    }
    this.context = function () {
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
    this.dialog  = function ( callback ) {
      function getType () {
        let type = "byte";
        self.options.forEach( function ( option ) {
          if ( option.name == "type" ) {
            type = option.value;
          }
        });
        return type;
      }
      let res  = null;
      let adr  = null;
      let type = null;
      self.options.forEach( function ( option, i ) {
        if ( option.name == "adr" ) {
          switch ( option.select ) {
            case "canAdr":
              res = "can";
              adr = option.value;
              break;
          } 
        }
        if ( option.name == "type" ) {
          type = option.value;
        }
      });
      if ( res != null ) {
        switch ( res ) {
          case "can" :
            dialog.addCanChunk( self.id, getType, type, callback, adr );
            break;
        }
      } else { 
        callback();
      } 
      return;
    }
    this.tooltip = function () {
      self.options.forEach( function ( option, i ) {
        if ( option.name == "userString" ) {
          self.obj.setAttribute( 'data-toggle', 'tooltip' );
          self.obj.title = option.value;
        }
        return;
      });
      return;
    }
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
      self.options.push( new Option( option, self.id, function() {self.update()} ) );
      if ( options != null ) {
        self.options[i].value = options[i].value;
      }
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
  function draw () {
    let pinCounter    = 0;
    /*--------------- NODE ---------------*/
    self.obj            = document.createElement( "DIV" );
    self.obj.id         = 'node' + self.id;
    self.obj.className  = 'node';
    /*------------ INPUT PORT ------------*/
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
      if ( self.inputs[i].data == "null" ) {
        mount.style.visibility='hidden';
        pin.style.visibility='hidden';        
      }
      mount.appendChild( pin );
      inputPort.appendChild( mount );
      $( pin ).tooltip( {
        'placement' : 'top',
        'trigger'   : 'hover',
      });
    }
    /*--------------- BODY ---------------*/
    body                  = document.createElement("DIV");
    body.className        = 'body';
    self.header           = document.createElement("A");
    self.header.innerHTML = short;
    body.appendChild( self.header );
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
  /* Callback - is finish of initilization */
  function startInit ( callback ) {
    self.focus.status = false;
    makeNode( self.type );   /* Get data from library */
    draw();                  /* Draw UI of Node       */
    setSize();               /* Set size of tje box   */
    self.move();             /* Move node box in mesh */
    init.drag();             /* Init drag and drop    */
    init.pins();             /* Draw pins PU          */
    show();                  /* Show UI readynode box */
    init.click();            /* Add clixk events      */
    init.context();          /* Add context menu      */
    init.tooltip();          /* Add tooltip of Node   */
    init.dialog( callback ); /* Add chunks in dialogs */
    return;
  }
  /*----------------------------------------*/
  this.update             = function () {
    self.options.forEach( function ( option, i ) {
      switch( option.name ) {
        case "userString":
          self.obj.title = option.value;
          break;
        case "pointer":
          self.header.innerHTML = "P" + option.value;  
          break;
        case "label":
          self.header.innerHTML = option.value;  
          break;
      }
      return;
    });
    return;
  }
  this.reInit             = function () {
    init.drag();
  }
  this.move               = function ( x=null, y=null ) {
    if ( ( x != null ) && ( typeof( x ) == 'number' ) ) {
      self.x = x;
    }
    if ( ( y != null ) && ( typeof( y ) == 'number' ) ) {
      self.y = y;
    }
    pos = mesh.getPosition( self.x, self.y );
    self.obj.style.left = pos.x + "px";
    self.obj.style.top  = pos.y + "px";
    return;
  }
  this.resetPinsAvailable = function () {
    self.inputs.forEach( function ( input ) {
      input.reset.available();
    });
    self.outputs.forEach( function ( output ) {
      output.reset.available();
    });
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
  startInit( onInitFinish );
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.Node     = Node;
module.exports.shiftKey = shiftKey;
/*----------------------------------------------------------------------------*/