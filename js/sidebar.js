var fild           = document.getElementById( "sidebar-fild"    );
var panelLibrary   = document.getElementById( "panel-library"   );
var headerLibrary  = document.getElementById( "header-library"  );
var resizerLibrary = document.getElementById( "resizer-library" );
var panelOptions   = document.getElementById( "panel-options"   );
var headerOptions  = document.getElementById( "header-options"  );
var resizerOptions = document.getElementById( "resizer-options" );
var panelHelp      = document.getElementById( "panel-help"      );
var headerHelp     = document.getElementById( "header-help"     );
/*----------------------------------------------------------------------------*/
function switchSidebarLib ( object ) {
  if ( object.classList.contains( "active" ) ) {
    object.classList.remove( "active" );
    panelLibrary.classList.remove( "active" );
    headerLibrary.classList.remove( "active" );
    resizerLibrary.classList.remove( "active" );
  } else {
    object.classList.add( "active" );
    panelLibrary.classList.add( "active" );
    headerLibrary.classList.add( "active" );
    resizerLibrary.classList.add( "active" );
  }
  resizer.reinit();
  return;
}
function switchSiderbarOptions ( object ) {
  if ( object.classList.contains( "active" ) ) {
    object.classList.remove( "active" );
    panelOptions.classList.remove( "active" );
    headerOptions.classList.remove( "active" );
    resizerOptions.classList.remove( "active" );
  } else {
    object.classList.add( "active" );
    panelOptions.classList.add( "active" );
    headerOptions.classList.add( "active" );
    resizerOptions.classList.add( "active" );
  }
  resizer.reinit();
  return;
}
function switchSiderbarHelp ( object ) {
  if ( object.classList.contains( "active" ) ) {
    object.classList.remove( "active" );
    panelHelp.classList.remove( "active" );
    headerHelp.classList.remove( "active" );
    resizerOptions.classList.remove( "active" );
  } else {
    object.classList.add( "active" );
    panelHelp.classList.add( "active" );
    headerHelp.classList.add( "active" );
    resizerOptions.classList.add( "active" );
  }
  resizer.reinit();
  return;
}
/*----------------------------------------------------------------------------*/
function Resizers ( resizer1, resizer2, block1, block2, block3, bar ) {
  var self  = this;
  var dragX = 0;

  const headerHeight  = 30;
  const resizerHeight = 3;

  function getBlockHeight ( block ) {
    let h = 0;
    if ( block.classList.contains( "active" ) ) {
      h = block.offsetHeight;
    }
    return h;
  }
  function getExtraHeight () {
    let h = 0;
    let c = 0;
    o1 = block1.classList.contains( "active" );
    o2 = block2.classList.contains( "active" );
    o3 = block3.classList.contains( "active" );
    if ( o1 > 0 ) {
      h += headerHeight;
      c++;
    }
    if ( o2 > 0 ) {
      h += headerHeight;
      c++;
    }
    if ( o3 > 0 ) {
      h += headerHeight;
      c++;
    }
    if ( c > 0 ) {
      h += ( c - 1 ) * resizerHeight;
    }
    return h;
  }
  function getUsedSpace () {
    let used = 0;
    used += getBlockHeight( block1 );
    used += getBlockHeight( block2 );
    used += getBlockHeight( block3 );
    used += getExtraHeight();
    return used;
  }
  function getFreeSpace () {
    return bar.offsetHeight - getUsedSpace();
  }
  function dragCallbac ( e, blockUp, blockDown ) {
    let delta = e.clientY - dragX;
    if ( delta < 0 ) { // up
      blockUp.style.height   = blockUp.offsetHeight + delta + "px";
      blockDown.style.height = blockDown.offsetHeight + getFreeSpace() + "px";
    } else {          // down
      blockDown.style.height = blockDown.offsetHeight - delta + "px";
      blockUp.style.height   = blockUp.offsetHeight + getFreeSpace() + 2 + "px";
    }
    dragX = e.clientY;
  }
  function onClickCallback ( object, callback ) {
    object.onmousedown = function dragMouseDown ( e ) {
      dragX = e.clientY;
      document.onmouseup   = () => document.onmousemove = document.onmouseup = null;
      document.onmousemove = function onMouseMove ( e ) {
        callback( e );
        return;
      }
      return;
    }
  }
  function init () {
    onClickCallback( resizer1, function ( e ) {
      if ( block2.classList.contains( "active" ) > 0 ) {
        dragCallbac( e, block1, block2 );
      } else {
        dragCallbac( e, block1, block3 );
      }
      return;
    });
    onClickCallback( resizer2, function ( e ) {
        dragCallbac( e, block2, block3 );
        if ( block2.classList.contains( "active" ) > 0 ) {
      } else {
        dragCallbac( e, block1, block3 );
      }
      return;
    });
    return;
  }
  /*------------------------------------------*/
  this.reinit = function () {
    if ( block1.classList.contains( "active" ) > 0 ) {
      block1.style.height = block1.offsetHeight + getFreeSpace() + "px";
    } else if ( block2.classList.contains( "active" ) > 0 ) {
      block2.style.height = block2.offsetHeight + getFreeSpace() + "px";
    } else if ( block3.classList.contains( "active" ) > 0 ) {
      block3.style.height = block3.offsetHeight + getFreeSpace() + "px";
    }
    return;
  }
  /*------------------------------------------*/
  init();
  self.reinit();
  return;
}
/*----------------------------------------------------------------------------*/
let resizer = new Resizers(
  resizerLibrary,
  resizerOptions,
  panelLibrary,
  panelOptions,
  panelHelp,
  fild
);
/*----------------------------------------------------------------------------*/
