const triIco     = '<svg viewBox="0 0 576 512"><path fill="currentColor" d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path></svg>';
const bellIco    = '<svg viewBox="0 0 448 512"><path fill="currentColor" d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z"></path></svg>';
const okIco      = '<svg viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg>';
const oilIco     = '<svg viewBox="0 0 640 512"><path fill="currentColor" d="M629.8 160.31L416 224l-50.49-25.24a64.07 64.07 0 0 0-28.62-6.76H280v-48h56c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16H176c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h56v48h-56L37.72 166.86a31.9 31.9 0 0 0-5.79-.53C14.67 166.33 0 180.36 0 198.34v94.95c0 15.46 11.06 28.72 26.28 31.48L96 337.46V384c0 17.67 14.33 32 32 32h274.63c8.55 0 16.75-3.42 22.76-9.51l212.26-214.75c1.5-1.5 2.34-3.54 2.34-5.66V168c.01-5.31-5.08-9.15-10.19-7.69zM96 288.67l-48-8.73v-62.43l48 8.73v62.43zm453.33 84.66c0 23.56 19.1 42.67 42.67 42.67s42.67-19.1 42.67-42.67S592 288 592 288s-42.67 61.77-42.67 85.33z"></path></svg>';
const shevronRightIco = '<svg viewBox="0 0 320 512"><path fill="currentColor" d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path></svg>';
const shevronLeftIco  = '<svg viewBox="0 0 320 512"><path fill="currentColor" d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path></svg>';
const tachometerIco   = '<svg viewBox="0 0 576 512"><path fill="currentColor" d="M288 32C128.94 32 0 160.94 0 320c0 52.8 14.25 102.26 39.06 144.8 5.61 9.62 16.3 15.2 27.44 15.2h443c11.14 0 21.83-5.58 27.44-15.2C561.75 422.26 576 372.8 576 320c0-159.06-128.94-288-288-288zm0 64c14.71 0 26.58 10.13 30.32 23.65-1.11 2.26-2.64 4.23-3.45 6.67l-9.22 27.67c-5.13 3.49-10.97 6.01-17.64 6.01-17.67 0-32-14.33-32-32S270.33 96 288 96zM96 384c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm48-160c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm246.77-72.41l-61.33 184C343.13 347.33 352 364.54 352 384c0 11.72-3.38 22.55-8.88 32H232.88c-5.5-9.45-8.88-20.28-8.88-32 0-33.94 26.5-61.43 59.9-63.59l61.34-184.01c4.17-12.56 17.73-19.45 30.36-15.17 12.57 4.19 19.35 17.79 15.17 30.36zm14.66 57.2l15.52-46.55c3.47-1.29 7.13-2.23 11.05-2.23 17.67 0 32 14.33 32 32s-14.33 32-32 32c-11.38-.01-20.89-6.28-26.57-15.22zM480 384c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"></path></svg>';
/*----------------------------------------------------------------------------*/
const fadeTimeout = 0.4; /*sec*/
const boxDistance = 15;  /*px*/
/*----------------------------------------------------------------------------*/
var alertAddIndex  = 0;
var alertDelIndex  = 0;
var alertCurNumber = 0;
/*----------------------------------------------------------------------------*/
function closeAlert ( id ) {
  let element = document.getElementById( 'alert' + id );
  if ( element != null ) {
    if ( element.classList.contains( 'hidden' ) == false ) {
      alertCurNumber--;
      element.classList.add( 'hidden' );
      setTimeout( function () {
        let element = document.getElementById( 'alert' + id );
        let alerts  = document.getElementsByClassName( 'alert-message' );
        for ( var i=alerts.length - 1; i>id; i-- ) {
          if ( alerts[i].classList.contains( 'hidden' ) == false ) {
            alerts[i].style.bottom = parseInt( alerts[i].style.bottom ) - element.offsetHeight - boxDistance + 'px';
          }
        }
        element.style.bottom = boxDistance + "px";
        alertDelIndex++;
      }, fadeTimeout * 1000 );
    }
  }
	return;
}
/*----------------------------------------------------------------------------*/
function AlertRecord ( bottom, height, index ) {
  this.bottom = bottom;
  this.height = height;
  this.index  = index;
}
/*----------------------------------------------------------------------------*/
function Alert ( type, ico, text, ack, progress ) {
  var self      = this;
  var box       = document.getElementById( 'alerts' );
  this.type     = type;
  this.ico      = ico;
  this.text     = text;
  this.index    = 0;
  this.y        = 0;

  if ( ack == undefined ) {
    this.ack = 0;
  } else {
    this.ack = ack;
  }
  if ( progress == undefined ) {
    this.progress = 0;
  } else {
    this.progress = progress;
  }
  //-------------------------------------------
  this.make = function () {
    this.index = alertAddIndex;
    alertAddIndex++;
    this.alertText  = '<div id="alert';
    this.alertText += this.index;
    this.alertText += '" class="alert ';
    this.alertText += this.type;
    this.alertText += ' hidden alert-message shadow rounded d-flex" role="alert"><div class="alert-icon d-flex justify-content-center align-items-center flex-grow-0 flex-shrink-0 py-3">';
    this.alertText += this.ico;
    this.alertText += '</div><div class="alert-content';
    if ( this.progress == 0 ) {
      this.alertText += ' d-flex align-items-center';
    }
    this.alertText += ' py-2 px-3">';
    this.alertText += '<div id="alert-text">';
    this.alertText += this.text;
    this.alertText += '</div>';
    if ( this.progress > 0 ) {
      this.alertText += '<div class="progress"><div id="alert-progress'
      this.alertText += this.index;
      this.alertText += '"class="progress-bar bg-info" role="progressbar" style="width: 0%;"></div></div>';
    }
    this.alertText += '</div>';
    if ( this.progress == 0 ) {
      this.alertText += '<a href="#" class="close px-2" onclick="closeAlert(';
      this.alertText += this.index;
      this.alertText += ')"><svg viewBox="0 0 352 512"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg></a>';
    }
    this.alertText  += '</div></div>';

    let alerts = document.getElementsByClassName( 'alert-message' );
    let active = [];
    for ( var i=0; i<alerts.length; i++ ) {
      if ( alerts[i].classList.contains( 'hidden' ) == false ) {
        active.push( new AlertRecord( parseInt( alerts[i].style.bottom ), alerts[i].offsetHeight, i ) );
      }
    }
    box.innerHTML = box.innerHTML + this.alertText;
    this.object   = document.getElementById( 'alert' + this.index );
    this.pb       = document.getElementById( 'alert-progress' + this.index );
    if ( active.length > 0 ) {
      self.object.style.bottom = active[active.length-1].bottom + active[active.length-1].height + boxDistance + 'px'
      let limit = window.innerHeight - boxDistance * 3;
      let tower = parseInt( self.object.style.bottom ) + self.object.offsetHeight ;
      if ( limit < tower ) {
        closeAlert( active[0].index );
      }
    } else {
      self.object.style.bottom = boxDistance + 'px';
    }
    alertCurNumber++;
    setTimeout( function () {
      self.object.classList.add( 'animation' );
      setTimeout( function () {
        self.object.classList.remove( 'hidden' );
      }, 1 );
    }, 1 );
    return;
  }
  /*--------------------------------------------------------------------------*/
  this.setProgressBar = function ( value ) {
    this.pb.style.width = value + "%";
    if ( value >= 100 ) {
      this.close( 2 );
    }
    return;
  }
  /*--------------------------------------------------------------------------*/
  this.close = function ( timeout ) {
    setTimeout ( function () {
      closeAlert( self.index );
    }, timeout * 1000 );
  }
  /*--------------------------------------------------------------------------*/
  this.make ();
  if ( ( this.progress == 0 ) && ( this.ack == 0 ) ) {
    this.close( 6 );
  }
  return self;
}
//------------------------------------------------------------------------------
module.exports.Alert           = Alert;
module.exports.triIco          = triIco;
module.exports.bellIco         = bellIco;
module.exports.okIco           = okIco;
module.exports.oilIco          = oilIco;
module.exports.shevronRightIco = shevronRightIco;
module.exports.tachometerIco   = tachometerIco;
module.exports.shevronLeftIco  = shevronLeftIco;
