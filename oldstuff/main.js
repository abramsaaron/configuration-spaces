let graph;
let graphs = {};
let graphicsForGraph, graphicsForConfigurationSpace;
let configuration_space, configuration_spaceLayout;
let cameraState, areWeOnTheLeft;
let font;
let easyCamActive = true;

let temperature = 1.0;
let cold = 0.001;
let coolingRate = 0.0;

let viewingStyle = "dual";

// For the GUI

let gui;
let parameters = {};

// Booleans

let running = true;
let takeScreenshotGraph = !true;
let takeScreenshotConfigSpace = !true;
let verbose = !true;
let forcesActive = true;
let robotAmoving = true;
let robotBmoving = true;
let addSingleNodeMode = false; // todo: clean up
let nodeSelectedForEdgeAddition;
let deleteNodeMode = false;

// Setup

function preload() {
  font = loadFont("fonts/Myriad_Pro_6809.otf");
}

function setup() {
  noCanvas();
  setAttributes("antialias", true);
  initParameters();
  init();
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

  setupEasyCam(graphicsForConfigurationSpace, 1000);
  addScreenPositionFunction(graphicsForConfigurationSpace);
}

function init() {
  initView(viewingStyle);
  initGraph(parameters.graphType);
  initGUI();
}

function updateMode() {
  switch (parameters.mode) {
    case "View":
      easyCamOn();
      deleteNodeMode = false;
      break;
    case "Move":
      easyCamOff();
      deleteNodeMode = false;
      break;
    case "Edit":
      easyCamOff();
      break;
  }
}

function toggleView() {
  if (viewingStyle === "dual") {
    viewingStyle = "single";
  } else if (viewingStyle === "single") {
    viewingStyle = "dual";
  }
  init();
}

function initView(style) {
  viewingStyle = style;
  resetCanvases();
  if (style === "single") {
    initgraphicsForGraph(0, windowHeight);
    initgraphicsForConfigurationSpace(windowWidth, windowHeight);
  } else if (viewingStyle === "dual") {
    initgraphicsForGraph(windowWidth / 2, windowHeight);
    initgraphicsForConfigurationSpace(windowWidth / 2, windowHeight);
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
  parameters.graphType = "K(2,3)";
  parameters.mode = "View";
  parameters.distinguishDots = !true;
  parameters.gridOn = !true;
  parameters.squareOn = true;
  parameters.showHyperplanes = true;
  parameters.granularityFirstCoordinate = 10;
  parameters.granularitySecondCoordinate = 10;
  parameters.showText = !true;
  parameters.sphereView = true;
  parameters.lights = true;
  parameters.moveDotsRandomly = !true;
  parameters.robotASpeed = 0.1;
  parameters.robotBSpeed = 0.1;
  parameters.amountMultiplier = 0.05;
  parameters.recordHistory = !true;
  parameters.showHistory = !true;
  parameters.sphereDetail = 30;
  parameters.resetHistory = function () {
    configuration_space.graphLayout.configuration.resetHistory();
  };
  parameters.speedUp = 1;
  parameters.labelX = 0;
  parameters.labelY = 0;
  parameters.labelZ = 20;
  parameters.colorRobotA = [220, 0, 0];
  parameters.colorRobotB = [60, 60, 60];
  parameters.colorConfig = [31, 108, 179];
  parameters.colorNode = [180, 180, 180];
  parameters.colorGraphEdge = [31, 108, 179];
  parameters.squareColor = [0, 0, 0];
  parameters.squareOpacity = 100;
  parameters.activeDotColor = [220, 110, 0];
  parameters.deleteNodeColor = [100, 0, 200];
  parameters.selectedNodeForEdgeColor = [45, 80, 200];
  // From graph layout
  parameters.nodeSize = 20;
  parameters.robotsNodeSize = 21;
  parameters.configNodeSize = 21;
  parameters.edgeWidthGraph = 4.5;
  parameters.edgeWidthConfigSpace = 2.0;
  parameters.edgeWidthGrid = 0.4;
}

// GUI setup

function initGUI() {
  if (gui !== undefined) gui.destroy();

  gui = new dat.GUI({
    autoPlace: false,
    width: 400,
  });

  // Choose graph
  let globalUI = gui.addFolder("Settings");
  let graphPicker = globalUI.add(parameters, "graphType", ["K(1,1)", "K(1,2)", "K(1,3)", "K(1,4)", "K(1,5)", "K(1,6)", "K(1,7)", "K(1,8)", "K(1,9)", "K(1,10)", "K(2,2)", "K(2,3)", "K(2,4)", "K(2,5)", "K(2,6)", "K(3,3)", "K(3,4)", "K(4,4)", "K(2)", "K(3)", "K(4)", "K(5)", "K(6)", "C(2)", "C(3)", "C(4)", "C(5)", "C(6)", "C(7)", "W(4)", "W(5)", "W(6)", "W(7)", "W(8)", "W(9)", "W(10)"]).name("Choose graph");
  graphPicker.onChange(function (value) {
    parameters.mode = "View";
    updateMode();
    init();
    // initView(viewingStyle);
    // initGraph(value);
  });

  let modePicker = globalUI.add(parameters, "mode", ["View", "Move", "Edit"]).name("Choose mode").listen();
  modePicker.onChange(function (value) {
    updateMode();
  });

  globalUI.open();

  // Visual
  let visualGUI = gui.addFolder("Visual Parameters");
  visualGUI.add(parameters, "showText").name("Show text");
  visualGUI.add(parameters, "nodeSize", 0, 40).name("Node size");

  visualGUI.add(parameters, "sphereView").name("Show spheres");
  visualGUI.add(parameters, "sphereDetail", 1, 60).step(1).name("Sphere detail");
  let lightsChange = visualGUI.add(parameters, "lights").name("Use lights (resets!)");
  lightsChange.onFinishChange(function (value) {
    init();
  });
  visualGUI.addColor(parameters, "colorNode").name("Node color");
  visualGUI.add(parameters, "labelX", -100, 100).step(1).name("Label: X offset");
  visualGUI.add(parameters, "labelY", -100, 100).step(1).name("Label: Y offset");
  visualGUI.add(parameters, "labelZ", -100, 100).step(1).name("Label: Z offset");
  // visualGUI.open();

  // Motion
  let motionGUI = gui.addFolder("Motion");

  motionGUI.add(parameters, "moveDotsRandomly").name("Move robots");
  motionGUI.add(parameters, "amountMultiplier", 0, 1).step(0.001).name("Robot speed multiplier");
  motionGUI.add(parameters, "robotASpeed", 0, 1).step(0.001).name("Robot A speed");
  motionGUI.add(parameters, "robotBSpeed", 0, 1).step(0.001).name("Robot B speed");
  motionGUI.add(parameters, "speedUp", 0, 1000).name("Drawing speed-up");

  motionGUI.add(parameters, "recordHistory").name("Record configuration history");
  motionGUI.add(parameters, "showHistory").name("Show configuration history ");
  motionGUI.add(parameters, "resetHistory").name("Reset configuration history");
  // motionGUI.open();

  // Graph
  let visualGUIGraph = gui.addFolder("Visuals for graph");
  visualGUIGraph.add(parameters, "robotsNodeSize", 0, 40).name("Node size for robots");
  visualGUIGraph.add(parameters, "edgeWidthGraph", 0, 10).name("Edge width in graph");
  visualGUIGraph.addColor(parameters, "colorRobotA").name("Robot A color");
  visualGUIGraph.addColor(parameters, "colorRobotB").name("Robot B color");
  visualGUIGraph.addColor(parameters, "colorGraphEdge").name("Edge color");

  // Config Space
  let visualGUISpace = gui.addFolder("Visuals for config space");
  visualGUISpace.add(parameters, "configNodeSize", 0, 40).name("Node size for configurations");
  visualGUISpace.add(parameters, "edgeWidthConfigSpace", 0, 10).name("Edge with in space");
  visualGUISpace.add(parameters, "edgeWidthGrid", 0, 10).name("Edge width for square grid");

  visualGUISpace.add(parameters, "gridOn").name("Show square grid");
  visualGUISpace.add(parameters, "squareOn").name("Show square surface");
  visualGUISpace.add(parameters, "showHyperplanes").name("Show hyperplanes");

  visualGUISpace.add(parameters, "granularityFirstCoordinate", 0, 80).step(1).name("Granularity for 1. coordinate");

  visualGUISpace.add(parameters, "granularitySecondCoordinate", 0, 80).step(1).name("Granularity for 2. coordinate");

  visualGUISpace.addColor(parameters, "squareColor").name("Square surface color");
  visualGUISpace.add(parameters, "squareOpacity", 0, 255).name("Square surface opacity");
  visualGUISpace.addColor(parameters, "colorConfig").name("Configuration color");
  // visualGUISpace.open();

  // Graph
  let graphGUI = gui.addFolder("Graph Parameters");
  graphGUI.add(graph.graphLayout, "edgelength", 0, 200).name("Target edge length");
  graphGUI.add(graph.graphLayout, "maxspeed", 0, 1000).name("Max node speed");
  graphGUI.add(graph.graphLayout, "cohesionthreshold", 0, 2).name("Neighbor attraction threshold");
  graphGUI.add(graph.graphLayout, "repulsion", 0, 100000).name("Repulsion");
  graphGUI.add(graph.graphLayout, "separationFactor", 0, 3).name("Separation factor");
  graphGUI.add(graph.graphLayout, "centerForce", 0, 0.15).name("Center force").listen();
  graphGUI.add(graph.graphLayout, "extraCenterForce", 0, 0.15).name("Extra center force");
  graphGUI.add(graph.graphLayout, "centerAttraction").name("Center forces active").listen();
  graphGUI.add(graph.graphLayout, "moveToCenter").name("Adjust to center");
  // graphGUI.open();

  // Configuration Space
  let configGUI = gui.addFolder("Configuration Space Parameters");
  configGUI.add(configuration_space.graphLayout, "firstCoordinateEdgeLength", 1, 1000).name("First coordinate target edge length");
  configGUI.add(configuration_space.graphLayout, "firstCoordinateForce", 0, 0.1).name("First coordinate edge force");
  configGUI.add(configuration_space.graphLayout, "secondCoordinateEdgeLength", 1, 1000).name("Second coordinate target edge length");
  configGUI.add(configuration_space.graphLayout, "secondCoordinateForce", 0, 0.1).name("Second coordinate edge force");
  configGUI.add(configuration_space.graphLayout, "maxspeed", 0, 1000).name("Max node speed");
  configGUI.add(configuration_space.graphLayout, "cohesionthreshold", 0, 2).name("Neighbor attraction threshold");
  configGUI.add(configuration_space.graphLayout, "repulsion", 0, 100000).name("Repulsion");
  configGUI.add(configuration_space.graphLayout, "separationFactor", 0, 3).name("Separation factor");
  configGUI.add(configuration_space.graphLayout, "centerForce", 0, 0.15).listen();
  configGUI.add(configuration_space.graphLayout, "extraCenterForce", 0, 0.15).name("Extra center force");
  configGUI.add(configuration_space.graphLayout, "centerAttraction").name("Center forces active").listen();
  configGUI.add(configuration_space.graphLayout, "moveToCenter").name("Adjust to center");
  // configGUI.open();

  // Place in DOM
  var customContainer = document.getElementById("gui");
  customContainer.appendChild(gui.domElement);
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

  if (takeScreenshotGraph) {
    takeScreenshotGraph = false;
    let time = str(year()) + ("0" + str(month())).slice(-2) + ("0" + str(day())).slice(-2) + "_" + ("0" + str(hour())).slice(-2) + ("0" + str(minute())).slice(-2) + ("0" + str(second())).slice(-2);
    let type = parameters.graphType.slice();
    saveCanvas(graph.graphLayout.graphics, time + "-" + type + "-graph.png");
  }
  if (takeScreenshotConfigSpace) {
    takeScreenshotConfigSpace = false;
    let time = str(year()) + ("0" + str(month())).slice(-2) + ("0" + str(day())).slice(-2) + "_" + ("0" + str(hour())).slice(-2) + ("0" + str(minute())).slice(-2) + ("0" + str(second())).slice(-2);
    let type = parameters.graphType.slice();
    saveCanvas(configuration_space.graphLayout.graphics, time + "-" + type + "-configspace.png");
  }

  if (mouseIsPressed) {
    ourMouseDragged();
  }
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
  easycam.setDistanceMax(3000);
  easycam.attachMouseListeners(g._renderer);
  easycam.setWheelScale(300);
  easycam.setViewport([g.elt.offsetLeft, g.elt.offsetTop, g.elt.offsetWidth, g.elt.offsetHeight]);
  g.easycam = easycam;
}

// Graph setup

function initGraph(graphType) {
  reheat();
  if (verbose) print("initGraph: " + graphType);
  if (graphType.charAt(0) === "K") {
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

  if (verbose) print(configuration_space);
}

// Main classes

class Graph {
  constructor(nodeLabels, edgeLabels) {
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
    this.graphLayout.showRobots = true;

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
    this.dimension = dimension;
    // todo: generalize and use dimension
    let positions = graph.nodes.concat(graph.edges);
    let possible_states = cartesianProductOf(positions, positions);
    this.states = possible_states.filter(is_state);
    if (verbose) console.log(this.states);
    if (verbose) print("States:");
    if (verbose) print(this.states);
    this.createGraphLayout(graphicsForConfigurationSpace, true);
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
    if (verbose) console.log("newPossibleStates");
    if (verbose) console.log(newPossibleStates);
    let newStates = newPossibleStates.filter(is_state);
    for (let state of newStates) {
      this.addStateToGraphLayout(state);
      this.states.push(state);
    }
  }

  removeStates(label) {
    let survivingStates = [];
    let statesToDelete = [];
    for (let state of this.states) {
      if (flatten(state).includes(label)) {
        statesToDelete.push(state);
      } else {
        survivingStates.push(state);
      }
    }
    for (let state of statesToDelete) {
      switch (this.getDegree(state)) {
        case 0:
          this.graphLayout.deleteNode(state);
          break;
        case 1:
          this.graphLayout.deleteEdge(state);
          break;
        case 2:
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
        if (verbose) print("state_1:");
        if (verbose) print(state);
        this.graphLayout.addNode(state);
        break;
      case 1:
        // Create edges
        if (verbose) print("state_1:");
        if (verbose) print(state);
        if (Array.isArray(state[0])) {
          // [[1,2], 0] gives [1,0] and [2,0]
          let nodeFrom = this.graphLayout.getNode([state[0][0], state[1]]);
          let nodeTo = this.graphLayout.getNode([state[0][1], state[1]]);
          this.graphLayout.addEdge(state, nodeFrom, nodeTo);
        } else if (Array.isArray(state[1])) {
          // [0, [1,2]] gives [0,1] and [0,2]
          let nodeFrom = this.graphLayout.getNode([state[0], state[1][0]]);
          let nodeTo = this.graphLayout.getNode([state[0], state[1][1]]);
          if (verbose) print("nodeFrom:");
          if (verbose) print(nodeFrom);
          this.graphLayout.addEdge(state, nodeFrom, nodeTo);
        } else {
          if (verbose) print("error");
        }
        break;
      case 2:
        // Create square
        if (verbose) print("state_2:");
        if (verbose) print(state);
        // state = [[ 0 , 3 ][ 1 , 2 ]] OR [[ 1 , 2][ 0 , 3 ]]
        let edgeAfrom = this.graphLayout.getEdge(state[0][0], state[1], true); // 0 [ 1, 2 ]  OR  1 [ 0 , 3]
        let edgeAto = this.graphLayout.getEdge(state[0][1], state[1], true); //   3 [ 1, 2 ]  OR  2 [ 0 , 3]
        let edgeBfrom = this.graphLayout.getEdge(state[0], state[1][0], true); // [ 0, 3 ] 1
        let edgeBto = this.graphLayout.getEdge(state[0], state[1][1], true); //   [ 0, 3 ] 2

        if (verbose) print(edgeAfrom);
        if (verbose) print(edgeAto);

        this.graphLayout.addSquare(state, edgeAfrom, edgeAto, edgeBfrom, edgeBto);
        break;
    }

    // let states_0 = this.getStates(0);
    // let states_1 = this.getStates(1);
    // let states_2 = this.getStates(2);

    // // Create nodes
    // for (let state of states_0) {
    //   if (verbose) print("state_1:");
    //   if (verbose) print(state);
    //   this.graphLayout.addNode(state);
    // }

    // // Create edges
    // for (let state of states_1) {
    //   if (verbose) print("state_1:");
    //   if (verbose) print(state);
    //   if (Array.isArray(state[0])) {
    //     // [[1,2], 0] gives [1,0] and [2,0]
    //     let nodeFrom = this.graphLayout.getNode([state[0][0], state[1]]);
    //     let nodeTo = this.graphLayout.getNode([state[0][1], state[1]]);
    //     this.graphLayout.addEdge(state, nodeFrom, nodeTo);
    //   } else if (Array.isArray(state[1])) {
    //     // [0, [1,2]] gives [0,1] and [0,2]
    //     let labelA = [state[0], state[1][0]];
    //     let nodeFrom = this.graphLayout.getNode(labelA);
    //     if (verbose) print("nodeFrom:");
    //     if (verbose) print(nodeFrom);
    //     let nodeTo = this.graphLayout.getNode([state[0], state[1][1]]);
    //     this.graphLayout.addEdge(state, nodeFrom, nodeTo);
    //   } else {
    //     if (verbose) print("error");
    //   }
    // }

    // // Create squares
    // for (let state of states_2) {
    //   if (verbose) print("state_2:");
    //   if (verbose) print(state);
    //   let edgeAfrom = this.graphLayout.getEdge(state[0][0], state[1]);
    //   let edgeAto = this.graphLayout.getEdge(state[0][1], state[1]);
    //   let edgeBfrom = this.graphLayout.getEdge(state[0], state[1][0]);
    //   let edgeBto = this.graphLayout.getEdge(state[0], state[1][1]);
    //   this.graphLayout.addSquare(state, edgeAfrom, edgeAto, edgeBfrom, edgeBto);
    // }
  }

  createGraphLayout(graphics, layout3D) {
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
    this.layoutGraph = true;

    this.nodes = [];
    this.nodeBorder = true;
    this.nodeBorderWidth = 0.05;
    this.showNodes = true;

    this.edges = [];
    this.showEdges = true;
    this.edgelength = 100;

    this.squares = [];
    this.showSquares = true;

    this.showRobots = true;

    this.centerAttraction = !true;
    this.centerForce = 0.0001;
    this.extraCenterForce = 0.0001;
    this.moveToCenter = true;

    this.firstCoordinateEdgeLength = 100;
    this.secondCoordinateEdgeLength = 100;

    this.graphEdgeForce = 0.01;
    this.firstCoordinateForce = 0.01;
    this.secondCoordinateForce = 0.01;

    this.center = createVector(0, 0, 0);

    this.heat = 1.0;
    this.coolDown = 0.01;

    this.maxspeed = 180;
    // this.neighborattraction = 0.01;
    this.cohesionthreshold = 10;
    this.cohesionFactor = 1.0;

    this.repulsion = 50000;
    this.separationFactor = 1.0;

    this.keyboardactive = true;
  }

  initlayout() {
    for (let i = 0; i < 100; i++) {
      for (let node of this.nodes) {
        node.update(this.nodes);
        node.move();
      }
    }
  }

  show() {
    // this.graphics.colorMode(HSB, 255);
    // this.graphics.background(255);
    this.graphics.clear();

    let gl = graphicsForConfigurationSpace.canvas.getContext("webgl");

    // gl.enable(gl.DEPTH_TEST);

    // gl.enable(gl.DEPTH_TEST);

    if (this.showSquares) {
      for (let square of this.squares) square.show();
    }

    // gl.enable(gl.DEPTH_TEST);

    if (this.showEdges) {
      for (let edge of this.edges) edge.show();
    }

    if (this.showNodes) {
      for (let node of this.nodes) {
        node.show();
      }
    }

    if (this.showRobots) {
      for (let robot of this.source.getRobots()) {
        robot.show();
      }
    }

    if (this.showConfiguration) {
      this.configuration.show();
    }

    this.counter++;
  }

  update() {
    if (running) {
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

      if (this.layoutGraph)
        for (let node of this.nodes) {
          if (forcesActive) {
            node.update(this.nodes);
          }
          node.move();
        }
    }
  }

  cohese() {
    for (let n of this.nodes) {
      if (n.parent != null && n.parent.parent != null) {
        let post = n.parent.parent.position;
        let curr = n.parent.position;
        let pre = n.position;
        let midpoint = p5.Vector.lerp(post, pre, 0.5);
        curr.lerp(midpoint, 0.1);
      }
    }
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
    if (verbose) print("returning false");
    return false;
  }

  getEdge(labelA, labelB, directed) {
    if (verbose) print("getEdge: ");
    if (verbose) print(labelA);
    if (verbose) print(labelB);
    for (let edge of this.edges) {
      if (arraysEqual([labelA, labelB], edge.label) || (!directed && arraysEqual([labelB, labelA], edge.label))) {
        if (verbose) print("FOUND!");
        if (verbose) print(edge);
        return edge;
      }
    }
  }

  getSquare(labelA, labelB) {
    if (verbose) print("getSquare: ");
    if (verbose) print(labelA);
    if (verbose) print(labelB);
    for (let square of this.squares) {
      if (verbose) print(square.label);
      if (arraysEqual([labelA, labelB], square.label)) {
        if (verbose) print("FOUND!");
        if (verbose) print(square);
        return square;
      }
    }
  }

  addNode(label, x, y, z) {
    if (verbose) print("adding node " + label);
    let r = 100;
    let node = new Node(this, label, x === undefined ? random(-r, r) : x, y === undefined ? random(-r, r) : y, z === undefined ? random(-r, r) : z);
    this.nodes.push(node);
    return node;
  }

  deleteNode(label) {
    let nodeToDelete = this.getNode(label);
    this.nodes.splice(this.nodes.indexOf(nodeToDelete), 1);
  }

  addEdge(label, nodeFrom, nodeTo) {
    if (verbose) print("adding edge " + label);
    if (verbose) print("connecting:");
    if (verbose) print(nodeFrom.label + " to " + nodeTo.label);
    let edge = new Edge(this, label, nodeFrom, nodeTo);
    this.edges.push(edge);
    nodeTo.connectTo(nodeFrom);
    nodeFrom.connectTo(nodeTo);
    return edge;
  }

  deleteEdge(label) {
    let edgeToDelete = this.getEdge(label[0], label[1], false);
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
  constructor(graphLayout, label, x, y, z) {
    this.graphLayout = graphLayout;
    this.graphics = graphLayout.graphics;
    this.labelText = labelToString(label);
    this.applyExtraCenterForce = !true;
    this.label = label;
    if (verbose) print(label);
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
    this.squareneighbors = [];
  }

  connectTo(node) {
    this.neighbors.push(node);
  }

  connectToDiagonally(node) {
    this.squareneighbors.push(node);
  }

  update(nodes) {
    let sep = this.separate(nodes);
    // let coh = this.cohese(this.graphLayout.edgelength, this.neighbors);
    let cohA = this.cohese(
      this.graphLayout.firstCoordinateEdgeLength,
      this.graphLayout.firstCoordinateForce,
      this.neighbors.filter((neighbor) => neighbor.label[0] === this.label[0])
    );
    let cohB = this.cohese(
      this.graphLayout.secondCoordinateEdgeLength,
      this.graphLayout.secondCoordinateForce,
      this.neighbors.filter((neighbor) => neighbor.label[1] === this.label[1])
    );
    // let coh2 = this.cohese(100, this.squareneighbors);

    sep.mult(this.graphLayout.separationFactor);
    // coh.mult(0 * this.graphLayout.cohesionFactor);
    cohA.mult(1 * this.graphLayout.cohesionFactor);
    cohB.mult(1 * this.graphLayout.cohesionFactor);
    // coh2.mult(0 * this.graphLayout.cohesionFactor);

    this.acceleration.add(sep);
    // this.acceleration.add(coh);
    this.acceleration.add(cohA);
    this.acceleration.add(cohB);
    // this.acceleration.add(coh2);

    // todo: find all squares containing this node
    // then, seek towards plane defined by three other nodes
    // perhaps easier to do this for each square
    // tell each square to “straighten out”

    if (this.graphLayout.centerAttraction) {
      let centerForceAddition = this.seek(this.graphLayout.centerForce, this.graphLayout.center);
      this.acceleration.add(centerForceAddition);

      if (this.applyExtraCenterForce) {
        let extraCenterForceAddition = this.seek(this.graphLayout.extraCenterForce, this.graphLayout.center);
        this.acceleration.add(extraCenterForceAddition);
      }
    }
  }

  move() {
    if (!this.frozen) {
      limitVector(this.velocity, this.graphLayout.maxspeed);
      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
      this.velocity.mult(0.9);
      this.acceleration.mult(0);
    }
  }

  separate(relevantnodes) {
    let sum = new createVector(0, 0, 0);
    for (let other of relevantnodes) {
      let diff = p5.Vector.sub(this.position, other.position);
      let d = diff.mag();
      if (d > 1.0) {
        diff.normalize().mult(this.graphLayout.repulsion / (d * d)); // 50 000
        sum.add(diff);
      }
    }
    return sum;
  }

  cohese(edgelength, force, relevantnodes) {
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

  seek(force, goal) {
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

  show() {
    if (this.nodeBorder) {
      this.graphics.stroke(150);
      this.graphics.strokeWeight(parameters.nodeSize * this.graphLayout.nodeBorderWidth);
    } else {
      this.graphics.noStroke();
    }

    // Draw node
    if (this.graphLayout.layout3D) {
      this.graphics.push();
      this.graphics.translate(this.position.x, this.position.y, this.position.z);

      if (deleteNodeMode && !this.occupied() && this.graphics === graphicsForGraph) {
        this.graphics.fill(parameters.deleteNodeColor);
      } else {
        if (this.active) {
          this.graphics.fill(parameters.activeDotColor);
        } else if (this.firstNodeOfEdge) {
          this.graphics.fill(parameters.selectedNodeForEdgeColor);
        } else {
          this.graphics.fill(parameters.colorNode);
        }
      }

      if (parameters.sphereView) {
        // Two last arguments are sphere detail.
        this.graphics.sphere(0.5 * parameters.nodeSize, parameters.sphereDetail, parameters.sphereDetail);
      } else {
        // Rotate such that ellipse faces front
        let rotation = this.graphics.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
        this.graphics.rotateX(-rotXYZ[0]);
        this.graphics.rotateY(-rotXYZ[1]);
        this.graphics.rotateZ(-rotXYZ[2]);
        // Draw the ellipse a little in front
        this.graphics.translate(0, 0, 10);
        this.graphics.stroke(0);
        this.graphics.strokeWeight(1.0);
        this.graphics.ellipse(0, 0, parameters.nodeSize, parameters.nodeSize);
      }
      this.graphics.pop();
    }

    // Draw text
    if (parameters.showText) {
      this.graphics.fill(0, 0, 0);
      this.graphics.textAlign(CENTER, CENTER);
      this.graphics.textFont(font);
      this.graphics.textSize(30);
      if (this.graphLayout.layout3D) {
        // 3D layout
        let rotation = this.graphics.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
        this.graphics.push();
        this.graphics.translate(this.position.x, this.position.y, this.position.z);
        this.graphics.rotateX(-rotXYZ[0]);
        this.graphics.rotateY(-rotXYZ[1]);
        this.graphics.rotateZ(-rotXYZ[2]);
        this.graphics.translate(parameters.labelX, parameters.labelY, parameters.labelZ);
        this.graphics.text(this.labelText, 0, 0);
        this.graphics.pop();
      } else {
        // 2D layout
        this.graphics.push();
        this.graphics.translate(this.position.x, this.position.y, this.position.z);
        this.graphics.text(this.labelText, 0, 0);
        this.graphics.pop();
      }
    }
  }
}

class Edge {
  constructor(graphLayout, label, nodeFrom, nodeTo) {
    this.graphLayout = graphLayout;
    this.graphics = graphLayout.graphics;
    this.label = label;
    this.nodeFrom = nodeFrom;
    this.nodeTo = nodeTo;
    this.subPoints = [];
    this.owner;
    if (Array.isArray(this.nodeFrom.label) && Array.isArray(this.nodeTo.label)) {
      if (this.nodeFrom.label[0] === this.nodeTo.label[0]) {
        this.edgeType = "robotBedge";
      } else if (this.nodeFrom.label[1] === this.nodeTo.label[1]) {
        this.edgeType = "robotAedge";
      } else {
        print("ERRRORR");
      }
    } else {
      this.edgeType = "graphEdge";
    }

    // this.initSubPoints();
  }

  // initSubPoints() {
  //   let thisGranularity;

  //   for (let n = 1; n < maxValue; n++) {
  //     this.subPoints[n] = p5.Vector.lerp(
  //       this.nodeFrom.position,
  //       this.nodeTo.position,
  //       (1.0 * n) / maxValue
  //     );
  //   }
  // }

  amountAlong(amount) {
    return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, amount);
  }

  connectedTo(node) {
    return node === this.nodeFrom || node === this.nodeTo;
  }

  getPosition(amount) {
    return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, amount);
  }

  show() {
    // Set edge color depending on type
    if (this.owner === undefined) {
      if (this.candidateForRobot === 0) {
        this.graphics.stroke(parameters.colorRobotA);
      } else if (this.candidateForRobot === 1) {
        this.graphics.stroke(parameters.colorRobotB);
      } else if (this.edgeType === "graphEdge") {
        this.graphics.stroke(parameters.colorGraphEdge);
      } else if (this.edgeType === "robotBedge") {
        this.graphics.stroke(parameters.colorRobotB);
      } else if (this.edgeType === "robotAedge") {
        this.graphics.stroke(parameters.colorRobotA);
      }
    } else {
      if (this.owner.index === 0) {
        this.graphics.stroke(parameters.colorRobotA);
      } else if (this.owner.index === 1) {
        this.graphics.stroke(parameters.colorRobotB);
      } else {
        this.graphics.stroke(0, 255, 0);
      }
    }

    // Set edge width.
    if (this.edgeType === "graphEdge") {
      this.graphics.strokeWeight(parameters.edgeWidthGraph);
    } else {
      this.graphics.strokeWeight(parameters.edgeWidthConfigSpace);
    }

    // Draw edge.
    lineV(this.graphLayout, this.nodeFrom.position, this.nodeTo.position);

    // Update the subpoints for the grid
    if (parameters.gridOn) {
      let thisGranularity;
      if (this.edgeType === "graphEdge") {
        thisGranularity = 1;
      } else if (this.edgeType === "robotBedge") {
        thisGranularity = parameters.granularityFirstCoordinate;
      } else if (this.edgeType === "robotAedge") {
        thisGranularity = parameters.granularitySecondCoordinate;
      }

      for (let n = 1; n < thisGranularity; n++) {
        this.subPoints[n] = p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, (1.0 * n) / thisGranularity);
      }
    }
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
    this.subPoints = [];

    // this.edgeAfrom.nodeFrom.connectToDiagonally(this.edgeAto.nodeTo);
    // this.edgeAto.nodeTo.connectToDiagonally(this.edgeAfrom.nodeFrom);
    // this.edgeAfrom.nodeTo.connectToDiagonally(this.edgeAto.nodeFrom);
    // this.edgeAto.nodeFrom.connectToDiagonally(this.edgeAfrom.nodeTo);

    if (verbose) print("square created!");
    if (verbose) print(this);
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

    let X = edgeAfrom.amountAlong(amountA);
    let Y = edgeAto.amountAlong(amountA);
    return p5.Vector.lerp(X, Y, amountB);
  }

  show() {
    // Show the grid.
    if (parameters.gridOn) {
      this.graphics.strokeWeight(parameters.edgeWidthGrid);
      // Make sure that we are not trying to access points that have not been defined.
      let firstGranularity = min(this.edgeAfrom.subPoints.length, parameters.granularityFirstCoordinate);
      // Draw the grid lines for robot A.
      for (let n = 1; n < firstGranularity; n++) {
        let a = this.edgeAfrom.subPoints[n];
        let b = this.edgeAto.subPoints[n];
        this.graphics.stroke(parameters.colorRobotA);
        this.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      // Make sure that we are not trying to access points that have not been defined.
      let secondGranularity = min(this.edgeBfrom.subPoints.length, parameters.granularitySecondCoordinate);
      // Draw the grid lines for robot B.
      for (let n = 1; n < secondGranularity; n++) {
        let a = this.edgeBfrom.subPoints[n];
        let b = this.edgeBto.subPoints[n];
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
    this.nodeTo = node;
    this.amount = 0.0001;
    this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = this;
  }

  setNeighbor(node) {
    this.nodeTo = node;
    this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = this;
  }

  setRandomNeighborIfPossible() {
    let candidates = this.getCandidates();
    if (candidates.length > 0) {
      this.nodeTo = candidates[floor(random(candidates.length))];
    }
  }

  setAmount(nextAmount) {
    // console.log("nextAmount = " + nextAmount);
    this.amount = constrain(nextAmount, 0, 1);

    // Check if current amount is 0 BEFORE setting it to something else.
    if (this.amount === 0) {
      // console.log(0);
      this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = undefined;
      this.nodeTo = this.nodeFrom;

      if (parameters.moveDotsRandomly) {
        // If we are at 0, pick a random neighbor.
        this.setRandomNeighborIfPossible();
        let nextNode = this.getRandomNeighbor();
        if (nextNode) {
          this.nodeTo = nextNode;
        } else {
          // It there is no available neighbor, stop.
          return false;
        }
      }
    }

    if (this.amount === 1.0) {
      // console.log(1);
      this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, false).owner = undefined;
      this.amount = 0;
      this.nodeFrom = this.nodeTo;
    }
  }

  getPosition() {
    return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, this.amount);
  }

  inANode() {
    return this.nodeFrom === this.nodeTo;
  }

  show() {
    // Find position.
    let position = this.getPosition();

    // Find stroke.
    if (this.nodeBorder) {
      this.graph.graphLayout.graphics.stroke(150);
      this.graph.graphLayout.graphics.strokeWeight(parameters.graphRobotSize * this.graphLayout.nodeBorderWidth);
    } else {
      this.graph.graphLayout.graphics.noStroke();
    }

    // Find fill.
    // if (this.active) {
    //   this.graph.graphLayout.graphics.fill(parameters.activeDotColor);
    // } else {
    this.graph.graphLayout.graphics.fill(
      // 0, 0, 0
      this.index === 0 ? parameters.colorRobotA : parameters.colorRobotB
    );
    // }

    // Draw node
    if (this.graph.graphLayout.layout3D) {
      this.graph.graphLayout.graphics.push();
      this.graph.graphLayout.graphics.translate(position.x, position.y, position.z);
      if (parameters.sphereView) {
        let d = parameters.sphereDetail;
        this.graph.graphLayout.graphics.sphere((this.active ? 0.55 : 0.5) * parameters.robotsNodeSize, d, d);
      } else {
        let rotation = this.graph.graphLayout.graphics.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
        this.graph.graphLayout.graphics.rotateX(-rotXYZ[0]);
        this.graph.graphLayout.graphics.rotateY(-rotXYZ[1]);
        this.graph.graphLayout.graphics.rotateZ(-rotXYZ[2]);
        this.graph.graphLayout.graphics.translate(0, 0, 20);
        this.graph.graphLayout.graphics.ellipse(0, 0, (this.active ? 1.1 : 1.0) * parameters.robotsNodeSize, (this.active ? 1.1 : 1.0) * parameters.robotsNodeSize);
      }
      this.graph.graphLayout.graphics.pop();
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
    if (verbose) print(F);
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

    if (verbose) print(F);
  }
  return new Graph(nodes, edges);
}

function completeBipartiteGraph(m, n) {
  if (verbose) print("completeBipartiteGraph: " + m + " " + n);
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
  graph.graphLayout.centerAttraction = true;
  graph.graphLayout.centerForce = Math.max(0.02, graph.graphLayout.centerForce);

  configuration_space.graphLayout.centerAttraction = true;
  configuration_space.graphLayout.centerForce = Math.max(0.02, configuration_space.graphLayout.centerForce);

  addSingleNodeMode = false; // todo: clean up
  return addedNode;
}

function deleteNode(node) {
  // Update neighbors
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
}

function addEdge(nodeFrom, nodeTo) {
  let label = [nodeFrom.label, nodeTo.label];
  graph.edges.push(label);
  // let nodeFrom = graph.graphLayout.getNode(label);
  // let nodeTo = graph.graphLayout.getNode(0);
  graph.graphLayout.addEdge(label, nodeFrom, nodeTo);
  configuration_space.addStates(label);

  // // This creates a new configuration_space. Not ideal.
  // configuration_space = new Configuration_space(graph, 2);
  // configuration_space.createGraphLayout(graphicsForConfigurationSpace, true);
  // configuration_space.graphLayout.centerAttraction = true;
  // configuration_space.graphLayout.centerForce = 0.01;
  // initGUI();
}

// Mouse

// function mouseWheel(event) {
//   return false;
// }

function mousePressed() {
  if (parameters.mode === "Move" || parameters.mode === "Edit") {
    areWeOnTheLeft = mouseX < windowWidth / 2 && viewingStyle === "dual" ? true : false; // -1 left, 1 right

    if (areWeOnTheLeft || parameters.mode === "Move") {
      let currentGraphics = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace;

      // Calculate mouse positions by substracting values.
      let relativeMouseX = mouseX - currentGraphics.easycam.viewport[0] - currentGraphics.easycam.viewport[2] / 2;
      let relativeMouseY = mouseY - currentGraphics.easycam.viewport[1] - currentGraphics.easycam.viewport[3] / 2;
      let mousePos = createVector(relativeMouseX, relativeMouseY);

      // We are using this vector to calculate the on-screen radius of robots/configuration/nodes.
      let v = currentGraphics.easycam.getUpVector();

      // Record camera state
      cameraState = currentGraphics.easycam.getState();

      // Which node are we clicking on?
      let selectedNode;
      let selectedDistance;

      // Clicking on robots or configuration takes priority.
      if (parameters.mode === "Move") {
        if (areWeOnTheLeft) {
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
        } else {
          // We are using this to calculate the on-screen radius of the configuration.
          let upVectorConfigNode = createVector(v[0], v[1], v[2]).setMag(0.5 * parameters.configNodeSize);
          // Check against configuration dot
          let configNode = configuration_space.graphLayout.configuration;
          configNode.active = false;
          let screenPos = currentGraphics.screenPosition(configNode.position);
          let distance = mousePos.dist(screenPos);
          let auxPos = currentGraphics.screenPosition(p5.Vector.add(configNode.position, upVectorConfigNode));
          let screenRadius = screenPos.dist(auxPos);
          if (distance < screenRadius) {
            selectedNode = configNode;
          }
        }
      }

      // If we are NOT clicking on robots or configuration, check nodes.
      if (selectedNode === undefined) {
        // We are using these vectors to calculate the on-screen radius of the nodes.
        let upVectorNode = createVector(v[0], v[1], v[2]).setMag(0.5 * parameters.nodeSize);
        let currentNodes = areWeOnTheLeft ? graph.graphLayout.nodes : configuration_space.graphLayout.nodes;

        // Resets lastSelected flag
        for (let node of currentNodes) {
          node.lastSelected = false;
        }
        // Search through all ordinary nodes
        for (let node of currentNodes) {
          node.active = false;
          screenPos = currentGraphics.screenPosition(node.position);
          distance = mousePos.dist(screenPos);
          auxPos = currentGraphics.screenPosition(p5.Vector.add(node.position, upVectorNode));
          // Find the screen radius of the node.
          screenRadius = screenPos.dist(auxPos);
          if (verbose) print(currentGraphics.screenPosition(node.position));
          if (distance < screenRadius && (selectedNode === undefined || distance < selectedDistance)) {
            selectedNode = node;
            selectedDistance = distance;
          }
        }
      }

      // If we clicked on a node, we are here.
      if (selectedNode !== undefined) {
        // Toggle the last selected flag for potential forces, for example.
        selectedNode.lastSelected = true;

        // If we are in edit mode, perhaps add an edge?
        if (parameters.mode === "Edit") {
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
          if (verbose) console.log("selectedNode.active = true");
        }
      } else {
        if (parameters.mode === "Edit") {
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
    }

    // Experiment
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
  if (parameters.mode === "Move") {
    reheat();

    let currentGraphics = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace;

    let relativeMouseX = mouseX - currentGraphics.easycam.viewport[0] - currentGraphics.easycam.viewport[2] / 2;
    let relativeMouseY = mouseY - currentGraphics.easycam.viewport[1] - currentGraphics.easycam.viewport[3] / 2;
    let mouse2D = createVector(relativeMouseX, relativeMouseY);

    let movingObject, ordinaryNodeMoving;

    if (areWeOnTheLeft) {
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
        if (verbose) console.log("moving node");
        for (let node of graph.graphLayout.nodes) {
          if (node.active === true) {
            ordinaryNodeMoving = node;
            if (verbose) console.log("movingNode = node");
            if (verbose) console.log(node);
          }
        }
      }
    } else {
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
            if (bestcandidate !== undefined) movingObject.robotB.setNeighbor(bestcandidate);
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
            if (bestcandidate !== undefined) movingObject.robotA.setNeighbor(bestcandidate);
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
      if (verbose) console.log("moving ordinaryNodeMoving");
      let screenPosOfMovingNode = currentGraphics.screenPosition(ordinaryNodeMoving.position);
      let mouseChange = p5.Vector.sub(mouse2D, screenPosOfMovingNode);

      let dst = applyToVec3(cameraState.rotation, [mouseChange.x, mouseChange.y, 0]);
      let camPos = currentGraphics.easycam.getPosition();
      let camPosVector = createVector(camPos[0], camPos[1], camPos[2]);
      let distToNode = ordinaryNodeMoving.position.dist(camPosVector);

      if (verbose) print(dst);
      let xMovement = dst[0];
      let yMovement = dst[1];
      let zMovement = dst[2];

      let move = createVector(xMovement, yMovement, zMovement).mult((0.5 * distToNode) / cameraState.distance);
      ordinaryNodeMoving.position.add(move);
    }
  } else if (parameters.mode === "View") {
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
  if (verbose) print("easyCamOff");
  graphicsForConfigurationSpace.easycam.removeMouseListeners();
  graphicsForGraph.easycam.removeMouseListeners();

  forcesActive = false;
  configuration_space.graphLayout.moveToCenter = false;
  graph.graphLayout.moveToCenter = false;
}

function easyCamOn() {
  easyCamActive = true;
  if (verbose) print("easyCamOn");
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
  flags[keyCode] = true;
  if (keyCode === SHIFT || key === "a" || key === "b") {
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

  if (key === "r") init();
  else if (key === "e") {
    parameters.mode = "Edit";
    updateMode();
  } else if (key === " ") running = !running;
  else if (key === "f") forcesActive = !forcesActive;
  else if (key === "t") parameters.showText = !parameters.showText;
  else if (key === "v") toggleView();
  else if (key === "g") toggleGUI(-1);
  else if (key === "0") toggleGUI(0);
  else if (key === "1") toggleGUI(1);
  else if (key === "2") toggleGUI(2);
  else if (key === "3") toggleGUI(3);
  else if (key === "n") addNode();
  //addSingleNodeMode = !addSingleNodeMode; // todo: clean up
  else if (key === "d") deleteNodeMode = !deleteNodeMode;
  else if (key === "a") robotAmoving = !robotAmoving;
  else if (key === "b") robotBmoving = !robotBmoving;
  else if (key === "c") toggleForSelectedNode();
  else if (key === "s") takeScreenshotGraph = !takeScreenshotGraph;
  else if (key === "S") takeScreenshotConfigSpace = !takeScreenshotConfigSpace;
  else if (key === "m") {
    graphicsForConfigurationSpace.easycam.removeMouseListeners();
    graphicsForGraph.easycam.removeMouseListeners();
  } else if (key === "M") {
    graphicsForConfigurationSpace.easycam.attachMouseListeners(graphicsForConfigurationSpace._renderer);
    graphicsForGraph.easycam.attachMouseListeners(graphicsForGraph._renderer);
  }
}

function keyReleased() {
  flags[keyCode] = false;
  if (keyCode === SHIFT || key === "a" || key === "b") {
    parameters.mode = "View";
    updateMode();
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

// Strings

function labelToString(L) {
  result = "";
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

function lineV(graphLayout, A, B) {
  if (graphLayout.layout3D) {
    graphLayout.graphics.line(A.x, A.y, A.z, B.x, B.y, B.z);
  } else {
    graphLayout.graphics.line(A.x, A.y, B.x, B.y);
  }
}

function checkIfArrayIsUnique(myArray) {
  return myArray.length === new Set(myArray).size;
}

const flatten = (arr) => [].concat.apply([], arr);

const product = (...sets) => sets.reduce((acc, set) => flatten(acc.map((x) => set.map((y) => [...x, y]))), [[]]);

function arraysEqual(a1, a2) {
  /* WARNING: arrays must not contain {objects} or behavior may be undefined */
  return JSON.stringify(a1) == JSON.stringify(a2);
}

function is_state(p) {
  return checkIfArrayIsUnique(p.flat());
}

function toggleForSelectedNode() {
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
