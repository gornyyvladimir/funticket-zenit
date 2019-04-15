'use strict';

// function debounce(f, ms) {
//   let timer = null;

//   return function(...args) {
//     const onComplete = () => {
//       f.apply(this, args);
//       timer = null;
//     };

//     if (timer) {
//       clearTimeout(timer);
//     }

//     timer = setTimeout(onComplete, ms);
//   };
// }

var VIDEO_FORMATS = [
  {
    ext: 'mp4',
    type: 'video/mp4',
  },
  {
    ext: 'webm',
    type: 'video/webm',
  },
  {
    ext: 'ogg',
    type: 'video/ogv',
  },
];

(function() {
  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;

  // Grab elements from DOM.
  var panoElement = document.querySelector('#pano');
  var autorotateToggleElement = document.querySelector('#autorotateToggle');
  var fullscreenToggleElement = document.querySelector('#fullscreenToggle');

  // Detect whether we are on a touch device.
  document.body.classList.add('no-touch');
  window.addEventListener('touchstart', function() {
    document.body.classList.remove('no-touch');
    document.body.classList.add('touch');
  });

  // Use tooltip fallback mode on IE < 11.
  if (bowser.msie && parseFloat(bowser.version) < 11) {
    document.body.classList.add('tooltip-fallback');
  }

  // Viewer options.
  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode,
    },
  };

  // Initialize viewer.
  var viewer = new Marzipano.Viewer(panoElement, viewerOpts);
  // var stage = viewer.stage();

  function hide(element) {
    element.style.display = 'none';
  }

  // var debounceHide = debounce(hide, 1000);
  // var loader = document.getElementById('loader');

  // stage.addEventListener('renderComplete', function() {
  //   debounceHide(loader);
  // });

  // Create scenes.
  var scenes = data.scenes.map(function(data) {
    var urlPrefix = 'tiles';
    var source = Marzipano.ImageUrlSource.fromString(urlPrefix + '/' + data.id + '/{z}/{f}/{y}/{x}.jpg', {
      cubeMapPreviewUrl: urlPrefix + '/' + data.id + '/preview.jpg',
    });
    var geometry = new Marzipano.CubeGeometry(data.levels);

    var limiter = Marzipano.RectilinearView.limit.traditional(
      2 * data.faceSize,
      (100 * Math.PI) / 180,
      (120 * Math.PI) / 180,
    );
    var view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);

    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true,
    });

    // Create link hotspots.
    data.linkHotspots.forEach(function(hotspot) {
      var element = createLinkHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });

    // Create info hotspots.
    data.infoHotspots.forEach(function(hotspot) {
      var element = createInfoHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });

    // Create text hotspots.
    data.textHotspots.forEach(function(hotspot) {
      var element = createTextHotspotElement(hotspot.text);
      scene
        .hotspotContainer()
        .createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch }, { perspective: hotspot.perspective });
    });

    // Create embedded Hotspots
    if (data.embeddedHotspots) {
      data.embeddedHotspots.forEach(function(hotspot) {
        var element = createEmbeddedElement();
        var hotspotElement = scene
          .hotspotContainer()
          .createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch }, { perspective: hotspot.perspective });
          
        // code for developers
        // var currentCoords = hotspot;

        // var radius = hotspot.perspective.radius,
        //   x = 0,
        //   y = 0,
        //   z = 0;
        // document.addEventListener('keypress', function(event) {
        //   var dragHotspot = hotspotElement;
        //   if (event.key === 'd') {
        //     currentCoords.yaw = currentCoords.yaw + 0.001;
        //     dragHotspot.setPosition(currentCoords);
        //   }
        //   if (event.key === 'a') {
        //     currentCoords.yaw = currentCoords.yaw - 0.001;
        //     dragHotspot.setPosition(currentCoords);
        //   }
        //   if (event.key === 's') {
        //     currentCoords.pitch = currentCoords.pitch + 0.001;
        //     dragHotspot.setPosition(currentCoords);
        //   }
        //   if (event.key === 'w') {
        //     currentCoords.pitch = currentCoords.pitch - 0.001;
        //     dragHotspot.setPosition(currentCoords);
        //   }
        //   if (event.key === '+') {
        //     radius += 30;
        //     currentCoords.perspective.radius = radius;
        //     dragHotspot.setPerspective({ radius: radius });
        //   }
        //   if (event.key === '-') {
        //     radius -= 30;
        //     currentCoords.perspective.radius = radius;
        //     dragHotspot.setPerspective({ radius: radius });
        //   }
        //   if (event.key === 'y') {
        //     y += 1;
        //     currentCoords.perspective.radius = radius;
        //     currentCoords.extraRotations = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
        //     dragHotspot.setPerspective({
        //       extraRotations: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
        //       radius: radius,
        //     });
        //   }
        //   if (event.key === 'h') {
        //     y -= 1;
        //     currentCoords.perspective.radius = radius;
        //     currentCoords.extraRotations = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
        //     dragHotspot.setPerspective({
        //       extraRotations: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
        //       radius: radius,
        //     });
        //   }
        //   if (event.key === 'g') {
        //     x += 1;
        //     currentCoords.perspective.radius = radius;
        //     currentCoords.extraRotations = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
        //     dragHotspot.setPerspective({
        //       extraRotations: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
        //       radius: radius,
        //     });
        //   }
        //   if (event.key === 'j') {
        //     x -= 1;
        //     currentCoords.perspective.radius = radius;
        //     currentCoords.extraRotations = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
        //     dragHotspot.setPerspective({
        //       extraRotations: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
        //       radius: radius,
        //     });
        //   }
        //   if (event.key === 'b') {
        //     z += 1;
        //     currentCoords.perspective.radius = radius;
        //     currentCoords.extraRotations = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
        //     dragHotspot.setPerspective({
        //       extraRotations: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
        //       radius: radius,
        //     });
        //   }
        //   if (event.key === 'n') {
        //     z -= 1;
        //     currentCoords.perspective.radius = radius;
        //     currentCoords.extraRotations = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
        //     dragHotspot.setPerspective({
        //       extraRotations: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
        //       radius: radius,
        //     });
        //   }
        //   console.log(currentCoords);
        // });
      });
    }

    // Create audio Hotspots
    if (data.videoHotspots) {
      data.audioHotspots.forEach(function(hotspot) {
        var element = createAudioElement(hotspot.id);
        scene
          .hotspotContainer()
          .createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch }, { perspective: hotspot.perspective });
      });
    }

    // Create video Hotspots
    if (data.videoHotspots) {
      data.videoHotspots.forEach(function(hotspot) {
        var element = createVideoElement(hotspot.id);
        scene
          .hotspotContainer()
          .createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch }, { perspective: hotspot.perspective });
      });
    }

    return {
      data: data,
      scene: scene,
      view: view,
    };
  });

  // Set up autorotate, if enabled.
  var autorotate = Marzipano.autorotate({
    yawSpeed: 0.03,
    targetPitch: 0,
    targetFov: Math.PI / 2,
  });
  if (data.settings.autorotateEnabled) {
    autorotateToggleElement.classList.add('enabled');
  }

  // Set handler for autorotate toggle.
  autorotateToggleElement.addEventListener('click', toggleAutorotate);

  // Set up fullscreen mode, if supported.
  if (screenfull.enabled && data.settings.fullscreenButton) {
    document.body.classList.add('fullscreen-enabled');
    fullscreenToggleElement.addEventListener('click', function() {
      screenfull.toggle();
    });
    screenfull.on('change', function() {
      if (screenfull.isFullscreen) {
        fullscreenToggleElement.classList.add('enabled');
      } else {
        fullscreenToggleElement.classList.remove('enabled');
      }
    });
  } else {
    document.body.classList.add('fullscreen-disabled');
  }

  // DOM elements for view controls.
  var viewUpElement = document.querySelector('#viewUp');
  var viewDownElement = document.querySelector('#viewDown');
  var viewLeftElement = document.querySelector('#viewLeft');
  var viewRightElement = document.querySelector('#viewRight');
  var viewInElement = document.querySelector('#viewIn');
  var viewOutElement = document.querySelector('#viewOut');

  // Dynamic parameters for controls.
  var velocity = 0.7;
  var friction = 3;

  // Associate view controls with elements.
  var controls = viewer.controls();
  controls.registerMethod(
    'upElement',
    new Marzipano.ElementPressControlMethod(viewUpElement, 'y', -velocity, friction),
    true,
  );
  controls.registerMethod(
    'downElement',
    new Marzipano.ElementPressControlMethod(viewDownElement, 'y', velocity, friction),
    true,
  );
  controls.registerMethod(
    'leftElement',
    new Marzipano.ElementPressControlMethod(viewLeftElement, 'x', -velocity, friction),
    true,
  );
  controls.registerMethod(
    'rightElement',
    new Marzipano.ElementPressControlMethod(viewRightElement, 'x', velocity, friction),
    true,
  );
  controls.registerMethod(
    'inElement',
    new Marzipano.ElementPressControlMethod(viewInElement, 'zoom', -velocity, friction),
    true,
  );
  controls.registerMethod(
    'outElement',
    new Marzipano.ElementPressControlMethod(viewOutElement, 'zoom', velocity, friction),
    true,
  );

  // Register the custom control method.
  var deviceOrientationControlMethod = new DeviceOrientationControlMethod();
  controls.registerMethod('deviceOrientation', deviceOrientationControlMethod);

  function switchScene(scene) {
    stopAutorotate();
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    startAutorotate();
  }

  function startAutorotate() {
    if (!autorotateToggleElement.classList.contains('enabled')) {
      return;
    }
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(3000, autorotate);
  }

  function stopAutorotate() {
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
  }

  function toggleAutorotate() {
    if (autorotateToggleElement.classList.contains('enabled')) {
      autorotateToggleElement.classList.remove('enabled');
      stopAutorotate();
    } else {
      autorotateToggleElement.classList.add('enabled');
      startAutorotate();
    }
  }

  // Create text hotspot element
  function createTextHotspotElement(text) {
    var wrapper = document.createElement('p');
    wrapper.classList.add('text-hotspot');
    wrapper.innerHTML = text;
    return wrapper;
  }

  function createEmbeddedElement() {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = '<iframe src="https://www.youtube.com/embed/TYfxKyghbMk?autoplay=1&mute=1&enablejsapi=1&playsinline=1&controls=0" frameborder="0"></iframe>'
    // Add video element
    // var video = document.createElement('video');
    // VIDEO_FORMATS.forEach(function(item) {
    //   var source = document.createElement('source');
    //   source.src = `video/zenit.${item.ext}`;
    //   source.type = item.type;
    //   video.appendChild(source);
    // });
    // video.poster = 'preview.jpeg';
    // video.crossOrigin = 'anonymous';
    // video.loop = true;

    // video.addEventListener('click', function(){
    //   event.target.muted = event.target.muted ? false : true;
    // })

    // // Prevent the video from going full screen on iOS.
    // video.playsInline = true;
    // video.webkitPlaysInline = true;
    // video.muted = true;
    // video.autoplay = true;
    // video.load();
    // wrapper.appendChild(video);
    wrapper.classList.add('embedded-hotspot');
    return wrapper;
  }

  function createAudioElement(id) {
    var audioButton = document.createElement('div');
    audioButton.classList.add('audio-hotspot');
    var audio = document.getElementById(id);
    audioButton.addEventListener('click', function(event) {
      if (!audio.paused && event.target === audioButton) {
        audio.pause();
        return;
      }
      document.querySelectorAll('audio').forEach(function(sound) {
        sound.pause();
        sound.currentTime = 0;
      });
      audio.play();
    });
    return audioButton;
  }

  function createVideoElement(id) {
    var wrapper = document.createElement('div');
    wrapper.addEventListener('click', function() {
      document.getElementById(id).classList.add('is-active');
    });
    wrapper.classList.add('video-hotspot');
    return wrapper;
  }

  function createLinkHotspotElement(hotspot) {
    // Create wrapper element to hold icon and tooltip.
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('link-hotspot');

    // Create image element.
    var icon = document.createElement('div');
    // icon.src = 'img/link.png';
    icon.classList.add('marker');

    // Set rotation transform.
    var transformProperties = ['-ms-transform', '-webkit-transform', 'transform'];
    for (var i = 0; i < transformProperties.length; i++) {
      var property = transformProperties[i];
      icon.style[property] = 'rotate(' + hotspot.rotation + 'rad)';
    }

    // Add click event handler.
    wrapper.addEventListener('click', function() {
      switchScene(findSceneById(hotspot.target));
      ym(53295286, 'reachGoal', 'hotspot_link');
    });

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    // Create tooltip element.
    var tooltip = document.createElement('div');
    tooltip.classList.add('hotspot-tooltip');
    tooltip.classList.add('link-hotspot-tooltip');
    tooltip.innerHTML = findSceneDataById(hotspot.target).name;

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);

    return wrapper;
  }

  function createInfoHotspotElement(hotspot) {
    // Create wrapper element to hold icon and tooltip.
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('info-hotspot');

    // Create hotspot/tooltip header.
    var header = document.createElement('div');
    header.classList.add('info-hotspot-header');

    // Create image element.
    var iconWrapper = document.createElement('div');
    iconWrapper.classList.add('info-hotspot-icon-wrapper');
    var icon = document.createElement('img');
    icon.src = 'img/info.png';
    icon.classList.add('info-hotspot-icon');
    iconWrapper.appendChild(icon);

    // Create title element.
    var titleWrapper = document.createElement('div');
    titleWrapper.classList.add('info-hotspot-title-wrapper');
    var title = document.createElement('div');
    title.classList.add('info-hotspot-title');
    title.innerHTML = hotspot.title;
    titleWrapper.appendChild(title);

    // Create close element.
    var closeWrapper = document.createElement('div');
    closeWrapper.classList.add('info-hotspot-close-wrapper');
    var closeIcon = document.createElement('img');
    closeIcon.src = 'img/close.png';
    closeIcon.classList.add('info-hotspot-close-icon');
    closeWrapper.appendChild(closeIcon);

    // Construct header element.
    header.appendChild(iconWrapper);
    header.appendChild(titleWrapper);
    header.appendChild(closeWrapper);

    // Create text element.
    var text = document.createElement('div');
    text.classList.add('info-hotspot-text');
    text.innerHTML = hotspot.text;

    // Place header and text into wrapper element.
    wrapper.appendChild(header);
    wrapper.appendChild(text);

    // Create a modal for the hotspot content to appear on mobile mode.
    var modal = document.createElement('div');
    modal.innerHTML = wrapper.innerHTML;
    modal.classList.add('info-hotspot-modal');
    document.body.appendChild(modal);

    var toggle = function() {
      wrapper.classList.toggle('visible');
      modal.classList.toggle('visible');
    };

    // Show content when hotspot is clicked.
    wrapper.querySelector('.info-hotspot-header').addEventListener('click', toggle);

    // Hide content when close icon is clicked.
    modal.querySelector('.info-hotspot-close-wrapper').addEventListener('click', toggle);

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
  }

  // Prevent touch and scroll events from reaching the parent element.
  function stopTouchAndScrollEventPropagation(element, eventList) {
    var eventList = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel', 'mousewheel'];
    for (var i = 0; i < eventList.length; i++) {
      element.addEventListener(eventList[i], function(event) {
        event.stopPropagation();
      });
    }
  }

  function findSceneById(id) {
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].data.id === id) {
        return scenes[i];
      }
    }
    return null;
  }

  function findSceneDataById(id) {
    for (var i = 0; i < data.scenes.length; i++) {
      if (data.scenes[i].id === id) {
        return data.scenes[i];
      }
    }
    return null;
  }

  function closeModal() {
    var iframe = document.querySelector('.modal iframe');
    modal.classList.remove('is-active');
    iframe.src = iframe.src;
  }

  var modalClose = document.querySelector('.modal-close');
  var modalBackground = document.querySelector('.modal-background');
  var modal = document.querySelector('.modal');
  modalClose.addEventListener('click', closeModal);
  modalBackground.addEventListener('click', closeModal);

  // Set up control for enabling/disabling device orientation.

  var enabled = false;

  var toggleElement = document.getElementById('deviceOrientationToggle');

  function enable() {
    if (autorotateToggleElement.classList.contains('enabled')) {
      autorotateToggleElement.classList.remove('enabled');
      stopAutorotate();
    }
    var view = viewer.view();
    deviceOrientationControlMethod.getPitch(function(err, pitch) {
      if (!err) {
        view.setPitch(pitch);
      }
    });
    controls.enableMethod('deviceOrientation');
    enabled = true;
  }

  function disable() {
    controls.disableMethod('deviceOrientation');
    enabled = false;
  }

  function toggle() {
    if (enabled) {
      disable();
    } else {
      enable();
    }
  }

  toggleElement.addEventListener('click', toggle);

  //enable gyroscope
  // enable();
  // document.addEventListener('DOMContentLoaded', function(){
  //   enable();
  // }, false);

  setTimeout(function() {
    enable();
  }, 2000);

  //vr tour click
  var vrTourButton = document.getElementById('vr-tour');
  var shopButton = document.getElementById('shop');
  var mapButton = document.getElementById('map-button');
  vrTourButton.addEventListener('click', function(e) {
    e.preventDefault();
    vrTourButton.classList.add('is-hidden');
    shopButton.classList.remove('is-hidden');
    mapButton.classList.remove('is-hidden');
    ym(53295286, 'reachGoal', ' vr_click');

    //some actions
  });
  setTimeout(function() {
    vrTourButton.classList.remove('is-hidden');
  }, 15000);

  var map = document.getElementById('map');
  mapButton.addEventListener('click', function(event) {
    event.preventDefault();
    map.classList.toggle('hide-right');
    ym(53295286, 'reachGoal', ' map_click');
  });

  var mapMarkers = document.querySelectorAll('.map-marker');

  function removeActive() {
    var mapMarkers = document.querySelectorAll('.map-marker');
    for (var i = 0; i < mapMarkers.length; i++) {
      mapMarkers[i].classList.remove('active');
    }
  }

  for (var i = 0; i < mapMarkers.length; i++) {
    mapMarkers[i].addEventListener('click', function(e) {
      e.preventDefault();
      removeActive();
      e.target.classList.add('active');
      var sceneId = e.target.dataset.scene;
      switchScene(scenes[sceneId]);
    });
  }

  window.addEventListener('load', function() {
    var loader = document.getElementById('loader');
    hide(loader);
  });

  // setTimeout(function(){
  //   var loader = document.getElementById('loader');
  //   hide(loader)
  // }, 3000);

  // hide(loader)

  // code for developers
  // document.body.addEventListener('click', function(e) {
  //   var view = viewer.view();
  //   console.log(view.screenToCoordinates({ x: e.clientX, y: e.clientY }));
  // });

  // Display the initial scene.
  switchScene(scenes[0]);
})();
