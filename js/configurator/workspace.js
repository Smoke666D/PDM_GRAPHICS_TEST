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
    if ( typeof( path ) == 'string' ) {
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
    } else {
      console.log( "Error on path type! It isn't string" );
    }
    return;
  }
  this.load = function ( path, callback ) {
    if ( typeof( path ) == 'string' ) {
      if ( typeof( callback ) == 'function' ) {
        if ( busy == 0 ) {
          busy = 1;
          fs.readFile( path, {encoding: "utf8"}, function ( error, text ) {
            if ( error ) {
              console.log( "Error on configuration loading!");
              busy = 0;
            } else {
              data = JSON.parse( text );
              callback();
              busy = 0;
            }
          });
        } else {
          console.log( "Save/load operation is busy!");
        }
      } else {
        console.log( "Error on callback type! Iy isn't function" );
      }
    } else {
      console.log( "Error on path type! It isn't string" );
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
    if ( typeof( path ) == 'string' ) {
      if ( typeof( scheme ) == 'object' ) {
        config.set( scheme );
        config.save( path );
      } else {
        console.log( "Error on sheme type! It isn't object" );
      }
    } else {
      console.log( "Error on path type! It isn't string" );
    }
    return;
  }
  this.load = function ( path, callback ) {
    if ( typeof( path ) == 'string' ) {
      if ( typeof( callback ) == 'function' ) {
        config.load( path, function () {
          callback( config.get() );
          return;
        });
      } else {
        console.log( "Error on callback type! Iy isn't function" );
      }
    } else {
      console.log( "Error on path type! It isn't string" );
    }
    return;
  }
  return;
}
/*----------------------------------------------------------------------------*/
let workspace = new Workspace();
/*----------------------------------------------------------------------------*/
module.exports.workspace = workspace;