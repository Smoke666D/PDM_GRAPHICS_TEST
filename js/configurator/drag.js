/*----------------------------------------------------------------------------*/
function dragElement( elmnt, trig, callback ) {
  var pos1 = 0;
  var pos2 = 0;
  var pos3 = 0;
  var pos4 = 0;
  if ( document.getElementById( trig.id ) ) {
    document.getElementById( trig.id ).onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }
  function dragMouseDown( e ) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;                        // get the mouse cursor position at startup:
    pos4 = e.clientY;
    document.onmouseup   = closeDragElement;
    document.onmousemove = elementDrag;      // call a function whenever the cursor moves:
    return;
  }
  function elementDrag( e ) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top  = ( elmnt.offsetTop  - pos2 ) + "px";
    elmnt.style.left = ( elmnt.offsetLeft - pos1 ) + "px";
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
