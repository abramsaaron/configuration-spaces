// GUI setup

let GUIS;

function initGUI() {
  if (verbose) console.log("initGUI");

  GUIS = [];

  // Define GUI elements.
  let guiLeft = document.getElementById("gui-left");
  let guiRight = document.getElementById("gui-right");

  // Set up events for choosing graphs.
  for (let graphPicker of document.getElementsByClassName("graphpicker")) {
    graphPicker.addEventListener("click", (e) => {
      parameters.graphType = e.target.innerHTML;
      parameters.mode = "View";
      graphIsCustomized = false;
      init();
    });
  }

  // Reset GUI elements.
  guiLeft.innerHTML = "";
  guiRight.innerHTML = "";

  // ----------------------------------------------------------------------//
  let optionsGUI = new lil.GUI({
    title: "Options",
    container: guiLeft,
    width: 300,
  });
  optionsGUI.add(parameters, "darkMode").name("Dark mode").listen();
  optionsGUI.add(parameters, "showGraph").name("Show graph").listen();
  optionsGUI.add(parameters, "showConfigurationspace").name("Show configuration space").listen();
  optionsGUI.add(parameters, "showRobots").name("Show robots").listen();
  optionsGUI.add(parameters, "showText").name("Show text").listen();
  optionsGUI.add(parameters, "showHyperplanes").name("Show hyperplanes");
  optionsGUI.add(parameters, "squareOn").name("Show square surfaces");
  optionsGUI.add(parameters, "gridOn").name("Show square grids");

  optionsGUI.add(parameters, "ordered").name("Ordered") .onChange((e) => {
    init();
  } );

  // ----------------------------------------------------------------------//
  let advancedGUI = new lil.GUI({
    title: "Advanced",
    container: guiLeft,
    // width: 300,
  }).close();
  advancedGUI.add(parameters, "mode").name("Mode").listen().disable();
  advancedGUI.add(parameters, "running").name("Running").listen();
  advancedGUI.add(parameters, "showLoops").name("Show loops");
  advancedGUI
    .add(parameters, "dualView")
    .name("Dual view")
    .onChange((e) => {
      setDualView(parameters.dualView);
    });
  syncViewToggle = advancedGUI.add(parameters, "syncView").name("Sync cameras");
  if (!parameters.dualView) {
    syncViewToggle.hide();
  }
  advancedGUI.add(parameters, "maxspeed", 0, 30, 0.01).name("Max node speed");

  // ----------------------------------------------------------------------//
  let visualsGUI = new lil.GUI({
    title: "Visuals",
    container: guiLeft,
    // width: 400,
  }).close();

  visualsGUI.add(parameters, "nodeSize", 0, 40, 1).name("Node size");
  visualsGUI.add(parameters, "robotsNodeSize", 0, 40, 1).name("Node size: Robot");
  visualsGUI.add(parameters, "configNodeSize", 0, 40, 1).name("Node size: Configuration");
  visualsGUI.add(parameters, "edgeWidthConfigSpace", 0, 10, 0.1).name("Edge width");
  visualsGUI.add(parameters, "edgeWidthGraph", 0, 10, 0.1).name("Edge width: Graph");
  visualsGUI.add(parameters, "edgeWidthGrid", 0, 10, 0.1).name("Edge width: Grid");
  visualsGUI.add(parameters, "fontSize", 10, 100, 1).name("Text size");
  visualsGUI.add(parameters, "labelZ", 0, 100, 1).name("Text offset from node");
  visualsGUI.add(parameters, "sphereView").name("Spheres as nodes");
  visualsGUI.add(parameters, "sphereDetail", 4, 40, 1).name("Sphere detail");
  visualsGUI.add(parameters, "granularityGraph", 0, 80, 1).name("Edge granularity: Graph");
  visualsGUI
    .add(parameters, "granularityFirstCoordinate", 0, 80, 1)
    .name("Edge granularity: First coordinate")
    .onChange((e) => {
      configuration_space.graphLayout.createInnerNodes();
    });
  visualsGUI
    .add(parameters, "granularitySecondCoordinate", 0, 80, 1)
    .name("Edge granularity: Second coordinate")
    .onChange((e) => {
      configuration_space.graphLayout.createInnerNodes();
    });

  // ----------------------------------------------------------------------//
  let colorsGUI = new lil.GUI({
    title: "Colors",
    container: guiLeft,
    // width: 400,
  }).close();

  colorsGUI.addColor(parameters, "colorNode").name("Nodes");
  colorsGUI.addColor(parameters, "colorRobotA").name("First robot/edges");
  colorsGUI.addColor(parameters, "colorRobotB").name("Second robot/edges");
  colorsGUI.addColor(parameters, "colorConfig").name("Configuration");
  colorsGUI.addColor(parameters, "colorGraphEdge").name("Graph edges");
  colorsGUI.addColor(parameters, "activeDotColor").name("Selected node");
  colorsGUI.addColor(parameters, "deleteNodeColor").name("Marked for deletion");
  colorsGUI.addColor(parameters, "selectedNodeForEdgeColor").name("Selected node for edge");
  colorsGUI.addColor(parameters, "squareColor").name("Squares");
  colorsGUI.add(parameters, "squareOpacity", 0, 255, 1).name("Square opacity");

  // ----------------------------------------------------------------------//
  let configurationSpaceGUI = new lil.GUI({
    title: "Configuration space layout",
    container: guiRight,
    width: 400,
  }); //.close();
  configurationSpaceGUI
    .add(parameters, "layoutPreset", {
      "Layout 00": "layout-00.txt",
      "Layout 01": "layout-01.txt",
      "Layout 02": "layout-02.txt",
    })
    .name("Layout presets")
    .onChange((e) => {
      readLayoutFromFile(parameters.layoutPreset);
    });
  configurationSpaceGUI.add(configuration_space.graphLayout, "firstCoordinateEdgeLength", 1, 1000, 1).name("Edge length: First coordinate");
  configurationSpaceGUI.add(configuration_space.graphLayout, "firstCoordinateForce", 0, 0.1, 0.01).name("Edge force: First coordinate");
  configurationSpaceGUI.add(configuration_space.graphLayout, "secondCoordinateEdgeLength", 1, 1000, 1).name("Edge length: Second coordinate");
  configurationSpaceGUI.add(configuration_space.graphLayout, "secondCoordinateForce", 0, 0.1, 0.0001).name("Edge force: Second coordinate");
  configurationSpaceGUI.add(configuration_space.graphLayout, "firstCoordinateMirrorForce", -0.2, 0.2, 0.0001).name("Force bias: First projection");
  configurationSpaceGUI.add(configuration_space.graphLayout, "secondCoordinateMirrorForce", -0.2, 0.2, 0.0001).name("Force bias: Second projection");
  configurationSpaceGUI.add(configuration_space.graphLayout, "coordinatePreference", -0.1, 0.1, 0.01).name("Coordinate preference");
  configurationSpaceGUI.add(configuration_space.graphLayout, "extraCenterPreference", 0, 0.1, 0.0001).name("Extra center preference");
  configurationSpaceGUI.add(configuration_space.graphLayout, "cohesionthreshold", 0, 2, 0.01).name("Neighbor attraction threshold");
  configurationSpaceGUI.add(configuration_space.graphLayout, "repulsion", 0, 500000, 1).name("Repulsion");
  configurationSpaceGUI.add(configuration_space.graphLayout, "centroidRepulsion", 0, 500000, 1).name("Centroid Repulsion");
  configurationSpaceGUI.add(configuration_space.graphLayout, "separationFactor", 0, 1300, 1).name("Separation factor");
  configurationSpaceGUI.add(configuration_space.graphLayout, "centerForce", 0, 0.15, 0.0001).name("Center Force").listen();
  configurationSpaceGUI.add(configuration_space.graphLayout, "extraCenterForce", 0, 0.15, 0.0001).name("Extra center force");
  configurationSpaceGUI.add(configuration_space.graphLayout, "moveToCenter").name("Adjust to center");
  configurationSpaceGUI.add(parameters, "THETA", 0, 10, 0.01).name("THETA");
  configurationSpaceGUI.add(configuration_space.graphLayout, "squarePlanarForce", 0, 0.1, 0.0001).name("Square Planar Force");

  // ----------------------------------------------------------------------//
  let graphLayoutGUI = new lil.GUI({
    title: "Graph layout",
    container: guiRight,
    width: 400,
  }).close();

  graphLayoutGUI.add(graph.graphLayout, "edgelength", 1, 400).name("Edge length");
  graphLayoutGUI.add(graph.graphLayout, "graphEdgeForce", 0, 0.1, 0.001).name("Edge force");
  graphLayoutGUI.add(graph.graphLayout, "cohesionthreshold", 0, 2, 0.01).name("Neighbor attraction threshold");
  graphLayoutGUI.add(graph.graphLayout, "repulsion", 0, 100000, 1).name("Repulsion");
  graphLayoutGUI.add(graph.graphLayout, "separationFactor", 0, 1300, 1).name("Separation factor");
  graphLayoutGUI.add(graph.graphLayout, "planarForce", 0, 0.15, 0.0001).name("Planar force");
  graphLayoutGUI.add(graph.graphLayout, "centerForce", 0, 0.15, 0.0001).name("Center force").listen();
  graphLayoutGUI.add(graph.graphLayout, "extraCenterForce", 0, 0.15, 0.0001).name("Extra center force");
  graphLayoutGUI.add(graph.graphLayout, "moveToCenter").name("Adjust to center");

  // ----------------------------------------------------------------------//
  let movementGUI = new lil.GUI({
    title: "Movement",
    container: guiRight,
    width: 400,
  }).close();
  movementGUI
    .add(parameters, "moveDotsRandomly")
    .name("Move robots")
    .onChange((e) => {
      if (parameters.moveDotsRandomly) parameters.showRobots = true;
    });
  movementGUI.add(parameters, "robotASpeed", 0, 1, 0.01).name("Speed of first robot");
  movementGUI.add(parameters, "robotBSpeed", 0, 1, 0.01).name("Speed of second robot");
  movementGUI.add(parameters, "amountMultiplier", 0, 1, 0.01).name("Multiplier");
  movementGUI.add(parameters, "speedUp", 0, 1, 0.01).name("Speed-up");
  movementGUI.add(parameters, "recordHistory").name("Record path");
  movementGUI.add(parameters, "showHistory").name("Show path");
  movementGUI
    .add(
      {
        resetHistory() {
          configuration_space.graphLayout.configuration.resetHistory();
        },
      },
      "resetHistory"
    )
    .name("resetHistory");

  // ----------------------------------------------------------------------//
  GUIS.push(optionsGUI, advancedGUI, visualsGUI, colorsGUI, configurationSpaceGUI, graphLayoutGUI, movementGUI);
}

function windowResized() {
  if (parameters.dualView) {
    graphicsForGraph.resizeCanvas(windowWidth / 2, windowHeight);
    graphicsForConfigurationSpace.resizeCanvas(windowWidth / 2, windowHeight);
  } else {
    graphicsForGraph.resizeCanvas(0, windowHeight);
    graphicsForConfigurationSpace.resizeCanvas(windowWidth, windowHeight);
  }
}

function startWarning(text) {
  let warning = createDiv(text);
  warning.class("warning");
  warning.parent(warningWrapper);
  setTimeout(function () {
    endWarning(warning);
  }, 3000);
}

function endWarning(warning) {
  warning.remove();
}
