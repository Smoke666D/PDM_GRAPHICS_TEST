/*  */
function Parser ( data ) {
  var data = data;

  console.log( data )

  let endPoints = []; /* Оконечные ноды без выходов или без подключенных выходов */
  let pointers  = []; /* Перечень источников указателей                          */

  /*------------------ Ok ------------------*/
  function calcEndPoints () {
    data.nodes.forEach( function ( node ) {
      if ( node.name != 'node_inputPointer' ) {
        endPoints.push( node.id );
      }
      return;
    });
    data.links.forEach( function ( link ) {
      endPoints.splice( endPoints.indexOf( link.from.node ), 1 );
      return;
    });
    return;
  }
  /*------------------ Ok ------------------*/
  function calcPointers () {
    let net = 0;
    data.nodes.forEach( function ( node ) {
      if  ( node.name == 'node_inputPointer' ) {
        net = parseInt( node.options[0].value );
        for ( var i=pointers.length; i<( net + 1 ); i++ ) {
          pointers.push( 0 );
        }
        data.links.forEach( function ( link ) {
          if ( link.to.node == node.id ) {
            pointers[net] = link.from;
          }
          return;
        });
      }
      return;
    });
    return;
  }
  /*------------------ NO ------------------*/
  this.getConectedAdr = function ( adr ) {
    let res = [];
    data.links.forEach( function ( link ) {
      if ( link.from == adr ) {
        res.push( link.to );
      }
      if ( link.to == adr ) {
        res.push( link.from )
      }
      return;
    });
    return res;
  }
  /*------------------ NO ------------------*/
  this.getNode = function ( id ) {
    return data.nodes[id];
  }




  calcEndPoints();
  calcPointers();
  console.log( pointers );
  return;
}

module.exports.Parser = Parser;