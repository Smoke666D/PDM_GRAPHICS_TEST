/*----------------------------------------------------------------------------*/
var lib = require('./nodeLib.js').nodeLib;
/*----------------------------------------------------------------------------*/
function Dialog () {
  var self     = this;
  var names    = [];
  var sections = [];
  this.title   = "";
  this.content = document.createElement( "DIV" );

  this.makeExternal = function ()  {
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
    return;
  }
  this.makeCAN = function () {
    self.title             = "CAN шина";
    self.content           = document.createElement( "DIV" );
    self.content.innerHTML = "No data!"
    return;
  }
  this.makeMB  = function () {
    self.title             = "ModBUS шина";
    self.content           = document.createElement( "DIV" );
    self.content.innerHTML = "No data!"
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
  var title   = document.getElementById( "dialogModal-title" );
  var body    = document.getElementById( "dialogModal-body"  );
  function init () {
    lib.awaitReady( function () {
      dialogs.init();
      self.showExternal();
    });
    return;
  }
  function clean () {
    title.innerHTML = "";
    body.innerHTML  = "";
    return;
  }
  function draw ( dialog ) {
    clean();
    title.innerHTML = dialog.title;
    body.appendChild( dialog.content );
    return;
  }

  this.showExternal = function () {
    draw( dialogs.external );
    return;
  }

  init();
  return;
}
/*----------------------------------------------------------------------------*/
let modal = new Modal();
