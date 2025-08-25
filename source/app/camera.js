// Camera setup

function setupEasyCam(g, thisDistance) {
  let easycam = createEasyCam(g._renderer, {
    distance: thisDistance,
  });
  easycam.setDistanceMin(10);
  easycam.setDistanceMax(30000); // 3000
  easycam.attachMouseListeners(g._renderer);
  easycam.setWheelScale(300);
  easycam.setViewport([g.elt.offsetLeft, g.elt.offsetTop, g.elt.offsetWidth, g.elt.offsetHeight]);
  g.easycam = easycam;
}

function easyCamOff() {
  easyCamActive = false;
  graphicsForConfigurationSpace.easycam.removeMouseListeners();
  graphicsForGraph.easycam.removeMouseListeners();

  forcesActive = false;
  configuration_space.graphLayout.moveToCenter = false;
  graph.graphLayout.moveToCenter = false;
}

function easyCamOn() {
  easyCamActive = true;
  if (vverbose) print("easyCamOn");
  graphicsForConfigurationSpace.easycam.attachMouseListeners(graphicsForConfigurationSpace._renderer);
  graphicsForGraph.easycam.attachMouseListeners(graphicsForGraph._renderer);

  forcesActive = true;
  configuration_space.graphLayout.moveToCenter = true;
  graph.graphLayout.moveToCenter = true;
}

function setDualView(value) {
  parameters.dualView = value;
  if (parameters.dualView) {
    syncViewToggle.hidden = false;
  } else {
    syncViewToggle.hidden = true;
  }
  init();
}
