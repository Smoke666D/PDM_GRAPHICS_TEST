/*----------------------------------------------------------------------------*/
var lib = require('./nodeLib.js').nodeLib;
var can = require('./can.js');
/*----------------------------------------------------------------------------*/
function Dialog () {
  var self     = this;
  var names    = [];
  var sections = [];
  var settings = new can.Settings();
  this.title   = "";
  this.content = document.createElement( "DIV" );
  this.action  = null;

  function resetSectionsFocus () {
    sections.forEach( function ( frame, i ) {
      if ( frame.isFocus() == true ) {
        settings.get( frame )
        frame.resetFocus();
      }
      return;
    });
    return;
  }

  this.makeExternal = function () {
    self.title             = "Переферийные устройства";
    self.content           = document.createElement( "DIV" );
    lib.getExternal().forEach( function ( device, i ) {
      let index = names.indexOf( device.class );
      if ( index == -1 ) {
        names.push( device.class );
        let sec        = document.createElement( "DIV" );
        let text       = document.createElement( "H5" );
        text.innerHTML = device.class;
        text.className = "none-text";
        sec.appendChild( text );
        sections.push( sec );
        index = names.indexOf( device.class );
      }
      let line          = document.createElement( "DIV" );
      let box           = document.createElement( "LABEL" );
      let checker       = document.createElement( "INPUT" );
      let span          = document.createElement( "SPAN" );
      let label         = document.createElement( "LABEL" );
      line.className    = "row unselect";
      box.className     = "switch";
      checker.type      = "checkbox";
      checker.id        = device.name;
      checker.className = "check-input";
      span.className    = "slider";
      label.htmlFor     = device.name;
      label.className   = "sliderLabel";
      label.innerHTML   = device.name;
      box.appendChild( checker );
      box.appendChild( span );
      line.appendChild( box );
      line.appendChild( label );
      sections[index].appendChild( line );
      return;
    });
    self.content.innerHTML = "";
    sections.forEach( function ( section, i ) {
      self.content.appendChild( section );
      return;
    });
    self.action = function () {
      let out      = [];
      lib.getExternal().forEach( function ( device, i ) {
        let checker = document.getElementById( device.name );
        if ( checker.checked == true ) {
          out.push( device );
        }
        return;
      });
      lib.setupExternal( out );
      return;
    }
    return;
  }
  this.makeCAN      = function () {
    self.title       = "CAN шина";
    self.content     = document.createElement( "DIV" );
    let bar          = document.createElement( "DIV" );
    bar.className    = "row";
    let button       = document.createElement( "BUTTON" );
    button.innerHTML = "+";
    button.className = "small";
    button.addEventListener( 'click', function () {
      let frame       = document.createElement( "DIV" );
      frame.className = "row";
      let cur = sections.length;
      sections.push( new can.Frame( cur, resetSectionsFocus, settings.set ) );
      frame.appendChild( sections[cur].getBox() );
      self.content.appendChild( frame );
    });
    bar.appendChild( button );
    self.content.appendChild( bar );
    self.content.appendChild( settings.draw() );
    self.action = function () {
      return;
    }
    return;
  }
  this.makeMB       = function () {
    self.title             = "ModBUS шина";
    self.content           = document.createElement( "DIV" );
    self.content.innerHTML = "No data!"
    self.action = function () {
      return;
    }
    return;
  }
  return;
}
function Dialogs () {
  var self      = this;
  this.external = new Dialog();
  this.can      = new Dialog();
  this.mb       = new Dialog();
  this.init     = function () {
    self.external.makeExternal();
    self.can.makeCAN();
    self.mb.makeMB();
    return;
  }
  return;
}
function Modal () {
  var self    = this;
  var dialogs = new Dialogs();
  var currant = "ext";
  var title   = document.getElementById( "dialogModal-title" );
  var body    = document.getElementById( "dialogModal-body"  );
  var button  = document.getElementById( "modal-button"      );
  function init () {
    lib.awaitReady( function () {
      dialogs.init();
      button.addEventListener( 'click', function () {
        buttonEvent( currant );
      });
      self.showExternal();
      document.getElementById( "bus-button" ).addEventListener( 'click', function () {
        if ( lib.getSetup().hardware.can == true ) {
          self.showCan();
          $("#dialogModal").modal('toggle');
        } else if ( lib.hardware.mb == true ) {
          self.showMb();
          $("#dialogModal").modal('toggle');
        }
        return;
      });
      return;
    });
    return;
  }
  function clean () {
    title.innerHTML = "";
    body.innerHTML  = "";
    return;
  }
  function buttonEvent ( adr ) {
    switch ( adr ) {
      case "ext":
        dialogs.external.action();
        break;
      case "can":
        dialogs.can.action();
        break;
      case "mb":
        dialogs.mb.action();
        break;
    }
    return;
  }
  function draw ( dialog ) {
    clean();
    title.innerHTML = dialog.title;
    body.appendChild( dialog.content );
    return;
  }

  this.showExternal = function () {
    currant = "ext";
    draw( dialogs.external );
    return;
  }
  this.showCan      = function () {
    currant = "can";
    console.log( currant );
    draw( dialogs.can );
    return;
  }
  this.showMb       = function () {
    currant = "mb";
    draw( dialogs.mb );
    return;
  }

  init();
  return;
}
/*----------------------------------------------------------------------------*/
let dialog = new Modal();
/*----------------------------------------------------------------------------*/
module.exports.dialog = dialog;
