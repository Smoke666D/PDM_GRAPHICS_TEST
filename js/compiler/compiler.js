const { parse } = require('path');

var Parser = require('./parser.js').Parser;
var lib    = require('../configurator/nodeLib.js').nodeLib;
/*----------------------------------------------------------------------------*/
var lang     = "denisScript";
let parser   = new Parser();
var doneList = [];
/*----------------------------------------------------------------------------*/
/*------------------ Ok ------------------*/
function getMakeData ( record, lng ) {
  let out   = null;
  let doing = true;
  if ( ( 'name' in record ) == true ) {
    if ( record.name.startsWith( 'node_var' ) == true ) {
      doing = false;
    }
  }
  if ( doing == true ) {
    Object.keys( record.compiler ).forEach( function ( key ) {
      if ( key == lng ) {
        out = record.compiler[lng];
      }
    });
  }
  return out;
}
/*------------------ No ------------------*/
function makeIn ( string, id ) {
  let output = null;
  let str    = "";
  let from   = null;
  if ( string.startsWith( 'in' ) ) {
    let adr  = parser.getConectedAdr( { "node": id, "pin": parseInt( string[2] ) } );
    if ( adr.length > 0 ) {
      from = lib.getNodeRecordByName( parser.getNode( adr[0].node ).name );
      if ( from.name == "node_outputPointer" ) {
        newAdr = parser.pointers[parser.getNode( adr[0].node ).options[0].value];
        adr    = [];
        adr.push( newAdr );
        from = lib.getNodeRecordByName( parser.getNode( adr[0].node ).name );
      }
      str    = getMakeData( from, lang ).outputs[adr[0].pin - from.inputs.length];
      output = str.substring( 0, ( str.indexOf( '.' ) + 1 ) ) + parser.getIndexById( adr[0].node );
    } else {
      switch ( parser.getNode( id ).name ) {
        case 'node_timersPWM':
          output = 'Hi';
          break;
        case 'node_inputSW':
          output = 'Lo';
          break;
        default:
          console.log( "[MAKE] No address on making 'in': " + parser.getNode( id ).name );
          break;
      }
    }
  } else {
    console.log( "[MAKE] In string starts with error: " + string );
  }
  return output;
}
/*------------------ Ok ------------------*/
function getNodeRecord ( id ) {
  return lib.getNodeRecord( lib.getTypeByName( parser.getNode( id ).name ) );
}
/*------------------ No ------------------*/
function getFromNodes ( id ) {
  let out = [];
  let node = getNodeRecord( id );
  node.inputs.forEach( function ( input, i ) {
    let adr = parser.getConectedAdr( { 'node' : id, 'pin' : i } );
    if ( adr.length > 0 ) {
      out.push( adr[0] );
    }
  });
  return out;
}
/*------------------ No ------------------*/
function processLine ( id ) {
  let output   = "";
  let makeData = getMakeData( getNodeRecord( id ), lang );
  if ( makeData != null ) {
    let str      = makeSetup( makeData.setup, id );
    if ( str.length > 0 ) {
      if ( str != "null" ) {
        output += str
        doneList.push( id );
        let adrs = getFromNodes( id );
        if ( adrs.length > 0 ) {
          adrs.forEach( function ( adr ) {
            let doing = true;
            doneList.forEach( function ( number ) {
              if ( number == adr.node ) {
                doing = false;
              }
            });
            if ( doing == true ) {
              output += processLine( adr.node );
            }
          });
        }
      }
    } else {
      output += "___ERROR___ (" + getNodeRecord( id ).name + ")\n";
    }
  }
  return output;
}
/*------------------ No ------------------*/
function makeCan () {

}
/*------------------ Ok ------------------*/
function makeDevice ( device ) {
  let string = getMakeData( lib.getSetup(), lang ).setup;
  if ( ( string != null ) && ( string.length > 0 ) ) {
    let start = 0;
    let end   = 0;
    let data  = "";
    while ( start >= 0 ) {
      start = string.indexOf( '$', 0 );
      end   = string.indexOf( '$', ( start + 1 ) );
      if ( ( start > 0 ) && ( end > 0 ) ) {
        start++;
        end++;
        data = string.substring( start, ( end - 1 ) );
        Object.keys( device ).forEach( function ( key, i ) {
          if ( data == key ) {
            string = string.substring( 0, ( start - 1 ) ) + device[key] + string.substring( end, string.length ); 
          }
        }); 
      }
    }
  } else {
    console.log( "[MAKE] Error on device setup" );
  }
  return string;
}
/*------------------ Ok ------------------*/
function makeSetup ( string, id ) {
  let data    = "";
  let value   = "";
  let done    = false;
  let record  = getNodeRecord( id );
  let options = parser.getNode( id ).options;
  if ( ( string != null ) && ( string.length > 0 ) ) {
    let start = 0;
    let end   = 0;
    while ( start >= 0 ) {
      start = string.indexOf( '$', 0 );
      end   = string.indexOf( '$', ( start + 1 ) );
      if ( ( start > 0 ) && ( end > 0 ) ) {
        start++;
        end++;
        done = false;
        data = string.substring( start, ( end - 1 ) );
        record.options.forEach( function( option, i )  {
          if ( option.name == data ) {
            value = options[i].value;
            done  = true;
          }
          return;
        });
        if ( done == false ) {
          if ( data.startsWith( 'in' ) ) {
            value = makeIn( data, id );
            if ( value != null ) {
              done = true;
            }
          }
          if ( data == 'n' ) {
            value = parser.getIndexById( id );
            done  = true;
          }
        }
        if ( done == false ) {
          value = "___ERROR___";
        }
        string = string.substring( 0, ( start - 1 ) ) + value + string.substring( end, string.length ); 
      }
    }
  }
  return string;
}
/*------------------ No ------------------*/
function build ( data ) {
  let output = "";
  doneList   = [];
  parser.init( data );
  console.log( '-------------------' );

  output +=makeDevice( data.device );
  parser.endPoints.forEach( function ( id ) {
    output += processLine( id );
    output += "//-------------------\n"
  });
  output += 'END;'

  require("fs").writeFile("out.txt", output, function ( error ) {
    if ( error != null ) {
      console.log( error );
    } else {
      console.log( '[MAKE] done' );
    }
    return;
  });
  return;
}
/*----------------------------------------------------------------------------*/


/*----------------------------------------------------------------------------*/
module.exports.build = build;
/*----------------------------------------------------------------------------*/
