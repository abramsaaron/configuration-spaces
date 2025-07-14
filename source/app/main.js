"use strict";

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

let temperature = 1.0;
let cold = 0.001;

let coolingRate = 0.0;

let octForces = true;
let graphIsCustomized = !true;

// For the GUI
// console.log("test 8");

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

// Setup

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
    urlParameters[parts[0]] = parts[1];
  }

  if (urlParameters["file"] !== undefined) {
    readFromFile(urlParameters["file"]);
    takeScreenshotConfigSpace = true;
    loadingFromFile = true;
  }
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
  // graphicsForGraph.colorMode(RGB, 255);
  // graphicsForGraph.colorMode(HSB, 255);
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
  // graphicsForConfigurationSpace.colorMode(RGB, 255);
  // graphicsForConfigurationSpace.colorMode(HSB, 255);
  graphicsForConfigurationSpace.pixelDensity(2);
  graphicsForConfigurationSpace.show();

  // let gl = g.getContext('webgl');
  let gl = graphicsForConfigurationSpace.canvas.getContext("webgl");
  // print();
  gl.disable(gl.DEPTH_TEST);

  setupEasyCam(graphicsForConfigurationSpace, 500);
  addScreenPositionFunction(graphicsForConfigurationSpace);
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
  updateIcons();
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

// Parameters

function initParameters() {
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

function makeFileName(postString) {
  let time = str(year()) + ("0" + str(month())).slice(-2) + ("0" + str(day())).slice(-2) + "_" + ("0" + str(hour())).slice(-2) + ("0" + str(minute())).slice(-2) + ("0" + str(second())).slice(-2);
  return parameters.graphType + postString + "_" + time;
}

// Temperature

function tick() {
  temperature = temperature * (1 - coolingRate);
}

function reheat() {
  temperature = 1.0;
}

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
  configuration_space = new Configuration_space(graph, 2);

  if (vverbose) print(configuration_space);

  if (verbose) print("initGraph: call updateURL");
  updateURL();
}

// Main classes

class Graph {
  constructor(nodeLabels, edgeLabels) {
    this.type = "graph";
    this.nodes = nodeLabels;
    this.edges = edgeLabels;
  }

  update() {
    this.graphLayout.update();
  }

  show() {
    this.graphLayout.show();
  }

  getRobots() {
    return [this.robotA, this.robotB];
  }

  otherRobot(robot) {
    if (this.robotA === robot) return this.robotB;
    else return this.robotA;
  }

  moveRobots() {
    let addtoA = parameters.amountMultiplier * parameters.robotASpeed;
    let addtoB = parameters.amountMultiplier * parameters.robotBSpeed;
    let nextA = this.robotA.amount + addtoA;
    let nextB = this.robotB.amount + addtoB;

    if (nextA >= 1 && nextB < 1) {
      nextA = 1;
      nextB = this.robotB.amount + (addtoB * (1 - this.robotA.amount)) / addtoA;
    } else if (nextA < 1 && nextB >= 1) {
      nextB = 1;
      nextA = this.robotA.amount + (addtoA * (1 - this.robotB.amount)) / addtoB;
    } else if (nextA >= 1 && nextB >= 1) {
      // --------- amountA ---------- 1.0 --- nextA
      // hits 1.0 at time ca. 2/3 = timeA
      // ---- amountB --------------- 1.0 ------------------------------------------ nextB
      // hits 1.0 at time ca. 1/4 = timeB
      // => B hits 1.0 first, so we need to:
      //    set B to 1.0
      //    set A accordingly
      let timeA = (1 - this.robotA.amount) / (nextA - this.robotA.amount);
      let timeB = (1 - this.robotB.amount) / (nextB - this.robotB.amount);

      if (timeA > timeB) {
        nextB = 1;
        nextA = this.robotA.amount + addtoA * timeB;
      } else {
        nextA = 1;
        nextB = this.robotB.amount + addtoB * timeA;
      }
    }

    if (robotAmoving) {
      this.robotA.setAmount(nextA);
    }
    if (robotBmoving) {
      this.robotB.setAmount(nextB);
    }

    if (parameters.recordHistory) {
      configuration_space.graphLayout.configuration.record(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount);
    }
  }

  createGraphLayout(graphics, layout3D) {
    this.graphLayout = new GraphLayout(this, graphics, layout3D);

    for (let nodeLabel of this.nodes) {
      this.graphLayout.addNode(nodeLabel);
    }

    for (let edgeLabel of this.edges) {
      let nodeFrom = this.graphLayout.getNode(edgeLabel[0]);
      let nodeTo = this.graphLayout.getNode(edgeLabel[1]);
      this.graphLayout.addEdge(edgeLabel, nodeFrom, nodeTo);
    }

    this.robotA = new Robot(this, this.graphLayout.nodes[0], 0);
    this.robotB = new Robot(this, this.graphLayout.nodes[1], 1);

    this.graphLayout.initlayout();
  }
}

class Configuration_space {
  constructor(graph, dimension) {
    this.type = "configuration_space";
    this.dimension = dimension;
    // todo: generalize and use dimension
    let positions = graph.nodes.concat(graph.edges);
    let possible_states = cartesianProductOf(positions, positions);
    this.states = possible_states.filter(is_state);
    if (vverbose) console.log(this.states);
    if (vverbose) print("States:");
    if (vverbose) print(this.states);
    this.createGraphLayout(graphicsForConfigurationSpace, true);
    // this.graphLayout.createInnerNodes(); // NEW!

    // if (verbose) console.log("Configuration_space: createInnerNodes");
    // for (let node of this.graphLayout.nodes) {
    //   node.createInnerNode();
    // }
    // for (let edge of this.graphLayout.edges) {
    //   edge.createInnerNodes();
    // }
    // for (let square of this.graphLayout.squares) {
    //   square.createInnerNodes();
    // }
  }

  update() {
    this.graphLayout.update();
  }

  show() {
    this.graphLayout.show();
  }

  getRobots() {
    return [];
  }

  // getStates(degree) {
  //   let result = [];
  //   for (let state of this.states) {
  //     if (getDegree(state) === degree) {
  //       result.push(state);
  //     }
  //   }
  //   return result;
  // }

  getDegree(state) {
    return flatten(state).length - this.dimension;
  }

  addStates(label) {
    let positions = graph.nodes.concat(graph.edges);
    let newPossibleStates = cartesianProductOf([label], positions).concat(cartesianProductOf(positions, [label]));
    if (vverbose) console.log("newPossibleStates");
    if (vverbose) console.log(newPossibleStates);
    let newStates = newPossibleStates.filter(is_state);
    for (let state of newStates) {
      this.addStateToGraphLayout(state);
      this.states.push(state);
    }
  }

  removeStates(label) {
    if (verbose) console.log("removeStates: " + label);
    let survivingStates = [];
    let statesToDelete = [];

    if (Array.isArray(label)) {
      // label is an edge, for example [0, [1, 2]]
      for (let state of this.states) {
        if (arraysEqual(label, state[0]) || arraysEqual(label, state[1])) {
          statesToDelete.push(state);
        } else {
          survivingStates.push(state);
        }
      }
    } else {
      // label is a node, for example 0
      for (let state of this.states) {
        if (flatten(state).includes(label)) {
          statesToDelete.push(state);
        } else {
          survivingStates.push(state);
        }
      }
    }

    if (verbose) console.log("survivingStates");
    if (verbose) console.log(survivingStates);
    if (verbose) console.log("statesToDelete");
    if (verbose) console.log(statesToDelete);

    for (let state of statesToDelete) {
      switch (this.getDegree(state)) {
        case 0:
          console.log("deleteNode ");
          console.log(state);
          this.graphLayout.deleteNode(state);
          break;
        case 1:
          console.log("deleteEdge ");
          console.log(state);
          this.graphLayout.deleteEdge(state);
          break;
        case 2:
          console.log("deleteSquare ");
          console.log(state);
          this.graphLayout.deleteSquare(state);
          break;
      }

      this.states = survivingStates;
    }
  }

  addStateToGraphLayout(state) {
    switch (this.getDegree(state)) {
      case 0:
        // Create node
        if (vverbose) print("state_1:");
        if (vverbose) print(state);
        this.graphLayout.addNode(state);
        break;
      case 1:
        // Create edges
        if (vverbose) print("state_1:");
        if (vverbose) print(state);
        if (Array.isArray(state[0])) {
          // [[1,2], 0] gives [1,0] and [2,0]
          let nodeFrom = this.graphLayout.getNode([state[0][0], state[1]]);
          let nodeTo = this.graphLayout.getNode([state[0][1], state[1]]);
          this.graphLayout.addEdge(state, nodeFrom, nodeTo);
        } else if (Array.isArray(state[1])) {
          // [0, [1,2]] gives [0,1] and [0,2]
          let nodeFrom = this.graphLayout.getNode([state[0], state[1][0]]);
          let nodeTo = this.graphLayout.getNode([state[0], state[1][1]]);
          if (vverbose) print("nodeFrom:");
          if (vverbose) print(nodeFrom);
          this.graphLayout.addEdge(state, nodeFrom, nodeTo);
        } else {
          if (vverbose) print("error");
        }
        break;
      case 2:
        // Create square
        if (vverbose) print("state_2:");
        if (vverbose) print(state);
        // state = [[ 0 , 3 ][ 1 , 2 ]] OR [[ 1 , 2][ 0 , 3 ]]
        let edgeAfrom = this.graphLayout.getEdge(state[0][0], state[1], true); // 0 [ 1, 2 ]  OR  1 [ 0 , 3]
        let edgeAto = this.graphLayout.getEdge(state[0][1], state[1], true); //   3 [ 1, 2 ]  OR  2 [ 0 , 3]
        let edgeBfrom = this.graphLayout.getEdge(state[0], state[1][0], true); // [ 0, 3 ] 1
        let edgeBto = this.graphLayout.getEdge(state[0], state[1][1], true); //   [ 0, 3 ] 2

        if (vverbose) print(edgeAfrom);
        if (vverbose) print(edgeAto);

        this.graphLayout.addSquare(state, edgeAfrom, edgeAto, edgeBfrom, edgeBto);
        break;
    }

    // let states_0 = this.getStates(0);
    // let states_1 = this.getStates(1);
    // let states_2 = this.getStates(2);

    // // Create nodes
    // for (let state of states_0) {
    //   if (vverbose) print("state_1:");
    //   if (vverbose) print(state);
    //   this.graphLayout.addNode(state);
    // }

    // // Create edges
    // for (let state of states_1) {
    //   if (vverbose) print("state_1:");
    //   if (vverbose) print(state);
    //   if (Array.isArray(state[0])) {
    //     // [[1,2], 0] gives [1,0] and [2,0]
    //     let nodeFrom = this.graphLayout.getNode([state[0][0], state[1]]);
    //     let nodeTo = this.graphLayout.getNode([state[0][1], state[1]]);
    //     this.graphLayout.addEdge(state, nodeFrom, nodeTo);
    //   } else if (Array.isArray(state[1])) {
    //     // [0, [1,2]] gives [0,1] and [0,2]
    //     let labelA = [state[0], state[1][0]];
    //     let nodeFrom = this.graphLayout.getNode(labelA);
    //     if (vverbose) print("nodeFrom:");
    //     if (vverbose) print(nodeFrom);
    //     let nodeTo = this.graphLayout.getNode([state[0], state[1][1]]);
    //     this.graphLayout.addEdge(state, nodeFrom, nodeTo);
    //   } else {
    //     if (vverbose) print("error");
    //   }
    // }

    // // Create squares
    // for (let state of states_2) {
    //   if (vverbose) print("state_2:");
    //   if (vverbose) print(state);
    //   let edgeAfrom = this.graphLayout.getEdge(state[0][0], state[1]);
    //   let edgeAto = this.graphLayout.getEdge(state[0][1], state[1]);
    //   let edgeBfrom = this.graphLayout.getEdge(state[0], state[1][0]);
    //   let edgeBto = this.graphLayout.getEdge(state[0], state[1][1]);
    //   this.graphLayout.addSquare(state, edgeAfrom, edgeAto, edgeBfrom, edgeBto);
    // }
  }

  createGraphLayout(graphics, layout3D) {
    if (verbose) console.log("createGraphLayout");
    this.graphLayout = new GraphLayout(this, graphics, layout3D);
    this.graphLayout.showConfiguration = true;

    for (let state of this.states) {
      this.addStateToGraphLayout(state);
    }

    // This requires graph.createGraphLayout to have been called.
    this.graphLayout.configuration = new Configuration(this.graphLayout, graph.robotA, graph.robotB);

    this.graphLayout.initlayout();
  }
}

class GraphLayout {
  constructor(source, graphics, layout3D) {
    this.source = source;
    this.graphics = graphics;
    this.layout3D = layout3D;

    this.updating = !true;

    this.nodes = [];
    this.nodeBorder = true;
    this.nodeBorderWidth = 0.05;
    this.showNodes = true;

    this.edges = [];
    this.showEdges = true;

    this.squares = [];
    this.showSquares = true;

    // this.innerNodes = [];

    this.planarForce = 0.0;
    this.squarePlanarForce = 0.0;
    this.centerForce = 0.001;
    this.extraCenterForce = 0.0;

    this.moveToCenter = true;

    this.edgelength = 100;
    this.firstCoordinateEdgeLength = 100;
    this.secondCoordinateEdgeLength = 100;

    this.graphEdgeForce = 0.01;
    this.firstCoordinateForce = 0.05;
    this.secondCoordinateForce = 0.01;
    this.firstCoordinateMirrorForce = 0.01;
    this.secondCoordinateMirrorForce = -0.01;

    // this.innerEdgeForce = 0.01;

    this.extraCenterPreference = 0.0;
    this.coordinatePreference = 0.01;

    this.center = createVector(0, 0, 0);

    this.heat = 1.0;
    this.coolDown = 0.01;

    this.cohesionthreshold = 10;
    this.cohesionFactor = 1.0;

    this.repulsion = 50000;
    this.centroidRepulsion = 50000;
    this.separationFactor = 30.0;

    this.keyboardactive = true;
  }

  initlayout() {
    if (octForces) {
      for (let i = 0; i < 10; i++) {
        this.updateOctree();
        for (let node of this.nodes) {
          node.update(this.nodes);
          node.move();
        }
      }
    }
  }

  updateOctree() {
    if (vverbose) console.log("updateOctree");
    // Creates a new Octree. Notice that the dimensions is twice that of the screen.
    let factor = 4;
    this.octree = new Octree(this, new Cube(0, 0, 0, factor * max(windowWidth, windowHeight), factor * max(windowWidth, windowHeight), factor * max(windowWidth, windowHeight)), 0);

    if (this.source.type === "graph") {
      // Insert all the nodes.
      for (let node of this.nodes) this.octree.insert(node);
    }

    if (this.source.type === "configuration_space") {
      // Insert all the nodes.
      for (let node of this.nodes) {
        if (node.innerNode !== undefined) {
          this.octree.insert(node.innerNode);
        }
      }

      // // Insert all the inner nodes.
      // for (let edge of this.edges) {
      //   for (let n = 1; n < edge.granularity; n++) {
      //     this.octree.insert(edge.innerNodes[n]);
      //   }
      // }
      // for (let square of this.squares) {
      //   for (let node of square.innerNodes) this.octree.insert(node);
      // }
    }

    // Calculate mass for octants.
    this.octree.calculateMass();
  }

  show() {
    // this.graphics.colorMode(HSB, 255);
    // this.graphics.background(255);
    this.graphics.clear();

    let gl = graphicsForConfigurationSpace.canvas.getContext("webgl");

    gl.disable(gl.DEPTH_TEST);

    // if (parameters.debugMode && this.source.type === "configuration_space") this.octree.show(this.graphics);

    if (this.source.type === "configuration_space" && parameters.showConfigurationspace) {
      if (this.showSquares) {
        for (let square of this.squares) square.show();
      }
    }

    gl.enable(gl.DEPTH_TEST);

    if (this.source.type === "configuration_space") {
      if (parameters.showGraph) {
        for (let node of graph.graphLayout.nodes) {
          node.show(this.graphics);
        }
        for (let edge of graph.graphLayout.edges) {
          edge.show(this.graphics);
        }
        if (parameters.showRobots) {
          for (let robot of graph.getRobots()) {
            robot.show(this.graphics);
          }
        }
      }

      // // Show inner nodes
      // for (let innerNode of this.innerNodes) {
      //   innerNode.show(this.graphics);
      // }
    }

    if (this.source.type === "graph" || parameters.showConfigurationspace) {
      if (this.showEdges) {
        for (let edge of this.edges) {
          edge.show(this.graphics);
        }
      }

      if (this.showNodes) {
        for (let node of this.nodes) {
          node.show(this.graphics);
        }
      }
    }

    if (this.source.type === "configuration_space" && parameters.showLoops) {
      if (configuration_space.loops !== undefined) {
        let numberOfLoops = configuration_space.loops.length;
        for (let i = 0; i < numberOfLoops; i++) {
          for (let edgeArray of configuration_space.loops[i]) {
            let edge = this.getEdge(edgeArray[0], edgeArray[1], true);
            colorMode(HSB);
            let col = color(map(i, 0, numberOfLoops, 0, 255), 255, 255);
            edge.show(this.graphics, 2.5, col);
          }
        }
      }
    }

    if (this.source.type === "graph") {
      if (parameters.showRobots) {
        for (let robot of this.source.getRobots()) {
          robot.show(this.graphics);
        }
      }
    }

    if (this.source.type === "configuration_space" && parameters.showConfigurationspace && parameters.showRobots) {
      if (this.showConfiguration) {
        this.configuration.show();
      }
    }

    if (this.source.type === "graph" && parameters.showText) {
      for (let node of this.nodes) {
        node.showText(this.graphics);
      }
    }

    if (this.source.type === "configuration_space" && this.showNodes && parameters.showConfigurationspace && parameters.showText) {
      for (let node of this.nodes) {
        node.showText(this.graphics);
      }
      // for (let edge of this.edges) {
      //   for (let innerNode of edge.innerNodes) {
      //     innerNode.showText(this.graphics);
      //   }
      // }
      // for (let square of this.squares) {
      //   for (let innerNode of square.innerNodes) {
      //     innerNode.showText(this.graphics);
      //   }
      // }
    }

    if (this.source.type === "configuration_space" && parameters.showGraph && parameters.showText) {
      for (let node of graph.graphLayout.nodes) {
        node.showText(this.graphics);
      }
    }

    this.counter++;
  }

  update() {
    if (forcesActive && parameters.running) {
      // Update octree.

      if (octForces) {
        this.updateOctree();
      }

      // Move to center.
      if (this.moveToCenter) {
        let centerAdjustmentX = 0;
        let centerAdjustmentY = 0;
        let centerAdjustmentZ = 0;
        for (let node of this.nodes) {
          centerAdjustmentX += (-node.position.x + this.center.x) / this.nodes.length;
          centerAdjustmentY += (-node.position.y + this.center.y) / this.nodes.length;
          centerAdjustmentZ += (-node.position.z + this.center.z) / this.nodes.length;
        }
        for (let node of this.nodes) {
          if (!node.frozen) node.position.add(0.1 * centerAdjustmentX, 0.1 * centerAdjustmentY, 0.1 * centerAdjustmentZ);
        }
      }

      // // Update centroid forces
      // for (let square of this.squares) {
      //   let centroids = this.getCentroids(square);
      //   square.updateRepulsionForce(centroids);
      // }

      for (let node of this.nodes) {
        node.update(this.nodes);
      }

      // for (let innerNode of this.innerNodes) {
      //   // console.log(innerNode.position);
      //   innerNode.update(this.innerNodes);
      // }

      // Apply square planar force.
      // if (this.source.type === "configuration_space") {
      //   for (let square of this.squares) {
      //     let squareNodes = [square.edgeAfrom.nodeFrom, square.edgeAfrom.nodeTo, square.edgeAto.nodeFrom, square.edgeAto.nodeTo];

      //   }
      // }

      for (let node of this.nodes) {
        node.move();
      }

      // for (let innerNode of this.innerNodes) {
      //   innerNode.move();
      // }
    }

    // // Update inner nodes.
    // for (let edge of this.edges) {
    //   edge.forceInnerNodesToTheirPositions();
    // }

    // // // Update inner nodes.
    // for (let square of this.squares) {
    //   square.forceInnerNodesToTheirPositions();
    // }
  }

  // mousePressed() {
  //   // print(mouseX);
  //   // print(mouseY);
  //   let mousePos = new createVector(mouseX, mouseY);
  //   qtree = new QuadTree(new Rectangle(0, 0, width, height), 4);
  //   for (let node of nodes) qtree.insertNode(node);
  //   let range = new Circle(mouseX, mouseY, nodeSize, nodeSize);
  //   let nodesClose = qtree.query(range);
  //   let closestDistance = width;
  //   let closest;
  //   for (let qtreedata of nodesClose) {
  //     let node = qtreedata.userData;
  //     let d = p5.Vector.dist(mousePos, node.position);
  //     if (d < closestDistance && d < nodeSize) {
  //       closest = node;
  //       closestDistance = d;
  //     }
  //   }
  // }

  getNode(label) {
    for (let node of this.nodes) {
      if (arraysEqual(node.label, label)) {
        return node;
      }
    }
    if (vverbose) print("returning false");
    return false;
  }

  getEdge(labelA, labelB, directed) {
    if (vverbose) print("getEdge: ");
    if (vverbose) print(labelA);
    if (vverbose) print(labelB);
    if (vverbose) print(directed);
    for (let edge of this.edges) {
      if (arraysEqual([labelA, labelB], edge.label) || (!directed && arraysEqual([labelB, labelA], edge.label))) {
        if (vverbose) print("FOUND!");
        if (vverbose) print(edge);
        return edge;
      }
    }
    return false;
  }

  getSquare(labelA, labelB) {
    if (vverbose) print("getSquare: ");
    if (vverbose) print(labelA);
    if (vverbose) print(labelB);
    for (let square of this.squares) {
      if (vverbose) print(square.label);
      if (arraysEqual([labelA, labelB], square.label)) {
        if (vverbose) print("FOUND!");
        if (vverbose) print(square);
        return square;
      }
    }
  }

  getCentroids(filterSquare) {
    // IDEA: Include (in order to repel!) only those squares that do not share an edge.
    // Is this what we are doing here?
    let result = [];
    for (let square of this.squares) {
      // if (square.label[0] != filterSquare.label[0] && square.label[1] != filterSquare.label[1]) {
      result.push(square.getCentroid());
      // }
    }
    return result;
  }

  addNode(label, x, y, z) {
    if (vverbose) print("adding node " + label);
    let r = 10;
    let node = new Node(this, label, x === undefined ? random(-r, r) : x, y === undefined ? random(-r, r) : y, z === undefined ? random(-r, r) : z, 1.0);
    this.nodes.push(node);
    return node;
  }

  deleteNode(label) {
    if (verbose) console.log("deleteNode: " + label);
    let nodeToDelete = this.getNode(label);

    // Update neighbors
    for (neighbor of nodeToDelete.neighbors) {
      neighbor.neighbors = neighbor.neighbors.filter((x) => !(x === nodeToDelete));
      if (verbose) console.log("neighbor.neighbors: " + neighbor.neighbors);
    }

    this.nodes.splice(this.nodes.indexOf(nodeToDelete), 1);
  }

  addEdge(label, nodeFrom, nodeTo) {
    if (vverbose) print("adding edge " + label);
    if (vverbose) print("connecting:");
    if (vverbose) print(nodeFrom.label + " to " + nodeTo.label);
    let edge = new Edge(this, label, nodeFrom, nodeTo);
    this.edges.push(edge);
    nodeTo.connectTo(nodeFrom);
    nodeFrom.connectTo(nodeTo);
    return edge;
  }

  deleteEdge(label) {
    if (verbose) console.log("deleteEdge: " + label);
    let edgeToDelete = this.getEdge(label[0], label[1], false);

    // Update neighbors
    edgeToDelete.nodeFrom.neighbors = edgeToDelete.nodeFrom.neighbors.filter((x) => x !== edgeToDelete.nodeTo);
    if (verbose) console.log("edgeToDelete.nodeFrom.neighbors: " + edgeToDelete.nodeFrom.neighbors);
    edgeToDelete.nodeTo.neighbors = edgeToDelete.nodeTo.neighbors.filter((x) => x !== edgeToDelete.nodeFrom);
    if (verbose) console.log("edgeToDelete.nodeTo.neighbors: " + edgeToDelete.nodeTo.neighbors);

    this.edges.splice(this.edges.indexOf(edgeToDelete), 1);
  }

  addSquare(label, edgeAfrom, edgeAto, edgeBfrom, edgeBto) {
    let square = new Square(this, label, edgeAfrom, edgeAto, edgeBfrom, edgeBto);
    this.squares.push(square);
  }

  deleteSquare(label) {
    let squareToDelete = this.getSquare(label[0], label[1]);
    this.squares.splice(this.squares.indexOf(squareToDelete), 1);
  }
}

class Node {
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
      this.acceleration = createVector(0, 0, 0);
    } else {
      this.position = createVector(x, y);
      this.velocity = createVector(0, 0);
      this.acceleration = createVector(0, 0);
    }
    this.frozen = false;
    this.alive = true;
    this.neighbors = [];
    this.neighborsA = []; // Todo: fix
    this.neighborsB = []; // Todo: fix
  }

  createInnerNode() {
    this.innerNode = new InnerNode(this, this.graphLayout, 0, this.position.copy());
  }

  connectTo(node) {
    this.neighbors.push(node);
  }

  update(nodes) {
    this.acceleration.mult(0);
    let sep;
    if (octForces) {
      sep = this.graphLayout.octree.getAllNodesForces(this); // .mult(this.graphLayout.separationFactor);
    } else {
      sep = this.getSeparationFromNodes(nodes);
    }

    if (this.graphLayout.source.type === "graph") {
      // Forces for the graph.
      // Keep nodes together with spring force
      let coh = this.getSpringForce(this.graphLayout.edgelength, this.graphLayout.graphEdgeForce, this.neighbors);
      coh.mult(1 * this.graphLayout.cohesionFactor);
      this.acceleration.add(coh);
      this.acceleration.add(sep);

      // Go towards center of coordinate nodes
      // if (configuration_space !== undefined) {
      //   const firstNeighbors = configuration_space.graphLayout.nodes.filter((node) => node.label[0] === this.label);
      //   const secondNeighbors = configuration_space.graphLayout.nodes.filter((node) => node.label[1] === this.label);
      //   const firstCenter = this.getCenter(firstNeighbors);
      //   const secondCenter = this.getCenter(secondNeighbors);
      //   const firstForce = this.getForceTowardsGoal(configuration_space.graphLayout.firstCoordinateMirrorForce, firstCenter);
      //   const secondForce = this.getForceTowardsGoal(configuration_space.graphLayout.secondCoordinateMirrorForce, secondCenter);
      //   this.acceleration.add(firstForce);
      //   this.acceleration.add(secondForce);
      // }

      // Planar force
      if (this.graphLayout.planarForce > 0) {
        let planarNodePosition = createVector(this.position.x, this.position.y, 0);
        let planarForceAddition = this.getForceTowardsGoal(this.graphLayout.planarForce, planarNodePosition);
        this.acceleration.add(planarForceAddition);
      }
    } else {
      // Forces for the configuration space.

      // Add centroid forces
      // for (let square of this.getSquareNeighbors()) {
      //   sep.add(square.centroidRepulsionForce);
      // }

      let cohA = this.getSpringForce(
        this.graphLayout.secondCoordinateEdgeLength,
        this.graphLayout.secondCoordinateForce,
        this.neighbors.filter((neighbor) => neighbor.label[0] === this.label[0])
      );

      let cohB = this.getSpringForce(
        this.graphLayout.firstCoordinateEdgeLength,
        this.graphLayout.firstCoordinateForce,
        this.neighbors.filter((neighbor) => neighbor.label[1] === this.label[1])
      );

      let cohAgraph = this.getForceTowardsGoal(this.graphLayout.firstCoordinateMirrorForce, graph.graphLayout.getNode(this.label[0]).position);
      let cohBgraph = this.getForceTowardsGoal(this.graphLayout.secondCoordinateMirrorForce, graph.graphLayout.getNode(this.label[1]).position);

      graph.graphLayout.nodes.forEach((node) => {
        if (node.applyExtraCenterForce) {
          if (this.label[0] === node.label) {
            cohAgraph = cohAgraph.add(this.getForceTowardsGoal(this.graphLayout.extraCenterPreference, node.position));
          }
          if (this.label[1] === node.label) {
            cohBgraph = cohBgraph.add(this.getForceTowardsGoal(-this.graphLayout.extraCenterPreference, node.position));
          }
        }
      });

      if (this.graphLayout.squarePlanarForce > 0) {
        // console.log("yes");
        // For example if we are in [0,1]
        for (let B of this.neighbors.filter((neighbor) => neighbor.label[0] === this.label[0])) {
          // For example B is [0,2]
          for (let C of this.neighbors.filter((neighbor) => neighbor.label[1] === this.label[1])) {
            // For example C is [3,1]
            if (C.label[0] !== B.label[1]) {
              let A = this.graphLayout.getNode([C.label[0], B.label[1]]);
              // For example A is [3,2]
              let target = getFourthPoint(A.position, B.position, C.position);
              let force = this.getForceTowardsGoal(this.graphLayout.squarePlanarForce, target);
              this.acceleration.add(force);
            }
          }
        }
      }

      // let sepB = this.getSeparationFromNodes(graph.graphLayout.nodes.filter((node) => node.label === this.label[1]));

      // let coh2 = this.getSpringForce(100, this.squareneighbors);
      // sep.mult(1 * this.graphLayout.separationFactor);

      cohA.mult(1 * this.graphLayout.cohesionFactor);
      cohB.mult(1 * this.graphLayout.cohesionFactor);

      // cohAgraph.mult(1 * this.graphLayout.cohesionFactor);
      // cohBgraph.mult(1 * this.graphLayout.cohesionFactor);

      // sepB.mult(1 * this.graphLayout.separationFactor);
      // cohBgraph.mult(1 * this.graphLayout.cohesionFactor);

      // this.acceleration.add(sep);
      this.acceleration.add(cohA);
      this.acceleration.add(cohB);
      this.acceleration.add(cohAgraph);
      this.acceleration.add(cohBgraph);

      // this.acceleration.add(sepB);
    }

    // todo: find all squares containing this node
    // then, getForceTowardsGoal towards plane defined by three other nodes
    // perhaps easier to do this for each square
    // tell each square to “straighten out”

    let centerForceAddition = this.getForceTowardsGoal(this.graphLayout.centerForce, this.graphLayout.center);
    this.acceleration.add(centerForceAddition);

    if (this.applyExtraCenterForce) {
      let extraCenterForceAddition = this.getForceTowardsGoal(this.graphLayout.extraCenterForce, this.graphLayout.center);
      this.acceleration.add(extraCenterForceAddition);
    }
  }

  move() {
    if (!this.frozen) {
      this.velocity.add(this.acceleration);
      limitVector(this.velocity, parameters.maxspeed);
      this.position.add(this.velocity);
      this.velocity.mult(0.9);
    }
  }

  getCenter(relevantnodes) {
    let sum = new createVector(0, 0, 0);
    const numberOfNodes = relevantnodes.length;
    for (let node of relevantnodes) {
      const addition = p5.Vector.div(node.position, numberOfNodes);
      sum.add(addition);
    }
    return sum;
  }

  getSeparationFromNodes(relevantnodes) {
    let sum = new createVector(0, 0, 0);
    for (let other of relevantnodes) {
      let diff = p5.Vector.sub(this.position, other.position);
      let d = diff.mag();
      if (d > 1.0) {
        diff.normalize().mult(this.graphLayout.repulsion / (d * d)); // this.graphLayout.repulsion = 50 000
        sum.add(diff);
      }
    }
    return sum;
  }

  getSpringForce(edgelength, force, relevantnodes) {
    let sum = new createVector(0, 0, 0);
    for (let other of relevantnodes) {
      let diff = p5.Vector.sub(this.position, other.position);
      let d = diff.mag() - edgelength;
      if (abs(d) > this.graphLayout.cohesionthreshold) {
        diff.normalize().mult(-force * d); // force = 0.01 .... setMag vs normalize().mult ?!?!
        sum.add(diff);
      }
    }
    limitVector(sum, edgelength);
    return sum;
  }

  getForceTowardsGoal(force, goal) {
    let diff = p5.Vector.sub(goal, this.position);
    let d = diff.mag();
    if (abs(d) > this.graphLayout.cohesionthreshold) {
      diff.normalize().mult(force * d); // force * d ... setMag vs normalize().mult ?!?
      // limitVector(diff, 10);
    }
    return diff;
  }

  occupied() {
    let result = false;
    if (this === graph.robotA.nodeFrom || this === graph.robotA.nodeTo || this === graph.robotB.nodeFrom || this === graph.robotB.nodeTo) {
      result = true;
    }
    return result;
  }

  isInner() {
    return Array.isArray(this.label) && Array.isArray(this.label[0]);
  }

  show(g) {
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
        g.sphere(0.25 * parameters.nodeSize, parameters.sphereDetail, parameters.sphereDetail);
        g.pop();
      }
    }

    if (this.nodeBorder) {
      g.stroke(150);
      g.strokeWeight(parameters.nodeSize * this.graphLayout.nodeBorderWidth);
    } else {
      g.noStroke();
    }

    // Draw node
    if (this.graphLayout.layout3D) {
      g.push();

      g.translate(this.position.x, this.position.y, this.position.z);

      if (deleteNodeMode && !this.occupied() && g === graphicsForGraph) {
        g.fill(parameters.deleteNodeColor);
      } else {
        if (this.applyExtraCenterForce) {
          g.fill(0, 255, 0);
        } else if (this.active) {
          g.fill(parameters.activeDotColor);
        } else if (this.firstNodeOfEdge) {
          g.fill(parameters.selectedNodeForEdgeColor);
        } else {
          g.fill(parameters.colorNode);
        }
      }

      if (parameters.sphereView) {
        // Two last arguments are sphere detail.
        g.sphere(0.5 * parameters.nodeSize, parameters.sphereDetail, parameters.sphereDetail);
      } else {
        // Rotate such that ellipse faces front
        let rotation = g.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
        g.rotateX(-rotXYZ[0]);
        g.rotateY(-rotXYZ[1]);
        g.rotateZ(-rotXYZ[2]);
        // Draw the ellipse a little in front
        g.translate(0, 0, 1);
        g.stroke(0);
        g.strokeWeight(1.0);
        g.ellipse(0, 0, parameters.nodeSize * (this.isInner() ? 0.5 : 1), parameters.nodeSize * (this.isInner() ? 0.5 : 1));
      }

      if (selectedNodesInGraph.includes(this) || selectedNodesInConfigSpace.includes(this)) {
        let rotation = g.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
        g.rotateX(-rotXYZ[0]);
        g.rotateY(-rotXYZ[1]);
        g.rotateZ(-rotXYZ[2]);
        g.colorMode(HSB, 255);
        g.stroke(0, 255, 255);
        g.noFill();
        g.strokeWeight(2.0);
        g.ellipse(0, 0, parameters.nodeSize * 1.5, parameters.nodeSize * 1.5);
      }
      g.pop();
    }
  }

  showText(g) {
    // Draw text
    g.fill(255, 255, 255);
    g.textAlign(CENTER, CENTER);
    g.textFont(font);
    g.textSize(parameters.fontSize);
    if (this.graphLayout.layout3D) {
      // 3D layout
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
      g.pop();
    } else {
      // 2D layout
      g.push();
      g.translate(this.position.x, this.position.y, this.position.z);
      g.text(this.labelText, 0, 0);
      g.pop();
    }
  }

  getSquareNeighbors() {
    let result = [];
    for (let square of this.graphLayout.squares) {
      // this.label is like [0,1]
      // square.label is like [[0,2],[1,3]]
      // square.label is NOT like [[0,1],[2,3]]
      if (
        square.label[0].includes(this.label[0]) &&
        square.label[1].includes(this.label[1]) //
        // (square.label[0].includes(this.label[1]) && square.label[1].includes(this.label[0]))
      ) {
        result.push(square);
      }
    }
    return result;
  }
}

class InnerNode {
  constructor(parent, graphLayout, label, position) {
    this.parent = parent;
    this.label = label;
    this.graphLayout = graphLayout;
    this.graphics = graphLayout.graphics;
    if (graphLayout.layout3D) {
      this.position = position;
      this.velocity = createVector(0, 0, 0);
      this.acceleration = createVector(0, 0, 0);
    } else {
      this.position = position;
      this.velocity = createVector(0, 0);
      this.acceleration = createVector(0, 0);
    }
    this.graphLayout.innerNodes.push(this);
    this.neighborsA = [];
    this.neighborsB = [];
  }

  update(nodes) {
    this.acceleration.mult(0);

    let sep;
    if (octForces) {
      sep = this.graphLayout.octree.getAllNodesForces(this); // .mult(this.graphLayout.separationFactor);
      // console.log(sep);
    } else {
      sep = this.getSeparationFromNodes(nodes);
    }

    // let targetEdgeLength = this.graphLayout.edgelength;
    // xzxxxxxxx
    //   getDegree
    // this.parent.granularity

    let cohA = this.getSpringForce(
      this.graphLayout.firstCoordinateEdgeLength / parameters.granularityFirstCoordinate, //
      this.graphLayout.firstCoordinateForce * 10, //
      this.neighborsA
    );
    let cohB = this.getSpringForce(
      this.graphLayout.secondCoordinateEdgeLength / parameters.granularitySecondCoordinate, //
      this.graphLayout.secondCoordinateForce * 10, //
      this.neighborsB
    );

    this.acceleration.add(sep);
    this.acceleration.add(cohA);
    this.acceleration.add(cohB);
  }

  move() {
    this.velocity.add(this.acceleration);
    limitVector(this.velocity, parameters.maxspeed);
    this.position.add(this.velocity);
    this.velocity.mult(0.9);
  }

  getSpringForce(edgelength, force, relevantnodes) {
    let sum = new createVector(0, 0, 0);
    for (let other of relevantnodes) {
      let diff = p5.Vector.sub(this.position, other.position);
      let d = diff.mag() - edgelength;
      if (abs(d) > this.graphLayout.cohesionthreshold) {
        diff.normalize().mult(-force * d); // force = 0.01 .... setMag vs normalize().mult ?!?!
        sum.add(diff);
      }
    }
    limitVector(sum, edgelength);
    return sum;
  }

  // TODO: This is copied from Node. Remove unnecessary stuff.
  show(g) {
    if (this.nodeBorder) {
      g.stroke(150);
      g.strokeWeight(parameters.nodeSize * this.graphLayout.nodeBorderWidth);
    } else {
      g.noStroke();
    }

    // Draw node
    if (this.graphLayout.layout3D) {
      g.push();
      g.translate(this.position.x, this.position.y, this.position.z);

      g.fill(parameters.colorNode);

      // Rotate such that ellipse faces front
      let rotation = g.easycam.getRotation();
      let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
      g.rotateX(-rotXYZ[0]);
      g.rotateY(-rotXYZ[1]);
      g.rotateZ(-rotXYZ[2]);
      // Draw the ellipse a little in front
      g.translate(0, 0, 1);
      g.stroke(0);
      g.strokeWeight(1.0);
      g.ellipse(0, 0, parameters.nodeSize * 0.25, parameters.nodeSize * 0.25);

      g.pop();
    }

    // Draw line to neighbors
    for (let n of this.neighborsA) {
      g.stroke(0, 255, 0);
      g.strokeWeight(1.0);
      g.line(this.position.x, this.position.y, this.position.z, n.position.x, n.position.y, n.position.z);
    }

    for (let n of this.neighborsB) {
      g.stroke(0, 0, 255);
      g.strokeWeight(1.0);
      g.line(this.position.x, this.position.y, this.position.z, n.position.x, n.position.y, n.position.z);
    }
  }

  showText(g) {
    // Draw text
    g.fill(0, 0, 0);
    g.textAlign(CENTER, CENTER);
    g.textFont(font);
    g.textSize(parameters.fontSize);
    if (this.graphLayout.layout3D) {
      // 3D layout
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
      g.pop();
    } else {
      // 2D layout
      g.push();
      g.translate(this.position.x, this.position.y, this.position.z);
      g.text(this.labelText, 0, 0);
      g.pop();
    }
  }
}

class InnerEdge {
  constructor(parent, graphLayout, label, nodeFrom, nodeTo) {
    this.graphLayout = graphLayout;
    this.graphics = graphLayout.graphics;
    this.label = label;
    this.nodeFrom = nodeFrom;
    this.nodeTo = nodeTo;
    this.edgeType = parent.edgeType;
  }

  // TODO: This is copied from Edge. Remove unnecessary stuff.
  show(g, strokeW, strokeC) {
    // Set stroke weight. Possible overrides happening via arguments to this function.
    g.strokeWeight(parameters.edgeWidthConfigSpace * 2 * (strokeW === undefined ? 1 : strokeW));

    // Set color. Possible overrides happening via arguments to this function.
    g.stroke(255, 0, 0);
    if (strokeC !== undefined) {
      g.stroke(strokeC);
    }

    // Draw edge.
    g.line(this.nodeFrom.position.x, this.nodeFrom.position.y, this.nodeFrom.position.z, this.nodeTo.position.x, this.nodeTo.position.y, this.nodeTo.position.z);
  }
}

class Edge {
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

    // Figure out the edge type.
    // TODO: ARE THESE THE RIGHT NAMES?
    if (Array.isArray(this.nodeFrom.label) && Array.isArray(this.nodeTo.label)) {
      if (this.nodeFrom.label[0] === this.nodeTo.label[0]) {
        this.edgeType = "robotBedge";
      } else if (this.nodeFrom.label[1] === this.nodeTo.label[1]) {
        this.edgeType = "robotAedge";
      } else {
        console.log();
        ("ERRRORR");
      }
    } else {
      this.edgeType = "graphEdge";
    }

    // this.createInnerNodes();
  }

  createInnerNodes() {
    this.innerNodes = [];
    this.innerEdges = [];
    if (this.edgeType === "graphEdge") {
      this.granularity = parameters.granularityGraph;
    } else if (this.edgeType === "robotBedge") {
      this.granularity = parameters.granularityFirstCoordinate;
    } else if (this.edgeType === "robotAedge") {
      this.granularity = parameters.granularitySecondCoordinate;
    }

    this.innerNodes[0] = this.nodeFrom.innerNode;
    this.innerNodes[this.granularity] = this.nodeTo.innerNode;

    for (let n = 1; n < this.granularity; n++) {
      this.innerNodes[n] = new InnerNode(this, this.graphLayout, n, p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, (1.0 * n) / this.granularity), 1.0 / this.granularity);
    }

    for (let n = 0; n < this.granularity; n++) {
      let nodeFrom = this.innerNodes[n];
      let nodeTo = this.innerNodes[n + 1];
      this.innerEdges[n] = new InnerEdge(this, this.graphLayout, n, nodeFrom, nodeTo);
      if (this.edgeType === "robotBedge") {
        nodeFrom.neighborsB.push(nodeTo);
        nodeTo.neighborsB.push(nodeFrom);
      } else if (this.edgeType === "robotAedge") {
        nodeFrom.neighborsA.push(nodeTo);
        nodeTo.neighborsA.push(nodeFrom);
      }
    }
  }

  amountAlong(amount) {
    return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, amount);
  }

  connectedTo(node) {
    return node === this.nodeFrom || node === this.nodeTo;
  }

  getPosition(amount) {
    return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, amount);
  }

  forceInnerNodesToTheirPositions() {
    for (let n = 1; n < this.granularity; n++) {
      this.innerNodes[n].position = p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, (1.0 * n) / this.granularity);
    }
  }

  show(g, strokeW, strokeC) {
    // Set edge color depending on type
    if (this.owner === undefined) {
      if (this.candidateForRobot === 0) {
        g.stroke(parameters.colorRobotA);
      } else if (this.candidateForRobot === 1) {
        g.stroke(parameters.colorRobotB);
      } else if (this.edgeType === "robotBedge") {
        g.stroke(parameters.colorRobotB);
      } else if (this.edgeType === "robotAedge") {
        g.stroke(parameters.colorRobotA);
      } else if (this.edgeType === "graphEdge") {
        g.stroke(parameters.colorGraphEdge);
      }
    } else {
      if (parameters.showRobots && this.owner.index === 0) {
        g.stroke(parameters.colorRobotA);
      } else if (parameters.showRobots && this.owner.index === 1) {
        g.stroke(parameters.colorRobotB);
      } else {
        g.stroke(parameters.colorGraphEdge);
      }
    }

    // Set edge width. Possible overrides happening via arguments to this function.
    if (this.edgeType === "graphEdge") {
      g.strokeWeight(parameters.edgeWidthGraph * (strokeW === undefined ? 1 : strokeW));
    } else {
      g.strokeWeight(parameters.edgeWidthConfigSpace * (strokeW === undefined ? 1 : strokeW));
    }

    // Set color. Possible overrides happening via arguments to this function.
    if (strokeC !== undefined) {
      g.stroke(strokeC);
    }

    // Draw edge.
    g.line(this.nodeFrom.position.x, this.nodeFrom.position.y, this.nodeFrom.position.z, this.nodeTo.position.x, this.nodeTo.position.y, this.nodeTo.position.z);

    // Show inner nodes.
    // for (let n = 1; n < this.granularity; n++) {
    //   this.innerNodes[n].show(g);
    // }

    // Show inner edges.
    // for (let innerEdge of this.innerEdges) {
    //   innerEdge.show(g, strokeW, strokeC);
    // }
  }
}

class Square {
  constructor(graphLayout, label, edgeAfrom, edgeAto, edgeBfrom, edgeBto) {
    this.graphLayout = graphLayout;
    this.graphics = graphLayout.graphics;
    this.label = label;
    // edgeA refers to the first edge in the graph
    // edgeB refers to the second edge in the graph
    this.edgeAfrom = edgeAfrom;
    this.edgeAto = edgeAto;
    this.edgeBfrom = edgeBfrom;
    this.edgeBto = edgeBto;
    this.innerEdges = [];
    this.innerSquares = [];

    // this.createInnerNodes();

    if (vverbose) print("square created!");
    if (vverbose) print(this);
  }

  getInnernode(label) {
    for (let x of this.innerNodes) {
      if (arraysEqual(x.label, label)) {
        return x;
      }
    }
    return undefined;
  }

  createInnerNodes() {
    // Assumes that we already have innerNodes for edges.
    this.innerNodes = [];
    for (let i = 1; i < this.edgeAfrom.granularity; i++) {
      for (let j = 1; j < this.edgeBfrom.granularity; j++) {
        let amountA = i / this.edgeAfrom.granularity;
        let amountB = j / this.edgeBfrom.granularity;
        let position = this.getPosition(amountA, amountB);
        let innerNode = new InnerNode(this, this.graphLayout, [i, j], position, (1 / this.edgeAfrom.granularity) * (1 / this.edgeBfrom.granularity));
        this.innerNodes.push(innerNode);
      }
    }

    for (let i = 1; i < this.edgeAfrom.granularity; i++) {
      for (let j = 1; j < this.edgeBfrom.granularity; j++) {
        let innerNode = this.getInnernode([i, j]);
        let A = this.getInnernode([i, j - 1]);
        let B = this.getInnernode([i, j + 1]);
        let C = this.getInnernode([i - 1, j]);
        let D = this.getInnernode([i + 1, j]);
        if (A !== undefined) innerNode.neighborsA.push(A);
        if (B !== undefined) innerNode.neighborsA.push(B);
        if (C !== undefined) innerNode.neighborsB.push(C);
        if (D !== undefined) innerNode.neighborsB.push(D);
      }
    }

    for (let i = 1; i < this.edgeAfrom.granularity; i++) {
      this.getInnernode([i, 1]).neighborsA.push(this.edgeAfrom.innerNodes[i]);
      this.edgeAfrom.innerNodes[i].neighborsA.push(this.getInnernode([i, 1]));

      this.getInnernode([i, this.edgeAfrom.granularity - 1]).neighborsA.push(this.edgeAto.innerNodes[i]);
      this.edgeAto.innerNodes[i].neighborsA.push(this.getInnernode([i, this.edgeAfrom.granularity - 1]));
    }
    for (let j = 1; j < this.edgeBfrom.granularity; j++) {
      this.getInnernode([1, j]).neighborsB.push(this.edgeBfrom.innerNodes[j]);
      this.edgeBfrom.innerNodes[j].neighborsB.push(this.getInnernode([1, j]));

      this.getInnernode([this.edgeAfrom.granularity - 1, j]).neighborsB.push(this.edgeBto.innerNodes[j]);
      this.edgeBto.innerNodes[j].neighborsB.push(this.getInnernode([this.edgeAfrom.granularity - 1, j]));
    }
  }

  forceInnerNodesToTheirPositions() {
    for (let innerNode of this.innerNodes) {
      let amountA = innerNode.label[0] / this.edgeAfrom.granularity;
      let amountB = innerNode.label[1] / this.edgeBfrom.granularity;
      innerNode.position = this.getPosition(amountA, amountB);
    }
  }

  updateRepulsionForce(centroids) {
    let centroid = this.getCentroid();
    let sum = new createVector(0, 0, 0);
    for (let other of centroids) {
      let diff = p5.Vector.sub(centroid, other);
      let d = diff.mag();
      if (d > 1.0) {
        diff.normalize().mult(this.graphLayout.centroidRepulsion / (d * d));
        sum.add(diff);
      }
    }
    this.centroidRepulsionForce = sum;
  }

  getPosition(amountA, amountB) {
    // *-->--- edgeAfrom -->---*
    // |                       |
    // |                       |
    // | edgeBfrom             | edgeBto
    // v                       v
    // |                       |
    // |                       |
    // |                       |
    // *--->-- edgeAto   --->--*

    let X = this.edgeAfrom.amountAlong(amountA);
    let Y = this.edgeAto.amountAlong(amountA);
    return p5.Vector.lerp(X, Y, amountB);
  }

  show() {
    // Show the grid.
    if (parameters.gridOn) {
      this.graphics.strokeWeight(parameters.edgeWidthGrid);

      // Draw the grid lines for robot A.
      for (let n = 1; n < this.edgeAfrom.innerNodes.length; n++) {
        let a = this.edgeAfrom.innerNodes[n].position;
        let b = this.edgeAto.innerNodes[n].position;
        this.graphics.stroke(parameters.colorRobotA);
        this.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      // Draw the grid lines for robot B.
      for (let n = 1; n < this.edgeBfrom.innerNodes.length; n++) {
        let a = this.edgeBfrom.innerNodes[n].position;
        let b = this.edgeBto.innerNodes[n].position;
        this.graphics.stroke(parameters.colorRobotB);
        this.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    if (parameters.squareOn) {
      this.graphics.noStroke();
      this.graphics.fill(red(parameters.squareColor), green(parameters.squareColor), blue(parameters.squareColor), parameters.squareOpacity);
      this.graphics.beginShape();
      this.graphics.vertex(this.edgeAfrom.nodeFrom.position.x, this.edgeAfrom.nodeFrom.position.y, this.edgeAfrom.nodeFrom.position.z);
      this.graphics.vertex(this.edgeAfrom.nodeTo.position.x, this.edgeAfrom.nodeTo.position.y, this.edgeAfrom.nodeTo.position.z);
      this.graphics.vertex(this.edgeAto.nodeTo.position.x, this.edgeAto.nodeTo.position.y, this.edgeAto.nodeTo.position.z);
      this.graphics.vertex(this.edgeAto.nodeFrom.position.x, this.edgeAto.nodeFrom.position.y, this.edgeAto.nodeFrom.position.z);
      this.graphics.endShape(CLOSE);
    }
  }

  getCentroid() {
    let result = createVector();
    result.add(this.edgeAfrom.nodeFrom.position);
    result.add(this.edgeAfrom.nodeTo.position);
    result.add(this.edgeAto.nodeTo.position);
    result.add(this.edgeAto.nodeFrom.position);
    result.div(4);
    return result;
  }
}

class Robot {
  constructor(graph, node, index) {
    // The graph is the abstract one with just labels.
    this.graph = graph;
    // The node is from the graphLayout, because we then have neighbors.
    this.nodeFrom = node;
    this.nodeTo = node; // Initial placement. //pickRandomNeighbor();
    this.amount = 0;
    this.index = index;
    this.visited = [];
  }

  occupyingNodes() {
    return [this.nodeFrom, this.nodeTo];
  }

  getCandidates() {
    // only makes sense when we are in nodeFrom
    return this.nodeFrom.neighbors.filter((x) => !this.graph.otherRobot(this).occupyingNodes().includes(x));
  }

  getAllPossibleEdges() {
    // returns labels
    let forbiddenNodes = this.graph
      .otherRobot(this)
      .occupyingNodes()
      .map((n) => n.label);
    return this.graph.edges.filter((x) => !forbiddenNodes.includes(x[0]) && !forbiddenNodes.includes(x[1]));
  }

  getRandomNeighbor() {
    let candidates = this.getCandidates();
    if (candidates.length > 0) {
      return candidates[floor(random(candidates.length))];
    } else {
      return false;
    }
  }

  setNodeTo(node) {
    this.visited.push(node);
    this.nodeTo = node;
    this.amount = 0.0001;
    this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = this;
  }

  setNeighbor(node) {
    this.nodeTo = node;
    this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = this;
  }

  setRandomNeighborIfPossible() {
    console.log("setRandomNeighborIfPossible");
    let candidates = this.getCandidates();
    if (candidates.length > 0) {
      this.nodeTo = candidates[floor(random(candidates.length))];
    }
  }

  setAmount(nextAmount) {
    // console.log("nextAmount = " + nextAmount);

    if (this.nodeFrom !== this.nodeTo) {
      this.amount = constrain(nextAmount, 0, 1);
    }

    // Check if current amount is 0 BEFORE setting it to something else.
    if (this.amount === 0) {
      if (vverbose) console.log("this.amount === 0.0");
      if (vverbose) console.log(this.nodeFrom.label + " " + this.nodeTo.label);
      if (vverbose) console.log(this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false));

      if (this.nodeFrom !== this.nodeTo) {
        this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = undefined;
        this.nodeTo = this.nodeFrom;
      }

      if (parameters.moveDotsRandomly) {
        // If we are at 0, pick a random neighbor.
        let nextNode = this.getRandomNeighbor();
        if (nextNode) {
          this.setNodeTo(nextNode);
        } else {
          // It there is no available neighbor, stop.
          return false;
        }
      }
    }

    if (this.amount === 1.0) {
      if (vverbose) console.log("this.amount === 1.0");
      if (vverbose) console.log(this.nodeFrom.label + " " + this.nodeTo.label);
      if (vverbose) console.log(this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false));
      if (this.nodeFrom !== this.nodeTo) {
        if (vverbose) console.log("resetting!");
        this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = undefined;
        this.amount = 0;
        this.nodeFrom = this.nodeTo;
      }
    }
  }

  getPosition() {
    return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, this.amount);
  }

  inANode() {
    return this.nodeFrom === this.nodeTo;
  }

  show(g) {
    // Find position.
    let position = this.getPosition();

    // Find stroke.
    if (this.nodeBorder) {
      g.stroke(150);
      g.strokeWeight(parameters.graphRobotSize * this.graphLayout.nodeBorderWidth);
    } else {
      g.noStroke();
    }

    // Find fill.
    // if (this.active) {
    //   g.fill(parameters.activeDotColor);
    // } else {
    g.fill(
      // 0, 0, 0
      this.index === 0 ? parameters.colorRobotA : parameters.colorRobotB
    );
    // }

    // Draw node
    if (this.graph.graphLayout.layout3D) {
      g.push();
      g.translate(position.x, position.y, position.z);
      if (parameters.sphereView) {
        let d = parameters.sphereDetail;
        g.sphere((this.active ? 0.55 : 0.5) * parameters.robotsNodeSize, d, d);
      } else {
        let rotation = g.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
        g.rotateX(-rotXYZ[0]);
        g.rotateY(-rotXYZ[1]);
        g.rotateZ(-rotXYZ[2]);
        g.translate(0, 0, 20);
        g.ellipse(0, 0, (this.active ? 1.1 : 1.0) * parameters.robotsNodeSize, (this.active ? 1.1 : 1.0) * parameters.robotsNodeSize);
      }
      g.pop();
    }
  }
}

class Configuration {
  constructor(graphLayout, robotA, robotB) {
    // print(graphLayout);
    this.graphLayout = graphLayout;
    this.robotA = robotA;
    this.robotB = robotB;
    this.history = [];
    this.updatePosition(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount);
  }

  updatePosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
    this.position = this.getPosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB);
  }

  getPosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
    let position;

    if (amountA === 0 && amountB === 0) {
      let stateLabel = [robotAfrom.label, robotBfrom.label];
      let state = this.graphLayout.getNode(stateLabel);
      position = state.position;
    } else if (amountA > 0 && amountB === 0) {
      let stateFromLabel = [robotAfrom.label, robotBfrom.label];
      let stateToLabel = [robotAto.label, robotBfrom.label];
      let stateFrom = this.graphLayout.getNode(stateFromLabel);
      let stateTo = this.graphLayout.getNode(stateToLabel);
      position = p5.Vector.lerp(stateFrom.position, stateTo.position, amountA);
    } else if (amountA === 0 && amountB > 0) {
      let stateFromLabel = [robotAfrom.label, robotBfrom.label];
      let stateToLabel = [robotAfrom.label, robotBto.label];
      let stateFrom = this.graphLayout.getNode(stateFromLabel);
      let stateTo = this.graphLayout.getNode(stateToLabel);
      position = p5.Vector.lerp(stateFrom.position, stateTo.position, amountB);
    } else {
      // (robotA.nodeFrom, robotB.nodeFrom)      edgeAfrom          (robotA.nodeTo, robotB.nodeFrom)
      //
      //                             *-->---X------------>---*
      //                             |      |                |
      //                             |      |                |
      //       edgeBfrom             |      |                |       edgeBto
      //                             v      |                v
      //                             |      |                |
      //                             |      Y                |
      //                             |      |                |
      //                             *--->--X------------->--*
      //
      // (robotA.nodeFrom, robotB.nodeTo)         edgeAto         (robotA.nodeTo, robotB.nodeTo)

      let topLeft = this.graphLayout.getNode([robotAfrom.label, robotBfrom.label]).position;
      let topRight = this.graphLayout.getNode([robotAto.label, robotBfrom.label]).position;
      let botLeft = this.graphLayout.getNode([robotAfrom.label, robotBto.label]).position;
      let botRight = this.graphLayout.getNode([robotAto.label, robotBto.label]).position;
      let topX = p5.Vector.lerp(topLeft, topRight, amountA);
      let botX = p5.Vector.lerp(botLeft, botRight, amountA);
      position = p5.Vector.lerp(topX, botX, amountB);
    }
    return position;
  }

  getCrosshair(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
    // This works even when one or both the amounts are zero.
    // (robotA.nodeFrom, robotB.nodeFrom)      edgeAfrom          (robotA.nodeTo, robotB.nodeFrom)
    //
    //                             *-->---X------------>---*
    //                             |      |                |
    //                             Y------P----------------Y
    //       edgeBfrom             |      |                |       edgeBto
    //                             v      |                v
    //                             |      |                |
    //                             |      |                |
    //                             |      |                |
    //                             *--->--X------------->--*
    //
    // (robotA.nodeFrom, robotB.nodeTo)         edgeAto         (robotA.nodeTo, robotB.nodeTo)

    let topLeft = this.graphLayout.getNode([robotAfrom.label, robotBfrom.label]).position;
    let topRight = this.graphLayout.getNode([robotAto.label, robotBfrom.label]).position;
    let botLeft = this.graphLayout.getNode([robotAfrom.label, robotBto.label]).position;
    let botRight = this.graphLayout.getNode([robotAto.label, robotBto.label]).position;

    let topX = p5.Vector.lerp(topLeft, topRight, amountA);
    let botX = p5.Vector.lerp(botLeft, botRight, amountA);

    let leftY = p5.Vector.lerp(topLeft, botLeft, amountB);
    let rightY = p5.Vector.lerp(topRight, botRight, amountB);

    return [topX, botX, leftY, rightY];
  }

  getHyperplaneLine(robotFrom, robotTo, amount, possibleEdge, flip) {
    // This works even when one or both the amounts are zero.
    // (robotFrom, possibleEdge.nodeFrom)      edgeFrom          (robotTo, possibleEdge.nodeFrom)
    //
    //                             *-->---X------------>---*
    //                             |      |                |
    //                             |      |                |
    //       possibleEdgeFrom      |      |                |       possibleEdgeTo
    //                             v      |                v
    //                             |      |                |
    //                             |      |                |
    //                             |      |                |
    //                             *--->--X------------->--*
    //
    // (robotFrom, possibleEdge.nodeTo)         edgeTo         (robotTo, possibleEdge.nodeTo)

    if (flip) {
      let topLeft = this.graphLayout.getNode([robotFrom.label, possibleEdge[0]]).position;
      let topRight = this.graphLayout.getNode([robotTo.label, possibleEdge[0]]).position;
      let botLeft = this.graphLayout.getNode([robotFrom.label, possibleEdge[1]]).position;
      let botRight = this.graphLayout.getNode([robotTo.label, possibleEdge[1]]).position;
      let topX = p5.Vector.lerp(topLeft, topRight, amount);
      let botX = p5.Vector.lerp(botLeft, botRight, amount);
      return [topX, botX];
    } else {
      let topLeft = this.graphLayout.getNode([possibleEdge[0], robotFrom.label]).position;
      let topRight = this.graphLayout.getNode([possibleEdge[0], robotTo.label]).position;
      let botLeft = this.graphLayout.getNode([possibleEdge[1], robotFrom.label]).position;
      let botRight = this.graphLayout.getNode([possibleEdge[1], robotTo.label]).position;
      let topX = p5.Vector.lerp(topLeft, topRight, amount);
      let botX = p5.Vector.lerp(botLeft, botRight, amount);
      return [topX, botX];
    }
  }

  record(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
    this.history.push([robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB]);
  }

  resetHistory() {
    this.history = [];
  }

  show() {
    if (parameters.showHistory) {
      for (let i = 0; i < this.history.length - 1; i++) {
        let A = this.history[i];
        let B = this.history[i + 1];
        let from = this.getPosition(A[0], A[1], A[2], A[3], A[4], A[5]);
        let to = this.getPosition(B[0], B[1], B[2], B[3], B[4], B[5]);

        this.graphLayout.graphics.stroke(0);
        this.graphLayout.graphics.strokeWeight(1.0);
        this.graphLayout.graphics.line(from.x, from.y, from.z, to.x, to.y, to.z);
      }
    }

    this.showAt(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount);
  }

  showAt(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
    this.updatePosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB);

    // robot A is somewhere. find all possible edges that B could occupy
    let robotApossibilites = this.robotA.getAllPossibleEdges();
    let robotBpossibilites = this.robotB.getAllPossibleEdges();

    // Show hyperplane.
    if (parameters.showHyperplanes) {
      for (let possibleEdge of robotApossibilites) {
        let c = this.getHyperplaneLine(robotBfrom, robotBto, amountB, possibleEdge, false);
        let a = c[0];
        let b = c[1];
        this.graphLayout.graphics.stroke(parameters.colorRobotA);
        this.graphLayout.graphics.strokeWeight(8.0);
        this.graphLayout.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      for (let possibleEdge of robotBpossibilites) {
        let c = this.getHyperplaneLine(robotAfrom, robotAto, amountA, possibleEdge, true);
        let a = c[0];
        let b = c[1];
        this.graphLayout.graphics.stroke(parameters.colorRobotB);
        this.graphLayout.graphics.strokeWeight(8.0);
        this.graphLayout.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    } else {
      if (this.active) {
        // Show crosshairs.
        let crosshairs = this.getCrosshair(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB);
        this.graphLayout.graphics.strokeWeight(8.0);
        if (crosshairs.length === 4) {
          let a = crosshairs[0];
          let b = crosshairs[1];
          this.graphLayout.graphics.stroke(parameters.colorRobotB);
          this.graphLayout.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
          let c = crosshairs[2];
          let d = crosshairs[3];
          this.graphLayout.graphics.stroke(parameters.colorRobotA);
          this.graphLayout.graphics.line(c.x, c.y, c.z, d.x, d.y, d.z);
        }
      }
    }

    this.graphLayout.graphics.push();
    this.graphLayout.graphics.translate(this.position.x, this.position.y, this.position.z);
    this.graphLayout.graphics.noStroke();

    if (this.active) {
      this.graphLayout.graphics.fill(parameters.activeDotColor);
    } else {
      this.graphLayout.graphics.fill(parameters.colorConfig);
    }

    if (parameters.sphereView) {
      let d = parameters.sphereDetail;
      this.graphLayout.graphics.sphere(0.5 * parameters.configNodeSize, d, d);
    } else {
      let rotation = this.graphLayout.graphics.easycam.getRotation();
      let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
      this.graphLayout.graphics.rotateX(-rotXYZ[0]);
      this.graphLayout.graphics.rotateY(-rotXYZ[1]);
      this.graphLayout.graphics.rotateZ(-rotXYZ[2]);
      this.graphLayout.graphics.translate(0, 0, 20);
      this.graphLayout.graphics.ellipse(0, 0, parameters.configNodeSize, parameters.configNodeSize);
    }
    this.graphLayout.graphics.pop();
  }
}

// Graph constructors

function completeGraph(m) {
  let nodes = [...Array(m).keys()];
  let edges = [];
  for (let F of nodes) {
    for (let T of nodes) {
      if (F !== T && F < T) {
        edges.push([F, T]);
      }
    }
  }
  return new Graph(nodes, edges);
}

function chainGraph(m) {
  let nodes = [...Array(m).keys()];
  let edges = [];
  for (let F of nodes) {
    edges.push([F, (F + 1) % m]);
    if (vverbose) print(F);
  }
  return new Graph(nodes, edges);
}

function wheelGraph(m) {
  let nodes = [...Array(m + 1).keys()];
  let edges = [];
  for (let F of nodes) {
    if (F !== m) {
      edges.push([F, m]);
    }
    edges.push([F, (F + 1) % m]);

    if (vverbose) print(F);
  }
  return new Graph(nodes, edges);
}

function randomGraph() {
  let nodes = [...Array(30).keys()];
  let edges = [];
  return new Graph(nodes, edges);
}

function completeBipartiteGraph(m, n) {
  if (vverbose) print("completeBipartiteGraph: " + m + " " + n);
  let nodesFrom = [...Array(m).keys()];
  let nodesTo = [...Array(n).keys()].map((x) => x + m);
  let nodes = [...Array(m + n).keys()];
  let edges = [];
  for (let F of nodesFrom) {
    for (let T of nodesTo) {
      edges.push([F, T]);
    }
  }
  return new Graph(nodes, edges);
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

// Mouse

function mouseWheel(event) {
  // Fix me. Check if left or right
  if (areWeOnTheLeft) {
    if (parameters.syncView) configuration_space.graphLayout.graphics.easycam.setState(graph.graphLayout.graphics.easycam.getState());
  } else {
    if (parameters.syncView) graph.graphLayout.graphics.easycam.setState(configuration_space.graphLayout.graphics.easycam.getState());
  }
}

let mouseIsPressedOnLeftSide = false;

function mousePressedOnLeft(e) {
  console.log("mousePressedOnLeft");
}

function mousePressed(e) {
  areWeOnTheLeft = e.target === graphicsForGraph.canvas;
  if (vverbose) console.log("mouse pressed");
  if (vverbose) console.log(areWeOnTheLeft);
  if (vverbose) console.log(parameters.mode);

  // Which node are we clicking on?
  let selectedNode;
  let selectedDistance;

  if (parameters.mode === "Move") {
    let currentGraphics = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace;

    // Calculate mouse positions by substracting values.
    let relativeMouseX = mouseX - currentGraphics.easycam.viewport[0] - currentGraphics.easycam.viewport[2] / 2;
    let relativeMouseY = mouseY - currentGraphics.easycam.viewport[1] - currentGraphics.easycam.viewport[3] / 2;
    let mousePos = createVector(relativeMouseX, relativeMouseY);

    // We are using this vector to calculate the on-screen radius of robots/configuration/nodes.
    let v = currentGraphics.easycam.getUpVector();

    // Record camera state
    cameraState = currentGraphics.easycam.getState();

    // Clicking on robots or configuration takes priority.

    if (parameters.showRobots) {
      // For the robots:
      // We are using this to calculate the on-screen radius of the robots.
      let upVectorRobotNode = createVector(v[0], v[1], v[2]).setMag(0.5 * parameters.robotsNodeSize);
      // Check against robots
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
      if (distanceA < screenRadiusA) {
        selectedNode = robotAnode;
      } else if (distanceB < screenRadiusB) {
        selectedNode = robotBnode;
      }
    }

    // For the configurations:
    // We are using this to calculate the on-screen radius of the configuration.
    let upVectorConfigNode = createVector(v[0], v[1], v[2]).setMag(0.5 * parameters.configNodeSize);
    // Check against configuration
    let configNode = configuration_space.graphLayout.configuration;
    configNode.active = false;
    let screenPos = currentGraphics.screenPosition(configNode.position);
    let distance = mousePos.dist(screenPos);
    let auxPos = currentGraphics.screenPosition(p5.Vector.add(configNode.position, upVectorConfigNode));
    let screenRadius = screenPos.dist(auxPos);
    if (distance < screenRadius) {
      selectedNode = configNode;
    }

    // At this point selectedNode is either undefined or some node.
    // If we are NOT clicking on robots or configuration, check nodes.
    if (selectedNode === undefined) {
      // We are using these vectors to calculate the on-screen radius of the nodes.
      let upVectorNode = createVector(v[0], v[1], v[2]).setMag(0.5 * parameters.nodeSize);
      // let currentNodes = areWeOnTheLeft ? graph.graphLayout.nodes : configuration_space.graphLayout.nodes;
      let currentNodes = [].concat(graph.graphLayout.nodes).concat(configuration_space.graphLayout.nodes);
      // let currentNodes = graph.graphLayout.nodes;

      // Resets lastSelected flag
      // TODO: check if lastSelected is ACTUALLY needed
      for (let node of currentNodes) {
        node.lastSelected = false;
      }

      // Search through all ordinary nodes
      for (let node of currentNodes) {
        node.active = false;
        let screenPos = currentGraphics.screenPosition(node.position);
        let distance = mousePos.dist(screenPos);
        let auxPos = currentGraphics.screenPosition(p5.Vector.add(node.position, upVectorNode));
        // Find the screen radius of the node.
        let screenRadius = screenPos.dist(auxPos);
        if (vverbose) print(currentGraphics.screenPosition(node.position));
        if (distance < screenRadius && (selectedNode === undefined || distance < selectedDistance)) {
          selectedNode = node;
          selectedDistance = distance;
        }
      }
    }

    // At this point selectedNode is still either undefined or some node.
    // If we clicked on a node, we are here.
    if (selectedNode !== undefined) {
      // Toggle the last selected flag for potential forces, for example.
      selectedNode.lastSelected = true;
      // TODO: check if lastSelected is ACTUALLY needed

      // Update the selectedNodesInGraph with nodes from the graph only.
      if (selectedNode.graphLayout !== undefined) {
        let selectedNodeType = selectedNode.graphLayout.source.type;
        if (selectedNodeType === "graph") {
          if (selectedNodesInGraph.includes(selectedNode)) {
            selectedNodesInGraph = selectedNodesInGraph.filter((n) => {
              return n !== selectedNode;
            });
          } else {
            selectedNodesInGraph.push(selectedNode);
          }
        }
      }
    } else {
      selectedNodesInGraph = [];
    }

    // If we are in edit mode, perhaps add an edge?
    if (selectedNode !== undefined && selectedNode.lastSelected) {
      if (parameters.mode === "Edit") {
        // TODO: there is no edit mode any more
        if (nodeSelectedForEdgeAddition !== undefined) {
          // We have already singled out a node. Now add an edge.
          if (nodeSelectedForEdgeAddition !== selectedNode) {
            // Check if there already exists an edge.
            if (graph.graphLayout.getEdge(nodeSelectedForEdgeAddition.label, selectedNode.label, false) === undefined) {
              // If not, add an edge.
              addEdge(nodeSelectedForEdgeAddition, selectedNode);
            }
          }
          // We are possibly clicking on the same node. Revert.
          nodeSelectedForEdgeAddition.firstNodeOfEdge = false;
          nodeSelectedForEdgeAddition = undefined;
        } else {
          // Are we in node delete mode?
          if (deleteNodeMode) {
            if (!selectedNode.occupied()) {
              deleteNode(selectedNode);
            }
          } else {
            // We are singling out the first node for adding an edge.
            nodeSelectedForEdgeAddition = selectedNode;
            selectedNode.firstNodeOfEdge = true;
          }
        }
      } else if (parameters.mode === "Move") {
        // The active flag is for moving around.
        selectedNode.active = true;
        if (!vverbose) console.log("selectedNode.active = true");
      }
    } else {
      if (parameters.mode === "Edit") {
        // TODO: there is no edit mode any more
        //  && addSingleNodeMode
        // let v = currentGraphics.screenPositionTo3Dposition(mousePos.x, mousePos.y, 0);
        // let x = v.x;
        // let y = v.y;
        // let z = v.z;
        let addedNode = addNode();

        let currentGraphics = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace;
        let relativeMouseX = mouseX - currentGraphics.easycam.viewport[0] - currentGraphics.easycam.viewport[2] / 2;
        let relativeMouseY = mouseY - currentGraphics.easycam.viewport[1] - currentGraphics.easycam.viewport[3] / 2;
        let mouse2D = createVector(relativeMouseX, relativeMouseY);

        for (let n = 0; n < 10; n++) {
          let screenPosOfMovingNode = currentGraphics.screenPosition(addedNode.position);
          let mouseDiff = p5.Vector.sub(mouse2D, screenPosOfMovingNode);
          let dst = applyToVec3(cameraState.rotation, [mouseDiff.x, mouseDiff.y, 0]);

          let xMovement = dst[0];
          let yMovement = dst[1];
          let zMovement = dst[2];

          let move = createVector(xMovement, yMovement, zMovement).setMag(mouseDiff.mag() * 0.5); //mult((0.5 * distToNode) / cameraState.distance);
          addedNode.position.add(move);
        }

        // let updateLayoutAfterAddition = !true;
        // if (updateLayoutAfterAddition) {
        //   forcesActive = true;
        //   configuration_space.graphLayout.moveToCenter = true;
        //   graph.graphLayout.moveToCenter = true;
        //   for (let n = 0; n < 100; n++) {
        //     graph.update();
        //     configuration_space.update();
        //   }
        //   forcesActive = false;
        //   configuration_space.graphLayout.moveToCenter = false;
        //   graph.graphLayout.moveToCenter = false;
        // }
      }
    }

    // This marks all the possible moves for the robot.
    if (graph.robotA.active === true || graph.robotB.active === true) {
      let activeRobot = graph.robotA.active === true ? graph.robotA : graph.robotB;
      let possibleEdges = activeRobot.getAllPossibleEdges();
      for (let possibleEdge of possibleEdges) {
        graph.graphLayout.getEdge(possibleEdge[0], possibleEdge[1]).candidateForRobot = activeRobot.index;
      }
    }
  } else if (parameters.mode === "View") {
    reheat();
  }
}

function ourMouseDragged() {
  if (vverbose) console.log("ourMouseDragged");
  if (parameters.mode === "Move") {
    reheat();

    let currentGraphics = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace;

    let relativeMouseX = mouseX - currentGraphics.easycam.viewport[0] - currentGraphics.easycam.viewport[2] / 2;
    let relativeMouseY = mouseY - currentGraphics.easycam.viewport[1] - currentGraphics.easycam.viewport[3] / 2;
    let mouse2D = createVector(relativeMouseX, relativeMouseY);

    let movingObject, ordinaryNodeMoving;

    // if (areWeOnTheLeft)
    {
      // Check if either of the robots is active
      if (graph.robotA.active === true || graph.robotB.active === true) {
        let activeRobot = graph.robotA.active === true ? graph.robotA : graph.robotB;
        if (activeRobot.inANode()) {
          let robotScreenPos = currentGraphics.screenPosition(activeRobot.getPosition());
          // mouseChange is a vector pointing towards the mouse
          let mouseChange = p5.Vector.sub(mouse2D, robotScreenPos);
          // Only pick node if mouseChange is big enough
          // Find candidates
          let candidates = activeRobot.getCandidates();
          let bestCandidate;
          let bestValue;
          // Find positions on screen
          for (let candidate of candidates) {
            let screenPosOfCandidate = currentGraphics.screenPosition(candidate.position);
            // TEST xxx
            // console.log(currentGraphics);

            // currentGraphics.easycam.beginHUD(currentGraphics._renderer);
            // currentGraphics.stroke(0, 255, 255);
            // currentGraphics.strokeWeight(400);
            // currentGraphics.fill(0, 0, 0);
            // currentGraphics.ellipse(0, 0, 200, 200);
            // currentGraphics.line(robotScreenPos.x, robotScreenPos.y, screenPosOfCandidate.x, screenPosOfCandidate.y);
            // currentGraphics.easycam.endHUD(currentGraphics._renderer);

            // currentGraphics.stroke(0);
            // currentGraphics.strokeWeight(240);
            // currentGraphics.line(activeRobot.getPosition().x, activeRobot.getPosition().y, activeRobot.getPosition().z,
            //   candidate.position.x, candidate.position.y, candidate.position.z);

            // changeForCandidate is a vector pointing towards the candidate
            let changeForCandidate = p5.Vector.sub(screenPosOfCandidate, robotScreenPos);
            // Value is the cosine of the angle.
            let value = p5.Vector.dot(changeForCandidate, mouseChange) / (mouseChange.mag() * changeForCandidate.mag());
            let threshold = changeForCandidate.dot(mouseChange) / pow(changeForCandidate.mag(), 2);
            if (threshold > 0.05) {
              if (bestCandidate === undefined || value > bestValue) {
                bestCandidate = candidate;
                bestValue = value;
              }
            }
          }
          // We have the candidate and the edge
          // Move robotTowards the Candidate
          if (bestCandidate !== undefined) {
            activeRobot.setNodeTo(bestCandidate);
          }
        } else {
          // The robot is on an edge. Change the amount accordingly.
          // mouseChange is a vector pointing towards the mouse
          let robotScreenPos = currentGraphics.screenPosition(activeRobot.getPosition());
          let mouseChange = p5.Vector.sub(mouse2D, robotScreenPos).mult(0.9);
          let nodeFromScreenPos = currentGraphics.screenPosition(activeRobot.nodeFrom.position);
          let nodeToScreenPos = currentGraphics.screenPosition(activeRobot.nodeTo.position);
          let edgeSomething = p5.Vector.sub(nodeToScreenPos, nodeFromScreenPos);
          let amountChange = edgeSomething.dot(mouseChange) / pow(edgeSomething.mag(), 2);
          activeRobot.setAmount(activeRobot.amount + amountChange);
        }
      } else {
        if (vverbose) console.log("moving node");
        for (let node of graph.graphLayout.nodes) {
          if (node.active === true) {
            ordinaryNodeMoving = node;
            if (vverbose) console.log("movingNode = node");
            if (vverbose) console.log(node);
          }
        }
      }
    }
    // else
    {
      // We are on the right side
      if (configuration_space.graphLayout.configuration.active === true) {
        movingObject = configuration_space.graphLayout.configuration;

        // (robotA.nodeFrom, robotB.nodeFrom)      edgeAfrom          (robotA.nodeTo, robotB.nodeFrom)
        //
        //                             *-->---X------------>---*
        //                             |      |                |
        //                             |      |                |
        //       edgeBfrom             |      |                |       edgeBto
        //                             v      |                v
        //                             |      |                |
        //                             |      Y                |
        //                             |      |                |
        //                             *--->--X------------->--*
        //
        // (robotA.nodeFrom, robotB.nodeTo)         edgeAto         (robotA.nodeTo, robotB.nodeTo)

        let configuration2D = graphicsForConfigurationSpace.screenPosition(movingObject.position);
        let mouseChange = p5.Vector.sub(mouse2D, configuration2D).mult(0.9);

        let topLeft = configuration_space.graphLayout.getNode([movingObject.robotA.nodeFrom.label, movingObject.robotB.nodeFrom.label]).position;
        let topRight = configuration_space.graphLayout.getNode([movingObject.robotA.nodeTo.label, movingObject.robotB.nodeFrom.label]).position;
        let botLeft = configuration_space.graphLayout.getNode([movingObject.robotA.nodeFrom.label, movingObject.robotB.nodeTo.label]).position;
        let botRight = configuration_space.graphLayout.getNode([movingObject.robotA.nodeTo.label, movingObject.robotB.nodeTo.label]).position;

        // let topLeft2D = graphicsForConfigurationSpace.screenPosition(topLeft);
        // let topRight2D = graphicsForConfigurationSpace.screenPosition(topRight);
        // let botLeft2D = graphicsForConfigurationSpace.screenPosition(botLeft);
        // let botRight2D = graphicsForConfigurationSpace.screenPosition(botRight);

        if (flags[SHIFT] || flags[66]) {
          if (movingObject.robotB.inANode()) {
            let bestcandidate = pickBestCandidateForB(movingObject, mouseChange);
            if (bestcandidate !== undefined && bestcandidate !== false) movingObject.robotB.setNeighbor(bestcandidate);
          } else {
            let topX = p5.Vector.lerp(topLeft, topRight, movingObject.robotA.amount);
            let botX = p5.Vector.lerp(botLeft, botRight, movingObject.robotA.amount);
            let topX2D = graphicsForConfigurationSpace.screenPosition(topX);
            let botX2D = graphicsForConfigurationSpace.screenPosition(botX);
            let edgeBaux = p5.Vector.sub(botX2D, topX2D);
            // if (edgeBaux.mag() > 0) {
            let amountBchange = edgeBaux.dot(mouseChange) / pow(edgeBaux.mag(), 2);
            movingObject.robotB.setAmount(movingObject.robotB.amount + amountBchange);
            // }
            //  else {
            //   let bestcandidate = pickBestCandidateForB(movingObject, mouseChange);
            //   movingObject.robotB.setNeighbor(bestcandidate);
            //   // Random choice
            //   // movingNode.robotB.setRandomNeighborIfPossible();
            // }
          }
        }
        if (flags[SHIFT] || flags[65]) {
          if (movingObject.robotA.inANode()) {
            let bestcandidate = pickBestCandidateForA(movingObject, mouseChange);
            if (bestcandidate !== undefined && bestcandidate !== false) movingObject.robotA.setNeighbor(bestcandidate);
          } else {
            let leftX = p5.Vector.lerp(topLeft, botLeft, movingObject.robotB.amount);
            let rightX = p5.Vector.lerp(topRight, botRight, movingObject.robotB.amount);
            let leftX2D = graphicsForConfigurationSpace.screenPosition(leftX);
            let rightX2D = graphicsForConfigurationSpace.screenPosition(rightX);
            let edgeAaux = p5.Vector.sub(rightX2D, leftX2D);
            // if (edgeAaux.mag() > 0) {
            let amountAchange = edgeAaux.dot(mouseChange) / pow(edgeAaux.mag(), 2);
            movingObject.robotA.setAmount(movingObject.robotA.amount + amountAchange);
            // } else {
            // Random choice
            // movingObject.robotA.setRandomNeighborIfPossible();
            // }
          }
        }
        // print("test: " + amountAchange + " " + amountBchange);
      } else {
        for (let node of configuration_space.graphLayout.nodes) {
          if (node.active === true) {
            ordinaryNodeMoving = node;
          }
        }
      }
    }

    if (ordinaryNodeMoving !== undefined) {
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

      let move = createVector(xMovement, yMovement, zMovement).mult((0.5 * distToNode) / cameraState.distance);
      ordinaryNodeMoving.position.add(move);
    }
  } else if (parameters.mode === "View") {
    if (areWeOnTheLeft) {
      if (parameters.syncView) configuration_space.graphLayout.graphics.easycam.setState(graph.graphLayout.graphics.easycam.getState());
    } else {
      if (parameters.syncView) graph.graphLayout.graphics.easycam.setState(configuration_space.graphLayout.graphics.easycam.getState());
    }
    reheat();
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

function mouseReleased() {
  // easyCamOn();
  // forcesActive = true;
  // configuration_space.graphLayout.moveToCenter = true;
  // graph.graphLayout.moveToCenter = true;
  configuration_space.graphLayout.configuration.active = false;
  for (let node of configuration_space.graphLayout.nodes) {
    node.active = false;
  }
  graph.robotA.active = false;
  graph.robotB.active = false;
  for (let node of graph.graphLayout.nodes) {
    node.active = false;
  }
  if (!(key === "a" || key === "b")) {
    for (let edge of graph.graphLayout.edges) {
      edge.candidateForRobot = undefined;
    }
  }
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

// Keyboard

let flags = {};

function downKey(c) {
  return flags[c.charCodeAt(0)];
}

function keyPressed() {
  if (verbose) console.log("keyPressed: " + keyCode);
  flags[keyCode] = true;
  if (keyCode === SHIFT || key === "a" || key === "b") {
    if (verbose) console.log(" move mode");
    parameters.mode = "Move";
    updateMode();
  }

  if ((key === "a" && !downKey("B")) || (key === "b" && !downKey("A"))) {
    let activeRobot = key === "a" ? graph.robotA : graph.robotB;
    let possibleEdges = activeRobot.getAllPossibleEdges();
    for (let possibleEdge of possibleEdges) {
      graph.graphLayout.getEdge(possibleEdge[0], possibleEdge[1]).candidateForRobot = activeRobot.index;
    }
  }

  // if (key === "R") init();
  if (key === "e") addEdgesForSelectedNodes();
  else if (key === "d") deleteSelectedNodesOrEdges();
  else if (key === " ") parameters.running = !parameters.running;
  else if (key === "o") {
    octForces = !octForces;
    console.log("octForces = " + octForces);
  } else if (key === "f") forcesActive = !forcesActive;
  else if (key === "q") parameters.debugMode = !parameters.debugMode;
  else if (key === "t") {
    parameters.showText = !parameters.showText;
    updateIcons();
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
      infoDiv.show();
    } else {
      infoDiv.hide();
    }
  }
  //addSingleNodeMode = !addSingleNodeMode; // todo: clean up
  else if (key === "a") robotAmoving = !robotAmoving;
  else if (key === "b") robotBmoving = !robotBmoving;
  else if (key === "c") toggleForSelectedNode();
  else if (key === "C") parameters.showConfigurationspace = !parameters.showConfigurationspace;
  else if (key === "s") takeScreenshotGraph = !takeScreenshotGraph;
  else if (key === "S") takeScreenshotConfigSpace = !takeScreenshotConfigSpace;
  else if (key === "R") parameters.showRobots = !parameters.showRobots;
  else if (key === "w") writeToFiles();
  // else if (key === "L") writeLayoutToFile();
  // else if (key === "W") writeChainComplexToFile();
  else if (key === "l") readLayoutFromFile("layout.txt");
  else if (key === "r") readFromFile("parameters.txt");
  else if (key === "+") readHomology();
  else if (key === "z") {
    graphicsForConfigurationSpace.easycam.removeMouseListeners();
    graphicsForGraph.easycam.removeMouseListeners();
  } else if (key === "Z") {
    graphicsForConfigurationSpace.easycam.attachMouseListeners(graphicsForConfigurationSpace._renderer);
    graphicsForGraph.easycam.attachMouseListeners(graphicsForGraph._renderer);
  }
  // tweakpane.refresh();
}

function keyReleased() {
  if (verbose) console.log("keyReleased: " + keyCode);
  flags[keyCode] = false;
  if (keyCode === SHIFT || key === "a" || key === "b") {
    if (verbose) console.log("keyReleased: " + "parameters.mode = View");
    parameters.mode = "View";
    updateMode(); // We call this because the listener is no longer listening when event from key down has fired.
  }

  if (!downKey("A") && !downKey("B")) {
    for (let edge of graph.graphLayout.edges) {
      edge.candidateForRobot = undefined;
    }
  }
}

// Math

function applyToVec3(rot, vec) {
  let dst;
  var [x, y, z] = vec;
  var [q0, q1, q2, q3] = rot;

  var s = q1 * x + q2 * y + q3 * z;
  dst = [0, 0, 0];
  dst[0] = 2 * (q0 * (x * q0 - (q2 * z - q3 * y)) + s * q1) - x;
  dst[1] = 2 * (q0 * (y * q0 - (q3 * x - q1 * z)) + s * q2) - y;
  dst[2] = 2 * (q0 * (z * q0 - (q1 * y - q2 * x)) + s * q3) - z;
  return dst;
}

function limitVector(p, value) {
  if (p.mag() > value) {
    p.normalize().mult(value);
  }
}

function EulerToQuaternion(x, y, z) {
  // Abbreviations for the various angular functions
  var cy = cos(z * 0.5);
  var sy = sin(z * 0.5);
  var cp = cos(y * 0.5);
  var sp = sin(y * 0.5);
  var cr = cos(x * 0.5);
  var sr = sin(x * 0.5);

  // convert to Quaternion
  var qw = cy * cp * cr + sy * sp * sr;
  var qx = cy * cp * sr - sy * sp * cr;
  var qy = sy * cp * sr + cy * sp * cr;
  var qz = sy * cp * cr - cy * sp * sr;

  //console.log('converted from Euler',x,y,z,'To Quaternion',qw,qx,qy,qz);
  return [qw, qx, qy, qz];
}

function QuaternionToEuler(q0, q1, q2, q3) {
  //qw, qx, qy, qz
  // Convert Rotation from Quaternion To XYZ (from wikipedia)
  // roll (x-axis rotation)
  var sinr_cosp = +2.0 * (q0 * q1 + q2 * q3);
  var cosr_cosp = +1.0 - 2.0 * (q1 * q1 + q2 * q2);
  var x = atan2(sinr_cosp, cosr_cosp);

  // pitch (y-axis rotation)
  var sinp = +2.0 * (q0 * q2 - q3 * q1);
  var y;
  if (abs(sinp) >= 1) y = copysign(M_PI / 2, sinp);
  // use 90 degrees if out of range
  else y = asin(sinp);

  // yaw (z-axis rotation)
  var siny_cosp = +2.0 * (q0 * q3 + q1 * q2);
  var cosy_cosp = +1.0 - 2.0 * (q2 * q2 + q3 * q3);
  var z = atan2(siny_cosp, cosy_cosp);

  return [x, y, z];
}

function cartesianProductOf() {
  return Array.prototype.reduce.call(
    arguments,
    function (a, b) {
      var ret = [];
      a.forEach(function (a) {
        b.forEach(function (b) {
          ret.push(a.concat([b]));
        });
      });
      return ret;
    },
    [[]]
  );
}

function getFourthPoint(A, B, C) {
  // A --- B
  // |     |
  // C --- D
  // A + ((B - A) + (C - A)) = B + C - A
  return p5.Vector.add(B, C).sub(A);
}

// Strings

function labelToString(L) {
  let result = "";
  if (Array.isArray(L)) {
    for (let l of L) {
      result += l + " ";
    }
    result = result.slice(0, -1);
    return result;
  } else {
    return L;
  }
}

// Helpers

function checkIfArrayIsUnique(myArray) {
  return myArray.length === new Set(myArray).size;
}

const flatten = (arr) => [].concat.apply([], arr);

const product = (...sets) => sets.reduce((acc, set) => flatten(acc.map((x) => set.map((y) => [...x, y]))), [[]]);

function arraysEqual(a1, a2) {
  /* WARNING: arrays must not contain {objects} or behavior may be undefined */
  return JSON.stringify(a1) == JSON.stringify(a2);
}

function edgesContainEdge(edges, edge) {
  for (let cand of edges) {
    if (arraysEqual(cand, edge)) return true;
    if (arraysEqual(cand, [edge[1], edge[0]])) return true;
  }
  return false;
}

function is_state(p) {
  return checkIfArrayIsUnique(p.flat());
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

function toggleGUI(type) {
  if (type === -1) {
    if (gui.closed === true) {
      gui.open();
    } else {
      gui.close();
    }
  }
}
