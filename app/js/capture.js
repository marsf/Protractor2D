// Copyright (c) 2015, Masahiko Imanaka. All rights reserved.
/* jshint moz:true, esnext:true */

var Capture = (function() {
'use strict';

var videoElement = document.getElementById('video'),
    isCameraAvailable = false,
    isStreaming = false,
    cameraDevice = null,
    cameraControl = null;  // Camera control.

function cameraStartup() {
  // For camera area.
  if (!navigator.mozCameras) {
    console.log("navigator.mozCamera not supported.");
    return false;
  }
  var cameras = window.navigator.mozCameras;
  cameraDevice = cameras.getListOfCameras()[0];
  var cameraConfig = {
    mode: 'picture',
    recorderProfile: 'jpg',
    previewSize: {
      width: 480,
      height: 320
    }
  };
  cameras.getCamera(cameraDevice, cameraConfig, onAccessCamera, onError);

  if (cameraControl) {
    cameraControl.onclose = onCloseCamera;
    return true;
  }
}

function onAccessCamera(camera) {
  cameraControl = camera;
  isCameraAvailable = true;
  videoElement.mozSrcObject = camera;
  videoElement.play();
  isStreaming = true;
}

function onError(err) {
  isCameraAvailable = false;
  console.error(err);
}

function cameraPauseResume() {
  if (isStreaming === true) {
    if (cameraControl) {
      var pictureOptions = {
        rotation: 90,
        pictureSize: cameraControl.capabilities.pictureSizes[7],  // W800, H600
        fileFormat: cameraControl.capabilities.fileFormats[0]  // jpeg
      };
      //cameraControl.autoFocus(function() { cameraControl.takePicture() });
      cameraControl.takePicture(pictureOptions, onPictureTaken);
    }
    videoElement.pause();
    return (isStreaming = false);
  } else {
    if (cameraControl) {
      //cameraControl.effect = cameraControl.capabilities.effects[0]; // none
      cameraControl.resumePreview();
    }
    videoElement.play();
    return (isStreaming = true);
  }
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

function onCloseCamera(ev) {
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
