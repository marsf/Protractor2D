(function() {
'use strict';

var contentareaElement = document.getElementById('contentarea'),
    contentAreaPadding = 0,
    contentAreaSize = { w: 200, h: 300 },
    contentAreaOffset = { x: 0, y: 0 },
    svgareaElement = document.getElementById('svg_area'),
    svgXaxisElement = document.getElementById('svg_Xaxis'),
    svgLineElement = document.getElementById('svg_line'),
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
  currentPos: {x:0, y:0}
};


function init() {
  // Swiper.js
  var swipe = new Swiper(svgareaElement);
  swipe.ontouch = onSwipeStart;
  swipe.onswiping = onSwiping;
  swipe.onswiped  = onSwipeEnd;
  swipe.start();

  // Content area settings.
  var svgCircleElement = document.getElementById('svg_circle');
  contentAreaPadding = parseInt(svgCircleElement.getAttribute('r'));
  contentAreaSize.w = contentareaElement.clientWidth * 0.9 - contentAreaPadding;
  contentAreaSize.h = contentareaElement.clientHeight - contentAreaPadding;
  contentAreaOffset.x = contentareaElement.offsetLeft;
  contentAreaOffset.y = contentareaElement.offsetTop + contentAreaPadding;
  svgXaxisElement.setAttribute('x2', contentAreaSize.w);
  svgLine._offsetY = contentAreaPadding;
  //svgLine.fromPos = [svgLineElement.getAttribute('x1'), svgLineElement.getAttribute('y1')];
  svgLine.toPos = [svgLineElement.getAttribute('x2'), svgLineElement.getAttribute('y2')];
  //drawAngleArc();
  angleValueElement.textContent = svgLine.angle;
}


function onSwipeStart(ev) {
  swipeItem.target = ev.target;
  //console.log('onSwipeStart', swipeItem.target.id);
  swipeItem.startPos.x = ev.startX;
  swipeItem.startPos.y = ev.startY;
  switch (swipeItem.target.id) {
    case 'svg_circle':
      swipeItem.target.setAttribute('stroke', '#8f8');
      svgLine.elm.setAttribute('stroke', '#8f8');
      break;
    default:
  }
}


function onSwiping(ev) {
  if (swipeItem.target === null) {
    console.log('swipeItem.target is null.');
    return;
  }
  //console.log('onSwiping', swipeItem.target.id, ev.dx, ev.dy);
  swipeItem.currentPos.x = swipeItem.startPos.x + ev.dx - contentAreaOffset.x;
  if (swipeItem.currentPos.x > contentAreaSize.w) {
    swipeItem.currentPos.x = contentAreaSize.w;
  } else if (swipeItem.currentPos.x < 0) {
    swipeItem.currentPos.x = 0;
  }
  swipeItem.currentPos.y = swipeItem.startPos.y + ev.dy - contentAreaOffset.y;
  if (swipeItem.currentPos.y > contentAreaSize.h) {
    swipeItem.currentPos.y = contentAreaSize.h;
  } else if (swipeItem.currentPos.y < contentAreaOffset.y) {
    swipeItem.currentPos.y = contentAreaOffset.y;
  }
  switch (swipeItem.target.id) {
    case 'svg_circle':
      swipeItem.target.setAttribute('cx', swipeItem.currentPos.x);
      swipeItem.target.setAttribute('cy', swipeItem.currentPos.y);
      svgLine.toPos = [swipeItem.currentPos.x, swipeItem.currentPos.y];
      drawAngleArc();
      break;
    default:
  }
}


function onSwipeEnd(ev) {
  if (swipeItem.target === null) {
    console.log('swipeItem.target is null.');
    return;
  }
  //console.log('onSwipeEnd', swipeItem.target.id);

  switch (swipeItem.target.id) {
    case 'svg_circle':
      swipeItem.target.setAttribute('stroke', '#0a0');
      svgLine.elm.setAttribute('stroke', '#0a0');
      angleValueElement.textContent = svgLine.angle;
      break;
    default:
  }
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


  window.addEventListener('load', init, false);
})();
