/*  */
function Parser ( data ) {
  var data = data;

  let endPoints = []; /* Оконечные ноды без выходов или без подключенных выходов */
  let pointers  = []; /* Перечень источников указателей                          */

  function calcEndPoints () {
    data.nodes.forEach( function ( node ) {
      endPoints.push( node.id );
      return;
    });
    data.links.forEach( function ( link ) {
      endPoints.splice( endPoints.indexOf( link.to.node ), 1 );
      return;
    });
    return;
  }
  function calcPointers () {
    let net = 0;
    data.nodes.forEach( function ( node ) {
      if  ( node.name == 'node_outputPointer' ) {
        node.options.forEach( function ( option ) {
          if ( option.name == 'pointer' ) {
            net = option.value;
            break;
          }
          return;
        });
        for ( var i=pointers.length; i<( net + 1 ); i++ ) {
          pointers.push( 0 );
        }
        data.links.forEach( function ( link ) {
          if ( link.to.node == node.id ) {
            pointers[net] = link.from;
            break;
          }
          return;
        });
      }
      return;
    });
    return;
  }





  return;
}