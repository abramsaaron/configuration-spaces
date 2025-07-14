// GUI setup

let syncViewToggle;
// let guiMode;

let graphToggleButton, configSpaceToggleButton;

function updateIcons() {
  if (parameters.showGraph) {
    graphToggleButton.classList.add("text-green-500");
    graphToggleButton.classList.remove("text-white");
  } else {
    graphToggleButton.classList.add("text-white");
    graphToggleButton.classList.remove("text-green-500");
  }

  if (parameters.showConfigurationspace) {
    configSpaceToggleButton.classList.add("text-green-500");
    configSpaceToggleButton.classList.remove("text-white");
  } else {
    configSpaceToggleButton.classList.add("text-white");
    configSpaceToggleButton.classList.remove("text-green-500");
  }

  if (parameters.showRobots) {
    robotsToggleButton.classList.add("text-green-500");
    robotsToggleButton.classList.remove("text-white");
  } else {
    robotsToggleButton.classList.add("text-white");
    robotsToggleButton.classList.remove("text-green-500");
  }

  if (parameters.showText) {
    textToggleButton.classList.add("text-green-500");
    textToggleButton.classList.remove("text-white");
  } else {
    textToggleButton.classList.add("text-white");
    textToggleButton.classList.remove("text-green-500");
  }

  if (parameters.mode == "Move") {
    moveToggleButton.classList.add("text-green-500");
    moveToggleButton.classList.remove("text-white");
  } else {
    moveToggleButton.classList.add("text-white");
    moveToggleButton.classList.remove("text-green-500");
  }

  if (parameters.running) {
    physicsToggleButton.classList.add("text-green-500");
    physicsToggleButton.classList.remove("text-white");
  } else {
    physicsToggleButton.classList.add("text-white");
    physicsToggleButton.classList.remove("text-green-500");
  }
}

function initGUI() {
  if (verbose) console.log("initGUI");

  graphPickers = document.getElementsByClassName("graphpicker");

  for (let graphPicker of graphPickers) {
    graphPicker.addEventListener("click", (e) => {
      parameters.graphType = e.target.innerHTML;
      parameters.mode = "View";
      graphIsCustomized = false;
      init();
    });
  }

  graphToggleButton = document.getElementById("graphtoggle");
  graphToggleButton.onclick = (e) => {
    parameters.showGraph = !parameters.showGraph;
    updateURL();
    updateIcons();
  };

  configSpaceToggleButton = document.getElementById("configspacetoggle");
  configSpaceToggleButton.onclick = (e) => {
    parameters.showConfigurationspace = !parameters.showConfigurationspace;
    updateURL();
    updateIcons();
  };

  robotsToggleButton = document.getElementById("robotstoggle");
  robotsToggleButton.onclick = (e) => {
    parameters.showRobots = !parameters.showRobots;
    updateURL();
    updateIcons();
  };

  textToggleButton = document.getElementById("texttoggle");
  textToggleButton.onclick = (e) => {
    parameters.showText = !parameters.showText;
    updateIcons();
  };

  moveToggleButton = document.getElementById("movetoggle");
  moveToggleButton.onclick = (e) => {
    if (parameters.mode == "View") {
      parameters.mode = "Move";
    } else {
      parameters.mode = "View";
    }
    updateMode();
    updateIcons();
  };

  physicsToggleButton = document.getElementById("physicstoggle");
  physicsToggleButton.onclick = (e) => {
    parameters.running = !parameters.running;
    updateIcons();
  };

  updateIcons();

  document.getElementById("lilgui").innerHTML = "";

  // ----------------------------------------------------------------------//
  let paneGeneralSettings = new lil.GUI({
    title: "General settings",
    container: document.getElementById("lilgui"),
    width: 400,
  });

  paneGeneralSettings.add(parameters, "gridOn").name("Show square grids");

  paneGeneralSettings.add(parameters, "squareOn").name("Show square surfaces");

  paneGeneralSettings.add(parameters, "showLoops").name("Show loops");

  paneGeneralSettings.add(parameters, "showHyperplanes").name("Show hyperplanes");

  paneGeneralSettings
    .add(parameters, "dualView")
    .name("Dual view")
    .onChange((e) => {
      console.log("change in panel");
      console.log("parameters.dualView = " + parameters.dualView);
      setDualView(parameters.dualView);
    });

  syncViewToggle = paneGeneralSettings.add(parameters, "syncView").name("Sync cameras");

  if (!parameters.dualView) {
    syncViewToggle.hidden = true;
  }

  // ----------------------------------------------------------------------//
  let paneVisualSettings = new lil.GUI({
    title: "Visual settings",
    container: document.getElementById("lilgui"),
    width: 400,
  }).close();

  paneVisualSettings.add(parameters, "nodeSize", 0, 40, 1).name("Node size");

  paneVisualSettings.add(parameters, "robotsNodeSize", 0, 40, 1).name("Robot size");

  paneVisualSettings.add(parameters, "configNodeSize", 0, 40, 1).name("Configuration node size");

  paneVisualSettings.add(parameters, "sphereDetail", 1, 40, 1).name("Sphere detail");

  paneVisualSettings.add(parameters, "edgeWidthGraph", 0, 10, 0.1).name("Graph edge width");

  paneVisualSettings.add(parameters, "edgeWidthConfigSpace", 0, 10, 0.1);

  paneVisualSettings.add(parameters, "edgeWidthGrid", 0, 10, 0.1).name("Grid edge width");

  paneVisualSettings.add(parameters, "granularityGraph", 0, 80, 1).name("Edge granularity for graph");

  paneVisualSettings.add(parameters, "granularityFirstCoordinate", 0, 80, 1).name("Edge granularity for first coordinate");

  // .onChange((e) => {
  //   configuration_space.graphLayout.createInnerNodes();
  // })
  paneVisualSettings.add(parameters, "granularitySecondCoordinate", 0, 80, 1).name("Edge granularity for second coordinate");

  // .onChange((e) => {
  //   configuration_space.graphLayout.createInnerNodes();
  // })
  paneVisualSettings.addColor(parameters, "colorNode").name("Node color");

  paneVisualSettings.addColor(parameters, "colorRobotA").name("Color of Robot A node");

  paneVisualSettings.addColor(parameters, "colorRobotB").name("Color of Robot B node");

  paneVisualSettings.addColor(parameters, "colorConfig").name("Color of Configuration node");

  paneVisualSettings.addColor(parameters, "colorGraphEdge").name("Color of Edges in Graph");

  paneVisualSettings.addColor(parameters, "squareColor").name("Color of squares");

  paneVisualSettings.add(parameters, "squareOpacity", 0, 255, 1).name("Opacity of squares");

  paneVisualSettings.addColor(parameters, "activeDotColor").name("Color of selected node");

  paneVisualSettings.addColor(parameters, "deleteNodeColor").name("Color for deletion of node");

  paneVisualSettings.addColor(parameters, "selectedNodeForEdgeColor").name("Color for selected Node for Edge");

  paneVisualSettings.add(parameters, "fontSize", 10, 100, 1).name("Font size");

  paneVisualSettings.add(parameters, "labelZ", 0, 100, 1).name("Text distance from nodes");

  // ----------------------------------------------------------------------//
  let paneMotionSettings = new lil.GUI({
    title: "Motion settings",
    container: document.getElementById("lilgui"),
    width: 400,
  }).close();

  paneMotionSettings.add(parameters, "moveDotsRandomly").name("Move robots");

  paneMotionSettings.add(parameters, "amountMultiplier", 0, 1, 0.01).name("amountMultiplier");

  paneMotionSettings.add(parameters, "robotASpeed", 0, 1, 0.01).name("robotASpeed");

  paneMotionSettings.add(parameters, "robotBSpeed", 0, 1, 0.01).name("robotBSpeed");

  paneMotionSettings.add(parameters, "speedUp", 0, 1, 0.01).name("speedUp");

  paneMotionSettings.add(parameters, "recordHistory").name("recordHistory");

  paneMotionSettings.add(parameters, "showHistory").name("showHistory");

  // gui
  //   .add(
  //     {
  //       func() {
  //         console.log("hi");
  //       },
  //     },
  //     "func"
  //   )
  //   .onChange(change)
  //   .onFinishChange(finishChange);

  paneMotionSettings
    .add(
      {
        func() {
          configuration_space.graphLayout.configuration.resetHistory();
        },
      },
      "func"
    )
    .name("resetHistory");

  // ----------------------------------------------------------------------//
  let paneGraphLayout = new lil.GUI({
    title: "Graph layout settings",
    container: document.getElementById("lilgui"),
    width: 400,
  }).close();

  paneGraphLayout.add(graph.graphLayout, "edgelength", 1, 400).name("Target edge length");

  paneGraphLayout.add(graph.graphLayout, "graphEdgeForce", 0, 0.1, 0.001).name("Edge force");

  paneGraphLayout.add(parameters, "maxspeed", 0, 30, 0.01).name("Max node speed");

  paneGraphLayout.add(graph.graphLayout, "cohesionthreshold", 0, 2, 0.01).name("Neighbor attraction threshold");

  paneGraphLayout.add(graph.graphLayout, "repulsion", 0, 100000, 1).name("Repulsion");

  paneGraphLayout.add(graph.graphLayout, "separationFactor", 0, 1300, 1).name("Separation factor");

  paneGraphLayout.add(graph.graphLayout, "planarForce", 0, 0.15, 0.0001).name("Planar force");

  paneGraphLayout.add(graph.graphLayout, "centerForce", 0, 0.15, 0.0001).name("Center force").listen();

  paneGraphLayout.add(graph.graphLayout, "extraCenterForce", 0, 0.15, 0.0001).name("Extra center force");

  paneGraphLayout.add(graph.graphLayout, "moveToCenter").name("Adjust to center");

  // ----------------------------------------------------------------------//
  let paneConfigspaceLayout = new lil.GUI({
    title: "Configuration space layout settings",
    container: document.getElementById("lilgui"),
    width: 400,
  }).close();

  // here
  paneConfigspaceLayout
    .add(parameters, "layoutPreset", {
      "Layout 00": "layout-00.txt",
      "Layout 01": "layout-01.txt",
      "Layout 02": "layout-02.txt",
    })
    .name("Layout presets")
    .onChange((e) => {
      readLayoutFromFile(parameters.layoutPreset);
    });

  paneConfigspaceLayout.add(configuration_space.graphLayout, "firstCoordinateEdgeLength", 1, 1000, 1).name("First coordinate target edge length");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "firstCoordinateForce", 0, 0.1, 0.01).name("Force for first coordinate edge");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "secondCoordinateEdgeLength", 1, 1000, 1).name("Second coordinate target edge length");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "secondCoordinateForce", 0, 0.1, 0.0001).name("Force for second coordinate edge");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "firstCoordinateMirrorForce", -0.2, 0.2, 0.0001).name("First projection bias");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "secondCoordinateMirrorForce", -0.2, 0.2, 0.0001).name("Second projection bias");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "coordinatePreference", -0.1, 0.1, 0.01).name("Coordinate preference");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "extraCenterPreference", 0, 0.1, 0.0001).name("Extra center preference");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "cohesionthreshold", 0, 2, 0.01).name("Neighbor attraction threshold");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "repulsion", 0, 500000, 1).name("Repulsion");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "centroidRepulsion", 0, 500000, 1).name("Centroid Repulsion");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "separationFactor", 0, 1300, 1).name("Separation factor");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "centerForce", 0, 0.15, 0.0001).name("Center Force").listen();

  paneConfigspaceLayout.add(configuration_space.graphLayout, "extraCenterForce", 0, 0.15, 0.0001).name("Extra center force");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "moveToCenter").name("Adjust to center");

  paneConfigspaceLayout.add(parameters, "THETA", 0, 10, 0.01).name("THETA");

  paneConfigspaceLayout.add(configuration_space.graphLayout, "squarePlanarForce", 0, 0.2, 0.0001).name(";Square Planar Force");
}
