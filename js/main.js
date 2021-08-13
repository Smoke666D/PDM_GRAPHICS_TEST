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
function navbarToogling() {
	genSw = document.getElementById( 'genPowerGeneratorControlEnb' );
	netSw = document.getElementById( 'mainsControlEnb' );
  function generatorToogle() {
		genPages = document.getElementById( 'genCollapse' );
		if ( genSw.checked == false ) {
  		genPages.classList.add( 'hide' );
			document.getElementById( 'sinput-starterStopGenFreqLevel' ).disabled = true;
			document.getElementById( 's-slider-starterStopGenFreqLevel' ).setAttribute('disabled', false);
		} else {
			genPages.classList.remove( 'hide' );
			document.getElementById( 'sinput-starterStopGenFreqLevel' ).disabled = false;
			document.getElementById( 's-slider-starterStopGenFreqLevel' ).removeAttribute( 'disabled' );
		}
	}
}
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
function toogleNav() {
	var sb   = document.getElementById( 'sidebar' );
	if ( sb.classList.contains( 'active' ) ) {
		sb.classList.remove( 'active' );
	} else {
		sb.classList.add( 'active' );
	}
	return;
}
function hideContent() {
	var contentPages = document.getElementsByClassName( 'content-data' );
	var navItems     = document.getElementsByClassName( 'navItem' );
	for ( var i=0; i<navItems.length; i++ ) {
		navItems[i].classList.remove( 'checked' );
	}
	for ( var i=0; i<contentPages.length; i++ ) {
		contentPages[i].classList.add( 'hidden' );
	}
	return;
}
function loadContent( id ) {
	hideContent();
	document.getElementById( id ).classList.remove( 'hidden' );
	document.getElementById( 'nav-' + id ).classList.add( 'checked' );
	var sb = document.getElementById( 'sidebar' );
	if ( window.matchMedia( '(max-width: 991.98px)' ).matches ) {
		sb.classList.remove( 'active' );
		sidebarDone = 0;
	}
	document.getElementById( 'content' ).scrollTop = 0;
	return;
}
var sidebarDone = 0;
document.getElementById( 'content' ).addEventListener( 'click', function() {
	var sb = document.getElementById( 'sidebar' );
	if ( !sb.classList.contains( 'active' ) ) {
		sidebarDone = 0;
	}
	if ( ( window.matchMedia( '(max-width: 991.98px)' ).matches ) && ( sb.classList.contains( 'active' ) ) && ( sidebarDone == 1 ) )  {
 		sb.classList.remove( 'active' );
		sidebarDone = 0;
}});
document.getElementById( 'sidebar' ).addEventListener( 'transitionend', function() {
	var sb = document.getElementById( 'sidebar' );
	if ( ( window.matchMedia( '(max-width: 991.98px)' ).matches ) && ( sb.classList.contains( 'active' ) ) ) {
		sidebarDone = 1;
}});
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
	})
	navbarToogling();
  loadContent( 'devicePage' );
	return;
});
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
