// Copyright (c) 2015, Masahiko Imanaka. All rights reserved.
/* jshint moz:true, esnext:true */

var Capture = (function() {
'use strict';

var videoElement = document.getElementById('video'),
    isCameraAvailable = false,
    isStreaming = false,
    cameraDevice = null,
    cameraControl = null,  // Camera control.
    cameraRotation = 0;

var videoSize = {width: 480, height: 320};  // 3:2

function cameraStartup(windowSize) {
  // For camera area.
  if (!navigator.mozCameras) {
    console.log("navigator.mozCamera not supported.");
    return false;
  }

  var cameras = window.navigator.mozCameras;
  cameraDevice = cameras.getListOfCameras()[0];  // Back camera.

  switch (windowSize.w) {
    case 360:  // 4/3
      videoSize.width = 480;
      videoSize.height = 360;
      break;
    case 320:  // 3:2
      videoSize.width = 480;
      videoSize.height = 320;
      break;
    default:
  }

  var cameraConfig = {
    mode: 'picture',
    recorderProfile: 'jpg',
    previewSize: videoSize
  };
  cameras.getCamera(cameraDevice, cameraConfig, onAccessCamera, onError);
}

function onAccessCamera(camera) {
  isCameraAvailable = true;
  cameraControl = camera;
  cameraRotation = cameraControl.sensorAngle;
  cameraControl.onClosed = onClosedCamera;
  console.log(cameraControl);

  adjustVideoArea();

  // Play.
  isStreaming = true;
  videoElement.mozSrcObject = cameraControl;
  videoElement.play();
}

function onError(err) {
  isCameraAvailable = false;
  console.error(err);
}

function adjustVideoArea() {
  videoElement.style.width = videoSize.width + 'px';
  videoElement.style.height = videoSize.height + 'px';

  var transformOrigin = '',
      rotate = '',
      translateX = '';
  var displayRatio = Math.round((videoSize.width / videoSize.height) * 100) / 100;
  if (cameraRotation === 90 || cameraRotation === 270) {
    switch(displayRatio) {
      case 1.77:  // 16:9
        transformOrigin = 'transform-origin:28.125% 50%;';
        if (cameraRotation === 270) {
          translateX = 'translateX(-43.75%)';
        }
        break;
      case 1.33:  // 4:3
        transformOrigin = 'transform-origin:37.5% 50%;';
        if (cameraRotation === 270) {
          translateX = 'translateX(-25%)';
        }
        break;
      case 1.50:  // 3:2
        transformOrigin = 'transform-origin:33.3% 50%;';
        if (cameraRotation === 270) {
          translateX = 'translateX(-33.3%)';
        }
        break;
      default:
    }
  } else {
    transformOrigin = 'transform-origin:50% 50%;';
  }
  rotate = 'rotate(' + cameraRotation + 'deg) ';
  videoElement.style.cssText += transformOrigin + 'transform:' + rotate + translateX + ';';
  //console.log('adjustVideoArea()', displayRatio, videoElement.style.cssText);
}


function cameraPauseResume() {
  if (isStreaming === true) {
    if (cameraControl) {
      var pictureOptions = {
        rotation: cameraRotation,
        //fileFormat: cameraControl.capabilities.fileFormats[0]  // jpeg
        pictureSize: null  // Default size.
      };
      //cameraControl.autoFocus(function() { cameraControl.takePicture() });
      cameraControl.takePicture(pictureOptions, onPictureTaken);
    }
    videoElement.pause();
    isStreaming = false;
  } else {
    if (cameraControl) {
      //cameraControl.effect = cameraControl.capabilities.effects[0]; // none
      cameraControl.resumePreview();
    }
    videoElement.play();
    isStreaming = true;
  }
  return isStreaming;
}

function onPictureTaken(blob) {
  //var storage = navigator.getDeviceStorage('pictures');
  //storage.addNamed(blob, 'myImage.jpg');
}

function cameraRelease() {
  if (cameraControl) {
    cameraControl.release();
    console.log('camera is released.');
  }
}

function onClosedCamera(ev) {
 console.log('camera onClose:', ev.reason);
 if (isStreaming === true) {
   videoElement.pause();
   isStreaming = false;
 }
 cameraRelease();
}


  return {
    'cameraStartup': cameraStartup,
    'cameraPauseResume': cameraPauseResume,
    'isCameraAvailable': isCameraAvailable
  };
})();
