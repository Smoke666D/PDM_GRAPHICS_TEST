/*----------------------------------------------------------------------------*/
function dragElement ( elmnt, trig, callback ) {
  var dX = 0;
  var dY = 0;
  var cX = 0;
  var cY = 0;
  var parent = elmnt.parentElement.parentElement.getBoundingClientRect();

  var leftBorder   = 0;
  var rightBorder  = parent.width - parseInt( elmnt.style.width );
  var topBorder    = elmnt.parentElement.offsetTop - elmnt.offsetTop;
  var bottomBorder = parent.height - parseInt( elmnt.style.height );
  if ( document.getElementById( trig.id ) ) {
    document.getElementById( trig.id ).onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }
  function dragMouseDown ( e ) {
    e = e || window.event;
    e.preventDefault();
    cX = e.clientX;                        // get the mouse cursor position at startup:
    cY = e.clientY;
    document.onmouseup   = closeDragElement;
    document.onmousemove = elementDrag;      // call a function whenever the cursor moves:
    return;
  }
  function elementDrag( e ) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    dX = cX - e.clientX;
    dY = cY - e.clientY;
    cX = e.clientX;
    cY = e.clientY;
    // set the element's new position:
    let newX = ( parseInt( elmnt.style.left ) - dX );
    let newY = ( parseInt( elmnt.style.top )  - dY );
    if ( newX < 0 ) {
      newX = 0;
    }
    if ( newX > rightBorder ) {
      newX = rightBorder;
    }
    if ( newY < topBorder ) {
      console.log( topBorder );
      newY = topBorder;
    }
    if ( newY > bottomBorder ) {
      newY = bottomBorder;
    }
    elmnt.style.top  = newY + "px"
    elmnt.style.left = newX + "px";
    callback();
    return;
  }
  function closeDragElement() {
    document.onmouseup   = null;
    document.onmousemove = null;
    return;
  }
  return;
}
/*----------------------------------------------------------------------------*/
module.exports.dragElement = dragElement;
/*----------------------------------------------------------------------------*/
