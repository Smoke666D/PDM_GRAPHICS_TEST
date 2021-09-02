var panelLibrary = document.getElementById( "panel-library" );
var panelOptions = document.getElementById( "panel-options" );
var panelHelp    = document.getElementById( "panel-help"    );

function switchSidebarLib ( object ) {
  if ( object.classList.contains( "active" ) ) {
    object.classList.remove( "active" );
    panelLibrary.classList.remove( "active" );
  } else {
    object.classList.add( "active" );
    panelLibrary.classList.add( "active" );
  }
  return;
}
function switchSiderbarOptions ( object ) {
  if ( object.classList.contains( "active" ) ) {
    object.classList.remove( "active" );
    panelOptions.classList.remove( "active" );
  } else {
    object.classList.add( "active" );
    panelOptions.classList.add( "active" );
  }
  return;
}
function switchSiderbarHelp ( object ) {
  if ( object.classList.contains( "active" ) ) {
    object.classList.remove( "active" );
    panelHelp.classList.remove( "active" );
  } else {
    object.classList.add( "active" );
    panelHelp.classList.add( "active" );
  }
  return;
}
