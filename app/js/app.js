// Copyright (c) 2015, Masahiko Imanaka. All rights reserved.
/* global Swiper, Capture */
/* jshint moz:true, esnext:true */
(function() {
'use strict';

var contentAreaPadding = 0,
    contentAreaSize = { w: 320, h: 480 },
    contentAreaOffset = { x: 0, y: 0 },
    svgareaElement = document.getElementById('svg_area'),
    svgXaxisElement = document.getElementById('svg_Xaxis'),
    svgLineElement = document.getElementById('svg_line'),
    svgCircleElement = document.getElementById('svg_circle'),
    svgArcElement = document.getElementById('svg_arc'),
    angleValueElement = document.getElementById('angleValue');

var pausebutton = document.getElementById('pausebutton');

var svgLine = {
  elm: svgLineElement,
  _fromPos: [0, 0],
  _toPos: [100, 100],
  _offsetY: 0,
  _angle: 0,
  _length: 10,
  get fromPos() {
    return this._fromPos;
  },
  set fromPos(coordinates) {
    this._fromPos = [coordinates[0], coordinates[1]];
    this.elm.setAttribute('x1', this._fromPos[0]);
    this.elm.setAttribute('y1', this._fromPos[1]);
    this._setLength();
  },
  get toPos() {
    return this._toPos;
  },
  set toPos(coordinates) {
    this._toPos = [coordinates[0], coordinates[1]];
    this.elm.setAttribute('x2', this._toPos[0]);
    this.elm.setAttribute('y2', this._toPos[1]);
    this._setLength();
  },
  get offsetY() {
    return this._offsetY ;
  },
  set offsetY(y) {
    this._offsetY = y;
  },
  get angle() {
    var ang = Math.atan2(this._toPos[0], this._toPos[1] - this._offsetY) * 180 / Math.PI;
    ang = Math.round(ang * 10) / 10;
    return (ang < 0) ? ang + 360 : ang;
  },
  get length() {
    return this._length;
  },
  _setLength: function _setLength() {
    this._length = Math.sqrt(
        Math.pow(this._toPos[0] - this._fromPos[0], 2) +
        Math.pow(this._toPos[1] - this._fromPos[1], 2) );
  }
};

var swipeItem = {
  target: null,
  startPos: {x:0, y:0},
  currentPos: {x:0, y:0},
  touchOffset: {x:0, y:0}
};


// Init.
function startup() {
  // Swiper.js
  var swipe = new Swiper(svgareaElement);
  swipe.ontouch = onSwipeStart;
  swipe.onswiping = onSwiping;
  swipe.onswiped  = onSwipeEnd;
  swipe.start();

  adjustContentArea();
  angleValueElement.textContent = svgLine.angle;

  // Camera setup.
  if (Capture.cameraStartup()) {
    pausebutton.addEventListener('click', toggleCameraStatus, false);
  }
}


function adjustContentArea() {
  var contentareaElement = document.getElementById('contentarea'),
      contentAreaHeight = document.getElementById('controlarea').offsetTop;

  // Adjust content area.
  contentAreaPadding = parseInt(svgCircleElement.getAttribute('r'));
  contentAreaSize.w = contentareaElement.clientWidth * 0.9 - contentAreaPadding;
  contentAreaSize.h = contentAreaHeight - contentAreaPadding;
  contentAreaOffset.x = contentareaElement.offsetLeft;
  contentAreaOffset.y = contentareaElement.offsetTop + contentAreaPadding;

  contentareaElement.style.height = contentAreaHeight + 'px';

  // Adjust line positions.
  svgXaxisElement.setAttribute('x2', contentAreaSize.w);
  svgLine.offsetY = contentAreaPadding;
  svgLine.fromPos = [parseInt(svgLineElement.getAttribute('x1')), parseInt(svgLineElement.getAttribute('y1'))];
  svgLine.toPos = [parseInt(svgLineElement.getAttribute('x2')), parseInt(svgLineElement.getAttribute('y2'))];
}

function toggleCameraStatus(ev) {
  ev.preventDefault();
  var status = Capture.cameraPauseResume();
  if (status === true) {
    console.log('camera resumed.');
    pausebutton.textContent = 'Pause';
  } else {
    console.log('camera paused.');
    pausebutton.textContent = 'Resume';
  }
}


// Swipe handlers for svg elemens.
function onSwipeStart(ev) {
  swipeItem.target = ev.target;
  //console.log('onSwipeStart', swipeItem.target.id);
  swipeItem.startPos.x = ev.startX;
  swipeItem.startPos.y = ev.startY;
  switch (swipeItem.target.id) {
    case 'svg_circle':
      swipeItem.touchOffset.x = swipeItem.startPos.x - svgLine.toPos[0];
      swipeItem.touchOffset.y = swipeItem.startPos.y - svgLine.toPos[1];
      swipeItem.target.setAttribute('stroke', '#8f8');
      svgLine.elm.setAttribute('stroke', '#8f8');
      break;
    case 'svg_Xaxis_handle':
      swipeItem.touchOffset.x = swipeItem.startPos.x - svgLine.fromPos[0];
      swipeItem.touchOffset.y = swipeItem.startPos.y - svgLine.fromPos[1];
      swipeItem.target.setAttribute('stroke', '#8f8');
      svgXaxisElement.setAttribute('stroke', '#8f8');
      break;
    default:
  }
}


function onSwiping(ev) {
  if (swipeItem.target === null) {
    console.log('swipe target is null.');
    return;
  }
  //console.log('onSwiping', swipeItem.target.id, ev.dx, ev.dy);
  switch (swipeItem.target.id) {
    case 'svg_circle':
      swipeItem.currentPos.x = swipeItem.startPos.x + ev.dx - swipeItem.touchOffset.x;
      if (swipeItem.currentPos.x > contentAreaSize.w) {
        swipeItem.currentPos.x = contentAreaSize.w;
      } else if (swipeItem.currentPos.x < 0) {
        swipeItem.currentPos.x = 0;
      }
      swipeItem.currentPos.y = swipeItem.startPos.y + ev.dy - swipeItem.touchOffset.y;
      if (swipeItem.currentPos.y > contentAreaSize.h) {
        swipeItem.currentPos.y = contentAreaSize.h;
      } else if (swipeItem.currentPos.y < contentAreaPadding) {
        swipeItem.currentPos.y = contentAreaPadding;
      }
      // Set positions.
      swipeItem.target.setAttribute('cx', swipeItem.currentPos.x);
      swipeItem.target.setAttribute('cy', swipeItem.currentPos.y);
      svgLine.toPos = [swipeItem.currentPos.x, swipeItem.currentPos.y];
      break;
    case 'svg_Xaxis_handle':
      swipeItem.currentPos.y = swipeItem.startPos.y + ev.dy - swipeItem.touchOffset.y;
      if (swipeItem.currentPos.y > contentAreaSize.h - contentAreaPadding) {
        swipeItem.currentPos.y = contentAreaSize.h - contentAreaPadding;
      } else if (swipeItem.currentPos.y < contentAreaPadding) {
        swipeItem.currentPos.y = contentAreaPadding;
      }
      // Set positions.
      var posY = swipeItem.currentPos.y;
      swipeItem.target.setAttribute('y', posY - 10);
      svgXaxisElement.setAttribute('y1', posY);
      svgXaxisElement.setAttribute('y2', posY);
      svgLine.offsetY = posY;
      svgLine.fromPos = [parseInt(svgLineElement.getAttribute('x1')), posY];
      break;
    default:
  }
  if (svgLine.angle > 0) {
    drawAngleArc();
  }
  angleValueElement.textContent = svgLine.angle;
}


function onSwipeEnd() {
  if (swipeItem.target === null) {
    console.log('swipe target is null.');
    return;
  }
  //console.log('onSwipeEnd', swipeItem.target.id);

  switch (swipeItem.target.id) {
    case 'svg_circle':
      swipeItem.target.setAttribute('stroke', '#0a0');
      svgLine.elm.setAttribute('stroke', '#0a0');
      break;
    case 'svg_Xaxis_handle':
      swipeItem.target.setAttribute('stroke', '#0a0');
      svgXaxisElement.setAttribute('stroke', '#0a0');
      break;
    default:
  }
  angleValueElement.textContent = svgLine.angle;
}


function drawAngleArc() {
  var path = svgArcElement.getAttribute('d').split(' '),
      arcOffsetLength = svgLine.length * 0.85;
  if ((arcOffsetLength + svgLine.offsetY) > contentAreaSize.h) {
    arcOffsetLength = contentAreaSize.h - svgLine.offsetY;
  }
  var radius = Math.round(arcOffsetLength),
      radAngle = svgLine.angle * Math.PI / 180,
      arcToX = Math.round(arcOffsetLength * Math.sin(radAngle)),
      arcToY = Math.round(arcOffsetLength * Math.cos(radAngle));
  // Path for the arc.
  // d="M 0,142 A 100,100 0 0,0 100,100"
  //   M fromX, fromY A rx, ry, ellips_angle, large-arc-flag,sweep-flag toX,toY
  path[1] = [0, radius + svgLine.offsetY].join();
  path[3] = [radius, radius].join();
  path[6] = [arcToX, arcToY + svgLine.offsetY].join();
  svgArcElement.setAttribute('d', path.join(' '));
  //console.log(svgArcElement.getAttribute('d'));
}

  window.addEventListener('load', startup, false);
})();
