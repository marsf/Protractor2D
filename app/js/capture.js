// Copyright (c) 2015, Masahiko Imanaka. All rights reserved.
/* jshint moz:true, esnext:true */

var Capture = (function() {
'use strict';

var videoElement = document.getElementById('video'),
    cameraDevice = null,
    cameraControl = null,  // Camera control.
    isCameraAvailable = false,
    isStreaming = false;

var videoSize = {width: 0, height: 0};

var usePromise = false; // FxOS 2.2: true

function cameraStartup() {
  // For camera area.
  if (!navigator.mozCameras) {
    console.log('navigator.mozCameras is not supported.');
    return false;
  }
  var cameras = window.navigator.mozCameras;

  // The mozCameras API uses promise in Firefox OS 2.2+ (Gecko 37.0+).
  usePromise = (cameras.getCamera.length === 1);

  // window.inner sizes:
  // Flame: W320xH539, Fx0: W360xH609, Alcatel: W320xH449 ?
  switch (window.innerWidth) {
    case 480:  // 16:9
      videoSize.width = 854;
      videoSize.height = 480;
      break;
    case 360:  // 4:3
      videoSize.width = 480;
      videoSize.height = 360;
      break;
    case 320:  // 3:2
      videoSize.width = 480;
      videoSize.height = 320;
      break;
    default:
      videoSize.width = 384;
      videoSize.height = 288;
  }

  cameraDevice = cameras.getListOfCameras()[0];  // Back camera.
  var cameraConfig = {
    mode: 'picture',
    previewSize: videoSize
  };
  if (usePromise) {
    cameras.getCamera(cameraDevice, cameraConfig).then(onAccessCamera, onError);
  } else {
    cameras.getCamera(cameraDevice, cameraConfig, onAccessCamera, onError);
  }
  return true;
}

function onAccessCamera(cameraObj) {
  //console.log(cameraObj);
  isCameraAvailable = true;
  cameraControl = (cameraObj.hasOwnProperty('camera')) ? cameraObj.camera : cameraObj;
  cameraControl.onclose = onCloseCamera;

  adjustVideoArea(cameraControl.sensorAngle);

  // Play.
  isStreaming = true;
  videoElement.mozSrcObject = cameraControl;
  videoElement.play();
}

function onError(err) {
  isCameraAvailable = false;
  console.error(err);
}


function adjustVideoArea(cameraRotation) {
  videoElement.style.width = videoSize.width + 'px';
  videoElement.style.height = videoSize.height + 'px';

  var transformOrigin = '',
      rotate = '',
      translateX = '';
  var displayRatio = Math.round((videoSize.width / videoSize.height) * 100) / 100;
  if (cameraRotation === 90 || cameraRotation === 270) {
    switch(displayRatio) {
      case 1.77:  // 16:9
        transformOrigin = '28.125% 50%';
        if (cameraRotation === 270) {
          translateX = 'translateX(-43.75%)';
        }
        break;
      case 1.33:  // 4:3
        transformOrigin = '37.5% 50%';
        if (cameraRotation === 270) {
          translateX = 'translateX(-25%)';
        }
        break;
      case 1.5:  // 3:2
        transformOrigin = '33.3% 50%';
        if (cameraRotation === 270) {
          translateX = 'translateX(-33.3%)';
        }
        break;
      default:
    }
  } else {
    transformOrigin = '50% 50%';
  }
  rotate = 'rotate(' + cameraRotation + 'deg) ';
  videoElement.style.transformOrigin = transformOrigin;
  videoElement.style.transform = rotate + translateX;
  console.log('adjustVideoArea() - ', 'sensorAngle:', cameraRotation, 'Ratio:', displayRatio, 'videoElement:', videoElement.style.cssText);
}


function cameraPauseResume() {
  if (isStreaming === true) {
    if (cameraControl) {
      var pictureOptions = {
        rotation: cameraControl.sensorAngle,
        //fileFormat: cameraControl.capabilities.fileFormats[0]  // jpeg
        pictureSize: null  // Default size.
      };
      if (usePromise) {
        cameraControl.takePicture(pictureOptions).then(onPictureTaken);
      } else {
        cameraControl.takePicture(pictureOptions, onPictureTaken);
      }
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
    cameraControl.release();  // Promise
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
