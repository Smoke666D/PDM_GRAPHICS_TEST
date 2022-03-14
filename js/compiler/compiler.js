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
/*------------------ Ok ------------------*/
function makeConst ( data, id ) {
  let out = "___ERROR___";
  if ( data.startsWith( 'const' ) ) {
    let sub = data.substring( ( data.indexOf( '(' ) + 1 ), data.indexOf( ')' ) );
    if ( sub.startsWith( 'in' ) ) {
      let adr = parser.getConectedAdr( { 'node' : id, 'pin' : parseInt( sub[2] ) } );
      if ( adr.length > 0 ) {
        let node = parser.getNode( adr[0].node );
        if ( node.name.startsWith( 'node_var' ) ) {
          out = node.options[0].value;
        }
      }
    }
  }
  return out;
}
/*------------------ Ok ------------------*/
function makeIn ( string, id ) {
  let output = null;
  let str    = "";
  let from   = null;
  let shift  = 0;    /* Костыль для CAN input */ 
  if ( string.startsWith( 'in' ) ) {
    let adr  = parser.getConectedFromAdr( { "node": id, "pin": parseInt( string[2] ) } );
    if ( adr.length > 0 ) {
      from = lib.getNodeRecordByName( parser.getNode( adr[0].node ).name );
      if ( from.name == "node_outputPointer" ) {
        newAdr = parser.pointers[parser.getNode( adr[0].node ).options[0].value];
        adr    = [];
        adr.push( newAdr );
        from = lib.getNodeRecordByName( parser.getNode( adr[0].node ).name );
      }
      if ( parser.getNode( adr[0].node ).name.startsWith( 'node_var' ) ) {
        output = parser.getNode( adr[0].node ).options[0].value
      } else {
        if ( from.name == 'node_inputCAN' ){
          if ( parser.getNode( adr[0].node ).options[0].value == 'bool' ) {
            shift = 1;
          }
        }
        str    = getMakeData( from, lang ).outputs[adr[0].pin - from.inputs.length + shift];
        output = str.substring( 0, ( str.indexOf( '.' ) + 1 ) ) + parser.getIndexById( adr[0].node );
      }
    } else {
      switch ( parser.getNode( id ).name ) {
        case 'node_timersPWM':
          output = 'HI';
          break;
        case 'node_inputSW':
          output = 'LO';
          break;
        case 'node_logicCounter':
          output = 'NULL';
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
/*------------------ Ok ------------------*/
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
/*------------------ Ok ------------------*/
function processLine ( id ) {
  let output   = "";
  let makeData = getMakeData( getNodeRecord( id ), lang );
  if ( makeData != null ) {
    let str      = makeSetup( makeData.setup, id );
    if ( str.length > 0 ) {
      if ( str != "null" ) {
        output += str
        doneList.push( id );
      }
    } else {
      if ( ( getNodeRecord( id ).name != 'node_outputCAN' ) && ( getNodeRecord( id ).name != 'node_inputDIN' ) ) {
        output += "___ERROR___ (" + getNodeRecord( id ).name + ")\n";
      }
    }
    let adrs = getFromNodes( id );
    if ( adrs.length > 0 ) {
      adrs.forEach( function ( adr ) {
        let doing = true;
        doneList.forEach( function ( number ) {
          if ( number == adr.node ) {
            doing = false;
          }
          return;
        });
        if ( doing == true ) {
          output += processLine( adr.node );
        }
        return;
      });
    }
  }
  return output;
}
/*------------------ Ok ------------------*/
function makeInputCan () {
  let output = "";
  parser.tables.input.forEach( function ( table ) {
    table.forEach( function ( id ) {
      let node = parser.getNode( id );
      let adr  = node.options[1].value;
      if ( node.options[0].value == 'bool' ) {
        output += 'CAN_DI.';
      } else {
        output += 'CAN_CH.';
      }
      output += parser.getIndexById( id ) + '=';
      output += '0x' + parser.frames[adr.frame].adr.toString( 16 ) + '/';
      output += adr.byte  + '/'
      switch ( node.options[0].value ) {
        case 'bool':
          output += adr.bit;
          break;
        case 'byte':
          output += '1'
          break;
        case 'short':
          output += '2'
          break;
      }
      output += ';\n';
      return;
    });
    return;
  });
  console.log( output )
  return output;
}
/*------------------ Ok ------------------*/
function makeOutputCan () {
  let output = "";
  let frames = [];
  let stream = [];
  //------- Make list of output CAN frames -------
  parser.tables.output.forEach( function ( table ) {
    table.forEach( function ( id ) {
      let node   = parser.getNode( id );
      for ( var i=frames.length; i<( node.options[1].value.frame + 1 ); i++ ) {
        frames.push( [] );
      }
      frames[node.options[1].value.frame].push({ 
        'id'   : id, 
        'type' : node.options[0].value, 
        'byte' : node.options[1].value.byte, 
        'bit'  : node.options[1].value.bit
      });
      return;
    });
    return;
  });
  //-- Make streams buffer for output CAN frames --
  stream = [];
  frames.forEach( function ( frame, n ) {
    stream.push( [] );
    frame.forEach( function ( chunk ) {
      if ( chunk.type == 'bool' ) {
        if ( stream[n].length < ( chunk.byte + 1 ) ) {
          for ( var i=0; i<( chunk.byte + 1 ); i++ ) {
            stream[n].push( [] ); 
          }
        }
        stream[n][chunk.byte].push( chunk );
      }
      return;
    });
    return;
  });
  //--------- Make stream strings --------
  let counter = 1;
  stream.forEach( function ( frame ) {
    frame.forEach( function ( byte, n ) {
      if ( byte.length > 0 ) {
        let buffer = 'CAN_STREAM.' + counter + '=';
        counter++;
        for ( var i=0; i<8; i++ ) {
          let exist = null;
          byte.forEach( function ( chunk ) {
            if ( chunk.bit == i ) {
              exist = chunk.bit;
            }
            return;
          });
          if ( exist == null ) {
            buffer += 'LO+';
          } else {
            buffer += makeIn( 'in0', byte[i].id ) + '+';
          }
        }
        buffer   = buffer.substring( 0, ( buffer.length - 1 ) ) + ';\n';
        output  += buffer;
        frame[n] = buffer.substring( 0, buffer.indexOf( '=' ) );
      }
      return;
    });
    return;
  });
  frames.forEach( function ( frame, n ) {
    let sub = 'CAN_OUT.' + ( n + 1 ) + '=';
    sub += '0x' + parser.frames[n].adr.toString( 16 ) + '/' + parser.frames[n].length + '/' + parser.frames[n].timeout + '+';
    stream[n].forEach ( function ( stre, k ) {
      if ( typeof( stre ) == 'string' ) {
        sub += stre + '/' + k + '/0+'
      }
    });
    frame.forEach( function ( chunk ) {
      if ( chunk.type != 'bool' ) {
        if ( parser.getNode( chunk.id ).name.indexOf( 'output' ) > 0 ) {
          sub += makeIn( 'in0', chunk.id ) + '/' + chunk.byte + '/' + chunk.bit + '+';
        }
      }
      return;
    });
    if ( sub.length > 23 ) {
      sub = sub.substring( 0, ( sub.length - 1 ) ) + ';\n';
      output += sub;
    }
    return;
  });
  output += "//-------------------\n"
  return output;
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
function makeExtern ( extern ) {
  let out = "";
  extern.forEach( function ( name ) {
    let record = lib.getExternalByName( name );
    let string =  getMakeData( record, lang ).setup;
    if ( ( string != null  ) && ( string.length > 0 ) ) {
      let start = 0;
      let end   = 0;  
      let value = 0;
      let done  = false;
      while ( start >= 0 ) {
        start = string.indexOf( '$', 0 );
        end   = string.indexOf( '$', ( start + 1 ) );
        if ( ( start > 0 ) && ( end > 0 ) ) {
          start++;
          end++;
          done = false;
          data = string.substring( start, ( end - 1 ) );
          Object.keys( record ).forEach( function ( key, i ) {
            if ( key == data ) {
              value = record[key];
            }
          });
          string = string.substring( 0, ( start - 1 ) ) + value + string.substring( end, string.length ); 
        }
      }
    }
    out += string;
  });
  return out;
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
          if ( data.startsWith( 'const' ) ) {
            value = makeConst( data, id );
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
  output += makeDevice( data.device );
  output += "//-------------------\n"
  output += makeExtern( data.device.external );
  output += "//-------------------\n"
  output += makeInputCan();
  output += "//-------------------\n"
  output += makeOutputCan();
  parser.endPoints.forEach( function ( id ) {
    output += processLine( id );
    output += "//-------------------\n"
  });
  output += 'END;\n'

  require( "fs" ).writeFile( getMakeData( lib.getSetup(), lang ).outputName, output, function ( error ) {
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
