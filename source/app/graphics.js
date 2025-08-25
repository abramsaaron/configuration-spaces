function resetCanvases() {
  if (graphicsForGraph !== undefined) {
    graphicsForGraph.remove();
  }
  if (graphicsForConfigurationSpace !== undefined) {
    graphicsForConfigurationSpace.remove();
  }
}

function initgraphicsForGraph(w, h) {
  graphicsForGraph = createGraphics(w, h, WEBGL);
  graphicsForGraph.smooth();
  graphicsForGraph.parent("graph");
  graphicsForGraph.pixelDensity(2);
  graphicsForGraph.show();
  setupEasyCam(graphicsForGraph, 500);
  addScreenPositionFunction(graphicsForGraph);
  if (vverbose) console.log(graphicsForGraph);
  graphicsForGraph.canvas.addEventListener("click", mousePressedOnLeft);
}

function initgraphicsForConfigurationSpace(w, h) {
  graphicsForConfigurationSpace = createGraphics(w, h, WEBGL);
  graphicsForConfigurationSpace.smooth();
  graphicsForConfigurationSpace.parent("configspace");
  graphicsForConfigurationSpace.pixelDensity(2);
  graphicsForConfigurationSpace.show();

  let gl = graphicsForConfigurationSpace.canvas.getContext("webgl");
  gl.disable(gl.DEPTH_TEST);

  setupEasyCam(graphicsForConfigurationSpace, 500);
  addScreenPositionFunction(graphicsForConfigurationSpace);
}
