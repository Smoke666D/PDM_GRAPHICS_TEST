var lib = require('../configurator/nodeLib.js').nodeLib;
/*  */
function Parser () {
  var self = this;
  var data = null;
  /*----------------------------------------*/
  this.endPoints = []; /* Оконечные ноды без выходов или без подключенных выходов */
  this.pointers  = []; /* Перечень источников указателей                          */
  this.index     = []; /* Индексы элементов, номера по типу нода                  */
  this.tables    = []; /* Номера элементов с табличными полями                    */
  /*------------------ Ok ------------------*/
  function calcEndPoints () {
    self.endPoints = [];
    data.nodes.forEach( function ( node ) {
      let notEnd = false;
      if ( ( node.name != 'node_inputPointer' ) && ( node.name != 'node_header' ) ) {
        data.links.forEach( function ( link ) {
          if ( link.from.node == node.id ) {
            notEnd = true;
          }
          return;
        });
        if ( notEnd == false ) {
          self.endPoints.push( node.id );
        }
      }
      return;
    });
    return;
  }
  /*------------------ Ok ------------------*/
  function calcPointers () {
    let net  = 0;
    self.pointers = [];
    data.nodes.forEach( function ( node ) {
      if  ( node.name == 'node_inputPointer' ) {
        net = parseInt( node.options[0].value );
        for ( var i=self.pointers.length; i<( net + 1 ); i++ ) {
          self.pointers.push( 0 );
        }
        data.links.forEach( function ( link ) {
          if ( link.to.node == node.id ) {
            self.pointers[net] = link.from;
          }
          return;
        });
      }
      return;
    });
    return;
  }
  /*------------------ Ok ------------------*/
  function calcIndex () {
    let counter = 0;
    let name    = "";
    self.index  = [];
    data.nodes.forEach( function ( node ) {
      counter = 0;
      name    = node.name;
      if ( parseInt( name[name.length - 1] ) > 0 ) {
        name = name.substring( 0, ( name.length - 1 ) );
      }
      self.index.forEach( function ( index ) {
        if ( index.name == name ) {
          counter++;
        }
      });
      self.index.push( {
        "name" : name,
        "n"    : ( counter + 1 ),
        "id"   : node.id
      });
    });
    return;
  }
  /*------------------ No ------------------*/
  function calcTable () {
    self.tables = [];
    data.nodes.forEach( function ( node ) {
      record = lib.getNodeRecordByName( node.name );
      if ( record.table > 0 ) {
        if ( self.tables.length < record.table ) {
          self.tables.push( [] );
        }
        self.tables[record.table - 1].push( node.id );
      }
      return;
    });
    return;
  }
  /*------------------ Ok ------------------*/
  this.getIndexById = function ( id ) {
    let result = null;
    self.index.forEach( function( index, i ) {
      if ( index.id == id ) {
        result = index.n;
      }
    });
    return result
  }
  /*------------------ Ok ------------------*/
  this.getConectedAdr = function ( adr ) {
    let res = [];
    data.links.forEach( function ( link ) {
      if ( ( link.from.node == adr.node ) && ( link.from.pin == adr.pin ) ) {
        res.push( link.to );
      }
      if ( ( link.to.node == adr.node ) && ( link.to.pin == adr.pin ) ) {
        res.push( link.from )
      }
      return;
    });
    return res;
  }
  /*------------------ Ok ------------------*/
  this.getNode = function ( id ) {
    return data.nodes[id];
  }
  /*------------------ Ok ------------------*/
  this.init = function ( input ) {
    data = input;
    calcEndPoints();
    calcPointers();
    calcIndex();
    calcTable();
    return;
  }
  return;
}

module.exports.Parser = Parser;