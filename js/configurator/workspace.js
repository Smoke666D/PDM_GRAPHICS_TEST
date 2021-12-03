const { Scheme } = require( './primitives' );
/*----------------------------------------------------------------------------*/
fs = require( 'fs' );
/*----------------------------------------------------------------------------*/
const fileName = "system/workspace.json";
/*----------------------------------------------------------------------------*/
function Config () {
  var self = this;
  var busy = 0;
  var data = null;
  this.set  = function ( scheme ) {
    data = scheme.save();
    return;
  }
  this.get  = function () {
    return data;
  }
  this.save = function ( path ) {
    if ( busy == 0 ) {
      busy = 1;
      let text = JSON.stringify( data, null, '  ' );
      fs.writeFile( path, text, {encoding: "utf8"}, function ( error ) {
        if ( error ) {
          console.log( "Error on configuration saving!");
        }
        busy = 0;
        return;
      });
    } else {
      console.log( "Save/load operation is busy!");
    }
    return;
  }
  this.load = function ( path ) {
    if ( busy == 0 ) {
      busy = 1;
      fs.readFile( path, {encoding: "utf8"}, function ( error, text ) {
        if ( error ) {
          console.log( "Error on configuration loading!");
          busy = 0;
        } else {
          //data.scheme = 
          //data.can = 
          busy = 0;
        }
      });
    } else {
      console.log( "Save/load operation is busy!");
    }
    return;
  }
}
/*----------------------------------------------------------------------------*/
function Workspace () {
  var self   = this;
  var ready  = 0;
  var file   = null;
  var buffer = new Buffer.alloc(1024);
  var size   = 0;
  var config = new Config();

  this.init = function ( callback = null ) {
    fs.open( fileName, "w+", function( error, fd ) {
      if ( error ) {
        console.log( "Error on workspace init!");
      } else {
        file = fd;
        fs.read( file, buffer, 0, buffer.length, 0, function( error, bytes ) {
          if ( error ) {
            console.log( "Error on workspace reading!");
          } else {
            if ( bytes == 0 ) {
              size = 0;
            }
            ready = 1;
            if ( callback != null ) {
              callback();
            }
          }
        });
      }
    });
  }
  this.save = function ( scheme, path ) {
    config.set( scheme );
    config.save( path );
    return;
  }
  this.load = function ( path ) {
    config.load( path );
    return  config.get();
  }



  


  return;
}
/*----------------------------------------------------------------------------*/
let workspace = new Workspace();
/*----------------------------------------------------------------------------*/
module.exports.workspace = workspace;