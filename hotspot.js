var lastHotspot;

  document.addEventListener('dblclick', function(event) {
    var coords = viewer.view().screenToCoordinates({ x: event.clientX, y: event.clientY });
    var element = createEmbeddedElement();
    lastHotspot = viewer
      .scene()
      .hotspotContainer()
      .createHotspot(
        element,
        { yaw: coords.yaw, pitch: coords.pitch },
        {
          perspective: {
            radius: 1300,
          },
        },
      );
    // console.log(viewer.view);
    console.log(coords);
  });

  var x = 0;
  var y = 0;
  var z = 0;
  var radius = 2000;
  document.addEventListener('keypress', function(event) {
    // console.log(event.key);
    // console.log(event);
    switch (event.key) {
      case 'x':
        x = event.ctrlKey ? x - 1 : x + 1;
        break;
      case 'y':
        y = event.ctrlKey ? y - 1 : y + 1;
        break;
      case 'z':
        z = event.ctrlKey ? z - 1 : z + 1;
        break;
      case 'q':
        x = 0;
        y = 0;
        z = 0;
        radius = 2000;
        break;
      case 'r':
        radius = event.ctrlKey ? radius - 1 : radius + 1;
        break;
    }
    if (lastHotspot) {
      var perspective = {
        extraRotations: `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
        radius: radius,
      };
      lastHotspot.setPerspective(perspective);
      var position = lastHotspot.position();
      var result = {
        yaw: position.yaw,
        pitch: position.pitch,
        perspective: perspective,
      };
      console.log(JSON.stringify(result));
    }
  });
