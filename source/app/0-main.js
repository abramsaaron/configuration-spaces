"use strict";

// Global parameters
let verbose = !true;
let vverbose = !true;

let graph;
// let graphs = {};
let graphicsForGraph, graphicsForConfigurationSpace;
let configuration_space;
let cameraState, areWeOnTheLeft;
let font;
let infoStrings, layoutStrings;
let chooseFile;
let easyCamActive = true;
let syncViewToggle;

let temperature = 1.0;
let cold = 0.001;

let coolingRate = 0.0;

let octForces = !true;
let graphIsCustomized = !true;

let gui;
let parameters = {};
let customGraph;
let infoDiv;
let warningWrapper;
let infoString;

// Booleans
let takeScreenshotGraph = !true;
let takeScreenshotConfigSpace = !true;
let loadingFromFile = !true;
let forcesActive = true;
let robotAmoving = true;
let robotBmoving = true;
let addSingleNodeMode = false; // todo: clean up
let nodeSelectedForEdgeAddition;
let deleteNodeMode = false;

let selectedNodesInGraph = [];
let selectedNodesInConfigSpace = [];

// Preload.

function preload() {
  // font = loadFont("fonts/Alpino-Medium.otf");
  // font = loadFont("fonts/cmunbx.otf");
  font = loadFont("fonts/Myriad_Pro_6809.otf");

  initParameters();

  let str = getURL();
  let parts = split(str, "?");

  if (parts.length !== 2) return;

  let inputString = parts[1];

  let urlParameters = {};
  for (let p of split(inputString, "&")) {
    let parts = split(p, "=");
    urlParameters[parts[0]] = parts[1];
  }

  if (urlParameters["file"] !== undefined) {
    readFromFile(urlParameters["file"]);
    takeScreenshotConfigSpace = true;
    loadingFromFile = true;
  }
}

// Parameters.

function initParameters() {
  if (verbose) console.log("initParameters");

  parameters.ordered = true;

  parameters.graphType = "K(2,3)";
  parameters.mode = "View";
  parameters.running = true;
  parameters.darkMode = !true;
  parameters.showGraph = true;
  parameters.showConfigurationspace = true;
  parameters.showInfo = !true;
  parameters.showRobots = !true;
  parameters.showHyperplanes = !true;
  parameters.showLoops = !true;
  parameters.syncView = !true;
  parameters.debugMode = !true;
  parameters.distinguishDots = !true;
  parameters.gridOn = !true;
  parameters.layoutPreset = "layout-00.txt";
  parameters.squareOn = true;
  parameters.granularityGraph = 4;
  parameters.granularityFirstCoordinate = 4;
  parameters.granularitySecondCoordinate = 4;
  parameters.showText = true;
  parameters.sphereView = true;
  parameters.lights = true;
  parameters.moveDotsRandomly = !true;
  parameters.robotASpeed = 0.1;
  parameters.robotBSpeed = 0.1;
  parameters.amountMultiplier = 0.05;
  parameters.recordHistory = !true;
  parameters.showHistory = !true;
  parameters.dualView = false;
  parameters.sphereDetail = 20;
  parameters.resetHistory = function () {
    configuration_space.graphLayout.configuration.resetHistory();
  };
  parameters.speedUp = 1;
  parameters.labelX = 0;
  parameters.labelY = 0;
  parameters.labelZ = 2;
  parameters.fontSize = 30;
  parameters.colorRobotA = "#bb0000"; // [220, 0, 0];
  parameters.colorRobotB = "#444444"; // 60, 60, 60];
  parameters.colorConfig = "#4499ee"; // [31, 108, 179];
  parameters.colorNode = "#999999"; // [180, 180, 180];
  parameters.colorGraphEdge = "#4499ee"; // [31, 108, 179];
  parameters.squareColor = "#888888"; // [0, 0, 0];
  parameters.squareOpacity = 100;
  parameters.activeDotColor = "#cc7700"; // [220, 110, 0];
  parameters.deleteNodeColor = "#6600ff"; // [100, 0, 200];
  parameters.selectedNodeForEdgeColor = "#4455bb"; // [45, 80, 200];
  // From graph layout
  parameters.maxspeed = 300;
  parameters.nodeSize = 20;
  parameters.robotsNodeSize = 21;
  parameters.configNodeSize = 21;
  parameters.edgeWidthGraph = 4.5;
  parameters.edgeWidthConfigSpace = 2.0;
  parameters.edgeWidthGrid = 0.4;
  // Experimental
  parameters.THETA = 2.6;
}

function setup() {
  if (verbose) console.log("setup");
  noCanvas();
  setAttributes("antialias", true);
  infoDiv = select("#info");

  warningWrapper = select("#warningWrapper");
  // chooseFile = createFileInput(handleFile);
  // chooseFile.parent("inputDiv");
  // initParameters();
  if (loadingFromFile) {
  } else {
    setParametersFromURL();
    if (verbose) console.log("setup continues");
    init();
  }
}

function init() {
  if (verbose) console.log("init");

  selectedNodesInGraph = [];
  initView();
  initGraph(parameters.graphType);
  initGUI();
}

function updateMode() {
  if (verbose) console.log("updateMode: " + parameters.mode);
  switch (parameters.mode) {
    case "View":
      console.log("updateMode: View mode");
      easyCamOn();
      deleteNodeMode = false;
      break;
    case "Move":
      console.log("updateMode: Move mode");
      easyCamOff();
      deleteNodeMode = false;
      break;
  }
  if (verbose) console.log("updateMode: refresh tweakpane");
  // guiMode.updateDisplay();
  // updateIcons();
}

function initView() {
  if (verbose) console.log("initView");
  resetCanvases();
  if (parameters.dualView) {
    initgraphicsForGraph(windowWidth / 2, windowHeight);
    initgraphicsForConfigurationSpace(windowWidth / 2, windowHeight);
  } else {
    initgraphicsForGraph(0, windowHeight);
    initgraphicsForConfigurationSpace(windowWidth, windowHeight);
  }

  if (parameters.lights) {
    let ambientBrightness = 180;
    let directionalBrightness = 180;
    // Lights for graph
    // RGB version
    graphicsForGraph.ambientLight(ambientBrightness, ambientBrightness, ambientBrightness);
    graphicsForGraph.directionalLight(directionalBrightness, directionalBrightness, directionalBrightness, -1, 0, 0);
    // HSB version
    // graphicsForGraph.ambientLight(0, 0, ambientBrightness);
    // graphicsForGraph.directionalLight(0, 0, directionalBrightness, -1, 0, 0);

    // Lights for config space
    // RGB version
    graphicsForConfigurationSpace.ambientLight(ambientBrightness, ambientBrightness, ambientBrightness);
    graphicsForConfigurationSpace.directionalLight(directionalBrightness, directionalBrightness, directionalBrightness, -1, 0, 0);
    // HSB version
    // graphicsForConfigurationSpace.ambientLight(0, 0, ambientBrightness);
    // graphicsForConfigurationSpace.directionalLight(0, 0, directionalBrightness, -1, 0, 0);
  }
}

// Draw loop
function draw() {
  if (temperature > cold) {
    tick();
    graph.update();
    configuration_space.update();
  }

  if (parameters.moveDotsRandomly) {
    for (let i = 0; i < parameters.speedUp; i++) {
      graph.moveRobots();
    }
  }

  graph.show();
  configuration_space.show();

  // if (parameters.showInfo) {
  //   console.log("show info");
  //   updateInfoString();
  // }

  // graphicsForConfigurationSpace.easycam.beginHUD(graphicsForConfigurationSpace._renderer, width, height);
  // graphicsForConfigurationSpace.fill(0);
  // graphicsForConfigurationSpace.ellipse(width / 2, height / 2, 50, 50);
  // graphicsForConfigurationSpace.easycam.endHUD(graphicsForConfigurationSpace._renderer);

  if (takeScreenshotGraph) {
    takeScreenshotGraph = false;
    saveCanvas(graph.graphLayout.graphics, makeFileName("-graph") + ".png");
  }
  if (takeScreenshotConfigSpace) {
    takeScreenshotConfigSpace = false;
    let filename = makeFileName("-configspace") + ".png";
    if (verbose) console.log("taking screenshot of config space: " + filename);
    saveCanvas(configuration_space.graphLayout.graphics, filename);
  }

  if (mouseIsPressed) {
    ourMouseDragged();
  }
}

// Graph setup

function initGraph(graphType) {
  reheat();
  if (verbose) print("initGraph: " + graphType);
  if (graphType === "random") {
    graph = randomGraph();
  } else if (graphType === "custom" && customGraph !== undefined) {
    graph = new Graph(customGraph.nodes, customGraph.edges);
  } else if (graphType.charAt(0) === "K") {
    graphType = graphType.slice(2, -1);
    let numbers = split(graphType, ",");
    if (numbers.length == 2) {
      graph = completeBipartiteGraph(int(numbers[0]), int(numbers[1]));
    } else if (numbers.length == 1) {
      graph = completeGraph(int(numbers[0]));
    }
  } else if (graphType.charAt(0) === "C") {
    graphType = graphType.slice(2, -1);
    let numbers = split(graphType, ",");
    if (numbers.length == 1) {
      graph = chainGraph(int(numbers[0]));
    }
  } else if (graphType.charAt(0) === "W") {
    graphType = graphType.slice(2, -1);
    let numbers = split(graphType, ",");
    if (numbers.length == 1) {
      graph = wheelGraph(int(numbers[0]));
    }
  }

  graph.createGraphLayout(graphicsForGraph, true);
  configuration_space = new Configuration_space(graph, 2, parameters.ordered );

  if (vverbose) print(configuration_space);

  if (verbose) print("initGraph: call updateURL");
  updateURL();
}

function addNode(x, y, z) {
  let label = Math.max(...graph.nodes) + 1;
  graph.nodes.push(label);
  let addedNode = graph.graphLayout.addNode(label, x, y, z);
  configuration_space.addStates(label);

  // TODO. EXPERIMENT. Not sure about:
  graph.graphLayout.centerForce = Math.max(0.02, graph.graphLayout.centerForce);

  configuration_space.graphLayout.centerForce = Math.max(0.02, configuration_space.graphLayout.centerForce);

  addSingleNodeMode = false; // todo: clean up

  // Set to custom.
  // parameters.graphType = "custom";

  updateURL();
  graphIsCustomized = true;

  return addedNode;
}

function deleteSelectedNodesOrEdges() {
  if (selectedNodesInGraph.length > 1) {
    for (let n = 0; n < selectedNodesInGraph.length - 1; n++) {
      for (let m = n + 1; m < selectedNodesInGraph.length; m++) {
        deleteEdge(selectedNodesInGraph[n], selectedNodesInGraph[m]);
      }
    }
  } else if (selectedNodesInGraph.length == 1) {
    deleteNode(selectedNodesInGraph[0]);
  }
}

function deleteNode(node) {
  // Important: The 'node' is in a graph; we do not edit the configuration space via the GUI.

  if (node.occupied()) {
    startWarning("This node is occupied and can not be deleted.");
    return;
  }
  // Update selected nodes
  selectedNodesInGraph.splice(selectedNodesInGraph.indexOf(node), 1);

  // Update neighbors in graph
  for (neighbor of node.neighbors) {
    neighbor.neighbors = neighbor.neighbors.filter((x) => !(x === node));
  }

  // Delete label from list.
  graph.nodes.splice(graph.nodes.indexOf(node.label), 1);

  let survivingEdgeLabels = [];
  let edgeLabelsToDelete = [];

  for (edge of graph.edges) {
    if (edge.includes(node.label)) {
      edgeLabelsToDelete.push(edge);
    } else {
      survivingEdgeLabels.push(edge);
    }
  }

  // Deleting the pairs from list of edges.
  graph.edges = survivingEdgeLabels;

  // Delete EDGES from graphLayout.
  for (edge of edgeLabelsToDelete) {
    graph.graphLayout.deleteEdge(edge);
  }

  // Delete NODE from graphLayout.
  graph.graphLayout.deleteNode(node.label);

  // Remove states.
  configuration_space.removeStates(node.label);

  // Set to custom.
  // parameters.graphType = "custom";

  graphIsCustomized = true;
  updateURL();
}

function deleteEdge(nodeFrom, nodeTo) {
  if (verbose) console.log("deleteEdge()");
  let edge = graph.graphLayout.getEdge(nodeFrom.label, nodeTo.label);

  if (edge.owner !== undefined) {
    startWarning("Not able to delete edge from " + nodeFrom.label + " to " + nodeTo.label + ".");
    return;
  }

  if (edge !== false && edge.owner == undefined) {
    let label = edge.label;

    // Update neighbors in graph
    nodeFrom.neighbors = nodeFrom.neighbors.filter((x) => !(x === nodeTo));
    nodeTo.neighbors = nodeTo.neighbors.filter((x) => !(x === nodeFrom));

    if (verbose) console.log("deleting edge");
    graph.edges = graph.edges.filter((l) => !arraysEqual(l, label));
    graph.graphLayout.deleteEdge(label);
    configuration_space.removeStates(label);
    graphIsCustomized = true;
    updateURL();
  }
}

function addEdgesForSelectedNodes() {
  for (let n = 0; n < selectedNodesInGraph.length - 1; n++) {
    for (let m = n + 1; m < selectedNodesInGraph.length; m++) {
      addEdge(selectedNodesInGraph[n], selectedNodesInGraph[m]);
    }
  }
}

function addEdge(nodeFrom, nodeTo) {
  if (graph.graphLayout.getEdge(nodeFrom.label, nodeTo.label) === false) {
    console.log("adding edge");
    let label = [nodeFrom.label, nodeTo.label];
    graph.edges.push(label);
    graph.graphLayout.addEdge(label, nodeFrom, nodeTo);
    configuration_space.addStates(label);
    graphIsCustomized = true;
    updateURL();
  } else {
    console.log("not adding edge");
  }
}

// Move this somewhere
function pickBestCandidateForA(movingNode, mouseChange) {
  let candidates = movingNode.robotA.getCandidates();
  let bestCandidate;
  let bestCandidateAngle = PI / 2;
  for (let candidate of candidates) {
    let topRight = configuration_space.graphLayout.getNode([
      candidate.label, // CANDIDATE
      movingNode.robotB.nodeFrom.label,
    ]).position;
    let botRight = configuration_space.graphLayout.getNode([
      candidate.label, // CANDIDATE
      movingNode.robotB.nodeTo.label,
    ]).position;

    // (robotA.nodeFrom, robotB.nodeFrom)                       (CANDIDATE, robotB.nodeFrom)
    //
    //                             *-->---------------->---*
    //                             |                       |
    //                             |                       |
    //                             |                       |
    //                             v                       v
    //                             |       screenDiff      |
    //        configuration pos.   X------->---------------X
    //                             |                       |
    //                             *--->---------------->--*
    //
    // (robotA.nodeFrom, robotB.nodeTo)                         (CANDIDATE, robotB.nodeTo)

    let leftX = movingNode.position;
    let rightX = p5.Vector.lerp(topRight, botRight, movingNode.robotB.amount);
    let leftX2D = graphicsForConfigurationSpace.screenPosition(leftX);
    let rightX2D = graphicsForConfigurationSpace.screenPosition(rightX);
    let screenDiff = p5.Vector.sub(rightX2D, leftX2D);
    let screenDiffAngle = abs(mouseChange.angleBetween(screenDiff));
    if (screenDiffAngle < bestCandidateAngle) {
      // bestCandidate === undefined ||
      bestCandidate = candidate;
      bestCandidateAngle = screenDiffAngle;
    }
  }
  return bestCandidate;
}
// Move this somewhere
function pickBestCandidateForB(movingNode, mouseChange) {
  let candidates = movingNode.robotB.getCandidates();
  let bestCandidate;
  let bestCandidateAngle = PI / 2;
  for (let candidate of candidates) {
    let botLeft = configuration_space.graphLayout.getNode([
      movingNode.robotA.nodeFrom.label,
      candidate.label, // CANDIDATE
    ]).position;
    let botRight = configuration_space.graphLayout.getNode([
      movingNode.robotA.nodeTo.label,
      candidate.label, // CANDIDATE
    ]).position;

    let topX = movingNode.position;
    let botX = p5.Vector.lerp(botLeft, botRight, movingNode.robotA.amount);
    let topX2D = graphicsForConfigurationSpace.screenPosition(topX);
    let botX2D = graphicsForConfigurationSpace.screenPosition(botX);
    let screenDiff = p5.Vector.sub(botX2D, topX2D);
    let screenDiffAngle = abs(mouseChange.angleBetween(screenDiff));
    if (screenDiffAngle < bestCandidateAngle) {
      // bestCandidate === undefined ||
      bestCandidate = candidate;
      bestCandidateAngle = screenDiffAngle;
    }
  }
  return bestCandidate;
}

// Helpers

function checkIfArrayIsUnique(myArray) {
  return myArray.length === new Set(myArray).size;
}

function edgesContainEdge(edges, edge) {
  for (let cand of edges) {
    if (arraysEqual(cand, edge)) return true;
    if (arraysEqual(cand, [edge[1], edge[0]])) return true;
  }
  return false;
}

function is_state_ordered(p) {
  return checkIfArrayIsUnique(p.flat());
}

function is_state_unordered(p) {
  if (!checkIfArrayIsUnique(p.flat())) return false;
  let degree = flatten(p).length - 2;
  console.log(labelToString(p));
  switch (degree) {
    case 0:
      console.log(p[0] < p[1]);
      return p[0] < p[1];
    case 1:
      console.log(typeof p[0] == "number" && p[1][0] < p[1][1]);
      return typeof p[0] == "number" && p[1][0] < p[1][1];
    case 2:
      // [0, 3] [1, 2]
      console.log(p[0][0] < p[0][1] && p[1][0] < p[1][1] && p[0][0] < p[1][0]);
      return p[0][0] < p[0][1] && p[1][0] < p[1][1] && p[0][0] < p[1][0];
  }
}

function toggleForSelectedNode() {
  console.log("toggleForSelectedNode");
  for (let node of graph.graphLayout.nodes) {
    if (node.lastSelected === true) {
      node.applyExtraCenterForce = !node.applyExtraCenterForce;
      if (verbose) print(node.applyExtraCenterForce);
    }
  }
  for (let node of configuration_space.graphLayout.nodes) {
    if (node.lastSelected === true) {
      node.applyExtraCenterForce = !node.applyExtraCenterForce;
      if (verbose) print(node.applyExtraCenterForce);
    }
  }
}
