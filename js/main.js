/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
window.addEventListener ( 'load', function() {
	window.scrollTo( 0, 0 );
});
document.addEventListener ( 'touchmove', function( e ) {
	e.preventDefault()
});
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
function hideContent() {
	var contentPages = document.getElementsByClassName( 'content-data' );
	for ( var i=0; i<contentPages.length; i++ ) {
		contentPages[i].classList.add( 'hidden' );
	}
	return;
}
function loadContent( id ) {
	hideContent();
	document.getElementById( id ).classList.remove( 'hidden' );
	document.getElementById( 'content' ).scrollTop = 0;
	return;
}
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
document.addEventListener( "DOMContentLoaded", function( event ) {
  $( function () {
		$( '[data-toggle="tooltip"]' ).tooltip( {
		  delay:     { 'show': 500, 'hide': 0 },
			trigger:   'hover',
			placement: 'auto',
			animation: true,
		})
	});
  loadContent( 'devicePage' );
	return;
});
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
