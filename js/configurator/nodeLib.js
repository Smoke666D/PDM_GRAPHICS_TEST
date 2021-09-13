/*----------------------------------------------------------------------------*/
const fs = require('fs');
/*----------------------------------------------------------------------------*/
const typePriority = ["variable",  "logic",   "timers",  "math",       "loops", "inputs", "outputs"];
const typeNames    = ["Переменные", "Логика", "Таймеры", "Математика", "Циклы", "Входы",  "Выходы" ];
const setupKeys    = ["nodNumber", "availableNods"];
/*----------------------------------------------------------------------------*/
function portRecord () {
  var self    = this;
  this.type   = "input";
  this.help   = "";
  this.expand = false;
  return;
}
function NodeRecord () {
  var self = this;
  this.name    = "";
  this.type    = "";
  this.table   = 0;
  this.heading = "";
  this.short   = "";
  this.help    = "";
  this.options = [];
  this.inputs  = [];
  this.outputs = [];
  this.expansionShift = 0;
  return;
}
function NodeSection ( key, name ) {
  var self     = this;
  this.key     = key;
  this.name    = name;
  this.records = [];
}
function NodeLib () {
  var self      = this;
  var ready     = false; /* Status of library         */
  var setup     = null;  /* Setup of current device   */
  var records   = [];    /* Records of the nodes data */
  var sections  = [];    /* Node data by the sections */
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
      setup = JSON.parse( fs.readFileSync( ( process.cwd() + "\\setup.json" ), "utf8" ) );
      callback();
    } catch (e) {
      console.log(  "error on parsing setup file" );
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
  function getFileList ( callback ) {
    let dir = process.cwd() + "\\nodes";
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
    let record = new NodeRecord();
    try {
      let data   = JSON.parse( fs.readFileSync( file, "utf8" ) );
      record = data;
    } catch (e) {
      console.log(  "error on parsing file: " + file );
    }
    return record;
  }
  function processFiles ( files, callback ) {
    files.forEach( function ( file, i ) {
      let record = getRecordFromFile( file )
      if ( isNodeAvailable( record.name ) == true ) {
        records.push( record );
      }
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
    getFileList( function ( files ) {
      records = [];
      getSetupFile( function () {
        checkSetupFile( function () {
          processFiles( files, function () {
            sortingRecords( function () {
              ready = true;
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
  /*----------------------------------------*/
  init();
  return;
}
/*----------------------------------------------------------------------------*/
var nodeLib = new NodeLib();
/*----------------------------------------------------------------------------*/
module.exports.nodeLib = nodeLib;
/*----------------------------------------------------------------------------*/
