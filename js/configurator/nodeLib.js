/*----------------------------------------------------------------------------*/
const fs = require('fs');
/*----------------------------------------------------------------------------*/
const typePriority = ["variable",  "logic",   "timers",  "math",       "loops", "inputs", "outputs"];
const typeNames    = ["Переменные", "Логика", "Таймеры", "Математика", "Циклы", "Входы",  "Выходы" ];
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
  this.inputs  = [];
  this.outputs = [];
  this.width   = 0;
  this.height  = 0;
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
  var source    = "";
  var filesList = [];
  var records   = [];
  var ready     = false;
  var sections  = [];
  /*----------------------------------------*/
  /*----------------------------------------*/
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
      records.push( getRecordFromFile( file ) );
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
      processFiles( files, function () {
        sortingRecords( function () {
          ready = true;
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
