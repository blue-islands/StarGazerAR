AFRAME.registerComponent('compass-rotation', {
  schema: {
    r: {type: 'number'},
    rDiff: {type: 'number'},
    isZodiacFound: {type: 'boolean', default: false},
    inAnimation: {type: 'boolean', default: false},
    },
  init: function () {
    this.tHit = 0;
    this.degtorad = Math.PI / 180;

    // listen to deviceorientation event
    var eventName = _getDeviceOrientationEventName();

    if (!!eventName) {
      // if Safari
      if (!!navigator.userAgent.match(/Version\/[\d.]+.*Safari/)) {
        // iOS 13+
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          var handler = function () {
            console.log('Requesting device orientation permissions...');
            DeviceOrientationEvent.requestPermission();
            document.removeEventListener('touchend', handler);
          };

          document.addEventListener('touchend', function () {
            handler()
          }, false);

          // alert('After camera permission prompt, please tap the screen to active geolocation.');
        } else {
          var timeout = setTimeout(function () {
            document.querySelector('a-scene').pause();
            alert('デバイスの向きが検出できませんでした。「設定 > Safari > モーションと画面の向きのアクセス」を有効にしてください。')
          }, 750);
          window.addEventListener(eventName, function () {
            clearTimeout(timeout);
          }, false);
        }
      }

      window.addEventListener(eventName, _updatecompassHeading.bind(this), false);

    } else {
      document.querySelector('a-scene').pause();
      alert('デバイスの向きが検出できませんでした。デバイスの設定を確認して再度お試しください。');
    }

    /**
     * Get device orientation event name, depends on browser implementation.
     * @returns {string} event name
     */
    function _getDeviceOrientationEventName() {
      var eventName;
      if ('ondeviceorientationabsolute' in window) {
        eventName = 'deviceorientationabsolute'
      } else if ('ondeviceorientation' in window) {
        eventName = 'deviceorientation'
      } else {
        eventName = '';
        console.error('Compass not supported')
      }

      return eventName
    }

    function _updatecompassHeading(ev) {
      var alpha;

      if (ev.webkitCompassHeading !== undefined) {
        if (ev.webkitCompassAccuracy < 50) {
          alpha = ev.webkitCompassHeading;
        } else {
          console.warn('webkitCompassAccuracy is ev.webkitCompassAccuracy');
        }
      } else if (ev.alpha !== null) {
        if (ev.absolute === true || ev.absolute === undefined) {
          alpha = _computeCompassHeading(ev.alpha, ev.beta, ev.gamma);
        } else {
          console.warn('ev.absolute === false');
        }
      } else {
        console.warn('ev.alpha === null');
      }

      // var _x = ev.beta ? ev.beta * degtorad : 0;
      // var _y = ev.gamma ? ev.gamma * degtorad : 0;
      // var _z = alpha ? alpha * degtorad : 0;
      //
      // var cX = Math.cos(_x);
      // var cY = Math.cos(_y);
      // var cZ = Math.cos(_z);
      // var sX = Math.sin(_x);
      // var sY = Math.sin(_y);
      // var sZ = Math.sin(_z);
      //
      // var Vx = -cZ * sY - sZ * sX * cY;
      // var Vy = -sZ * sY + cZ * sX * cY;
      //
      // var compassHeading = Math.atan(Vx / Vy);
      //
      // if (Vy < 0) {
      //   compassHeading += Math.PI;
      // } else if (Vx < 0) {
      //   compassHeading += 2 * Math.PI;
      // }
      //
      // alpha = compassHeading * (180 / Math.PI);
      this.el.setAttribute('compass-rotation', {r: alpha});

      if (zodData) {
        var rDiff = zodData.directionNum - alpha;
        if (180 <= Math.abs(rDiff)) {
          var dirNorm = (zodData.directionNum > alpha) ? -1 : 1;
          rDiff = (dirNorm * 360 + zodData.directionNum) - alpha;
        }
        this.el.setAttribute('compass-rotation', {rDiff: rDiff});

        const wwh = window.innerWidth / 2;
        var inAnimation = this.data.inAnimation;

        // stars-shape
        var starShapeEl = getEl('stars-shape');
        var starImgOffset = wwh - starShapeEl.clientWidth / 2;
        if (!inAnimation) {
          starImgOffset += rDiff * 9;
        }
        starShapeEl.style.left = starImgOffset + 'px';

        // direction arrow
        var dirArwEl = getEl('dir-arrow');
        var pxPerDeg = (wwh - dirArwEl.clientWidth) / 180;
        var dirArwImgOffset;
        if (0 < rDiff) {
          dirArwEl.classList.remove('rev');
          dirArwImgOffset = (wwh - dirArwEl.clientWidth);
          if (!inAnimation) {
            dirArwImgOffset -= pxPerDeg * rDiff;
          }
        } else {
          dirArwEl.classList.add('rev');
          dirArwImgOffset = wwh;
          if (!inAnimation) {
            dirArwImgOffset += pxPerDeg * Math.abs(rDiff);
          }
        }
        dirArwEl.style.left = dirArwImgOffset + 'px';

        // debug
        // getEl('tHit').innerText = 'starImgOffset=' + starImgOffset;
      }
    }

    /**
     * Compute compass heading.
     *
     * @param {number} alpha
     * @param {number} beta
     * @param {number} gamma
     *
     * @returns {number} compass heading
     */
    function _computeCompassHeading(alpha, beta, gamma) {

      // Convert degrees to radians
      var alphaRad = alpha * (Math.PI / 180);
      var betaRad = beta * (Math.PI / 180);
      var gammaRad = gamma * (Math.PI / 180);

      // Calculate equation components
      var cA = Math.cos(alphaRad);
      var sA = Math.sin(alphaRad);
      var sB = Math.sin(betaRad);
      var cG = Math.cos(gammaRad);
      var sG = Math.sin(gammaRad);

      // Calculate A, B, C rotation components
      var rA = - cA * sG - sA * sB * cG;
      var rB = - sA * sG + cA * sB * cG;

      // Calculate compass heading
      var compassHeading = Math.atan(rA / rB);

      // Convert from half unit circle to whole unit circle
      if (rB < 0) {
        compassHeading += Math.PI;
      } else if (rA < 0) {
        compassHeading += 2 * Math.PI;
      }

      // Convert radians to degrees
      compassHeading *= 180 / Math.PI;

      return compassHeading;
    }
  },

  tick: function (t, td) {
    const r = this.data.r, rDiff = this.data.rDiff;

    if (zodData) {
      const markerAttr = document.querySelector('a-marker').getAttribute('marker-event');
      if (!this.data.isZodiacFound && markerAttr.found) {
        let picID;

        // zodiac found judge
        var absRDiff = Math.abs(rDiff);
        if (12 > absRDiff) {
          if (0 == this.tHit) {
            this.tHit = t;
          }
        } else {
          this.tHit = 0;
        }
        if (1500 < (t - this.tHit) && 0 !== this.tHit) {
          this.el.setAttribute('compass-rotation', {isZodiacFound: true, inAnimation: true});
          hideEl('pos-gauge');
          var starEl = getEl('stars-shape');
          starEl.firstElementChild.className = 'darkout';
          starEl.lastElementChild.className = 'flash';
          starEl.firstElementChild.addEventListener('animationend', this.afterZodiacFound.bind(this), false);
          picID = selZodiacName;
        } else {
          // nezumi
          picID = (0 < rDiff) ? 'nezumiR' : 'nezumiL';
        }
        getEl('img-plane').setAttribute('parapara', {pic_id: picID});
      }

      // DEBUG
      // getEl('alpha').innerText = 'alpha='+this.data.r;
      // getEl('rdiff').innerText = 'rdiff='+rDiff;
      // getEl('tHit').innerText = 'rDiff=' + rDiff;
    }
  },
  afterZodiacFound: function () {
    hideEl('stars-shape');
    getEl('cam-take').disabled = false;
    getEl('view-fortune').disabled = false;
    if (notifyTap) {
      addNotifyTap();
    }
    this.el.setAttribute('compass-rotation', {inAnimation: false});
  },
});

