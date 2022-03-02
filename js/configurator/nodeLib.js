/*----------------------------------------------------------------------------*/
const fs = require('fs');
/*----------------------------------------------------------------------------*/
const typePriority = ["variable",  "logic",   "timers",  "math",       "loops", "inputs", "outputs"];
const typeNames    = ["Переменные", "Логика", "Таймеры", "Математика", "Циклы", "Входы",  "Выходы" ];
const setupKeys    = ["nodNumber", "hardware", "compiler", "help", "options", "availableNods"];
/*----------------------------------------------------------------------------*/
function portRecord () {
  var self    = this;
  this.type   = "input";
  this.help   = "";
  this.expand = false;
  return;
}
function NodeSection ( key, name ) {
  var self     = this;
  this.key     = key;
  this.name    = name;
  this.records = [];
}
function Hardware () {
  var self  = this;
  this.din  = 0;
  this.dout = 0;
  this.ain  = 0;
  this.aout = 0;
  this.sw   = 0;
  this.led  = 0;
  return;
}
function NodeLib () {
  var self     = this;
  var ready    = false; /* Status of library         */
  var setup    = null;  /* Setup of current device   */
  var records  = [];    /* Records of the nodes data */
  var sections = [];    /* Node data by the sections */
  var external = [];    /* External devices list     */
  var usedExt  = [];    /* Used external device list */
  var hardware = new Hardware();
  /*----------------------------------------*/
  /*----------------------------------------*/
  function checkSetupFile ( callback ) {
    let checker = 0;
    setupKeys.forEach( function ( key, i ) {
      if ( Object.keys( setup ).indexOf( key ) >= 0 ) {
        checker++;
      }
    });
    if ( checker == Object.keys( setup ).length ) {
      callback();
    } else {
      console.log( "Wrong setup file!" );
    }
    return;
  }
  function getSetupFile ( callback ) {
    setup = null;
    try {
      setup = JSON.parse( fs.readFileSync( ( process.cwd() + "\\system\\setup.json" ), "utf8" ) );
      callback();
    } catch (e) {
      console.log( "error on parsing setup file" );
    }
    return;
  }
  function isNodeAvailable ( name ) {
    let res = false;
    if ( setup.availableNods[name] == true ) {
      res = true;
    }
    return res;
  }
  function isDeviceAvailable () {
    return true;
  }
  function getFileList ( way, callback ) {
    let dir = process.cwd() + way;
    fs.readdir( dir, function ( err, files ) {
      if ( err == null ) {
        files.forEach( function ( file, i ) {
          files[i] = dir + "\\" + file;
        });
        callback( files );
      }
    });
    return;
  }
  function getRecordFromFile ( file ) {
    let record = null;
    try {
      record = JSON.parse( fs.readFileSync( file, "utf8" ) );
    } catch (e) {
      console.log(  "error on parsing file: " + file );
    }
    return record;
  }
  function processNodeFiles ( files, callback ) {
    files.forEach( function ( file, i ) {
      let record = getRecordFromFile( file );
      if ( isNodeAvailable( record.name ) == true ) {
        records.push( record );
      }
      return;
    });
    callback();
    return;
  }
  function processDeviceFiles ( files, callback ) {
    files.forEach( function ( file, i ) {
      let record = getRecordFromFile( file );
      if ( isDeviceAvailable() == true ) {
        external.push( record );
      }
      return;
    });
    callback();
    return;
  }
  function sortingRecords ( callback ) {
    let buffer = [];
    typePriority.forEach( function ( name, i ) {
      sections.push( new NodeSection( name, typeNames[i] ) );
      records.forEach( function ( record, j ) {
        if ( record.type == name ) {
          sections[i].records.push( record );
          buffer.push( record );
        }
      });
    });
    records = buffer;
    callback();
    return;
  }
  function init () {
    getFileList( "\\nodes", function ( files ) {
      records = [];
      getSetupFile( function () {
        checkSetupFile( function () {
          processNodeFiles( files, function () {
            sortingRecords( function () {
              getFileList( "\\external", function ( files ) {
                external = [];
                processDeviceFiles( files, function () {
                  self.reinitHardware();
                  ready = true;
                });
              });
            });
          });
        });
      });
    });
    return;
  }
  /*----------------------------------------*/
  this.getNodeRecord    = function ( id ) {
    return records[id];
  }
  this.getTypeByName    = function ( name ) {
    let res = null;
    records.forEach( function ( record, i ) {
      if ( record.name == name ) {
        res = i;
      }
      return;
    });
    return res;
  }
  this.getNodeRecordByName = function ( name ) {
    return self.getNodeRecord( self.getTypeByName( name ) );
  }
  this.getSection       = function ( id ) {
    return sections[id];
  }
  this.getSectionNumber = function () {
    return sections.length;
  }
  this.getRecordsLength = function () {
    return records.length;
  }
  this.getStatus        = function () {
    return ready;
  }
  this.getSetup         = function () {
    return setup;
  }
  this.getExternal      = function () {
    return external;
  }
  this.setupExternal    = function ( ext ) {
    usedExt = [];
    ext.forEach( function ( device, i ) {
      let index = external.indexOf( device );
      if ( index != -1 ) {
        usedExt.push( device );
      }
    });
    self.reinitHardware();
    return;
  }
  this.reinitHardware   = function () {
    hardware.din  = setup.hardware.din;
    hardware.dout = setup.hardware.dout;
    hardware.ain  = setup.hardware.ain;
    hardware.aout = setup.hardware.aout;
    hardware.sw   = setup.hardware.sw;
    hardware.led  = setup.hardware.led;
    usedExt.forEach( function ( device, i ) {
      hardware.din  += device.din;
      hardware.dout += device.dout;
      hardware.ain  += device.ain;
      hardware.aout += device.aout;
      hardware.sw   += device.sw;
      hardware.led  += device.led;
      return;
    });
    return;
  }
  this.getHardware      = function () {
    return hardware;
  }
  this.awaitReady       = function ( callback ) {
    setTimeout( function () {
      if ( ready == true ) {
        callback();
      } else {
        self.awaitReady( callback );
      }
      return;
    }, 1 );
    return;
  }
  /*----------------------------------------*/
  init();
  return;
}
/*----------------------------------------------------------------------------*/
var nodeLib = new NodeLib();
/*----------------------------------------------------------------------------*/
module.exports.nodeLib = nodeLib;
/*----------------------------------------------------------------------------*/
