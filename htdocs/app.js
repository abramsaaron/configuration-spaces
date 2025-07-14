class BuildHistory { constructor() { } show(g) { g.fill(128) } } let syncViewToggle;
let graphToggleButton, configSpaceToggleButton;
function updateIcons() {
  if (parameters.showGraph) {
    graphToggleButton.classList.add("text-green-500");
    graphToggleButton.classList.remove("text-white")
  } else {
    graphToggleButton.classList.add("text-white");
    graphToggleButton.classList.remove("text-green-500")
  } if (parameters.showConfigurationspace) {
    configSpaceToggleButton.classList.add("text-green-500");
    configSpaceToggleButton.classList.remove("text-white")
  } else {
    configSpaceToggleButton.classList.add("text-white");
    configSpaceToggleButton.classList.remove("text-green-500")
  } if (parameters.showRobots) {
    robotsToggleButton.classList.add("text-green-500");
    robotsToggleButton.classList.remove("text-white")
  } else {
    robotsToggleButton.classList.add("text-white");
    robotsToggleButton.classList.remove("text-green-500")
  } if (parameters.showText) {
    textToggleButton.classList.add("text-green-500");
    textToggleButton.classList.remove("text-white")
  } else {
    textToggleButton.classList.add("text-white");
    textToggleButton.classList.remove("text-green-500")
  } if (parameters.mode == "Move") {
    moveToggleButton.classList.add("text-green-500");
    moveToggleButton.classList.remove("text-white")
  } else {
    moveToggleButton.classList.add("text-white");
    moveToggleButton.classList.remove("text-green-500")
  } if (parameters.running) {
    physicsToggleButton.classList.add("text-green-500");
    physicsToggleButton.classList.remove("text-white")
  } else {
    physicsToggleButton.classList.add("text-white");
    physicsToggleButton.classList.remove("text-green-500")
  }
} function initGUI() {
  if (verbose) console.log("initGUI");

  graphPickers = document.getElementsByClassName("graphpicker");
  for (let graphPicker of graphPickers) {
    graphPicker.addEventListener("click", (e => {
      parameters.graphType = e.target.innerHTML;
      parameters.mode = "View";
      graphIsCustomized = false;
      init()
    }))
  } graphToggleButton = document.getElementById("graphtoggle");
  graphToggleButton.onclick = e => {
    parameters.showGraph = !parameters.showGraph;
    updateURL();
    updateIcons()
  };
  configSpaceToggleButton = document.getElementById("configspacetoggle");
  configSpaceToggleButton.onclick = e => {
    parameters.showConfigurationspace = !parameters.showConfigurationspace;
    updateURL();
    updateIcons()
  };
  robotsToggleButton = document.getElementById("robotstoggle");
  robotsToggleButton.onclick = e => {
    parameters.showRobots = !parameters.showRobots;
    updateURL();
    updateIcons()
  };
  textToggleButton = document.getElementById("texttoggle");
  textToggleButton.onclick = e => {
    parameters.showText = !parameters.showText;
    updateIcons()
  };
  moveToggleButton = document.getElementById("movetoggle");
  moveToggleButton.onclick = e => {
    if (parameters.mode == "View") { parameters.mode = "Move" } else { parameters.mode = "View" } updateMode();
    updateIcons()
  };
  physicsToggleButton = document.getElementById("physicstoggle");
  physicsToggleButton.onclick = e => {
    parameters.running = !parameters.running;
    updateIcons()
  };
  updateIcons();
  document.getElementById("lilgui").innerHTML = "";
  let paneGeneralSettings = new lil.GUI({ title: "General settings", container: document.getElementById("lilgui"), width: 400 });
  paneGeneralSettings.add(parameters, "gridOn").name("Show square grids");
  paneGeneralSettings.add(parameters, "squareOn").name("Show square surfaces");
  paneGeneralSettings.add(parameters, "showLoops").name("Show loops");
  paneGeneralSettings.add(parameters, "showHyperplanes").name("Show hyperplanes");
  paneGeneralSettings.add(parameters, "dualView").name("Dual view").onChange((e => {
    console.log("change in panel");
    console.log("parameters.dualView = " + parameters.dualView);
    setDualView(parameters.dualView)
  }));
  syncViewToggle = paneGeneralSettings.add(parameters, "syncView").name("Sync cameras");
  if (!parameters.dualView) { syncViewToggle.hidden = true } let paneVisualSettings = new lil.GUI({ title: "Visual settings", container: document.getElementById("lilgui"), width: 400 }).close();
  paneVisualSettings.add(parameters, "nodeSize", 0, 40, 1).name("Node size");
  paneVisualSettings.add(parameters, "robotsNodeSize", 0, 40, 1).name("Robot size");
  paneVisualSettings.add(parameters, "configNodeSize", 0, 40, 1).name("Configuration node size");
  paneVisualSettings.add(parameters, "sphereDetail", 1, 40, 1).name("Sphere detail");
  paneVisualSettings.add(parameters, "edgeWidthGraph", 0, 10, .1).name("Graph edge width");
  paneVisualSettings.add(parameters, "edgeWidthConfigSpace", 0, 10, .1);
  paneVisualSettings.add(parameters, "edgeWidthGrid", 0, 10, .1).name("Grid edge width");
  paneVisualSettings.add(parameters, "granularityGraph", 0, 80, 1).name("Edge granularity for graph");
  paneVisualSettings.add(parameters, "granularityFirstCoordinate", 0, 80, 1).name("Edge granularity for first coordinate");
  paneVisualSettings.add(parameters, "granularitySecondCoordinate", 0, 80, 1).name("Edge granularity for second coordinate");
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
  let paneMotionSettings = new lil.GUI({ title: "Motion settings", container: document.getElementById("lilgui"), width: 400 }).close();
  paneMotionSettings.add(parameters, "moveDotsRandomly").name("Move robots");
  paneMotionSettings.add(parameters, "amountMultiplier", 0, 1, .01).name("amountMultiplier");
  paneMotionSettings.add(parameters, "robotASpeed", 0, 1, .01).name("robotASpeed");
  paneMotionSettings.add(parameters, "robotBSpeed", 0, 1, .01).name("robotBSpeed");
  paneMotionSettings.add(parameters, "speedUp", 0, 1, .01).name("speedUp");
  paneMotionSettings.add(parameters, "recordHistory").name("recordHistory");
  paneMotionSettings.add(parameters, "showHistory").name("showHistory");
  paneMotionSettings.add({ func() { configuration_space.graphLayout.configuration.resetHistory() } }, "func").name("resetHistory");
  let paneGraphLayout = new lil.GUI({ title: "Graph layout settings", container: document.getElementById("lilgui"), width: 400 }).close();
  paneGraphLayout.add(graph.graphLayout, "edgelength", 1, 400).name("Target edge length");
  paneGraphLayout.add(graph.graphLayout, "graphEdgeForce", 0, .1, .001).name("Edge force");
  paneGraphLayout.add(parameters, "maxspeed", 0, 30, .01).name("Max node speed");
  paneGraphLayout.add(graph.graphLayout, "cohesionthreshold", 0, 2, .01).name("Neighbor attraction threshold");
  paneGraphLayout.add(graph.graphLayout, "repulsion", 0, 1e5, 1).name("Repulsion");
  paneGraphLayout.add(graph.graphLayout, "separationFactor", 0, 1300, 1).name("Separation factor");
  paneGraphLayout.add(graph.graphLayout, "planarForce", 0, .15, 1e-4).name("Planar force");
  paneGraphLayout.add(graph.graphLayout, "centerForce", 0, .15, 1e-4).name("Center force").listen();
  paneGraphLayout.add(graph.graphLayout, "extraCenterForce", 0, .15, 1e-4).name("Extra center force");
  paneGraphLayout.add(graph.graphLayout, "moveToCenter").name("Adjust to center");
  let paneConfigspaceLayout = new lil.GUI({ title: "Configuration space layout settings", container: document.getElementById("lilgui"), width: 400 }).close();
  paneConfigspaceLayout.add(parameters, "layoutPreset", { "Layout 00": "layout-00.txt", "Layout 01": "layout-01.txt", "Layout 02": "layout-02.txt" }).name("Layout presets").onChange((e => { readLayoutFromFile(parameters.layoutPreset) }));
  paneConfigspaceLayout.add(configuration_space.graphLayout, "firstCoordinateEdgeLength", 1, 1e3, 1).name("First coordinate target edge length");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "firstCoordinateForce", 0, .1, .01).name("Force for first coordinate edge");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "secondCoordinateEdgeLength", 1, 1e3, 1).name("Second coordinate target edge length");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "secondCoordinateForce", 0, .1, 1e-4).name("Force for second coordinate edge");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "firstCoordinateMirrorForce", -.2, .2, 1e-4).name("First projection bias");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "secondCoordinateMirrorForce", -.2, .2, 1e-4).name("Second projection bias");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "coordinatePreference", -.1, .1, .01).name("Coordinate preference");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "extraCenterPreference", 0, .1, 1e-4).name("Extra center preference");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "cohesionthreshold", 0, 2, .01).name("Neighbor attraction threshold");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "repulsion", 0, 5e5, 1).name("Repulsion");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "centroidRepulsion", 0, 5e5, 1).name("Centroid Repulsion");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "separationFactor", 0, 1300, 1).name("Separation factor");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "centerForce", 0, .15, 1e-4).name("Center Force").listen();
  paneConfigspaceLayout.add(configuration_space.graphLayout, "extraCenterForce", 0, .15, 1e-4).name("Extra center force");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "moveToCenter").name("Adjust to center");
  paneConfigspaceLayout.add(parameters, "THETA", 0, 10, .01).name("THETA");
  paneConfigspaceLayout.add(configuration_space.graphLayout, "squarePlanarForce", 0, .2, 1e-4).name(";
Square Planar Force")}"use strict";
let verbose = !true;
  let vverbose = !true;
  let graph;
  let graphs = {};
  let graphicsForGraph, graphicsForConfigurationSpace;
  let configuration_space;
  let cameraState, areWeOnTheLeft;
  let font;
  let infoStrings, layoutStrings;
  let chooseFile;
  let easyCamActive = true;
  let temperature = 1;
  let cold = .001;
  let coolingRate = 0;
  let octForces = true;
  let graphIsCustomized = !true;
  let gui;
  let parameters = {};
  let customGraph;
  let infoDiv;
  let warningWrapper;
  let infoString;
  let takeScreenshotGraph = !true;
  let takeScreenshotConfigSpace = !true;
  let loadingFromFile = !true;
  let forcesActive = true;
  let robotAmoving = true;
  let robotBmoving = true;
  let addSingleNodeMode = false;
  let nodeSelectedForEdgeAddition;
  let deleteNodeMode = false;
  let selectedNodesInGraph = [];
  let selectedNodesInConfigSpace = [];
  function preload() {
    font = loadFont("fonts/Myriad_Pro_6809.otf");
    initParameters();
    let str = getURL();
    let parts = split(str, "?");
    if (parts.length !== 2) return;
    let inputString = parts[1];
    let urlParameters = {};
    for (let p of split(inputString, "&")) {
      let parts = split(p, "=");
      urlParameters[parts[0]] = parts[1]
    } if (urlParameters["file"] !== undefined) {
      readFromFile(urlParameters["file"]);
      takeScreenshotConfigSpace = true;
      loadingFromFile = true
    }
  } function windowResized() {
    if (parameters.dualView) {
      graphicsForGraph.resizeCanvas(windowWidth / 2, windowHeight);
      graphicsForConfigurationSpace.resizeCanvas(windowWidth / 2, windowHeight)
    } else {
      graphicsForGraph.resizeCanvas(0, windowHeight);
      graphicsForConfigurationSpace.resizeCanvas(windowWidth, windowHeight)
    }
  } function setup() {
    if (verbose) console.log("setup");
    noCanvas();
    setAttributes("antialias", true);
    infoDiv = select("#info");
    warningWrapper = select("#warningWrapper");
    if (loadingFromFile) { } else {
      setParametersFromURL();
      if (verbose) console.log("setup continues");
      init()
    }
  } function startWarning(text) {
    let warning = createDiv(text);
    warning.class("warning");
    warning.parent(warningWrapper);
    setTimeout((function () { endWarning(warning) }), 3e3)
  } function endWarning(warning) { warning.remove() } function resetCanvases() { if (graphicsForGraph !== undefined) { graphicsForGraph.remove() } if (graphicsForConfigurationSpace !== undefined) { graphicsForConfigurationSpace.remove() } } function initgraphicsForGraph(w, h) {
    graphicsForGraph = createGraphics(w, h, WEBGL);
    graphicsForGraph.smooth();
    graphicsForGraph.parent("graph");
    graphicsForGraph.pixelDensity(2);
    graphicsForGraph.show();
    setupEasyCam(graphicsForGraph, 500);
    addScreenPositionFunction(graphicsForGraph);
    if (vverbose) console.log(graphicsForGraph);
    graphicsForGraph.canvas.addEventListener("click", mousePressedOnLeft)
  } function initgraphicsForConfigurationSpace(w, h) {
    graphicsForConfigurationSpace = createGraphics(w, h, WEBGL);
    graphicsForConfigurationSpace.smooth();
    graphicsForConfigurationSpace.parent("configspace");
    graphicsForConfigurationSpace.pixelDensity(2);
    graphicsForConfigurationSpace.show();
    let gl = graphicsForConfigurationSpace.canvas.getContext("webgl");
    gl.disable(gl.DEPTH_TEST);
    setupEasyCam(graphicsForConfigurationSpace, 500);
    addScreenPositionFunction(graphicsForConfigurationSpace)
  } function init() {
    if (verbose) console.log("init");
    selectedNodesInGraph = [];
    initView();
    initGraph(parameters.graphType);
    initGUI()
  } function updateMode() {
    if (verbose) console.log("updateMode: " + parameters.mode);
    switch (parameters.mode) {
      case "View": console.log("updateMode: View mode");
        easyCamOn();
        deleteNodeMode = false;
        break;
      case "Move": console.log("updateMode: Move mode");
        easyCamOff();
        deleteNodeMode = false;
        break
    }if (verbose) console.log("updateMode: refresh tweakpane");
    updateIcons()
  } function setDualView(value) {
    parameters.dualView = value;
    if (parameters.dualView) { syncViewToggle.hidden = false } else { syncViewToggle.hidden = true } init()
  } function initView() {
    if (verbose) console.log("initView");
    resetCanvases();
    if (parameters.dualView) {
      initgraphicsForGraph(windowWidth / 2, windowHeight);
      initgraphicsForConfigurationSpace(windowWidth / 2, windowHeight)
    } else {
      initgraphicsForGraph(0, windowHeight);
      initgraphicsForConfigurationSpace(windowWidth, windowHeight)
    } if (parameters.lights) {
      let ambientBrightness = 180;
      let directionalBrightness = 180;
      graphicsForGraph.ambientLight(ambientBrightness, ambientBrightness, ambientBrightness);
      graphicsForGraph.directionalLight(directionalBrightness, directionalBrightness, directionalBrightness, -1, 0, 0);
      graphicsForConfigurationSpace.ambientLight(ambientBrightness, ambientBrightness, ambientBrightness);
      graphicsForConfigurationSpace.directionalLight(directionalBrightness, directionalBrightness, directionalBrightness, -1, 0, 0)
    }
  } function initParameters() {
    if (verbose) console.log("initParameters");
    parameters.graphType = "K(1,9)";
    parameters.mode = "View";
    parameters.running = true;
    parameters.showGraph = true;
    parameters.showConfigurationspace = true;
    parameters.showInfo = !true;
    parameters.showRobots = true;
    parameters.showLoops = !true;
    parameters.syncView = true;
    parameters.debugMode = !true;
    parameters.distinguishDots = !true;
    parameters.gridOn = !true;
    parameters.layoutPreset = "layout-00.txt";
    parameters.squareOn = true;
    parameters.showHyperplanes = true;
    parameters.granularityGraph = 2;
    parameters.granularityFirstCoordinate = 2;
    parameters.granularitySecondCoordinate = 2;
    parameters.showText = !true;
    parameters.sphereView = true;
    parameters.lights = true;
    parameters.moveDotsRandomly = !true;
    parameters.robotASpeed = .1;
    parameters.robotBSpeed = .1;
    parameters.amountMultiplier = .05;
    parameters.recordHistory = !true;
    parameters.showHistory = !true;
    parameters.dualView = false;
    parameters.sphereDetail = 20;
    parameters.resetHistory = function () { configuration_space.graphLayout.configuration.resetHistory() };
    parameters.speedUp = 1;
    parameters.labelX = 0;
    parameters.labelY = 0;
    parameters.labelZ = 2;
    parameters.fontSize = 30;
    parameters.colorRobotA = "#bb0000";
    parameters.colorRobotB = "#444444";
    parameters.colorConfig = "#4499ee";
    parameters.colorNode = "#999999";
    parameters.colorGraphEdge = "#4499ee";
    parameters.squareColor = "#888888";
    parameters.squareOpacity = 100;
    parameters.activeDotColor = "#cc7700";
    parameters.deleteNodeColor = "#6600ff";
    parameters.selectedNodeForEdgeColor = "#4455bb";
    parameters.maxspeed = 300;
    parameters.nodeSize = 20;
    parameters.robotsNodeSize = 21;
    parameters.configNodeSize = 21;
    parameters.edgeWidthGraph = 4.5;
    parameters.edgeWidthConfigSpace = 2;
    parameters.edgeWidthGrid = .4;
    parameters.THETA = 2.6
  } function draw() {
    if (temperature > cold) {
      tick();
      graph.update();
      configuration_space.update()
    } if (parameters.moveDotsRandomly) {
      for (let i = 0;
        i < parameters.speedUp;
        i++) { graph.moveRobots() }
    } graph.show();
    configuration_space.show();
    if (takeScreenshotGraph) {
      takeScreenshotGraph = false;
      saveCanvas(graph.graphLayout.graphics, makeFileName("-graph") + ".png")
    } if (takeScreenshotConfigSpace) {
      takeScreenshotConfigSpace = false;
      let filename = makeFileName("-configspace") + ".png";
      if (verbose) console.log("taking screenshot of config space: " + filename);
      saveCanvas(configuration_space.graphLayout.graphics, filename)
    } if (mouseIsPressed) { ourMouseDragged() }
  } function makeFileName(postString) {
    let time = str(year()) + ("0" + str(month())).slice(-2) + ("0" + str(day())).slice(-2) + "_" + ("0" + str(hour())).slice(-2) + ("0" + str(minute())).slice(-2) + ("0" + str(second())).slice(-2);
    return parameters.graphType + postString + "_" + time
  } function tick() { temperature = temperature * (1 - coolingRate) } function reheat() { temperature = 1 } function setupEasyCam(g, thisDistance) {
    let easycam = createEasyCam(g._renderer, { distance: thisDistance });
    easycam.setDistanceMin(10);
    easycam.setDistanceMax(3e4);
    easycam.attachMouseListeners(g._renderer);
    easycam.setWheelScale(300);
    easycam.setViewport([g.elt.offsetLeft, g.elt.offsetTop, g.elt.offsetWidth, g.elt.offsetHeight]);
    g.easycam = easycam
  } function initGraph(graphType) {
    reheat();
    if (verbose) print("initGraph: " + graphType);
    if (graphType === "random") { graph = randomGraph() } else if (graphType === "custom" && customGraph !== undefined) { graph = new Graph(customGraph.nodes, customGraph.edges) } else if (graphType.charAt(0) === "K") {
      graphType = graphType.slice(2, -1);
      let numbers = split(graphType, ",");
      if (numbers.length == 2) { graph = completeBipartiteGraph(int(numbers[0]), int(numbers[1])) } else if (numbers.length == 1) { graph = completeGraph(int(numbers[0])) }
    } else if (graphType.charAt(0) === "C") {
      graphType = graphType.slice(2, -1);
      let numbers = split(graphType, ",");
      if (numbers.length == 1) { graph = chainGraph(int(numbers[0])) }
    } else if (graphType.charAt(0) === "W") {
      graphType = graphType.slice(2, -1);
      let numbers = split(graphType, ",");
      if (numbers.length == 1) { graph = wheelGraph(int(numbers[0])) }
    } graph.createGraphLayout(graphicsForGraph, true);
    configuration_space = new Configuration_space(graph, 2);
    if (vverbose) print(configuration_space);
    if (verbose) print("initGraph: call updateURL");
    updateURL()
  } class Graph {
    constructor(nodeLabels, edgeLabels) {
      this.type = "graph";
      this.nodes = nodeLabels;
      this.edges = edgeLabels
    } update() { this.graphLayout.update() } show() { this.graphLayout.show() } getRobots() { return [this.robotA, this.robotB] } otherRobot(robot) {
      if (this.robotA === robot) return this.robotB;
      else return this.robotA
    } moveRobots() {
      let addtoA = parameters.amountMultiplier * parameters.robotASpeed;
      let addtoB = parameters.amountMultiplier * parameters.robotBSpeed;
      let nextA = this.robotA.amount + addtoA;
      let nextB = this.robotB.amount + addtoB;
      if (nextA >= 1 && nextB < 1) {
        nextA = 1;
        nextB = this.robotB.amount + addtoB * (1 - this.robotA.amount) / addtoA
      } else if (nextA < 1 && nextB >= 1) {
        nextB = 1;
        nextA = this.robotA.amount + addtoA * (1 - this.robotB.amount) / addtoB
      } else if (nextA >= 1 && nextB >= 1) {
        let timeA = (1 - this.robotA.amount) / (nextA - this.robotA.amount);
        let timeB = (1 - this.robotB.amount) / (nextB - this.robotB.amount);
        if (timeA > timeB) {
          nextB = 1;
          nextA = this.robotA.amount + addtoA * timeB
        } else {
          nextA = 1;
          nextB = this.robotB.amount + addtoB * timeA
        }
      } if (robotAmoving) { this.robotA.setAmount(nextA) } if (robotBmoving) { this.robotB.setAmount(nextB) } if (parameters.recordHistory) { configuration_space.graphLayout.configuration.record(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount) }
    } createGraphLayout(graphics, layout3D) {
      this.graphLayout = new GraphLayout(this, graphics, layout3D);
      for (let nodeLabel of this.nodes) { this.graphLayout.addNode(nodeLabel) } for (let edgeLabel of this.edges) {
        let nodeFrom = this.graphLayout.getNode(edgeLabel[0]);
        let nodeTo = this.graphLayout.getNode(edgeLabel[1]);
        this.graphLayout.addEdge(edgeLabel, nodeFrom, nodeTo)
      } this.robotA = new Robot(this, this.graphLayout.nodes[0], 0);
      this.robotB = new Robot(this, this.graphLayout.nodes[1], 1);
      this.graphLayout.initlayout()
    }
  } class Configuration_space {
    constructor(graph, dimension) {
      this.type = "configuration_space";
      this.dimension = dimension;
      let positions = graph.nodes.concat(graph.edges);
      let possible_states = cartesianProductOf(positions, positions);
      this.states = possible_states.filter(is_state);
      if (vverbose) console.log(this.states);
      if (vverbose) print("States:");
      if (vverbose) print(this.states);
      this.createGraphLayout(graphicsForConfigurationSpace, true)
    } update() { this.graphLayout.update() } show() { this.graphLayout.show() } getRobots() { return [] } getDegree(state) { return flatten(state).length - this.dimension } addStates(label) {
      let positions = graph.nodes.concat(graph.edges);
      let newPossibleStates = cartesianProductOf([label], positions).concat(cartesianProductOf(positions, [label]));
      if (vverbose) console.log("newPossibleStates");
      if (vverbose) console.log(newPossibleStates);
      let newStates = newPossibleStates.filter(is_state);
      for (let state of newStates) {
        this.addStateToGraphLayout(state);
        this.states.push(state)
      }
    } removeStates(label) {
      if (verbose) console.log("removeStates: " + label);
      let survivingStates = [];
      let statesToDelete = [];
      if (Array.isArray(label)) { for (let state of this.states) { if (arraysEqual(label, state[0]) || arraysEqual(label, state[1])) { statesToDelete.push(state) } else { survivingStates.push(state) } } } else { for (let state of this.states) { if (flatten(state).includes(label)) { statesToDelete.push(state) } else { survivingStates.push(state) } } } if (verbose) console.log("survivingStates");
      if (verbose) console.log(survivingStates);
      if (verbose) console.log("statesToDelete");
      if (verbose) console.log(statesToDelete);
      for (let state of statesToDelete) {
        switch (this.getDegree(state)) {
          case 0: console.log("deleteNode ");
            console.log(state);
            this.graphLayout.deleteNode(state);
            break;
          case 1: console.log("deleteEdge ");
            console.log(state);
            this.graphLayout.deleteEdge(state);
            break;
          case 2: console.log("deleteSquare ");
            console.log(state);
            this.graphLayout.deleteSquare(state);
            break
        }this.states = survivingStates
      }
    } addStateToGraphLayout(state) {
      switch (this.getDegree(state)) {
        case 0: if (vverbose) print("state_1:");
          if (vverbose) print(state);
          this.graphLayout.addNode(state);
          break;
        case 1: if (vverbose) print("state_1:");
          if (vverbose) print(state);
          if (Array.isArray(state[0])) {
            let nodeFrom = this.graphLayout.getNode([state[0][0], state[1]]);
            let nodeTo = this.graphLayout.getNode([state[0][1], state[1]]);
            this.graphLayout.addEdge(state, nodeFrom, nodeTo)
          } else if (Array.isArray(state[1])) {
            let nodeFrom = this.graphLayout.getNode([state[0], state[1][0]]);
            let nodeTo = this.graphLayout.getNode([state[0], state[1][1]]);
            if (vverbose) print("nodeFrom:");
            if (vverbose) print(nodeFrom);
            this.graphLayout.addEdge(state, nodeFrom, nodeTo)
          } else { if (vverbose) print("error") } break;
        case 2: if (vverbose) print("state_2:");
          if (vverbose) print(state);
          let edgeAfrom = this.graphLayout.getEdge(state[0][0], state[1], true);
          let edgeAto = this.graphLayout.getEdge(state[0][1], state[1], true);
          let edgeBfrom = this.graphLayout.getEdge(state[0], state[1][0], true);
          let edgeBto = this.graphLayout.getEdge(state[0], state[1][1], true);
          if (vverbose) print(edgeAfrom);
          if (vverbose) print(edgeAto);
          this.graphLayout.addSquare(state, edgeAfrom, edgeAto, edgeBfrom, edgeBto);
          break
      }
    } createGraphLayout(graphics, layout3D) {
      if (verbose) console.log("createGraphLayout");
      this.graphLayout = new GraphLayout(this, graphics, layout3D);
      this.graphLayout.showConfiguration = true;
      for (let state of this.states) { this.addStateToGraphLayout(state) } this.graphLayout.configuration = new Configuration(this.graphLayout, graph.robotA, graph.robotB);
      this.graphLayout.initlayout()
    }
  } class GraphLayout {
    constructor(source, graphics, layout3D) {
      this.source = source;
      this.graphics = graphics;
      this.layout3D = layout3D;
      this.updating = !true;
      this.nodes = [];
      this.nodeBorder = true;
      this.nodeBorderWidth = .05;
      this.showNodes = true;
      this.edges = [];
      this.showEdges = true;
      this.squares = [];
      this.showSquares = true;
      this.planarForce = 0;
      this.squarePlanarForce = 0;
      this.centerForce = .001;
      this.extraCenterForce = 0;
      this.moveToCenter = true;
      this.edgelength = 100;
      this.firstCoordinateEdgeLength = 100;
      this.secondCoordinateEdgeLength = 100;
      this.graphEdgeForce = .01;
      this.firstCoordinateForce = .05;
      this.secondCoordinateForce = .01;
      this.firstCoordinateMirrorForce = .01;
      this.secondCoordinateMirrorForce = -.01;
      this.extraCenterPreference = 0;
      this.coordinatePreference = .01;
      this.center = createVector(0, 0, 0);
      this.heat = 1;
      this.coolDown = .01;
      this.cohesionthreshold = 10;
      this.cohesionFactor = 1;
      this.repulsion = 5e4;
      this.centroidRepulsion = 5e4;
      this.separationFactor = 30;
      this.keyboardactive = true
    } initlayout() {
      if (octForces) {
        for (let i = 0;
          i < 10;
          i++) {
            this.updateOctree();
          for (let node of this.nodes) {
            node.update(this.nodes);
            node.move()
          }
        }
      }
    } updateOctree() {
      if (vverbose) console.log("updateOctree");
      let factor = 4;
      this.octree = new Octree(this, new Cube(0, 0, 0, factor * max(windowWidth, windowHeight), factor * max(windowWidth, windowHeight), factor * max(windowWidth, windowHeight)), 0);
      if (this.source.type === "graph") { for (let node of this.nodes) this.octree.insert(node) } if (this.source.type === "configuration_space") { for (let node of this.nodes) { if (node.innerNode !== undefined) { this.octree.insert(node.innerNode) } } } this.octree.calculateMass()
    } show() {
      this.graphics.clear();
      let gl = graphicsForConfigurationSpace.canvas.getContext("webgl");
      gl.disable(gl.DEPTH_TEST);
      if (this.source.type === "configuration_space" && parameters.showConfigurationspace) { if (this.showSquares) { for (let square of this.squares) square.show() } } gl.enable(gl.DEPTH_TEST);
      if (this.source.type === "configuration_space") { if (parameters.showGraph) { for (let node of graph.graphLayout.nodes) { node.show(this.graphics) } for (let edge of graph.graphLayout.edges) { edge.show(this.graphics) } if (parameters.showRobots) { for (let robot of graph.getRobots()) { robot.show(this.graphics) } } } } if (this.source.type === "graph" || parameters.showConfigurationspace) { if (this.showEdges) { for (let edge of this.edges) { edge.show(this.graphics) } } if (this.showNodes) { for (let node of this.nodes) { node.show(this.graphics) } } } if (this.source.type === "configuration_space" && parameters.showLoops) {
        if (configuration_space.loops !== undefined) {
          let numberOfLoops = configuration_space.loops.length;
          for (let i = 0;
            i < numberOfLoops;
            i++) {
              for (let edgeArray of configuration_space.loops[i]) {
                let edge = this.getEdge(edgeArray[0], edgeArray[1], true);
                colorMode(HSB);
                let col = color(map(i, 0, numberOfLoops, 0, 255), 255, 255);
                edge.show(this.graphics, 2.5, col)
              }
          }
        }
      } if (this.source.type === "graph") { if (parameters.showRobots) { for (let robot of this.source.getRobots()) { robot.show(this.graphics) } } } if (this.source.type === "configuration_space" && parameters.showConfigurationspace && parameters.showRobots) { if (this.showConfiguration) { this.configuration.show() } } if (this.source.type === "graph" && parameters.showText) { for (let node of this.nodes) { node.showText(this.graphics) } } if (this.source.type === "configuration_space" && this.showNodes && parameters.showConfigurationspace && parameters.showText) { for (let node of this.nodes) { node.showText(this.graphics) } } if (this.source.type === "configuration_space" && parameters.showGraph && parameters.showText) { for (let node of graph.graphLayout.nodes) { node.showText(this.graphics) } } this.counter++
    } update() {
      if (forcesActive && parameters.running) {
        if (octForces) { this.updateOctree() } if (this.moveToCenter) {
          let centerAdjustmentX = 0;
          let centerAdjustmentY = 0;
          let centerAdjustmentZ = 0;
          for (let node of this.nodes) {
            centerAdjustmentX += (-node.position.x + this.center.x) / this.nodes.length;
            centerAdjustmentY += (-node.position.y + this.center.y) / this.nodes.length;
            centerAdjustmentZ += (-node.position.z + this.center.z) / this.nodes.length
          } for (let node of this.nodes) { if (!node.frozen) node.position.add(.1 * centerAdjustmentX, .1 * centerAdjustmentY, .1 * centerAdjustmentZ) }
        } for (let node of this.nodes) { node.update(this.nodes) } for (let node of this.nodes) { node.move() }
      }
    } getNode(label) {
      for (let node of this.nodes) { if (arraysEqual(node.label, label)) { return node } } if (vverbose) print("returning false");
      return false
    } getEdge(labelA, labelB, directed) {
      if (vverbose) print("getEdge: ");
      if (vverbose) print(labelA);
      if (vverbose) print(labelB);
      if (vverbose) print(directed);
      for (let edge of this.edges) {
        if (arraysEqual([labelA, labelB], edge.label) || !directed && arraysEqual([labelB, labelA], edge.label)) {
          if (vverbose) print("FOUND!");
          if (vverbose) print(edge);
          return edge
        }
      } return false
    } getSquare(labelA, labelB) {
      if (vverbose) print("getSquare: ");
      if (vverbose) print(labelA);
      if (vverbose) print(labelB);
      for (let square of this.squares) {
        if (vverbose) print(square.label);
        if (arraysEqual([labelA, labelB], square.label)) {
          if (vverbose) print("FOUND!");
          if (vverbose) print(square);
          return square
        }
      }
    } getCentroids(filterSquare) {
      let result = [];
      for (let square of this.squares) { result.push(square.getCentroid()) } return result
    } addNode(label, x, y, z) {
      if (vverbose) print("adding node " + label);
      let r = 10;
      let node = new Node(this, label, x === undefined ? random(-r, r) : x, y === undefined ? random(-r, r) : y, z === undefined ? random(-r, r) : z, 1);
      this.nodes.push(node);
      return node
    } deleteNode(label) {
      if (verbose) console.log("deleteNode: " + label);
      let nodeToDelete = this.getNode(label);
      for (neighbor of nodeToDelete.neighbors) {
        neighbor.neighbors = neighbor.neighbors.filter((x => !(x === nodeToDelete)));
        if (verbose) console.log("neighbor.neighbors: " + neighbor.neighbors)
      } this.nodes.splice(this.nodes.indexOf(nodeToDelete), 1)
    } addEdge(label, nodeFrom, nodeTo) {
      if (vverbose) print("adding edge " + label);
      if (vverbose) print("connecting:");
      if (vverbose) print(nodeFrom.label + " to " + nodeTo.label);
      let edge = new Edge(this, label, nodeFrom, nodeTo);
      this.edges.push(edge);
      nodeTo.connectTo(nodeFrom);
      nodeFrom.connectTo(nodeTo);
      return edge
    } deleteEdge(label) {
      if (verbose) console.log("deleteEdge: " + label);
      let edgeToDelete = this.getEdge(label[0], label[1], false);
      edgeToDelete.nodeFrom.neighbors = edgeToDelete.nodeFrom.neighbors.filter((x => x !== edgeToDelete.nodeTo));
      if (verbose) console.log("edgeToDelete.nodeFrom.neighbors: " + edgeToDelete.nodeFrom.neighbors);
      edgeToDelete.nodeTo.neighbors = edgeToDelete.nodeTo.neighbors.filter((x => x !== edgeToDelete.nodeFrom));
      if (verbose) console.log("edgeToDelete.nodeTo.neighbors: " + edgeToDelete.nodeTo.neighbors);
      this.edges.splice(this.edges.indexOf(edgeToDelete), 1)
    } addSquare(label, edgeAfrom, edgeAto, edgeBfrom, edgeBto) {
      let square = new Square(this, label, edgeAfrom, edgeAto, edgeBfrom, edgeBto);
      this.squares.push(square)
    } deleteSquare(label) {
      let squareToDelete = this.getSquare(label[0], label[1]);
      this.squares.splice(this.squares.indexOf(squareToDelete), 1)
    }
  } class Node {
    constructor(graphLayout, label, x, y, z, mass) {
      this.graphLayout = graphLayout;
      this.graphics = graphLayout.graphics;
      this.labelText = labelToString(label);
      this.applyExtraCenterForce = !true;
      this.label = label;
      this.mass = mass;
      if (vverbose) print(label);
      this.active = false;
      if (graphLayout.layout3D) {
        this.position = createVector(x, y, z);
        this.velocity = createVector(0, 0, 0);
        this.acceleration = createVector(0, 0, 0)
      } else {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0)
      } this.frozen = false;
      this.alive = true;
      this.neighbors = [];
      this.neighborsA = [];
      this.neighborsB = []
    } createInnerNode() { this.innerNode = new InnerNode(this, this.graphLayout, 0, this.position.copy()) } connectTo(node) { this.neighbors.push(node) } update(nodes) {
      this.acceleration.mult(0);
      let sep;
      if (octForces) { sep = this.graphLayout.octree.getAllNodesForces(this) } else { sep = this.getSeparationFromNodes(nodes) } if (this.graphLayout.source.type === "graph") {
        let coh = this.getSpringForce(this.graphLayout.edgelength, this.graphLayout.graphEdgeForce, this.neighbors);
        coh.mult(1 * this.graphLayout.cohesionFactor);
        this.acceleration.add(coh);
        this.acceleration.add(sep);
        if (this.graphLayout.planarForce > 0) {
          let planarNodePosition = createVector(this.position.x, this.position.y, 0);
          let planarForceAddition = this.getForceTowardsGoal(this.graphLayout.planarForce, planarNodePosition);
          this.acceleration.add(planarForceAddition)
        }
      } else {
        let cohA = this.getSpringForce(this.graphLayout.secondCoordinateEdgeLength, this.graphLayout.secondCoordinateForce, this.neighbors.filter((neighbor => neighbor.label[0] === this.label[0])));
        let cohB = this.getSpringForce(this.graphLayout.firstCoordinateEdgeLength, this.graphLayout.firstCoordinateForce, this.neighbors.filter((neighbor => neighbor.label[1] === this.label[1])));
        let cohAgraph = this.getForceTowardsGoal(this.graphLayout.firstCoordinateMirrorForce, graph.graphLayout.getNode(this.label[0]).position);
        let cohBgraph = this.getForceTowardsGoal(this.graphLayout.secondCoordinateMirrorForce, graph.graphLayout.getNode(this.label[1]).position);
        graph.graphLayout.nodes.forEach((node => { if (node.applyExtraCenterForce) { if (this.label[0] === node.label) { cohAgraph = cohAgraph.add(this.getForceTowardsGoal(this.graphLayout.extraCenterPreference, node.position)) } if (this.label[1] === node.label) { cohBgraph = cohBgraph.add(this.getForceTowardsGoal(-this.graphLayout.extraCenterPreference, node.position)) } } }));
        if (this.graphLayout.squarePlanarForce > 0) {
          for (let B of this.neighbors.filter((neighbor => neighbor.label[0] === this.label[0]))) {
            for (let C of this.neighbors.filter((neighbor => neighbor.label[1] === this.label[1]))) {
              if (C.label[0] !== B.label[1]) {
                let A = this.graphLayout.getNode([C.label[0], B.label[1]]);
                let target = getFourthPoint(A.position, B.position, C.position);
                let force = this.getForceTowardsGoal(this.graphLayout.squarePlanarForce, target);
                this.acceleration.add(force)
              }
            }
          }
        } cohA.mult(1 * this.graphLayout.cohesionFactor);
        cohB.mult(1 * this.graphLayout.cohesionFactor);
        this.acceleration.add(cohA);
        this.acceleration.add(cohB);
        this.acceleration.add(cohAgraph);
        this.acceleration.add(cohBgraph)
      } let centerForceAddition = this.getForceTowardsGoal(this.graphLayout.centerForce, this.graphLayout.center);
      this.acceleration.add(centerForceAddition);
      if (this.applyExtraCenterForce) {
        let extraCenterForceAddition = this.getForceTowardsGoal(this.graphLayout.extraCenterForce, this.graphLayout.center);
        this.acceleration.add(extraCenterForceAddition)
      }
    } move() {
      if (!this.frozen) {
        this.velocity.add(this.acceleration);
        limitVector(this.velocity, parameters.maxspeed);
        this.position.add(this.velocity);
        this.velocity.mult(.9)
      }
    } getCenter(relevantnodes) {
      let sum = new createVector(0, 0, 0);
      const numberOfNodes = relevantnodes.length;
      for (let node of relevantnodes) {
        const addition = p5.Vector.div(node.position, numberOfNodes);
        sum.add(addition)
      } return sum
    } getSeparationFromNodes(relevantnodes) {
      let sum = new createVector(0, 0, 0);
      for (let other of relevantnodes) {
        let diff = p5.Vector.sub(this.position, other.position);
        let d = diff.mag();
        if (d > 1) {
          diff.normalize().mult(this.graphLayout.repulsion / (d * d));
          sum.add(diff)
        }
      } return sum
    } getSpringForce(edgelength, force, relevantnodes) {
      let sum = new createVector(0, 0, 0);
      for (let other of relevantnodes) {
        let diff = p5.Vector.sub(this.position, other.position);
        let d = diff.mag() - edgelength;
        if (abs(d) > this.graphLayout.cohesionthreshold) {
          diff.normalize().mult(-force * d);
          sum.add(diff)
        }
      } limitVector(sum, edgelength);
      return sum
    } getForceTowardsGoal(force, goal) {
      let diff = p5.Vector.sub(goal, this.position);
      let d = diff.mag();
      if (abs(d) > this.graphLayout.cohesionthreshold) { diff.normalize().mult(force * d) } return diff
    } occupied() {
      let result = false;
      if (this === graph.robotA.nodeFrom || this === graph.robotA.nodeTo || this === graph.robotB.nodeFrom || this === graph.robotB.nodeTo) { result = true } return result
    } isInner() { return Array.isArray(this.label) && Array.isArray(this.label[0]) } show(g) {
      if (parameters.debugMode && this.graphLayout.source.type !== "graph" && !this.isInner()) {
        g.strokeWeight(parameters.edgeWidthConfigSpace);
        let p0 = graph.graphLayout.getNode(this.label[0]).position;
        let p1 = graph.graphLayout.getNode(this.label[1]).position;
        g.colorMode(HSB, 255);
        g.stroke(50, 255, 255, 100);
        g.line(this.position.x, this.position.y, this.position.z, p0.x, p0.y, p0.z);
        g.stroke(210, 255, 255, 100);
        g.line(this.position.x, this.position.y, this.position.z, p1.x, p1.y, p1.z);
        for (let square of this.getSquareNeighbors()) {
          let centroid = square.getCentroid();
          g.strokeWeight(parameters.edgeWidthConfigSpace);
          let p0 = centroid;
          g.colorMode(HSB, 255);
          g.stroke(150, 255, 255, 50);
          g.line(this.position.x, this.position.y, this.position.z, p0.x, p0.y, p0.z);
          g.push();
          g.translate(p0.x, p0.y, p0.z);
          g.fill(120, 255, 255);
          g.sphere(.25 * parameters.nodeSize, parameters.sphereDetail, parameters.sphereDetail);
          g.pop()
        }
      } if (this.nodeBorder) {
        g.stroke(150);
        g.strokeWeight(parameters.nodeSize * this.graphLayout.nodeBorderWidth)
      } else { g.noStroke() } if (this.graphLayout.layout3D) {
        g.push();
        g.translate(this.position.x, this.position.y, this.position.z);
        if (deleteNodeMode && !this.occupied() && g === graphicsForGraph) { g.fill(parameters.deleteNodeColor) } else { if (this.applyExtraCenterForce) { g.fill(0, 255, 0) } else if (this.active) { g.fill(parameters.activeDotColor) } else if (this.firstNodeOfEdge) { g.fill(parameters.selectedNodeForEdgeColor) } else { g.fill(parameters.colorNode) } } if (parameters.sphereView) { g.sphere(.5 * parameters.nodeSize, parameters.sphereDetail, parameters.sphereDetail) } else {
          let rotation = g.easycam.getRotation();
          let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
          g.rotateX(-rotXYZ[0]);
          g.rotateY(-rotXYZ[1]);
          g.rotateZ(-rotXYZ[2]);
          g.translate(0, 0, 1);
          g.stroke(0);
          g.strokeWeight(1);
          g.ellipse(0, 0, parameters.nodeSize * (this.isInner() ? .5 : 1), parameters.nodeSize * (this.isInner() ? .5 : 1))
        } if (selectedNodesInGraph.includes(this) || selectedNodesInConfigSpace.includes(this)) {
          let rotation = g.easycam.getRotation();
          let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
          g.rotateX(-rotXYZ[0]);
          g.rotateY(-rotXYZ[1]);
          g.rotateZ(-rotXYZ[2]);
          g.colorMode(HSB, 255);
          g.stroke(0, 255, 255);
          g.noFill();
          g.strokeWeight(2);
          g.ellipse(0, 0, parameters.nodeSize * 1.5, parameters.nodeSize * 1.5)
        } g.pop()
      }
    } showText(g) {
      g.fill(255, 255, 255);
      g.textAlign(CENTER, CENTER);
      g.textFont(font);
      g.textSize(parameters.fontSize);
      if (this.graphLayout.layout3D) {
        let rotation = g.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
        g.push();
        g.translate(this.position.x, this.position.y, this.position.z);
        g.rotateX(-rotXYZ[0]);
        g.rotateY(-rotXYZ[1]);
        g.rotateZ(-rotXYZ[2]);
        let maxRadius = max(parameters.nodeSize, parameters.configNodeSize, parameters.robotsNodeSize);
        g.translate(parameters.labelX, parameters.labelY, maxRadius + parameters.labelZ);
        g.text(this.labelText, 0, 0);
        g.pop()
      } else {
        g.push();
        g.translate(this.position.x, this.position.y, this.position.z);
        g.text(this.labelText, 0, 0);
        g.pop()
      }
    } getSquareNeighbors() {
      let result = [];
      for (let square of this.graphLayout.squares) { if (square.label[0].includes(this.label[0]) && square.label[1].includes(this.label[1])) { result.push(square) } } return result
    }
  } class InnerNode {
    constructor(parent, graphLayout, label, position) {
      this.parent = parent;
      this.label = label;
      this.graphLayout = graphLayout;
      this.graphics = graphLayout.graphics;
      if (graphLayout.layout3D) {
        this.position = position;
        this.velocity = createVector(0, 0, 0);
        this.acceleration = createVector(0, 0, 0)
      } else {
        this.position = position;
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0)
      } this.graphLayout.innerNodes.push(this);
      this.neighborsA = [];
      this.neighborsB = []
    } update(nodes) {
      this.acceleration.mult(0);
      let sep;
      if (octForces) { sep = this.graphLayout.octree.getAllNodesForces(this) } else { sep = this.getSeparationFromNodes(nodes) } let cohA = this.getSpringForce(this.graphLayout.firstCoordinateEdgeLength / parameters.granularityFirstCoordinate, this.graphLayout.firstCoordinateForce * 10, this.neighborsA);
      let cohB = this.getSpringForce(this.graphLayout.secondCoordinateEdgeLength / parameters.granularitySecondCoordinate, this.graphLayout.secondCoordinateForce * 10, this.neighborsB);
      this.acceleration.add(sep);
      this.acceleration.add(cohA);
      this.acceleration.add(cohB)
    } move() {
      this.velocity.add(this.acceleration);
      limitVector(this.velocity, parameters.maxspeed);
      this.position.add(this.velocity);
      this.velocity.mult(.9)
    } getSpringForce(edgelength, force, relevantnodes) {
      let sum = new createVector(0, 0, 0);
      for (let other of relevantnodes) {
        let diff = p5.Vector.sub(this.position, other.position);
        let d = diff.mag() - edgelength;
        if (abs(d) > this.graphLayout.cohesionthreshold) {
          diff.normalize().mult(-force * d);
          sum.add(diff)
        }
      } limitVector(sum, edgelength);
      return sum
    } show(g) {
      if (this.nodeBorder) {
        g.stroke(150);
        g.strokeWeight(parameters.nodeSize * this.graphLayout.nodeBorderWidth)
      } else { g.noStroke() } if (this.graphLayout.layout3D) {
        g.push();
        g.translate(this.position.x, this.position.y, this.position.z);
        g.fill(parameters.colorNode);
        let rotation = g.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
        g.rotateX(-rotXYZ[0]);
        g.rotateY(-rotXYZ[1]);
        g.rotateZ(-rotXYZ[2]);
        g.translate(0, 0, 1);
        g.stroke(0);
        g.strokeWeight(1);
        g.ellipse(0, 0, parameters.nodeSize * .25, parameters.nodeSize * .25);
        g.pop()
      } for (let n of this.neighborsA) {
        g.stroke(0, 255, 0);
        g.strokeWeight(1);
        g.line(this.position.x, this.position.y, this.position.z, n.position.x, n.position.y, n.position.z)
      } for (let n of this.neighborsB) {
        g.stroke(0, 0, 255);
        g.strokeWeight(1);
        g.line(this.position.x, this.position.y, this.position.z, n.position.x, n.position.y, n.position.z)
      }
    } showText(g) {
      g.fill(0, 0, 0);
      g.textAlign(CENTER, CENTER);
      g.textFont(font);
      g.textSize(parameters.fontSize);
      if (this.graphLayout.layout3D) {
        let rotation = g.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
        g.push();
        g.translate(this.position.x, this.position.y, this.position.z);
        g.rotateX(-rotXYZ[0]);
        g.rotateY(-rotXYZ[1]);
        g.rotateZ(-rotXYZ[2]);
        let maxRadius = max(parameters.nodeSize, parameters.configNodeSize, parameters.robotsNodeSize);
        g.translate(parameters.labelX, parameters.labelY, maxRadius + parameters.labelZ);
        g.text(this.labelText, 0, 0);
        g.pop()
      } else {
        g.push();
        g.translate(this.position.x, this.position.y, this.position.z);
        g.text(this.labelText, 0, 0);
        g.pop()
      }
    }
  } class InnerEdge {
    constructor(parent, graphLayout, label, nodeFrom, nodeTo) {
      this.graphLayout = graphLayout;
      this.graphics = graphLayout.graphics;
      this.label = label;
      this.nodeFrom = nodeFrom;
      this.nodeTo = nodeTo;
      this.edgeType = parent.edgeType
    } show(g, strokeW, strokeC) {
      g.strokeWeight(parameters.edgeWidthConfigSpace * 2 * (strokeW === undefined ? 1 : strokeW));
      g.stroke(255, 0, 0);
      if (strokeC !== undefined) { g.stroke(strokeC) } g.line(this.nodeFrom.position.x, this.nodeFrom.position.y, this.nodeFrom.position.z, this.nodeTo.position.x, this.nodeTo.position.y, this.nodeTo.position.z)
    }
  } class Edge {
    constructor(graphLayout, label, nodeFrom, nodeTo) {
      if (verbose) console.log("new Edge");
      if (verbose) console.log("nodeFrom");
      if (verbose) console.log(nodeFrom);
      if (verbose) console.log("nodeTo");
      if (verbose) console.log(nodeTo);
      this.graphLayout = graphLayout;
      this.graphics = graphLayout.graphics;
      this.label = label;
      this.nodeFrom = nodeFrom;
      this.nodeTo = nodeTo;
      this.subPoints = [];
      if (Array.isArray(this.nodeFrom.label) && Array.isArray(this.nodeTo.label)) {
        if (this.nodeFrom.label[0] === this.nodeTo.label[0]) { this.edgeType = "robotBedge" } else if (this.nodeFrom.label[1] === this.nodeTo.label[1]) { this.edgeType = "robotAedge" } else {
          console.log();
          "ERRRORR"
        }
      } else { this.edgeType = "graphEdge" }
    } createInnerNodes() {
      this.innerNodes = [];
      this.innerEdges = [];
      if (this.edgeType === "graphEdge") { this.granularity = parameters.granularityGraph } else if (this.edgeType === "robotBedge") { this.granularity = parameters.granularityFirstCoordinate } else if (this.edgeType === "robotAedge") { this.granularity = parameters.granularitySecondCoordinate } this.innerNodes[0] = this.nodeFrom.innerNode;
      this.innerNodes[this.granularity] = this.nodeTo.innerNode;
      for (let n = 1;
        n < this.granularity;
        n++) { this.innerNodes[n] = new InnerNode(this, this.graphLayout, n, p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, 1 * n / this.granularity), 1 / this.granularity) } for (let n = 0;
        n < this.granularity;
        n++) {
          let nodeFrom = this.innerNodes[n];
        let nodeTo = this.innerNodes[n + 1];
        this.innerEdges[n] = new InnerEdge(this, this.graphLayout, n, nodeFrom, nodeTo);
        if (this.edgeType === "robotBedge") {
          nodeFrom.neighborsB.push(nodeTo);
          nodeTo.neighborsB.push(nodeFrom)
        } else if (this.edgeType === "robotAedge") {
          nodeFrom.neighborsA.push(nodeTo);
          nodeTo.neighborsA.push(nodeFrom)
        }
      }
    } amountAlong(amount) { return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, amount) } connectedTo(node) { return node === this.nodeFrom || node === this.nodeTo } getPosition(amount) { return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, amount) } forceInnerNodesToTheirPositions() {
      for (let n = 1;
        n < this.granularity;
        n++) { this.innerNodes[n].position = p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, 1 * n / this.granularity) }
    } show(g, strokeW, strokeC) { if (this.owner === undefined) { if (this.candidateForRobot === 0) { g.stroke(parameters.colorRobotA) } else if (this.candidateForRobot === 1) { g.stroke(parameters.colorRobotB) } else if (this.edgeType === "robotBedge") { g.stroke(parameters.colorRobotB) } else if (this.edgeType === "robotAedge") { g.stroke(parameters.colorRobotA) } else if (this.edgeType === "graphEdge") { g.stroke(parameters.colorGraphEdge) } } else { if (parameters.showRobots && this.owner.index === 0) { g.stroke(parameters.colorRobotA) } else if (parameters.showRobots && this.owner.index === 1) { g.stroke(parameters.colorRobotB) } else { g.stroke(parameters.colorGraphEdge) } } if (this.edgeType === "graphEdge") { g.strokeWeight(parameters.edgeWidthGraph * (strokeW === undefined ? 1 : strokeW)) } else { g.strokeWeight(parameters.edgeWidthConfigSpace * (strokeW === undefined ? 1 : strokeW)) } if (strokeC !== undefined) { g.stroke(strokeC) } g.line(this.nodeFrom.position.x, this.nodeFrom.position.y, this.nodeFrom.position.z, this.nodeTo.position.x, this.nodeTo.position.y, this.nodeTo.position.z) }
  } class Square {
    constructor(graphLayout, label, edgeAfrom, edgeAto, edgeBfrom, edgeBto) {
      this.graphLayout = graphLayout;
      this.graphics = graphLayout.graphics;
      this.label = label;
      this.edgeAfrom = edgeAfrom;
      this.edgeAto = edgeAto;
      this.edgeBfrom = edgeBfrom;
      this.edgeBto = edgeBto;
      this.innerEdges = [];
      this.innerSquares = [];
      if (vverbose) print("square created!");
      if (vverbose) print(this)
    } getInnernode(label) { for (let x of this.innerNodes) { if (arraysEqual(x.label, label)) { return x } } return undefined } createInnerNodes() {
      this.innerNodes = [];
      for (let i = 1;
        i < this.edgeAfrom.granularity;
        i++) {
          for (let j = 1;
            j < this.edgeBfrom.granularity;
            j++) {
              let amountA = i / this.edgeAfrom.granularity;
            let amountB = j / this.edgeBfrom.granularity;
            let position = this.getPosition(amountA, amountB);
            let innerNode = new InnerNode(this, this.graphLayout, [i, j], position, 1 / this.edgeAfrom.granularity * (1 / this.edgeBfrom.granularity));
            this.innerNodes.push(innerNode)
          }
      } for (let i = 1;
        i < this.edgeAfrom.granularity;
        i++) {
          for (let j = 1;
            j < this.edgeBfrom.granularity;
            j++) {
              let innerNode = this.getInnernode([i, j]);
            let A = this.getInnernode([i, j - 1]);
            let B = this.getInnernode([i, j + 1]);
            let C = this.getInnernode([i - 1, j]);
            let D = this.getInnernode([i + 1, j]);
            if (A !== undefined) innerNode.neighborsA.push(A);
            if (B !== undefined) innerNode.neighborsA.push(B);
            if (C !== undefined) innerNode.neighborsB.push(C);
            if (D !== undefined) innerNode.neighborsB.push(D)
          }
      } for (let i = 1;
        i < this.edgeAfrom.granularity;
        i++) {
          this.getInnernode([i, 1]).neighborsA.push(this.edgeAfrom.innerNodes[i]);
        this.edgeAfrom.innerNodes[i].neighborsA.push(this.getInnernode([i, 1]));
        this.getInnernode([i, this.edgeAfrom.granularity - 1]).neighborsA.push(this.edgeAto.innerNodes[i]);
        this.edgeAto.innerNodes[i].neighborsA.push(this.getInnernode([i, this.edgeAfrom.granularity - 1]))
      } for (let j = 1;
        j < this.edgeBfrom.granularity;
        j++) {
          this.getInnernode([1, j]).neighborsB.push(this.edgeBfrom.innerNodes[j]);
        this.edgeBfrom.innerNodes[j].neighborsB.push(this.getInnernode([1, j]));
        this.getInnernode([this.edgeAfrom.granularity - 1, j]).neighborsB.push(this.edgeBto.innerNodes[j]);
        this.edgeBto.innerNodes[j].neighborsB.push(this.getInnernode([this.edgeAfrom.granularity - 1, j]))
      }
    } forceInnerNodesToTheirPositions() {
      for (let innerNode of this.innerNodes) {
        let amountA = innerNode.label[0] / this.edgeAfrom.granularity;
        let amountB = innerNode.label[1] / this.edgeBfrom.granularity;
        innerNode.position = this.getPosition(amountA, amountB)
      }
    } updateRepulsionForce(centroids) {
      let centroid = this.getCentroid();
      let sum = new createVector(0, 0, 0);
      for (let other of centroids) {
        let diff = p5.Vector.sub(centroid, other);
        let d = diff.mag();
        if (d > 1) {
          diff.normalize().mult(this.graphLayout.centroidRepulsion / (d * d));
          sum.add(diff)
        }
      } this.centroidRepulsionForce = sum
    } getPosition(amountA, amountB) {
      let X = this.edgeAfrom.amountAlong(amountA);
      let Y = this.edgeAto.amountAlong(amountA);
      return p5.Vector.lerp(X, Y, amountB)
    } show() {
      if (parameters.gridOn) {
        this.graphics.strokeWeight(parameters.edgeWidthGrid);
        for (let n = 1;
          n < this.edgeAfrom.innerNodes.length;
          n++) {
            let a = this.edgeAfrom.innerNodes[n].position;
          let b = this.edgeAto.innerNodes[n].position;
          this.graphics.stroke(parameters.colorRobotA);
          this.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z)
        } for (let n = 1;
          n < this.edgeBfrom.innerNodes.length;
          n++) {
            let a = this.edgeBfrom.innerNodes[n].position;
          let b = this.edgeBto.innerNodes[n].position;
          this.graphics.stroke(parameters.colorRobotB);
          this.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z)
        }
      } if (parameters.squareOn) {
        this.graphics.noStroke();
        this.graphics.fill(red(parameters.squareColor), green(parameters.squareColor), blue(parameters.squareColor), parameters.squareOpacity);
        this.graphics.beginShape();
        this.graphics.vertex(this.edgeAfrom.nodeFrom.position.x, this.edgeAfrom.nodeFrom.position.y, this.edgeAfrom.nodeFrom.position.z);
        this.graphics.vertex(this.edgeAfrom.nodeTo.position.x, this.edgeAfrom.nodeTo.position.y, this.edgeAfrom.nodeTo.position.z);
        this.graphics.vertex(this.edgeAto.nodeTo.position.x, this.edgeAto.nodeTo.position.y, this.edgeAto.nodeTo.position.z);
        this.graphics.vertex(this.edgeAto.nodeFrom.position.x, this.edgeAto.nodeFrom.position.y, this.edgeAto.nodeFrom.position.z);
        this.graphics.endShape(CLOSE)
      }
    } getCentroid() {
      let result = createVector();
      result.add(this.edgeAfrom.nodeFrom.position);
      result.add(this.edgeAfrom.nodeTo.position);
      result.add(this.edgeAto.nodeTo.position);
      result.add(this.edgeAto.nodeFrom.position);
      result.div(4);
      return result
    }
  } class Robot {
    constructor(graph, node, index) {
      this.graph = graph;
      this.nodeFrom = node;
      this.nodeTo = node;
      this.amount = 0;
      this.index = index;
      this.visited = []
    } occupyingNodes() { return [this.nodeFrom, this.nodeTo] } getCandidates() { return this.nodeFrom.neighbors.filter((x => !this.graph.otherRobot(this).occupyingNodes().includes(x))) } getAllPossibleEdges() {
      let forbiddenNodes = this.graph.otherRobot(this).occupyingNodes().map((n => n.label));
      return this.graph.edges.filter((x => !forbiddenNodes.includes(x[0]) && !forbiddenNodes.includes(x[1])))
    } getRandomNeighbor() {
      let candidates = this.getCandidates();
      if (candidates.length > 0) { return candidates[floor(random(candidates.length))] } else { return false }
    } setNodeTo(node) {
      this.visited.push(node);
      this.nodeTo = node;
      this.amount = 1e-4;
      this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = this
    } setNeighbor(node) {
      this.nodeTo = node;
      this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = this
    } setRandomNeighborIfPossible() {
      console.log("setRandomNeighborIfPossible");
      let candidates = this.getCandidates();
      if (candidates.length > 0) { this.nodeTo = candidates[floor(random(candidates.length))] }
    } setAmount(nextAmount) {
      if (this.nodeFrom !== this.nodeTo) { this.amount = constrain(nextAmount, 0, 1) } if (this.amount === 0) {
        if (vverbose) console.log("this.amount === 0.0");
        if (vverbose) console.log(this.nodeFrom.label + " " + this.nodeTo.label);
        if (vverbose) console.log(this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false));
        if (this.nodeFrom !== this.nodeTo) {
          this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = undefined;
          this.nodeTo = this.nodeFrom
        } if (parameters.moveDotsRandomly) {
          let nextNode = this.getRandomNeighbor();
          if (nextNode) { this.setNodeTo(nextNode) } else { return false }
        }
      } if (this.amount === 1) {
        if (vverbose) console.log("this.amount === 1.0");
        if (vverbose) console.log(this.nodeFrom.label + " " + this.nodeTo.label);
        if (vverbose) console.log(this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false));
        if (this.nodeFrom !== this.nodeTo) {
          if (vverbose) console.log("resetting!");
          this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = undefined;
          this.amount = 0;
          this.nodeFrom = this.nodeTo
        }
      }
    } getPosition() { return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, this.amount) } inANode() { return this.nodeFrom === this.nodeTo } show(g) {
      let position = this.getPosition();
      if (this.nodeBorder) {
        g.stroke(150);
        g.strokeWeight(parameters.graphRobotSize * this.graphLayout.nodeBorderWidth)
      } else { g.noStroke() } g.fill(this.index === 0 ? parameters.colorRobotA : parameters.colorRobotB);
      if (this.graph.graphLayout.layout3D) {
        g.push();
        g.translate(position.x, position.y, position.z);
        if (parameters.sphereView) {
          let d = parameters.sphereDetail;
          g.sphere((this.active ? .55 : .5) * parameters.robotsNodeSize, d, d)
        } else {
          let rotation = g.easycam.getRotation();
          let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
          g.rotateX(-rotXYZ[0]);
          g.rotateY(-rotXYZ[1]);
          g.rotateZ(-rotXYZ[2]);
          g.translate(0, 0, 20);
          g.ellipse(0, 0, (this.active ? 1.1 : 1) * parameters.robotsNodeSize, (this.active ? 1.1 : 1) * parameters.robotsNodeSize)
        } g.pop()
      }
    }
  } class Configuration {
    constructor(graphLayout, robotA, robotB) {
      this.graphLayout = graphLayout;
      this.robotA = robotA;
      this.robotB = robotB;
      this.history = [];
      this.updatePosition(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount)
    } updatePosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) { this.position = this.getPosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) } getPosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
      let position;
      if (amountA === 0 && amountB === 0) {
        let stateLabel = [robotAfrom.label, robotBfrom.label];
        let state = this.graphLayout.getNode(stateLabel);
        position = state.position
      } else if (amountA > 0 && amountB === 0) {
        let stateFromLabel = [robotAfrom.label, robotBfrom.label];
        let stateToLabel = [robotAto.label, robotBfrom.label];
        let stateFrom = this.graphLayout.getNode(stateFromLabel);
        let stateTo = this.graphLayout.getNode(stateToLabel);
        position = p5.Vector.lerp(stateFrom.position, stateTo.position, amountA)
      } else if (amountA === 0 && amountB > 0) {
        let stateFromLabel = [robotAfrom.label, robotBfrom.label];
        let stateToLabel = [robotAfrom.label, robotBto.label];
        let stateFrom = this.graphLayout.getNode(stateFromLabel);
        let stateTo = this.graphLayout.getNode(stateToLabel);
        position = p5.Vector.lerp(stateFrom.position, stateTo.position, amountB)
      } else {
        let topLeft = this.graphLayout.getNode([robotAfrom.label, robotBfrom.label]).position;
        let topRight = this.graphLayout.getNode([robotAto.label, robotBfrom.label]).position;
        let botLeft = this.graphLayout.getNode([robotAfrom.label, robotBto.label]).position;
        let botRight = this.graphLayout.getNode([robotAto.label, robotBto.label]).position;
        let topX = p5.Vector.lerp(topLeft, topRight, amountA);
        let botX = p5.Vector.lerp(botLeft, botRight, amountA);
        position = p5.Vector.lerp(topX, botX, amountB)
      } return position
    } getCrosshair(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
      let topLeft = this.graphLayout.getNode([robotAfrom.label, robotBfrom.label]).position;
      let topRight = this.graphLayout.getNode([robotAto.label, robotBfrom.label]).position;
      let botLeft = this.graphLayout.getNode([robotAfrom.label, robotBto.label]).position;
      let botRight = this.graphLayout.getNode([robotAto.label, robotBto.label]).position;
      let topX = p5.Vector.lerp(topLeft, topRight, amountA);
      let botX = p5.Vector.lerp(botLeft, botRight, amountA);
      let leftY = p5.Vector.lerp(topLeft, botLeft, amountB);
      let rightY = p5.Vector.lerp(topRight, botRight, amountB);
      return [topX, botX, leftY, rightY]
    } getHyperplaneLine(robotFrom, robotTo, amount, possibleEdge, flip) {
      if (flip) {
        let topLeft = this.graphLayout.getNode([robotFrom.label, possibleEdge[0]]).position;
        let topRight = this.graphLayout.getNode([robotTo.label, possibleEdge[0]]).position;
        let botLeft = this.graphLayout.getNode([robotFrom.label, possibleEdge[1]]).position;
        let botRight = this.graphLayout.getNode([robotTo.label, possibleEdge[1]]).position;
        let topX = p5.Vector.lerp(topLeft, topRight, amount);
        let botX = p5.Vector.lerp(botLeft, botRight, amount);
        return [topX, botX]
      } else {
        let topLeft = this.graphLayout.getNode([possibleEdge[0], robotFrom.label]).position;
        let topRight = this.graphLayout.getNode([possibleEdge[0], robotTo.label]).position;
        let botLeft = this.graphLayout.getNode([possibleEdge[1], robotFrom.label]).position;
        let botRight = this.graphLayout.getNode([possibleEdge[1], robotTo.label]).position;
        let topX = p5.Vector.lerp(topLeft, topRight, amount);
        let botX = p5.Vector.lerp(botLeft, botRight, amount);
        return [topX, botX]
      }
    } record(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) { this.history.push([robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB]) } resetHistory() { this.history = [] } show() {
      if (parameters.showHistory) {
        for (let i = 0;
          i < this.history.length - 1;
          i++) {
            let A = this.history[i];
          let B = this.history[i + 1];
          let from = this.getPosition(A[0], A[1], A[2], A[3], A[4], A[5]);
          let to = this.getPosition(B[0], B[1], B[2], B[3], B[4], B[5]);
          this.graphLayout.graphics.stroke(0);
          this.graphLayout.graphics.strokeWeight(1);
          this.graphLayout.graphics.line(from.x, from.y, from.z, to.x, to.y, to.z)
        }
      } this.showAt(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount)
    } showAt(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
      this.updatePosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB);
      let robotApossibilites = this.robotA.getAllPossibleEdges();
      let robotBpossibilites = this.robotB.getAllPossibleEdges();
      if (parameters.showHyperplanes) {
        for (let possibleEdge of robotApossibilites) {
          let c = this.getHyperplaneLine(robotBfrom, robotBto, amountB, possibleEdge, false);
          let a = c[0];
          let b = c[1];
          this.graphLayout.graphics.stroke(parameters.colorRobotA);
          this.graphLayout.graphics.strokeWeight(8);
          this.graphLayout.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z)
        } for (let possibleEdge of robotBpossibilites) {
          let c = this.getHyperplaneLine(robotAfrom, robotAto, amountA, possibleEdge, true);
          let a = c[0];
          let b = c[1];
          this.graphLayout.graphics.stroke(parameters.colorRobotB);
          this.graphLayout.graphics.strokeWeight(8);
          this.graphLayout.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z)
        }
      } else {
        if (this.active) {
          let crosshairs = this.getCrosshair(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB);
          this.graphLayout.graphics.strokeWeight(8);
          if (crosshairs.length === 4) {
            let a = crosshairs[0];
            let b = crosshairs[1];
            this.graphLayout.graphics.stroke(parameters.colorRobotB);
            this.graphLayout.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
            let c = crosshairs[2];
            let d = crosshairs[3];
            this.graphLayout.graphics.stroke(parameters.colorRobotA);
            this.graphLayout.graphics.line(c.x, c.y, c.z, d.x, d.y, d.z)
          }
        }
      } this.graphLayout.graphics.push();
      this.graphLayout.graphics.translate(this.position.x, this.position.y, this.position.z);
      this.graphLayout.graphics.noStroke();
      if (this.active) { this.graphLayout.graphics.fill(parameters.activeDotColor) } else { this.graphLayout.graphics.fill(parameters.colorConfig) } if (parameters.sphereView) {
        let d = parameters.sphereDetail;
        this.graphLayout.graphics.sphere(.5 * parameters.configNodeSize, d, d)
      } else {
        let rotation = this.graphLayout.graphics.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
        this.graphLayout.graphics.rotateX(-rotXYZ[0]);
        this.graphLayout.graphics.rotateY(-rotXYZ[1]);
        this.graphLayout.graphics.rotateZ(-rotXYZ[2]);
        this.graphLayout.graphics.translate(0, 0, 20);
        this.graphLayout.graphics.ellipse(0, 0, parameters.configNodeSize, parameters.configNodeSize)
      } this.graphLayout.graphics.pop()
    }
  } function completeGraph(m) {
    let nodes = [...Array(m).keys()];
    let edges = [];
    for (let F of nodes) { for (let T of nodes) { if (F !== T && F < T) { edges.push([F, T]) } } } return new Graph(nodes, edges)
  } function chainGraph(m) {
    let nodes = [...Array(m).keys()];
    let edges = [];
    for (let F of nodes) {
      edges.push([F, (F + 1) % m]);
      if (vverbose) print(F)
    } return new Graph(nodes, edges)
  } function wheelGraph(m) {
    let nodes = [...Array(m + 1).keys()];
    let edges = [];
    for (let F of nodes) {
      if (F !== m) { edges.push([F, m]) } edges.push([F, (F + 1) % m]);
      if (vverbose) print(F)
    } return new Graph(nodes, edges)
  } function randomGraph() {
    let nodes = [...Array(30).keys()];
    let edges = [];
    return new Graph(nodes, edges)
  } function completeBipartiteGraph(m, n) {
    if (vverbose) print("completeBipartiteGraph: " + m + " " + n);
    let nodesFrom = [...Array(m).keys()];
    let nodesTo = [...Array(n).keys()].map((x => x + m));
    let nodes = [...Array(m + n).keys()];
    let edges = [];
    for (let F of nodesFrom) { for (let T of nodesTo) { edges.push([F, T]) } } return new Graph(nodes, edges)
  } function addNode(x, y, z) {
    let label = Math.max(...graph.nodes) + 1;
    graph.nodes.push(label);
    let addedNode = graph.graphLayout.addNode(label, x, y, z);
    configuration_space.addStates(label);
    graph.graphLayout.centerForce = Math.max(.02, graph.graphLayout.centerForce);
    configuration_space.graphLayout.centerForce = Math.max(.02, configuration_space.graphLayout.centerForce);
    addSingleNodeMode = false;
    updateURL();
    graphIsCustomized = true;
    return addedNode
  } function deleteSelectedNodesOrEdges() {
    if (selectedNodesInGraph.length > 1) {
      for (let n = 0;
        n < selectedNodesInGraph.length - 1;
        n++) {
          for (let m = n + 1;
            m < selectedNodesInGraph.length;
            m++) { deleteEdge(selectedNodesInGraph[n], selectedNodesInGraph[m]) }
      }
    } else if (selectedNodesInGraph.length == 1) { deleteNode(selectedNodesInGraph[0]) }
  } function deleteNode(node) {
    if (node.occupied()) {
      startWarning("This node is occupied and can not be deleted.");
      return
    } selectedNodesInGraph.splice(selectedNodesInGraph.indexOf(node), 1);
    for (neighbor of node.neighbors) { neighbor.neighbors = neighbor.neighbors.filter((x => !(x === node))) } graph.nodes.splice(graph.nodes.indexOf(node.label), 1);
    let survivingEdgeLabels = [];
    let edgeLabelsToDelete = [];
    for (edge of graph.edges) { if (edge.includes(node.label)) { edgeLabelsToDelete.push(edge) } else { survivingEdgeLabels.push(edge) } } graph.edges = survivingEdgeLabels;
    for (edge of edgeLabelsToDelete) { graph.graphLayout.deleteEdge(edge) } graph.graphLayout.deleteNode(node.label);
    configuration_space.removeStates(node.label);
    graphIsCustomized = true;
    updateURL()
  } function deleteEdge(nodeFrom, nodeTo) {
    if (verbose) console.log("deleteEdge()");
    let edge = graph.graphLayout.getEdge(nodeFrom.label, nodeTo.label);
    if (edge.owner !== undefined) {
      startWarning("Not able to delete edge from " + nodeFrom.label + " to " + nodeTo.label + ".");
      return
    } if (edge !== false && edge.owner == undefined) {
      let label = edge.label;
      nodeFrom.neighbors = nodeFrom.neighbors.filter((x => !(x === nodeTo)));
      nodeTo.neighbors = nodeTo.neighbors.filter((x => !(x === nodeFrom)));
      if (verbose) console.log("deleting edge");
      graph.edges = graph.edges.filter((l => !arraysEqual(l, label)));
      graph.graphLayout.deleteEdge(label);
      configuration_space.removeStates(label);
      graphIsCustomized = true;
      updateURL()
    }
  } function addEdgesForSelectedNodes() {
    for (let n = 0;
      n < selectedNodesInGraph.length - 1;
      n++) {
        for (let m = n + 1;
          m < selectedNodesInGraph.length;
          m++) { addEdge(selectedNodesInGraph[n], selectedNodesInGraph[m]) }
    }
  } function addEdge(nodeFrom, nodeTo) {
    if (graph.graphLayout.getEdge(nodeFrom.label, nodeTo.label) === false) {
      console.log("adding edge");
      let label = [nodeFrom.label, nodeTo.label];
      graph.edges.push(label);
      graph.graphLayout.addEdge(label, nodeFrom, nodeTo);
      configuration_space.addStates(label);
      graphIsCustomized = true;
      updateURL()
    } else { console.log("not adding edge") }
  } function mouseWheel(event) { if (areWeOnTheLeft) { if (parameters.syncView) configuration_space.graphLayout.graphics.easycam.setState(graph.graphLayout.graphics.easycam.getState()) } else { if (parameters.syncView) graph.graphLayout.graphics.easycam.setState(configuration_space.graphLayout.graphics.easycam.getState()) } } let mouseIsPressedOnLeftSide = false;
  function mousePressedOnLeft(e) { console.log("mousePressedOnLeft") } function mousePressed(e) {
    areWeOnTheLeft = e.target === graphicsForGraph.canvas;
    if (vverbose) console.log("mouse pressed");
    if (vverbose) console.log(areWeOnTheLeft);
    if (vverbose) console.log(parameters.mode);
    let selectedNode;
    let selectedDistance;
    if (parameters.mode === "Move") {
      let currentGraphics = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace;
      let relativeMouseX = mouseX - currentGraphics.easycam.viewport[0] - currentGraphics.easycam.viewport[2] / 2;
      let relativeMouseY = mouseY - currentGraphics.easycam.viewport[1] - currentGraphics.easycam.viewport[3] / 2;
      let mousePos = createVector(relativeMouseX, relativeMouseY);
      let v = currentGraphics.easycam.getUpVector();
      cameraState = currentGraphics.easycam.getState();
      if (parameters.showRobots) {
        let upVectorRobotNode = createVector(v[0], v[1], v[2]).setMag(.5 * parameters.robotsNodeSize);
        let robotAnode = graph.robotA;
        let robotBnode = graph.robotB;
        robotAnode.active = false;
        robotBnode.active = false;
        let robotAposition = robotAnode.getPosition();
        let robotBposition = robotBnode.getPosition();
        let screenPosA = currentGraphics.screenPosition(robotAposition);
        let screenPosB = currentGraphics.screenPosition(robotBposition);
        let distanceA = mousePos.dist(screenPosA);
        let distanceB = mousePos.dist(screenPosB);
        let auxPosA = currentGraphics.screenPosition(p5.Vector.add(robotAposition, upVectorRobotNode));
        let auxPosB = currentGraphics.screenPosition(p5.Vector.add(robotBposition, upVectorRobotNode));
        let screenRadiusA = screenPosA.dist(auxPosA);
        let screenRadiusB = screenPosB.dist(auxPosB);
        if (distanceA < screenRadiusA) { selectedNode = robotAnode } else if (distanceB < screenRadiusB) { selectedNode = robotBnode }
      } let upVectorConfigNode = createVector(v[0], v[1], v[2]).setMag(.5 * parameters.configNodeSize);
      let configNode = configuration_space.graphLayout.configuration;
      configNode.active = false;
      let screenPos = currentGraphics.screenPosition(configNode.position);
      let distance = mousePos.dist(screenPos);
      let auxPos = currentGraphics.screenPosition(p5.Vector.add(configNode.position, upVectorConfigNode));
      let screenRadius = screenPos.dist(auxPos);
      if (distance < screenRadius) { selectedNode = configNode } if (selectedNode === undefined) {
        let upVectorNode = createVector(v[0], v[1], v[2]).setMag(.5 * parameters.nodeSize);
        let currentNodes = [].concat(graph.graphLayout.nodes).concat(configuration_space.graphLayout.nodes);
        for (let node of currentNodes) { node.lastSelected = false } for (let node of currentNodes) {
          node.active = false;
          let screenPos = currentGraphics.screenPosition(node.position);
          let distance = mousePos.dist(screenPos);
          let auxPos = currentGraphics.screenPosition(p5.Vector.add(node.position, upVectorNode));
          let screenRadius = screenPos.dist(auxPos);
          if (vverbose) print(currentGraphics.screenPosition(node.position));
          if (distance < screenRadius && (selectedNode === undefined || distance < selectedDistance)) {
            selectedNode = node;
            selectedDistance = distance
          }
        }
      } if (selectedNode !== undefined) {
        selectedNode.lastSelected = true;
        if (selectedNode.graphLayout !== undefined) {
          let selectedNodeType = selectedNode.graphLayout.source.type;
          if (selectedNodeType === "graph") { if (selectedNodesInGraph.includes(selectedNode)) { selectedNodesInGraph = selectedNodesInGraph.filter((n => n !== selectedNode)) } else { selectedNodesInGraph.push(selectedNode) } }
        }
      } else { selectedNodesInGraph = [] } if (selectedNode !== undefined && selectedNode.lastSelected) {
        if (parameters.mode === "Edit") {
          if (nodeSelectedForEdgeAddition !== undefined) {
            if (nodeSelectedForEdgeAddition !== selectedNode) { if (graph.graphLayout.getEdge(nodeSelectedForEdgeAddition.label, selectedNode.label, false) === undefined) { addEdge(nodeSelectedForEdgeAddition, selectedNode) } } nodeSelectedForEdgeAddition.firstNodeOfEdge = false;
            nodeSelectedForEdgeAddition = undefined
          } else {
            if (deleteNodeMode) { if (!selectedNode.occupied()) { deleteNode(selectedNode) } } else {
              nodeSelectedForEdgeAddition = selectedNode;
              selectedNode.firstNodeOfEdge = true
            }
          }
        } else if (parameters.mode === "Move") {
          selectedNode.active = true;
          if (!vverbose) console.log("selectedNode.active = true")
        }
      } else {
        if (parameters.mode === "Edit") {
          let addedNode = addNode();
          let currentGraphics = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace;
          let relativeMouseX = mouseX - currentGraphics.easycam.viewport[0] - currentGraphics.easycam.viewport[2] / 2;
          let relativeMouseY = mouseY - currentGraphics.easycam.viewport[1] - currentGraphics.easycam.viewport[3] / 2;
          let mouse2D = createVector(relativeMouseX, relativeMouseY);
          for (let n = 0;
            n < 10;
            n++) {
              let screenPosOfMovingNode = currentGraphics.screenPosition(addedNode.position);
            let mouseDiff = p5.Vector.sub(mouse2D, screenPosOfMovingNode);
            let dst = applyToVec3(cameraState.rotation, [mouseDiff.x, mouseDiff.y, 0]);
            let xMovement = dst[0];
            let yMovement = dst[1];
            let zMovement = dst[2];
            let move = createVector(xMovement, yMovement, zMovement).setMag(mouseDiff.mag() * .5);
            addedNode.position.add(move)
          }
        }
      } if (graph.robotA.active === true || graph.robotB.active === true) {
        let activeRobot = graph.robotA.active === true ? graph.robotA : graph.robotB;
        let possibleEdges = activeRobot.getAllPossibleEdges();
        for (let possibleEdge of possibleEdges) { graph.graphLayout.getEdge(possibleEdge[0], possibleEdge[1]).candidateForRobot = activeRobot.index }
      }
    } else if (parameters.mode === "View") { reheat() }
  } function ourMouseDragged() {
    if (vverbose) console.log("ourMouseDragged");
    if (parameters.mode === "Move") {
      reheat();
      let currentGraphics = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace;
      let relativeMouseX = mouseX - currentGraphics.easycam.viewport[0] - currentGraphics.easycam.viewport[2] / 2;
      let relativeMouseY = mouseY - currentGraphics.easycam.viewport[1] - currentGraphics.easycam.viewport[3] / 2;
      let mouse2D = createVector(relativeMouseX, relativeMouseY);
      let movingObject, ordinaryNodeMoving;
      {
        if (graph.robotA.active === true || graph.robotB.active === true) {
          let activeRobot = graph.robotA.active === true ? graph.robotA : graph.robotB;
          if (activeRobot.inANode()) {
            let robotScreenPos = currentGraphics.screenPosition(activeRobot.getPosition());
            let mouseChange = p5.Vector.sub(mouse2D, robotScreenPos);
            let candidates = activeRobot.getCandidates();
            let bestCandidate;
            let bestValue;
            for (let candidate of candidates) {
              let screenPosOfCandidate = currentGraphics.screenPosition(candidate.position);
              let changeForCandidate = p5.Vector.sub(screenPosOfCandidate, robotScreenPos);
              let value = p5.Vector.dot(changeForCandidate, mouseChange) / (mouseChange.mag() * changeForCandidate.mag());
              let threshold = changeForCandidate.dot(mouseChange) / pow(changeForCandidate.mag(), 2);
              if (threshold > .05) {
                if (bestCandidate === undefined || value > bestValue) {
                  bestCandidate = candidate;
                  bestValue = value
                }
              }
            } if (bestCandidate !== undefined) { activeRobot.setNodeTo(bestCandidate) }
          } else {
            let robotScreenPos = currentGraphics.screenPosition(activeRobot.getPosition());
            let mouseChange = p5.Vector.sub(mouse2D, robotScreenPos).mult(.9);
            let nodeFromScreenPos = currentGraphics.screenPosition(activeRobot.nodeFrom.position);
            let nodeToScreenPos = currentGraphics.screenPosition(activeRobot.nodeTo.position);
            let edgeSomething = p5.Vector.sub(nodeToScreenPos, nodeFromScreenPos);
            let amountChange = edgeSomething.dot(mouseChange) / pow(edgeSomething.mag(), 2);
            activeRobot.setAmount(activeRobot.amount + amountChange)
          }
        } else {
          if (vverbose) console.log("moving node");
          for (let node of graph.graphLayout.nodes) {
            if (node.active === true) {
              ordinaryNodeMoving = node;
              if (vverbose) console.log("movingNode = node");
              if (vverbose) console.log(node)
            }
          }
        }
      } {
        if (configuration_space.graphLayout.configuration.active === true) {
          movingObject = configuration_space.graphLayout.configuration;
          let configuration2D = graphicsForConfigurationSpace.screenPosition(movingObject.position);
          let mouseChange = p5.Vector.sub(mouse2D, configuration2D).mult(.9);
          let topLeft = configuration_space.graphLayout.getNode([movingObject.robotA.nodeFrom.label, movingObject.robotB.nodeFrom.label]).position;
          let topRight = configuration_space.graphLayout.getNode([movingObject.robotA.nodeTo.label, movingObject.robotB.nodeFrom.label]).position;
          let botLeft = configuration_space.graphLayout.getNode([movingObject.robotA.nodeFrom.label, movingObject.robotB.nodeTo.label]).position;
          let botRight = configuration_space.graphLayout.getNode([movingObject.robotA.nodeTo.label, movingObject.robotB.nodeTo.label]).position;
          if (flags[SHIFT] || flags[66]) {
            if (movingObject.robotB.inANode()) {
              let bestcandidate = pickBestCandidateForB(movingObject, mouseChange);
              if (bestcandidate !== undefined && bestcandidate !== false) movingObject.robotB.setNeighbor(bestcandidate)
            } else {
              let topX = p5.Vector.lerp(topLeft, topRight, movingObject.robotA.amount);
              let botX = p5.Vector.lerp(botLeft, botRight, movingObject.robotA.amount);
              let topX2D = graphicsForConfigurationSpace.screenPosition(topX);
              let botX2D = graphicsForConfigurationSpace.screenPosition(botX);
              let edgeBaux = p5.Vector.sub(botX2D, topX2D);
              let amountBchange = edgeBaux.dot(mouseChange) / pow(edgeBaux.mag(), 2);
              movingObject.robotB.setAmount(movingObject.robotB.amount + amountBchange)
            }
          } if (flags[SHIFT] || flags[65]) {
            if (movingObject.robotA.inANode()) {
              let bestcandidate = pickBestCandidateForA(movingObject, mouseChange);
              if (bestcandidate !== undefined && bestcandidate !== false) movingObject.robotA.setNeighbor(bestcandidate)
            } else {
              let leftX = p5.Vector.lerp(topLeft, botLeft, movingObject.robotB.amount);
              let rightX = p5.Vector.lerp(topRight, botRight, movingObject.robotB.amount);
              let leftX2D = graphicsForConfigurationSpace.screenPosition(leftX);
              let rightX2D = graphicsForConfigurationSpace.screenPosition(rightX);
              let edgeAaux = p5.Vector.sub(rightX2D, leftX2D);
              let amountAchange = edgeAaux.dot(mouseChange) / pow(edgeAaux.mag(), 2);
              movingObject.robotA.setAmount(movingObject.robotA.amount + amountAchange)
            }
          }
        } else { for (let node of configuration_space.graphLayout.nodes) { if (node.active === true) { ordinaryNodeMoving = node } } }
      } if (ordinaryNodeMoving !== undefined) {
        if (vverbose) console.log("moving ordinaryNodeMoving");
        let screenPosOfMovingNode = currentGraphics.screenPosition(ordinaryNodeMoving.position);
        let mouseChange = p5.Vector.sub(mouse2D, screenPosOfMovingNode);
        let dst = applyToVec3(cameraState.rotation, [mouseChange.x, mouseChange.y, 0]);
        let camPos = currentGraphics.easycam.getPosition();
        let camPosVector = createVector(camPos[0], camPos[1], camPos[2]);
        let distToNode = ordinaryNodeMoving.position.dist(camPosVector);
        if (vverbose) print(dst);
        let xMovement = dst[0];
        let yMovement = dst[1];
        let zMovement = dst[2];
        let move = createVector(xMovement, yMovement, zMovement).mult(.5 * distToNode / cameraState.distance);
        ordinaryNodeMoving.position.add(move)
      }
    } else if (parameters.mode === "View") { if (areWeOnTheLeft) { if (parameters.syncView) configuration_space.graphLayout.graphics.easycam.setState(graph.graphLayout.graphics.easycam.getState()) } else { if (parameters.syncView) graph.graphLayout.graphics.easycam.setState(configuration_space.graphLayout.graphics.easycam.getState()) } reheat() }
  } function pickBestCandidateForA(movingNode, mouseChange) {
    let candidates = movingNode.robotA.getCandidates();
    let bestCandidate;
    let bestCandidateAngle = PI / 2;
    for (let candidate of candidates) {
      let topRight = configuration_space.graphLayout.getNode([candidate.label, movingNode.robotB.nodeFrom.label]).position;
      let botRight = configuration_space.graphLayout.getNode([candidate.label, movingNode.robotB.nodeTo.label]).position;
      let leftX = movingNode.position;
      let rightX = p5.Vector.lerp(topRight, botRight, movingNode.robotB.amount);
      let leftX2D = graphicsForConfigurationSpace.screenPosition(leftX);
      let rightX2D = graphicsForConfigurationSpace.screenPosition(rightX);
      let screenDiff = p5.Vector.sub(rightX2D, leftX2D);
      let screenDiffAngle = abs(mouseChange.angleBetween(screenDiff));
      if (screenDiffAngle < bestCandidateAngle) {
        bestCandidate = candidate;
        bestCandidateAngle = screenDiffAngle
      }
    } return bestCandidate
  } function pickBestCandidateForB(movingNode, mouseChange) {
    let candidates = movingNode.robotB.getCandidates();
    let bestCandidate;
    let bestCandidateAngle = PI / 2;
    for (let candidate of candidates) {
      let botLeft = configuration_space.graphLayout.getNode([movingNode.robotA.nodeFrom.label, candidate.label]).position;
      let botRight = configuration_space.graphLayout.getNode([movingNode.robotA.nodeTo.label, candidate.label]).position;
      let topX = movingNode.position;
      let botX = p5.Vector.lerp(botLeft, botRight, movingNode.robotA.amount);
      let topX2D = graphicsForConfigurationSpace.screenPosition(topX);
      let botX2D = graphicsForConfigurationSpace.screenPosition(botX);
      let screenDiff = p5.Vector.sub(botX2D, topX2D);
      let screenDiffAngle = abs(mouseChange.angleBetween(screenDiff));
      if (screenDiffAngle < bestCandidateAngle) {
        bestCandidate = candidate;
        bestCandidateAngle = screenDiffAngle
      }
    } return bestCandidate
  } function mouseReleased() {
    configuration_space.graphLayout.configuration.active = false;
    for (let node of configuration_space.graphLayout.nodes) { node.active = false } graph.robotA.active = false;
    graph.robotB.active = false;
    for (let node of graph.graphLayout.nodes) { node.active = false } if (!(key === "a" || key === "b")) { for (let edge of graph.graphLayout.edges) { edge.candidateForRobot = undefined } }
  } function easyCamOff() {
    easyCamActive = false;
    graphicsForConfigurationSpace.easycam.removeMouseListeners();
    graphicsForGraph.easycam.removeMouseListeners();
    forcesActive = false;
    configuration_space.graphLayout.moveToCenter = false;
    graph.graphLayout.moveToCenter = false
  } function easyCamOn() {
    easyCamActive = true;
    if (vverbose) print("easyCamOn");
    graphicsForConfigurationSpace.easycam.attachMouseListeners(graphicsForConfigurationSpace._renderer);
    graphicsForGraph.easycam.attachMouseListeners(graphicsForGraph._renderer);
    forcesActive = true;
    configuration_space.graphLayout.moveToCenter = true;
    graph.graphLayout.moveToCenter = true
  } let flags = {};
  function downKey(c) { return flags[c.charCodeAt(0)] } function keyPressed() {
    if (verbose) console.log("keyPressed: " + keyCode);
    flags[keyCode] = true;
    if (keyCode === SHIFT || key === "a" || key === "b") {
      if (verbose) console.log(" move mode");
      parameters.mode = "Move";
      updateMode()
    } if (key === "a" && !downKey("B") || key === "b" && !downKey("A")) {
      let activeRobot = key === "a" ? graph.robotA : graph.robotB;
      let possibleEdges = activeRobot.getAllPossibleEdges();
      for (let possibleEdge of possibleEdges) { graph.graphLayout.getEdge(possibleEdge[0], possibleEdge[1]).candidateForRobot = activeRobot.index }
    } if (key === "e") addEdgesForSelectedNodes();
    else if (key === "d") deleteSelectedNodesOrEdges();
    else if (key === " ") parameters.running = !parameters.running;
    else if (key === "o") {
      octForces = !octForces;
      console.log("octForces = " + octForces)
    } else if (key === "f") forcesActive = !forcesActive;
    else if (key === "q") parameters.debugMode = !parameters.debugMode;
    else if (key === "t") {
      parameters.showText = !parameters.showText;
      updateIcons()
    } else if (key === "g") toggleGUI(-1);
    else if (key === "0") toggleGUI(0);
    else if (key === "1") toggleGUI(1);
    else if (key === "2") toggleGUI(2);
    else if (key === "3") toggleGUI(3);
    else if (key === "n") addNode();
    else if (key === "i") {
      parameters.showInfo = !parameters.showInfo;
      if (parameters.showInfo) {
        console.log("show info");
        updateInfoString();
        infoDiv.show()
      } else { infoDiv.hide() }
    } else if (key === "a") robotAmoving = !robotAmoving;
    else if (key === "b") robotBmoving = !robotBmoving;
    else if (key === "c") toggleForSelectedNode();
    else if (key === "C") parameters.showConfigurationspace = !parameters.showConfigurationspace;
    else if (key === "s") takeScreenshotGraph = !takeScreenshotGraph;
    else if (key === "S") takeScreenshotConfigSpace = !takeScreenshotConfigSpace;
    else if (key === "R") parameters.showRobots = !parameters.showRobots;
    else if (key === "w") writeToFiles();
    else if (key === "l") readLayoutFromFile("layout.txt");
    else if (key === "r") readFromFile("parameters.txt");
    else if (key === "+") readHomology();
    else if (key === "z") {
      graphicsForConfigurationSpace.easycam.removeMouseListeners();
      graphicsForGraph.easycam.removeMouseListeners()
    } else if (key === "Z") {
      graphicsForConfigurationSpace.easycam.attachMouseListeners(graphicsForConfigurationSpace._renderer);
      graphicsForGraph.easycam.attachMouseListeners(graphicsForGraph._renderer)
    }
  } function keyReleased() {
    if (verbose) console.log("keyReleased: " + keyCode);
    flags[keyCode] = false;
    if (keyCode === SHIFT || key === "a" || key === "b") {
      if (verbose) console.log("keyReleased: " + "parameters.mode = View");
      parameters.mode = "View";
      updateMode()
    } if (!downKey("A") && !downKey("B")) { for (let edge of graph.graphLayout.edges) { edge.candidateForRobot = undefined } }
  } function applyToVec3(rot, vec) {
    let dst;
    var [x, y, z] = vec;
    var [q0, q1, q2, q3] = rot;
    var s = q1 * x + q2 * y + q3 * z;
    dst = [0, 0, 0];
    dst[0] = 2 * (q0 * (x * q0 - (q2 * z - q3 * y)) + s * q1) - x;
    dst[1] = 2 * (q0 * (y * q0 - (q3 * x - q1 * z)) + s * q2) - y;
    dst[2] = 2 * (q0 * (z * q0 - (q1 * y - q2 * x)) + s * q3) - z;
    return dst
  } function limitVector(p, value) { if (p.mag() > value) { p.normalize().mult(value) } } function EulerToQuaternion(x, y, z) {
    var cy = cos(z * .5);
    var sy = sin(z * .5);
    var cp = cos(y * .5);
    var sp = sin(y * .5);
    var cr = cos(x * .5);
    var sr = sin(x * .5);
    var qw = cy * cp * cr + sy * sp * sr;
    var qx = cy * cp * sr - sy * sp * cr;
    var qy = sy * cp * sr + cy * sp * cr;
    var qz = sy * cp * cr - cy * sp * sr;
    return [qw, qx, qy, qz]
  } function QuaternionToEuler(q0, q1, q2, q3) {
    var sinr_cosp = +2 * (q0 * q1 + q2 * q3);
    var cosr_cosp = +1 - 2 * (q1 * q1 + q2 * q2);
    var x = atan2(sinr_cosp, cosr_cosp);
    var sinp = +2 * (q0 * q2 - q3 * q1);
    var y;
    if (abs(sinp) >= 1) y = copysign(M_PI / 2, sinp);
    else y = asin(sinp);
    var siny_cosp = +2 * (q0 * q3 + q1 * q2);
    var cosy_cosp = +1 - 2 * (q2 * q2 + q3 * q3);
    var z = atan2(siny_cosp, cosy_cosp);
    return [x, y, z]
  } function cartesianProductOf() {
    return Array.prototype.reduce.call(arguments, (function (a, b) {
      var ret = [];
      a.forEach((function (a) { b.forEach((function (b) { ret.push(a.concat([b])) })) }));
      return ret
    }), [[]])
  } function getFourthPoint(A, B, C) { return p5.Vector.add(B, C).sub(A) } function labelToString(L) {
    let result = "";
    if (Array.isArray(L)) {
      for (let l of L) { result += l + " " } result = result.slice(0, -1);
      return result
    } else { return L }
  } function checkIfArrayIsUnique(myArray) { return myArray.length === new Set(myArray).size } const flatten = arr => [].concat.apply([], arr);
  const product = (...sets) => sets.reduce(((acc, set) => flatten(acc.map((x => set.map((y => [...x, y])))))), [[]]);
  function arraysEqual(a1, a2) { return JSON.stringify(a1) == JSON.stringify(a2) } function edgesContainEdge(edges, edge) {
    for (let cand of edges) {
      if (arraysEqual(cand, edge)) return true;
      if (arraysEqual(cand, [edge[1], edge[0]])) return true
    } return false
  } function is_state(p) { return checkIfArrayIsUnique(p.flat()) } function toggleForSelectedNode() {
    console.log("toggleForSelectedNode");
    for (let node of graph.graphLayout.nodes) {
      if (node.lastSelected === true) {
        node.applyExtraCenterForce = !node.applyExtraCenterForce;
        if (verbose) print(node.applyExtraCenterForce)
      }
    } for (let node of configuration_space.graphLayout.nodes) {
      if (node.lastSelected === true) {
        node.applyExtraCenterForce = !node.applyExtraCenterForce;
        if (verbose) print(node.applyExtraCenterForce)
      }
    }
  } function toggleGUI(type) { if (type === -1) { if (gui.closed === true) { gui.open() } else { gui.close() } } } let MAXLEVEL = 10;
  let BUCKETSIZE = 10;
  let NODEMASS = 1;
  const EMPTY = 0;
  const LEAF = 1;
  const DIVIDED = 2;
  const allNodesForce = -1 * .33;
  const gravityPower = 2;
  class Octree {
    constructor(graphLayout, boundary, level) {
      this.graphLayout = graphLayout;
      this.boundary = boundary;
      this.level = level;
      this.state = EMPTY;
      this.children = undefined;
      this.centerOfMass = createVector();
      this.centerMass = 0
    } subdivide() {
      this.state = DIVIDED;
      let x = this.boundary.x;
      let y = this.boundary.y;
      let z = this.boundary.z;
      let w = this.boundary.w / 2;
      let h = this.boundary.h / 2;
      let d = this.boundary.d / 2;
      this.URF = new Octree(this.graphLayout, new Cube(x + w, y - h, z + d, w, h, d), this.level + 1);
      this.ULF = new Octree(this.graphLayout, new Cube(x - w, y - h, z + d, w, h, d), this.level + 1);
      this.LRF = new Octree(this.graphLayout, new Cube(x + w, y + h, z + d, w, h, d), this.level + 1);
      this.LLF = new Octree(this.graphLayout, new Cube(x - w, y + h, z + d, w, h, d), this.level + 1);
      this.URB = new Octree(this.graphLayout, new Cube(x + w, y - h, z - d, w, h, d), this.level + 1);
      this.ULB = new Octree(this.graphLayout, new Cube(x - w, y - h, z - d, w, h, d), this.level + 1);
      this.LRB = new Octree(this.graphLayout, new Cube(x + w, y + h, z - d, w, h, d), this.level + 1);
      this.LLB = new Octree(this.graphLayout, new Cube(x - w, y + h, z - d, w, h, d), this.level + 1)
    } insert(node) {
      if (this.state == EMPTY) {
        if (this.children == null) { this.children = [] } this.children.push(node);
        this.state = LEAF
      } else if (this.state == LEAF) {
        if (this.children.length < BUCKETSIZE || this.level == MAXLEVEL) { this.children.push(node) } else {
          this.subdivide();
          for (let n of this.children) { this.insertInOctant(n) } this.children = [];
          this.insertInOctant(node)
        }
      } else if (this.state == DIVIDED) { this.insertInOctant(node) } else { error("insert: state unknown") }
    } insertInOctant(n) {
      if (this.ULF.boundary.contains(n)) this.ULF.insert(n);
      else if (this.URF.boundary.contains(n)) this.URF.insert(n);
      else if (this.LLF.boundary.contains(n)) this.LLF.insert(n);
      else if (this.LRF.boundary.contains(n)) this.LRF.insert(n);
      else if (this.ULB.boundary.contains(n)) this.ULB.insert(n);
      else if (this.URB.boundary.contains(n)) this.URB.insert(n);
      else if (this.LLB.boundary.contains(n)) this.LLB.insert(n);
      else if (this.LRB.boundary.contains(n)) this.LRB.insert(n);
      else { if (vverbose) console.error("insertInOctant: not in any octant: " + n.position + " " + this.boundary.toString() + "\n" + "this.ULF.boundary = " + this.ULF.boundary.toString() + "\n" + "this.URF.boundary = " + this.URF.boundary.toString() + "\n" + "this.LLF.boundary = " + this.LLF.boundary.toString() + "\n" + "this.LRF.boundary = " + this.LRF.boundary.toString() + "\n" + "this.ULB.boundary = " + this.ULB.boundary.toString() + "\n" + "this.URB.boundary = " + this.URB.boundary.toString() + "\n" + "this.LLB.boundary = " + this.LLB.boundary.toString() + "\n" + "this.LRB.boundary = " + this.LRB.boundary.toString() + "\n") }
    } calculateMass() {
      if (vverbose) console.log("calculateMass");
      if (this.state == EMPTY) { } else if (this.state == LEAF) {
        this.centerOfMass.set(0, 0, 0);
        this.centerMass = 0;
        let counter = 0;
        for (let node of this.children) {
          this.centerOfMass.add(p5.Vector.mult(node.position, node.mass));
          this.centerMass += node.mass;
          counter++
        } this.centerOfMass.div(counter)
      } else if (this.state == DIVIDED) {
        this.centerOfMass.set(0, 0, 0);
        this.centerMass = 0;
        this.URF.calculateMass();
        this.ULF.calculateMass();
        this.LRF.calculateMass();
        this.LLF.calculateMass();
        this.URB.calculateMass();
        this.ULB.calculateMass();
        this.LRB.calculateMass();
        this.LLB.calculateMass();
        this.centerOfMass.add(p5.Vector.mult(this.URF.centerOfMass, this.URF.centerMass));
        this.centerMass += this.URF.centerMass;
        this.centerOfMass.add(p5.Vector.mult(this.ULF.centerOfMass, this.ULF.centerMass));
        this.centerMass += this.ULF.centerMass;
        this.centerOfMass.add(p5.Vector.mult(this.LRF.centerOfMass, this.LRF.centerMass));
        this.centerMass += this.LRF.centerMass;
        this.centerOfMass.add(p5.Vector.mult(this.LLF.centerOfMass, this.LLF.centerMass));
        this.centerMass += this.LLF.centerMass;
        this.centerOfMass.add(p5.Vector.mult(this.URB.centerOfMass, this.URB.centerMass));
        this.centerMass += this.URB.centerMass;
        this.centerOfMass.add(p5.Vector.mult(this.ULB.centerOfMass, this.ULB.centerMass));
        this.centerMass += this.ULB.centerMass;
        this.centerOfMass.add(p5.Vector.mult(this.LRB.centerOfMass, this.LRB.centerMass));
        this.centerMass += this.LRB.centerMass;
        this.centerOfMass.add(p5.Vector.mult(this.LLB.centerOfMass, this.LLB.centerMass));
        this.centerMass += this.LLB.centerMass;
        this.centerOfMass.div(this.centerMass)
      } else {
        if (vverbose) console.log("ERROR");
        error("calculateMass: state unknown")
      }
    } getAllNodesForces(target) {
      let result = createVector();
      if (this.state == EMPTY) { } else if (this.state == LEAF) {
        for (let other of this.children) {
          if (target != other) {
            let diff = p5.Vector.sub(target.position, other.position);
            let d = diff.mag();
            if (d > 1) {
              diff.normalize().mult(this.graphLayout.repulsion / pow(d, gravityPower));
              result.add(diff)
            }
          }
        }
      } else if (this.state == DIVIDED) {
        let d = this.centerOfMass.dist(target.position);
        if (d > parameters.THETA * this.boundary.w) {
          let diff = p5.Vector.sub(target.position, this.centerOfMass);
          if (d > 1) {
            diff.normalize().mult(this.graphLayout.repulsion * this.centerMass / pow(d, gravityPower));
            result.add(diff)
          }
        } else {
          result.add(this.ULF.getAllNodesForces(target));
          result.add(this.URF.getAllNodesForces(target));
          result.add(this.LLF.getAllNodesForces(target));
          result.add(this.LRF.getAllNodesForces(target));
          result.add(this.ULB.getAllNodesForces(target));
          result.add(this.URB.getAllNodesForces(target));
          result.add(this.LLB.getAllNodesForces(target));
          result.add(this.LRB.getAllNodesForces(target))
        }
      } else { if (vverbose) error("forcesOnNode: state missing") } return result
    } show(g) {
      g.push();
      g.translate(this.boundary.x, this.boundary.y, this.boundary.z);
      g.stroke(0);
      g.strokeWeight(1);
      g.noFill();
      g.box(2 * this.boundary.w, 2 * this.boundary.h, 2 * this.boundary.d);
      g.pop();
      if (this.children != null) {
        for (let node of this.children) {
          g.stroke(60, 255, 255, 255);
          g.strokeWeight(1);
          g.line(this.centerOfMass.x, this.centerOfMass.y, this.centerOfMass.z, node.position.x, node.position.y, node.position.z);
          g.push();
          g.translate(this.centerOfMass.x, this.centerOfMass.y, this.centerOfMass.z);
          g.fill(210, 255, 255, 255);
          g.noStroke();
          g.sphere(10);
          g.pop()
        }
      } if (this.state == DIVIDED) {
        this.URF.show(g);
        this.ULF.show(g);
        this.LRF.show(g);
        this.LLF.show(g);
        this.URB.show(g);
        this.ULB.show(g);
        this.LRB.show(g);
        this.LLB.show(g)
      }
    }
  } class Cube {
    constructor(x, y, z, w, h, d) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      this.h = h;
      this.d = d
    } contains(node) { return node.position.x >= this.x - this.w && node.position.x <= this.x + this.w && node.position.y >= this.y - this.h && node.position.y <= this.y + this.h && node.position.z >= this.z - this.d && node.position.z <= this.z + this.d } intersects(range) { return !(range.x - range.w > this.x + this.w || range.x + range.w < this.x - this.w || range.y - range.h > this.y + this.h || range.y + range.h < this.y - this.h || range.z - range.d > this.z + this.d || range.z + range.d < this.z - this.d) } toString() { return "x=" + this.x + " y=" + this.y + " z=" + this.z + " w=" + this.w + " h=" + this.h + " d=" + this.d }
  } function initGUIOld() {
    if (verbose) console.log("initGUI");
    document.getElementById("tweakpane").innerHTML = "";
    tweakpane = new Tweakpane({ container: document.getElementById("tweakpane") });
    const paneGeneralSettings = tweakpane.addFolder({ title: "General settings", expanded: true });
    paneGeneralSettings.addInput(parameters, "graphType", { label: "Choose graph", options: { custom: "custom", "K(1,1)": "K(1,1)", "K(1,2)": "K(1,2)", "K(1,3)": "K(1,3)", "K(1,4)": "K(1,4)", "K(1,5)": "K(1,5)", "K(1,6)": "K(1,6)", "K(1,7)": "K(1,7)", "K(1,8)": "K(1,8)", "K(1,9)": "K(1,9)", "K(1,10)": "K(1,10)", "K(2,2)": "K(2,2)", "K(2,3)": "K(2,3)", "K(2,4)": "K(2,4)", "K(2,5)": "K(2,5)", "K(2,6)": "K(2,6)", "K(3,3)": "K(3,3)", "K(3,4)": "K(3,4)", "K(4,4)": "K(4,4)", "K(2)": "K(2)", "K(3)": "K(3)", "K(4)": "K(4)", "K(5)": "K(5)", "K(6)": "K(6)", "K(7)": "K(7)", "K(8)": "K(8)", "C(2)": "C(2)", "C(3)": "C(3)", "C(4)": "C(4)", "C(5)": "C(5)", "C(6)": "C(6)", "C(7)": "C(7)", "W(4)": "W(4)", "W(5)": "W(5)", "W(6)": "W(6)", "W(7)": "W(7)", "W(8)": "W(8)", "W(9)": "W(9)", "W(10)": "W(10)" } }).on("change", (e => {
      parameters.mode = "View";
      graphIsCustomized = false;
      init()
    }));
    paneGeneralSettings.addInput(parameters, "mode", { label: "Choose mode", options: { View: "View", Move: "Move" } }).on("change", (e => {
      if (verbose) console.log("mode: on change event");
      updateMode()
    }));
    paneGeneralSettings.addInput(parameters, "running", { label: "Running" });
    paneGeneralSettings.addInput(parameters, "showRobots", { label: "Show robots" }).on("change", (e => { updateURL() }));
    paneGeneralSettings.addInput(parameters, "showGraph", { label: "Show graph in configuration space" }).on("change", (e => { updateURL() }));
    paneGeneralSettings.addInput(parameters, "showConfigurationspace", { label: "Show configuration space" }).on("change", (e => { updateURL() }));
    paneGeneralSettings.addInput(parameters, "showInfo", { label: "Show info" }).on("change", (e => { if (e.value) { infoDiv.show() } else { infoDiv.hide() } }));
    paneGeneralSettings.addInput(parameters, "gridOn", { label: "Show square grids" });
    paneGeneralSettings.addInput(parameters, "squareOn", { label: "Show square surfaces" });
    paneGeneralSettings.addInput(parameters, "showLoops", { label: "Show loops" });
    paneGeneralSettings.addInput(parameters, "showHyperplanes", { label: "Show hyperplanes" });
    paneGeneralSettings.addInput(parameters, "showText", { label: "Show text (t)" });
    paneGeneralSettings.addInput(parameters, "dualView", { label: "Dual view" }).on("change", (e => {
      console.log("change in panel");
      console.log("parameters.dualView = " + parameters.dualView);
      setDualView(parameters.dualView)
    }));
    syncViewToggle = paneGeneralSettings.addInput(parameters, "syncView", { label: "Sync cameras" });
    if (!parameters.dualView) { syncViewToggle.hidden = true } const paneVisualSettings = tweakpane.addFolder({ title: "Visual settings", expanded: !true });
    paneVisualSettings.addInput(parameters, "nodeSize", { label: "Node size", min: 0, max: 40 });
    paneVisualSettings.addInput(parameters, "robotsNodeSize", { label: "Robot size", min: 0, max: 40 });
    paneVisualSettings.addInput(parameters, "configNodeSize", { label: "Configuration node size", min: 0, max: 40 });
    paneVisualSettings.addInput(parameters, "sphereDetail", { label: "Sphere detail", step: 1, min: 2, max: 40 });
    paneVisualSettings.addInput(parameters, "edgeWidthGraph", { label: "Graph edge width", min: 0, max: 10 });
    paneVisualSettings.addInput(parameters, "edgeWidthConfigSpace", { label: "Configuration edge width", min: 0, max: 10 });
    paneVisualSettings.addInput(parameters, "edgeWidthGrid", { label: "Grid edge width", min: 0, max: 10 });
    paneVisualSettings.addInput(parameters, "granularityGraph", { label: "Edge granularity for graph", step: 1, min: 0, max: 80 });
    paneVisualSettings.addInput(parameters, "granularityFirstCoordinate", { label: "Edge granularity for first coordinate", step: 1, min: 0, max: 80 });
    paneVisualSettings.addInput(parameters, "granularitySecondCoordinate", { label: "Edge granularity for second coordinate", step: 1, min: 0, max: 80 });
    paneVisualSettings.addInput(parameters, "colorNode", { label: "Node color", view: "color" });
    paneVisualSettings.addInput(parameters, "colorRobotA", { label: "Color of Robot A node", view: "color" });
    paneVisualSettings.addInput(parameters, "colorRobotB", { label: "Color of Robot B node", view: "color" });
    paneVisualSettings.addInput(parameters, "colorConfig", { label: "Color of Configuration node", view: "color" });
    paneVisualSettings.addInput(parameters, "colorGraphEdge", { label: "Color of Edges in Graph", view: "color" });
    paneVisualSettings.addInput(parameters, "squareColor", { label: "Color of squares", view: "color" });
    paneVisualSettings.addInput(parameters, "squareOpacity", { label: "Opacity of squares", min: 0, max: 255 });
    paneVisualSettings.addInput(parameters, "activeDotColor", { label: "Color of selected node", view: "color" });
    paneVisualSettings.addInput(parameters, "deleteNodeColor", { label: "Color for deletion of node", view: "color" });
    paneVisualSettings.addInput(parameters, "selectedNodeForEdgeColor", { label: "Color for selected Node for Edge", view: "color" });
    paneVisualSettings.addInput(parameters, "fontSize", { label: "Font size", min: 10, max: 100 });
    paneVisualSettings.addInput(parameters, "labelZ", { label: "Text distance from nodes", min: 0, max: 100 });
    const paneMotionSettings = tweakpane.addFolder({ title: "Motion settings", expanded: !true });
    paneMotionSettings.addInput(parameters, "moveDotsRandomly", { label: "Move robots" });
    paneMotionSettings.addInput(parameters, "amountMultiplier", { label: "amountMultiplier", min: 0, max: 1 });
    paneMotionSettings.addInput(parameters, "robotASpeed", { label: "robotASpeed", min: 0, max: 1 });
    paneMotionSettings.addInput(parameters, "robotBSpeed", { label: "robotBSpeed", min: 0, max: 1 });
    paneMotionSettings.addInput(parameters, "speedUp", { label: "speedUp", min: 0, max: 1 });
    paneMotionSettings.addInput(parameters, "recordHistory", { label: "recordHistory" });
    paneMotionSettings.addInput(parameters, "showHistory", { label: "showHistory" });
    paneMotionSettings.addButton({ label: "resetHistory", title: "reset" }).on("click", (() => { configuration_space.graphLayout.configuration.resetHistory() }));
    const paneGraphLayout = tweakpane.addFolder({ title: "Graph layout settings", expanded: true });
    paneGraphLayout.addInput(graph.graphLayout, "edgelength", { label: "Target edge length", min: 1, max: 400 });
    paneGraphLayout.addInput(graph.graphLayout, "graphEdgeForce", { label: "Edge force", min: 0, max: .1 });
    paneGraphLayout.addInput(parameters, "maxspeed", { label: "Max node speed", min: 0, max: 30 });
    paneGraphLayout.addInput(graph.graphLayout, "cohesionthreshold", { label: "Neighbor attraction threshold", min: 0, max: 2 });
    paneGraphLayout.addInput(graph.graphLayout, "repulsion", { label: "Repulsion", min: 0, max: 1e5 });
    paneGraphLayout.addInput(graph.graphLayout, "separationFactor", { label: "Separation factor", min: 0, max: 1300 });
    paneGraphLayout.addInput(graph.graphLayout, "planarForce", { label: "Planar force", min: 0, max: .15 });
    paneGraphLayout.addInput(graph.graphLayout, "centerForce", { label: "Center force", min: 0, max: .15 });
    paneGraphLayout.addInput(graph.graphLayout, "extraCenterForce", { label: "Extra center force", min: 0, max: .15 });
    paneGraphLayout.addInput(graph.graphLayout, "moveToCenter", { label: "Adjust to center" });
    const paneConfigspaceLayout = tweakpane.addFolder({ title: "Configuration space layout settings", expanded: true });
    paneConfigspaceLayout.addInput(parameters, "layoutPreset", { label: "Layout presets", options: { "Layout 00": "layout-00.txt", "Layout 01": "layout-01.txt", "Layout 02": "layout-02.txt" } }).on("change", (e => { readLayoutFromFile(parameters.layoutPreset) }));
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "firstCoordinateEdgeLength", { label: "First coordinate target edge length", min: 1, max: 1e3 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "firstCoordinateForce", { label: "Force for first coordinate edge", min: 0, max: .1 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "secondCoordinateEdgeLength", { label: "Second coordinate target edge length", min: 1, max: 1e3 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "secondCoordinateForce", { label: "Force for second coordinate edge", min: 0, max: .1 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "firstCoordinateMirrorForce", { label: "First projection bias", min: -.2, max: .2 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "secondCoordinateMirrorForce", { label: "Second projection bias", min: -.2, max: .2 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "coordinatePreference", { label: "Coordinate preference", min: -.1, max: .1 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "extraCenterPreference", { label: "Extra center preference", min: 0, max: .1 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "cohesionthreshold", { label: "Neighbor attraction threshold", min: 0, max: 2 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "repulsion", { label: "Repulsion", min: 0, max: 5e5 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "centroidRepulsion", { label: "Centroid Repulsion", min: 0, max: 5e5 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "separationFactor", { label: "Separation factor", min: 0, max: 1300 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "centerForce", { label: "Center Force", min: 0, max: .15 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "extraCenterForce", { label: "Extra center force", min: 0, max: .15 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "moveToCenter", { label: "Adjust to center" });
    paneConfigspaceLayout.addInput(parameters, "THETA", { label: "THETA", min: 0, max: 10 });
    paneConfigspaceLayout.addInput(configuration_space.graphLayout, "squarePlanarForce", { label: "Square Planar Force", min: 0, max: .2 })
  } function updateURL() {
    if (verbose) console.log("updateURL");
    if (history.pushState) {
      let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + (parameters.graphType === "custom" || graphIsCustomized ? "graph=custom" + "&" + "nodes=" + graph.nodes + "&" + "edges=" + edgesToString(graph.edges) : "graph=" + parameters.graphType) + "&" + "view=" + (parameters.dualView ? "dual" : "single") + "&" + "showgraph=" + parameters.showGraph + "&" + "showconfigspace=" + parameters.showConfigurationspace + "&" + "showrobots=" + parameters.showRobots;
      window.history.pushState({ path: newurl }, "", newurl);
      if (verbose) console.log(newurl)
    }
  } function edgesToString(edges) {
    let result = "";
    for (let edge of edges) { result += "[" + edge + "]," } result = result.substr(0, result.length - 1);
    return result
  } function setParametersFromURL() {
    if (verbose) console.log("setParametersFromURL");
    let str = getURL();
    let parts = split(str, "?");
    if (parts.length !== 2) return;
    let inputString = parts[1];
    let urlParameters = {};
    for (let p of split(inputString, "&")) {
      let parts = split(p, "=");
      urlParameters[parts[0]] = parts[1]
    } if (urlParameters["file"] !== undefined) {
      readFromFile(urlParameters["file"]);
      return
    } if (verbose) console.log("setParametersFromURL continues");
    let nodes, edges, graph;
    let edgesFromUrl = [];
    let viewStr = urlParameters["view"];
    if (viewStr === "single") { parameters.dualView = false } else if (viewStr === "dual") { parameters.dualView = true } let showGraphStr = urlParameters["showgraph"];
    parameters.showGraph = showGraphStr !== "false";
    let showConfigStr = urlParameters["showconfigspace"];
    parameters.showConfigurationspace = showConfigStr !== "false";
    let showRobotsStr = urlParameters["showrobots"];
    parameters.showRobots = showRobotsStr !== "false";
    let graphStr = urlParameters["graph"];
    if (graphStr !== undefined && graphStr !== "custom") { parameters.graphType = graphStr } else {
      let nodesStr = urlParameters["nodes"];
      if (nodesStr === undefined) return;
      nodes = nodesStr.split(",").map(Number);
      for (let n of nodes) { if (isNaN(n)) return } let edgesStr = urlParameters["edges"];
      if (vverbose) console.log(edgesStr);
      if (edgesStr !== null) edgesStr = decodeURIComponent(edgesStr);
      if (vverbose) console.log(edgesStr);
      if (edgesStr !== undefined && edgesStr.charAt(0) == "[" && edgesStr.charAt(edgesStr.length - 1) == "]") {
        if (vverbose) console.log("🎉 success []");
        edgesStr = edgesStr.slice(1, -1);
        edgesFromUrl = edgesStr.split(/[^\d],[^\d]/).map((s => s.split(",").map(Number)))
      } edges = [];
      for (let edge of edgesFromUrl) { if (edge.length === 2 && nodes.includes(edge[0]) && nodes.includes(edge[1]) && edge[0] !== edge[1] && !edgesContainEdge(edges, edge)) { edges.push(edge) } } if (nodes !== undefined) {
        customGraph = {};
        customGraph.nodes = nodes;
        customGraph.edges = edges;
        graphIsCustomized = true;
        parameters.graphType = "custom"
      }
    }
  } function updateInfoString() {
    infoStrings = [];
    infoStrings.push("Graph = " + parameters.graphType);
    infoStrings.push("Nodes = " + JSON.stringify(graph.nodes));
    infoStrings.push("Edges = " + JSON.stringify(graph.edges));
    let nodesWithExtraCenterForce = [];
    for (let node of graph.graphLayout.nodes) { if (node.applyExtraCenterForce) { nodesWithExtraCenterForce.push(node.label) } } infoStrings.push("Graph nodes with extra center force = " + JSON.stringify(nodesWithExtraCenterForce));
    let state = graphicsForConfigurationSpace.easycam.getState();
    infoStrings.push("Camera state = " + JSON.stringify(state));
    let globalParameters = {};
    globalParameters["mode"] = parameters.mode;
    globalParameters["showGraph"] = parameters.showGraph;
    globalParameters["showConfigurationspace"] = parameters.showConfigurationspace;
    globalParameters["showRobots"] = parameters.showRobots;
    globalParameters["syncView"] = parameters.syncView;
    globalParameters["distinguishDots"] = parameters.distinguishDots;
    globalParameters["gridOn"] = parameters.gridOn;
    globalParameters["squareOn"] = parameters.squareOn;
    globalParameters["showHyperplanes"] = parameters.showHyperplanes;
    globalParameters["granularityFirstCoordinate"] = parameters.granularityFirstCoordinate;
    globalParameters["granularitySecondCoordinate"] = parameters.granularitySecondCoordinate;
    globalParameters["showText"] = parameters.showText;
    globalParameters["sphereView"] = parameters.sphereView;
    globalParameters["lights"] = parameters.lights;
    globalParameters["moveDotsRandomly"] = parameters.moveDotsRandomly;
    globalParameters["robotASpeed"] = parameters.robotASpeed;
    globalParameters["robotBSpeed"] = parameters.robotBSpeed;
    globalParameters["amountMultiplier"] = parameters.amountMultiplier;
    globalParameters["recordHistory"] = parameters.recordHistory;
    globalParameters["showHistory"] = parameters.showHistory;
    globalParameters["sphereDetail"] = parameters.sphereDetail;
    globalParameters["speedUp"] = parameters.speedUp;
    globalParameters["labelX"] = parameters.labelX;
    globalParameters["labelY"] = parameters.labelY;
    globalParameters["labelZ"] = parameters.labelZ;
    globalParameters["colorRobotA"] = parameters.colorRobotA;
    globalParameters["colorRobotB"] = parameters.colorRobotB;
    globalParameters["colorConfig"] = parameters.colorConfig;
    globalParameters["colorNode"] = parameters.colorNode;
    globalParameters["colorGraphEdge"] = parameters.colorGraphEdge;
    globalParameters["squareColor"] = parameters.squareColor;
    globalParameters["squareOpacity"] = parameters.squareOpacity;
    globalParameters["activeDotColor"] = parameters.activeDotColor;
    globalParameters["deleteNodeColor"] = parameters.deleteNodeColor;
    globalParameters["selectedNodeForEdgeColor"] = parameters.selectedNodeForEdgeColor;
    globalParameters["nodeSize"] = parameters.nodeSize;
    globalParameters["robotsNodeSize"] = parameters.robotsNodeSize;
    globalParameters["configNodeSize"] = parameters.configNodeSize;
    globalParameters["edgeWidthGraph"] = parameters.edgeWidthGraph;
    globalParameters["edgeWidthConfigSpace"] = parameters.edgeWidthConfigSpace;
    globalParameters["edgeWidthGrid"] = parameters.edgeWidthGrid;
    globalParameters["maxspeed"] = parameters.maxspeed;
    infoStrings.push("Parameters = " + JSON.stringify(globalParameters));
    let graphParameters = {};
    graphParameters["edgelength"] = graph.graphLayout.edgelength;
    graphParameters["cohesionthreshold"] = graph.graphLayout.cohesionthreshold;
    graphParameters["repulsion"] = graph.graphLayout.repulsion;
    graphParameters["separationFactor"] = graph.graphLayout.separationFactor;
    graphParameters["planarForce"] = graph.graphLayout.planarForce;
    graphParameters["centerForce"] = graph.graphLayout.centerForce;
    graphParameters["extraCenterForce"] = graph.graphLayout.extraCenterForce;
    graphParameters["moveToCenter"] = graph.graphLayout.moveToCenter;
    infoStrings.push("Graph parameters = " + JSON.stringify(graphParameters));
    let configSpaceParameters = {};
    configSpaceParameters["firstCoordinateEdgeLength"] = configuration_space.graphLayout.firstCoordinateEdgeLength;
    configSpaceParameters["firstCoordinateForce"] = configuration_space.graphLayout.firstCoordinateForce;
    configSpaceParameters["secondCoordinateEdgeLength"] = configuration_space.graphLayout.secondCoordinateEdgeLength;
    configSpaceParameters["secondCoordinateForce"] = configuration_space.graphLayout.secondCoordinateForce;
    configSpaceParameters["firstCoordinateMirrorForce"] = configuration_space.graphLayout.firstCoordinateMirrorForce;
    configSpaceParameters["secondCoordinateMirrorForce"] = configuration_space.graphLayout.secondCoordinateMirrorForce;
    configSpaceParameters["coordinatePreference"] = configuration_space.graphLayout.coordinatePreference;
    configSpaceParameters["extraCenterPreference"] = configuration_space.graphLayout.extraCenterPreference;
    configSpaceParameters["cohesionthreshold"] = configuration_space.graphLayout.cohesionthreshold;
    configSpaceParameters["repulsion"] = configuration_space.graphLayout.repulsion;
    configSpaceParameters["separationFactor"] = configuration_space.graphLayout.separationFactor;
    configSpaceParameters["centerForce"] = configuration_space.graphLayout.centerForce;
    configSpaceParameters["extraCenterForce"] = configuration_space.graphLayout.extraCenterForce;
    configSpaceParameters["moveToCenter"] = configuration_space.graphLayout.moveToCenter;
    infoStrings.push("Configuration space parameters = " + JSON.stringify(configSpaceParameters));
    for (let n of graph.nodes) { infoStrings.push("Node position (" + n + ") = " + posToString(graph.graphLayout.getNode(n).position)) } for (let n of configuration_space.graphLayout.nodes) { infoStrings.push("Configuration position (" + n.label + ") = " + posToString(n.position)) } let infoHTML = "";
    infoHTML += "<div class='break-all'>";
    for (let string of infoStrings) { infoHTML += string + "<br>" } infoHTML += "</div>";
    infoDiv.html(infoHTML)
  } function updateLayoutStrings() {
    layoutStrings = [];
    let graphParameters = {};
    graphParameters["edgelength"] = graph.graphLayout.edgelength;
    graphParameters["cohesionthreshold"] = graph.graphLayout.cohesionthreshold;
    graphParameters["repulsion"] = graph.graphLayout.repulsion;
    graphParameters["separationFactor"] = graph.graphLayout.separationFactor;
    graphParameters["planarForce"] = graph.graphLayout.planarForce;
    graphParameters["centerForce"] = graph.graphLayout.centerForce;
    graphParameters["extraCenterForce"] = graph.graphLayout.extraCenterForce;
    graphParameters["moveToCenter"] = graph.graphLayout.moveToCenter;
    layoutStrings.push("Graph parameters = " + JSON.stringify(graphParameters));
    let configSpaceParameters = {};
    configSpaceParameters["firstCoordinateEdgeLength"] = configuration_space.graphLayout.firstCoordinateEdgeLength;
    configSpaceParameters["firstCoordinateForce"] = configuration_space.graphLayout.firstCoordinateForce;
    configSpaceParameters["secondCoordinateEdgeLength"] = configuration_space.graphLayout.secondCoordinateEdgeLength;
    configSpaceParameters["secondCoordinateForce"] = configuration_space.graphLayout.secondCoordinateForce;
    configSpaceParameters["firstCoordinateMirrorForce"] = configuration_space.graphLayout.firstCoordinateMirrorForce;
    configSpaceParameters["secondCoordinateMirrorForce"] = configuration_space.graphLayout.secondCoordinateMirrorForce;
    configSpaceParameters["coordinatePreference"] = configuration_space.graphLayout.coordinatePreference;
    configSpaceParameters["extraCenterPreference"] = configuration_space.graphLayout.extraCenterPreference;
    configSpaceParameters["cohesionthreshold"] = configuration_space.graphLayout.cohesionthreshold;
    configSpaceParameters["repulsion"] = configuration_space.graphLayout.repulsion;
    configSpaceParameters["separationFactor"] = configuration_space.graphLayout.separationFactor;
    configSpaceParameters["centerForce"] = configuration_space.graphLayout.centerForce;
    configSpaceParameters["extraCenterForce"] = configuration_space.graphLayout.extraCenterForce;
    configSpaceParameters["moveToCenter"] = configuration_space.graphLayout.moveToCenter;
    configSpaceParameters["squarePlanarForce"] = configuration_space.graphLayout.squarePlanarForce;
    layoutStrings.push("Configuration space parameters = " + JSON.stringify(configSpaceParameters))
  } function readLayoutFromStrings(strings) {
    if (vverbose) console.log("readLayoutFromStrings");
    let parametersFromFile = {};
    for (let s of strings) {
      if (s === "") continue;
      let parts = split(s, " = ");
      if (parts.length !== 2) continue;
      parametersFromFile[parts[0]] = parts[1]
    } let graphParametersString = parametersFromFile["Graph parameters"];
    let graphParameters = JSON.parse(graphParametersString);
    graph.graphLayout.edgelength = graphParameters["edgelength"];
    graph.graphLayout.cohesionthreshold = graphParameters["cohesionthreshold"];
    graph.graphLayout.repulsion = graphParameters["repulsion"];
    graph.graphLayout.separationFactor = graphParameters["separationFactor"];
    graph.graphLayout.planarForce = graphParameters["planarForce"];
    graph.graphLayout.centerForce = graphParameters["centerForce"];
    graph.graphLayout.extraCenterForce = graphParameters["extraCenterForce"];
    graph.graphLayout.moveToCenter = graphParameters["moveToCenter"];
    let configSpaceParametersString = parametersFromFile["Configuration space parameters"];
    let configSpaceParameters = JSON.parse(configSpaceParametersString);
    configuration_space.graphLayout.firstCoordinateEdgeLength = configSpaceParameters["firstCoordinateEdgeLength"];
    configuration_space.graphLayout.firstCoordinateForce = configSpaceParameters["firstCoordinateForce"];
    configuration_space.graphLayout.secondCoordinateEdgeLength = configSpaceParameters["secondCoordinateEdgeLength"];
    configuration_space.graphLayout.secondCoordinateForce = configSpaceParameters["secondCoordinateForce"];
    configuration_space.graphLayout.firstCoordinateMirrorForce = configSpaceParameters["firstCoordinateMirrorForce"];
    configuration_space.graphLayout.secondCoordinateMirrorForce = configSpaceParameters["secondCoordinateMirrorForce"];
    configuration_space.graphLayout.coordinatePreference = configSpaceParameters["coordinatePreference"];
    configuration_space.graphLayout.extraCenterPreference = configSpaceParameters["extraCenterPreference"];
    configuration_space.graphLayout.cohesionthreshold = configSpaceParameters["cohesionthreshold"];
    configuration_space.graphLayout.repulsion = configSpaceParameters["repulsion"];
    configuration_space.graphLayout.separationFactor = configSpaceParameters["separationFactor"];
    configuration_space.graphLayout.centerForce = configSpaceParameters["centerForce"];
    configuration_space.graphLayout.extraCenterForce = configSpaceParameters["extraCenterForce"];
    configuration_space.graphLayout.moveToCenter = configSpaceParameters["moveToCenter"];
    configuration_space.graphLayout.squarePlanarForce = configSpaceParameters["squarePlanarForce"]
  } function writeToFiles() { writeParametersToFile() } function writeParametersToFile() {
    let filename = makeFileName("");
    updateInfoString();
    saveStrings(infoStrings, filename, "txt");
    saveCanvas(configuration_space.graphLayout.graphics, filename + ".png")
  } function writeLayoutToFile() {
    updateLayoutStrings();
    saveStrings(layoutStrings, makeFileName("-layout"), "txt")
  } function writeChainComplexToFile() {
    let str = getChompString();
    saveStrings([str], makeFileName(""), "chn")
  } function writeObjToFile() {
    let str = getObjString();
    saveStrings([str], makeFileName(""), "obj")
  } function readHomology() {
    const filename = "catalog/" + parameters.graphType + ".gen";
    loadStrings(filename, saveLoopsInConfigurationSpace)
  } function saveLoopsInConfigurationSpace(strings) {
    let loops = getLoops(strings);
    configuration_space.loops = loops;
    console.log("loops loaded");
    console.log(loops)
  } function getLoops(strings) {
    let readingLoops = false;
    let loops = [];
    for (let s of strings) {
      if (!readingLoops && s === "[H_1]") {
        readingLoops = true;
        continue
      } if (readingLoops) {
        if (s === "") { return loops } else {
          let loop = s.split(/[+-]/).filter((x => x !== "")).map(trim).map((x => JSON.parse(x)));
          loops.push(loop)
        }
      }
    }
  } function readFromString(strings) {
    if (verbose) console.log("readFromString");
    let parametersFromFile = {};
    for (let s of strings) {
      if (s === "") continue;
      let parts = split(s, " = ");
      if (parts.length !== 2) continue;
      parametersFromFile[parts[0]] = parts[1]
    } parameters.graphType = parametersFromFile["Graph"];
    if (parameters.graphType === "custom") {
      customGraph = {};
      customGraph.nodes = JSON.parse(parametersFromFile["Nodes"]);
      customGraph.edges = JSON.parse(parametersFromFile["Edges"])
    } let globalParametersString = parametersFromFile["Parameters"];
    let globalParameters = JSON.parse(globalParametersString);
    parameters.mode = globalParameters["mode"];
    parameters.showGraph = globalParameters["showGraph"];
    parameters.showConfigurationspace = globalParameters["showConfigurationspace"];
    parameters.showRobots = globalParameters["showRobots"];
    parameters.syncView = globalParameters["syncView"];
    parameters.distinguishDots = globalParameters["distinguishDots"];
    parameters.gridOn = globalParameters["gridOn"];
    parameters.squareOn = globalParameters["squareOn"];
    parameters.showHyperplanes = globalParameters["showHyperplanes"];
    parameters.granularityFirstCoordinate = globalParameters["granularityFirstCoordinate"];
    parameters.granularitySecondCoordinate = globalParameters["granularitySecondCoordinate"];
    parameters.showText = globalParameters["showText"];
    parameters.sphereView = globalParameters["sphereView"];
    parameters.lights = globalParameters["lights"];
    parameters.moveDotsRandomly = globalParameters["moveDotsRandomly"];
    parameters.robotASpeed = globalParameters["robotASpeed"];
    parameters.robotBSpeed = globalParameters["robotBSpeed"];
    parameters.amountMultiplier = globalParameters["amountMultiplier"];
    parameters.recordHistory = globalParameters["recordHistory"];
    parameters.showHistory = globalParameters["showHistory"];
    parameters.sphereDetail = globalParameters["sphereDetail"];
    parameters.speedUp = globalParameters["speedUp"];
    parameters.labelX = globalParameters["labelX"];
    parameters.labelY = globalParameters["labelY"];
    parameters.labelZ = globalParameters["labelZ"];
    parameters.colorRobotA = globalParameters["colorRobotA"];
    parameters.colorRobotB = globalParameters["colorRobotB"];
    parameters.colorConfig = globalParameters["colorConfig"];
    parameters.colorNode = globalParameters["colorNode"];
    parameters.colorGraphEdge = globalParameters["colorGraphEdge"];
    parameters.squareColor = globalParameters["squareColor"];
    parameters.squareOpacity = globalParameters["squareOpacity"];
    parameters.activeDotColor = globalParameters["activeDotColor"];
    parameters.deleteNodeColor = globalParameters["deleteNodeColor"];
    parameters.selectedNodeForEdgeColor = globalParameters["selectedNodeForEdgeColor"];
    parameters.nodeSize = globalParameters["nodeSize"];
    parameters.robotsNodeSize = globalParameters["robotsNodeSize"];
    parameters.configNodeSize = globalParameters["configNodeSize"];
    parameters.edgeWidthGraph = globalParameters["edgeWidthGraph"];
    parameters.edgeWidthConfigSpace = globalParameters["edgeWidthConfigSpace"];
    parameters.edgeWidthGrid = globalParameters["edgeWidthGrid"];
    parameters.maxspeed = globalParameters["maxspeed"];
    if (verbose) console.log("readFromString: call initView and initGraph");
    initView();
    initGraph(parameters.graphType);
    let graphNodesWithExtraCenterForce = JSON.parse(parametersFromFile["Graph nodes with extra center force"]);
    for (let node of graphNodesWithExtraCenterForce) { graph.graphLayout.getNode(node).applyExtraCenterForce = true } let graphParametersString = parametersFromFile["Graph parameters"];
    let graphParameters = JSON.parse(graphParametersString);
    graph.graphLayout.edgelength = graphParameters["edgelength"];
    graph.graphLayout.cohesionthreshold = graphParameters["cohesionthreshold"];
    graph.graphLayout.repulsion = graphParameters["repulsion"];
    graph.graphLayout.separationFactor = graphParameters["separationFactor"];
    graph.graphLayout.planarForce = graphParameters["planarForce"];
    graph.graphLayout.centerForce = graphParameters["centerForce"];
    graph.graphLayout.extraCenterForce = graphParameters["extraCenterForce"];
    graph.graphLayout.moveToCenter = graphParameters["moveToCenter"];
    let configSpaceParametersString = parametersFromFile["Configuration space parameters"];
    let configSpaceParameters = JSON.parse(configSpaceParametersString);
    configuration_space.graphLayout.firstCoordinateEdgeLength = configSpaceParameters["firstCoordinateEdgeLength"];
    configuration_space.graphLayout.firstCoordinateForce = configSpaceParameters["firstCoordinateForce"];
    configuration_space.graphLayout.secondCoordinateEdgeLength = configSpaceParameters["secondCoordinateEdgeLength"];
    configuration_space.graphLayout.secondCoordinateForce = configSpaceParameters["secondCoordinateForce"];
    configuration_space.graphLayout.firstCoordinateMirrorForce = configSpaceParameters["firstCoordinateMirrorForce"];
    configuration_space.graphLayout.secondCoordinateMirrorForce = configSpaceParameters["secondCoordinateMirrorForce"];
    configuration_space.graphLayout.coordinatePreference = configSpaceParameters["coordinatePreference"];
    configuration_space.graphLayout.extraCenterPreference = configSpaceParameters["extraCenterPreference"];
    configuration_space.graphLayout.cohesionthreshold = configSpaceParameters["cohesionthreshold"];
    configuration_space.graphLayout.repulsion = configSpaceParameters["repulsion"];
    configuration_space.graphLayout.separationFactor = configSpaceParameters["separationFactor"];
    configuration_space.graphLayout.centerForce = configSpaceParameters["centerForce"];
    configuration_space.graphLayout.extraCenterForce = configSpaceParameters["extraCenterForce"];
    configuration_space.graphLayout.moveToCenter = configSpaceParameters["moveToCenter"];
    if (verbose) console.log("readFromString: call initGUI");
    for (let n of graph.nodes) {
      let node = graph.graphLayout.getNode(n);
      let coordinates = parametersFromFile["Node position (" + n + ")"];
      if (coordinates !== undefined && coordinates.charAt(0) == "[" && coordinates.charAt(coordinates.length - 1) == "]") {
        coordinates = coordinates.slice(1, -1);
        coordinates = coordinates.split(",").map(Number)
      } node.position = createVector(coordinates[0], coordinates[1], coordinates[2])
    } for (let node of configuration_space.graphLayout.nodes) {
      let coordinates = parametersFromFile["Configuration position (" + node.label[0] + "," + node.label[1] + ")"];
      if (coordinates !== undefined && coordinates.charAt(0) == "[" && coordinates.charAt(coordinates.length - 1) == "]") {
        coordinates = coordinates.slice(1, -1);
        coordinates = coordinates.split(",").map(Number)
      } if (verbose) console.log("configuration coordinates = " + coordinates);
      node.position = createVector(coordinates[0], coordinates[1], coordinates[2])
    } let cameraStateString = parametersFromFile["Camera state"];
    graphicsForConfigurationSpace.easycam.setState(JSON.parse(cameraStateString), 0);
    parameters.mode = "Move";
    if (verbose) console.log("readFromString: call updateMode");
    easyCamOff()
  } function readFromFile(fileName) {
    if (verbose) console.log("readFromFile: " + fileName);
    loadStrings(fileName, readFromString)
  } function readLayoutFromFile(fileName) { loadStrings(fileName, readLayoutFromStrings) } function posToString(pos) { return "[" + pos.x + "," + pos.y + "," + pos.z + "]" } function handleFile(file) {
    let str = file.data;
    let strings = str.split("\n");
    readFromString(strings)
  } function getChompString() {
    let result = "";
    result += "chain complex\n\n";
    result += "max dimension = 2\n\n";
    result += "dimension 0\n";
    for (let state of configuration_space.states) { if (configuration_space.getDegree(state) === 0) { result += " # " + JSON.stringify(state) + "\n" } } result += "\n\ndimension 1\n";
    for (let state of configuration_space.states) {
      if (configuration_space.getDegree(state) === 1) {
        let product;
        if (Array.isArray(state[0])) { product = cartesianProductOf(state[0], [state[1]]) } else { product = cartesianProductOf([state[0]], state[1]) } result += " # " + JSON.stringify(state) + " = - " + JSON.stringify(product[0]) + " + " + JSON.stringify(product[1]) + "\n"
      }
    } result += "\n\ndimension 2\n";
    for (let state of configuration_space.states) {
      if (configuration_space.getDegree(state) === 2) {
        result += " # " + JSON.stringify(state) + " =";
        result += " + " + JSON.stringify([state[0], state[1][0]]);
        result += " + " + JSON.stringify([state[0][1], state[1]]);
        result += " - " + JSON.stringify([state[0], state[1][1]]);
        result += " - " + JSON.stringify([state[0][0], state[1]]);
        result += "\n"
      }
    } return result
  } function getObjString() {
    let result = "";
    result += "# OBJ\n###########################################\n\n";
    let objCounter = 1;
    for (let n of configuration_space.graphLayout.nodes) {
      n.OBJindex = objCounter;
      result += "# vertex " + objCounter + " = " + n.label + "\n";
      result += "v " + n.position.x + " " + n.position.y + " " + n.position.z + "\n";
      objCounter = objCounter + 1
    } for (let state of configuration_space.states) {
      if (configuration_space.getDegree(state) === 2) {
        result += "# face " + JSON.stringify(state) + "\n";
        result += "f";
        result += " " + str(configuration_space.graphLayout.getNode([state[0][0], state[1][0]]).OBJindex);
        result += " " + str(configuration_space.graphLayout.getNode([state[0][0], state[1][1]]).OBJindex);
        result += " " + str(configuration_space.graphLayout.getNode([state[0][1], state[1][1]]).OBJindex);
        result += " " + str(configuration_space.graphLayout.getNode([state[0][1], state[1][0]]).OBJindex);
        result += "\n";
        result += "f";
        result += " " + str(configuration_space.graphLayout.getNode([state[0][1], state[1][0]]).OBJindex);
        result += " " + str(configuration_space.graphLayout.getNode([state[0][1], state[1][1]]).OBJindex);
        result += " " + str(configuration_space.graphLayout.getNode([state[0][0], state[1][1]]).OBJindex);
        result += " " + str(configuration_space.graphLayout.getNode([state[0][0], state[1][0]]).OBJindex);
        result += "\n"
      }
    } for (let state of configuration_space.states) {
      if (configuration_space.getDegree(state) === 1) {
        result += "# line " + JSON.stringify(state) + "\n";
        result += "l";
        if (Array.isArray(state[0])) {
          result += " " + str(configuration_space.graphLayout.getNode([state[0][0], state[1]]).OBJindex);
          result += " " + str(configuration_space.graphLayout.getNode([state[0][1], state[1]]).OBJindex)
        } else {
          result += " " + str(configuration_space.graphLayout.getNode([state[0], state[1][0]]).OBJindex);
          result += " " + str(configuration_space.graphLayout.getNode([state[0], state[1][1]]).OBJindex)
        } result += "\n"
      }
    } return result
  }