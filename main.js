let graph, graphLayout;
let graphs = {};
let graphicsGraph, graphicsConfigSpace;
let configuration_space, configuration_spaceLayout;
let easycam, cameraState;
let font;
let robotAhue = 0;
let robotBhue = 60;

let temperature = 1.0;
let cold = 0.001;
let coolingRate = 0.03;

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
  if (graphicsGraph !== undefined) {
    graphicsGraph.remove();
  }
  if (graphicsConfigSpace !== undefined) {
    graphicsConfigSpace.remove();
  }
}

function initGraphicsGraph(w, h) {
  graphicsGraph = createGraphics(w, h, WEBGL);
  graphicsGraph.parent("graph");
  graphicsGraph.colorMode(HSB, 255);
  graphicsGraph.pixelDensity(2);
  graphicsGraph.show();
  setupEasyCam(graphicsGraph);
}

function initGraphicsConfigSpace(w, h) {
  graphicsConfigSpace = createGraphics(w, h, WEBGL);
  graphicsConfigSpace.parent("configspace");
  graphicsConfigSpace.colorMode(HSB, 255);
  graphicsConfigSpace.pixelDensity(2);
  graphicsConfigSpace.show();
  setupEasyCam(graphicsConfigSpace);
  // Additional settings
  addScreenPositionFunction(graphicsConfigSpace);
}

function init() {
  initView(viewingStyle);
  initGraph(parameters.graphType);
  initGUI();
}

function toggleView() {
  if (viewingStyle === "dual") {
    initView("single");
  } else if (viewingStyle === "single") {
    initView("dual");
  }
  init();
}

function initView(style) {
  viewingStyle = style;
  resetCanvases();
  if (style === "single") {
    initGraphicsGraph(0, windowHeight);
    initGraphicsConfigSpace(windowWidth, windowHeight);
  } else if (viewingStyle === "dual") {
    initGraphicsGraph(windowWidth / 2, windowHeight);
    initGraphicsConfigSpace(windowWidth / 2, windowHeight);
  }

  if (parameters.lights) {
    // Lights for graph
    graphicsGraph.ambientLight(0, 0, 255);
    graphicsGraph.directionalLight(0, 0, 255, -1, 0, 0);

    // Lights for config space
    graphicsConfigSpace.ambientLight(0, 0, 220);
    graphicsConfigSpace.directionalLight(0, 0, 255, -1, 0, 0);
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
    graph.moveRobots();
  }

  graph.show();
  configuration_space.show();

  if (takeScreenshotGraph) {
    takeScreenshotGraph = false;
    let time =
      str(year()) +
      ("0" + str(month())).slice(-2) +
      ("0" + str(day())).slice(-2) +
      "_" +
      ("0" + str(hour())).slice(-2) +
      ("0" + str(hour())).slice(-2) +
      ("0" + str(second())).slice(-2);
    let type = parameters.graphType.slice();
    saveCanvas(graph.graphLayout.graphics, time + "-" + type + "-graph.png");
  }
  if (takeScreenshotConfigSpace) {
    takeScreenshotConfigSpace = false;
    let time =
      str(year()) +
      ("0" + str(month())).slice(-2) +
      ("0" + str(day())).slice(-2) +
      "_" +
      ("0" + str(hour())).slice(-2) +
      ("0" + str(hour())).slice(-2) +
      ("0" + str(second())).slice(-2);
    let type = parameters.graphType.slice();
    saveCanvas(
      configuration_space.graphLayout.graphics,
      time + "-" + type + "-configspace.png"
    );
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

function setupEasyCam(g) {
  let easycam = createEasyCam(g._renderer, {
    distance: 2000,
  });
  easycam.setDistanceMin(10);
  easycam.setDistanceMax(3000);
  easycam.attachMouseListeners(g._renderer);
  easycam.setViewport([
    g.elt.offsetLeft,
    g.elt.offsetTop,
    g.elt.offsetWidth,
    g.elt.offsetHeight,
  ]);
  g.easycam = easycam;
}

// Parameters

function initParameters() {
  parameters.graphType = "C(7)";
  parameters.distinguishDots = !true;
  parameters.gridOn = !true;
  parameters.squareOn = true;
  parameters.granularity = 40;
  parameters.showText = !true;
  parameters.sphereView = true;
  parameters.lights = true;
  parameters.moveDotsRandomly = true;
  parameters.robotASpeed = 0.0005;
  parameters.robotBSpeed = 0.0005;
}

// GUI setup

function initGUI() {
  if (gui !== undefined) gui.destroy();

  gui = new dat.GUI({
    autoPlace: false,
  });

  // Choose graph
  let globalUI = gui.addFolder("Choose graph");
  let graphPicker = globalUI.add(parameters, "graphType", [
    "K(1,2)",
    "K(1,3)",
    "K(1,4)",
    "K(2,2)",
    "K(2,3)",
    "K(2,4)",
    "K(3,3)",
    "K(3,4)",
    "K(4,4)",
    "K(3)",
    "K(4)",
    "K(5)",
    "K(6)",
    "C(3)",
    "C(4)",
    "C(5)",
    "C(6)",
    "C(7)",
  ]);
  globalUI.open();
  graphPicker.onFinishChange(function (value) {
    initView(viewingStyle);
    initGraph(value);
  });

  // Visual
  let visualGUI = gui.addFolder("Visuals");
  visualGUI.add(parameters, "showText");
  visualGUI.add(graph.graphLayout, "nodeSize", 0, 40);
  visualGUI.add(graph.graphLayout, "edgeWidth", 0, 10);
  visualGUI.add(configuration_space.graphLayout, "nodeSize", 0, 40);
  visualGUI.add(configuration_space.graphLayout, "edgeWidth", 0, 10);
  visualGUI.add(parameters, "granularity", 0, 40).step(1);
  visualGUI.add(parameters, "gridOn");
  visualGUI.add(parameters, "squareOn");
  visualGUI.add(parameters, "sphereView");
  let lightsChange = visualGUI.add(parameters, "lights");
  lightsChange.onFinishChange(function (value) {
    init();
  });
  visualGUI.add(parameters, "moveDotsRandomly");
  visualGUI.add(parameters, "robotASpeed", 0, 0.1);
  visualGUI.add(parameters, "robotBSpeed", 0, 0.1);
  visualGUI.open();

  // Graph
  let graphGUI = gui.addFolder("Graph");
  graphGUI.add(graph.graphLayout, "edgelength", 0, 200);
  graphGUI.add(graph.graphLayout, "maxspeed", 0, 1000);
  graphGUI.add(graph.graphLayout, "neighborattraction", 0, 0.1);
  graphGUI.add(graph.graphLayout, "cohesionthreshold", 0, 2);
  graphGUI.add(graph.graphLayout, "repulsion", 0, 100000);
  graphGUI.add(graph.graphLayout, "separationFactor", 0, 3);
  graphGUI.add(graph.graphLayout, "centerAttraction");
  graphGUI.add(graph.graphLayout, "moveToCenter");
  // graphGUI.open();

  // Configuration Space
  let configGUI = gui.addFolder("Configuration Space");
  configGUI.add(
    configuration_space.graphLayout,
    "firstCoordinateForce",
    1,
    1000
  );
  configGUI.add(
    configuration_space.graphLayout,
    "secondCoordinateForce",
    1,
    1000
  );
  configGUI.add(configuration_space.graphLayout, "edgelength", 0, 200);
  configGUI.add(configuration_space.graphLayout, "maxspeed", 0, 1000);
  configGUI.add(configuration_space.graphLayout, "neighborattraction", 0, 0.1);
  configGUI.add(configuration_space.graphLayout, "cohesionthreshold", 0, 2);
  configGUI.add(configuration_space.graphLayout, "repulsion", 0, 100000);
  configGUI.add(configuration_space.graphLayout, "separationFactor", 0, 3);
  configGUI.add(configuration_space.graphLayout, "centerAttraction");
  configGUI.add(configuration_space.graphLayout, "moveToCenter");
  // configGUI.open();

  // Place in DOM
  var customContainer = document.getElementById("gui");
  customContainer.appendChild(gui.domElement);
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
  }


  graph.createGraphLayout(graphicsGraph, true);
  configuration_space = new Configuration_space(graph, 2);
  configuration_space.createGraphLayout(graphicsConfigSpace, true);

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
    if (robotAmoving) {
      this.robotA.move(parameters.robotASpeed);
    }
    if (robotBmoving) {
      this.robotB.move(parameters.robotBSpeed);
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

    this.robotA = new Robot(this, this.graphLayout.nodes[0], robotAhue);
    this.robotB = new Robot(this, this.graphLayout.nodes[1], robotBhue);

    this.graphLayout.initlayout();
  }
}

class Configuration_space {
  constructor(graph, dimension) {
    this.dimension = dimension;
    this.positions = graph.nodes.concat(graph.edges);
    // todo: generalize and use dimension
    let possible_states = cartesianProductOf(this.positions, this.positions);
    this.states = possible_states.filter(is_state);
    if (!verbose) print("States:");
    if (!verbose) print(this.states);
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

  getStates(degree) {
    let result = [];
    for (let state of this.states) {
      if (flatten(state).length - this.dimension === degree) {
        result.push(state);
      }
    }
    return result;
  }

  createGraphLayout(graphics, layout3D) {
    this.graphLayout = new GraphLayout(this, graphics, layout3D);
    this.graphLayout.showConfiguration = true;

    let states_0 = this.getStates(0);
    let states_1 = this.getStates(1);
    let states_2 = this.getStates(2);

    // Create nodes
    for (let state of states_0) {
      if (verbose) print("state_1:");
      if (verbose) print(state);
      this.graphLayout.addNode(state);
    }

    // Create edges
    for (let state of states_1) {
      if (verbose) print("state_1:");
      if (verbose) print(state);
      if (Array.isArray(state[0])) {
        // [[1,2], 0] gives [1,0] and [2,0]
        let nodeFrom = this.graphLayout.getNode([state[0][0], state[1]]);
        let nodeTo = this.graphLayout.getNode([state[0][1], state[1]]);
        this.graphLayout.addEdge(state, nodeFrom, nodeTo);
      } else if (Array.isArray(state[1])) {
        // [0, [1,2]] gives [0,1] and [0,2]
        let labelA = [state[0], state[1][0]];
        let nodeFrom = this.graphLayout.getNode(labelA);
        if (verbose) print("nodeFrom:");
        if (verbose) print(nodeFrom);
        let nodeTo = this.graphLayout.getNode([state[0], state[1][1]]);
        this.graphLayout.addEdge(state, nodeFrom, nodeTo);
      } else {
        if (verbose) print("error");
      }
    }

    // Create squares
    for (let state of states_2) {
      if (verbose) print("state_2:");
      if (verbose) print(state);
      let edgeAfrom = this.graphLayout.getEdge(state[0][0], state[1]);
      let edgeAto = this.graphLayout.getEdge(state[0][1], state[1]);
      let edgeBfrom = this.graphLayout.getEdge(state[0], state[1][0]);
      let edgeBto = this.graphLayout.getEdge(state[0], state[1][1]);
      this.graphLayout.addSquare(state, edgeAfrom, edgeAto, edgeBfrom, edgeBto);
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
    this.nodeSize = 20.0;
    this.nodeBorder = true;
    this.nodeBorderWidth = 0.05;
    this.showNodes = true;

    this.edges = [];
    this.showEdges = true;
    this.edgeWidth = 4.5;
    this.edgelength = 100;

    this.squares = [];
    this.showSquares = true;

    this.showRobots = true;

    this.centerAttraction = !true;
    this.moveToCenter = true;

    this.firstCoordinateForce = 100;
    this.secondCoordinateForce = 100;

    this.center = createVector(0, 0, 0);

    this.heat = 1.0;
    this.coolDown = 0.01;

    this.maxspeed = 180;
    this.neighborattraction = 0.01;
    this.cohesionthreshold = 0;
    this.cohesionFactor = 1.0;

    this.repulsion = 10000;
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

  update() {
    if (running) {
      if (this.moveToCenter) {
        let centerAdjustmentX = 0;
        let centerAdjustmentY = 0;
        let centerAdjustmentZ = 0;
        for (let node of this.nodes) {
          centerAdjustmentX +=
            (-node.position.x + this.center.x) / this.nodes.length;
          centerAdjustmentY +=
            (-node.position.y + this.center.y) / this.nodes.length;
          centerAdjustmentZ +=
            (-node.position.z + this.center.z) / this.nodes.length;
        }
        for (let node of this.nodes) {
          if (!node.frozen)
            node.position.add(
              0.1 * centerAdjustmentX,
              0.1 * centerAdjustmentY,
              0.1 * centerAdjustmentZ
            );
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

  show() {
    this.graphics.colorMode(HSB, 255);
    this.graphics.background(255);

    if (this.showSquares) {
      for (let square of this.squares) square.show();
    }

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
        let position = p5.Vector.lerp(
          robot.nodeFrom.position,
          robot.nodeTo.position,
          robot.amount
        );
        robot.show(position);
      }
    }

    if (this.showConfiguration) {
      this.configuration.show();
    }

    this.counter++;
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

  mousePressed() {
    // print(mouseX);
    // print(mouseY);
    let mousePos = new createVector(mouseX, mouseY);
    qtree = new QuadTree(new Rectangle(0, 0, width, height), 4);
    for (let node of nodes) qtree.insertNode(node);
    let range = new Circle(mouseX, mouseY, nodeSize, nodeSize);
    let nodesClose = qtree.query(range);
    let closestDistance = width;
    let closest;
    for (let qtreedata of nodesClose) {
      let node = qtreedata.userData;
      let d = p5.Vector.dist(mousePos, node.position);
      if (d < closestDistance && d < nodeSize) {
        closest = node;
        closestDistance = d;
      }
    }
  }

  getNode(label) {
    for (let node of this.nodes) {
      if (arraysEqual(node.label, label)) {
        return node;
      }
    }
    if (verbose) print("returning false");
    return false;
  }

  getEdge(labelA, labelB) {
    if (verbose) print("getEdge: ");
    if (verbose) print(labelA);
    if (verbose) print(labelB);
    for (let edge of this.edges) {
      if (arraysEqual([labelA, labelB], edge.label)) {
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
      print(square.label);
      if (arraysEqual([labelA, labelB], square.label)) {
        if (verbose) print("FOUND!");
        if (verbose) print(square);
        return square;
      }
    }
  }

  addNode(label) {
    if (verbose) print("adding node " + label);
    let r = 1000;
    let node = new Node(
      this,
      label,
      random(-r, r),
      random(-r, r),
      random(-r, r)
    );
    this.nodes.push(node);
  }

  addEdge(label, nodeFrom, nodeTo) {
    if (verbose) print("adding edge " + label);
    if (verbose) print("connecting:");
    if (verbose) print(nodeFrom.label + " to " + nodeTo.label);
    let edge = new Edge(this, label, nodeFrom, nodeTo);
    this.edges.push(edge);
    nodeTo.connectTo(nodeFrom);
    nodeFrom.connectTo(nodeTo);
  }

  addSquare(label, edgeAfrom, edgeAto, edgeBfrom, edgeBto) {
    let square = new Square(
      this,
      label,
      edgeAfrom,
      edgeAto,
      edgeBfrom,
      edgeBto
    );
    this.squares.push(square);
  }
}

class Node {
  constructor(graphlayout, label, x, y, z) {
    this.graphlayout = graphlayout;
    this.graphics = graphlayout.graphics;
    this.labelText = labelToString(label);
    this.label = label;
    if (verbose) print(label);
    this.active = false;
    if (graphlayout.layout3D) {
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
    this.nodesInRange = [];
    // this.history = new Array(historyLength).fill(this.position);
  }

  connectTo(node) {
    this.neighbors.push(node);
  }

  connectToDiagonally(node) {
    this.squareneighbors.push(node);
  }

  update(nodes) {
    let sep = this.separate(nodes);
    let coh = this.cohese(this.graphlayout.edgelength, this.neighbors);
    let cohA = this.cohese(
      this.graphlayout.firstCoordinateForce,
      this.neighbors.filter((neighbor) => neighbor.label[0] === this.label[0])
    );
    let cohB = this.cohese(
      this.graphlayout.secondCoordinateForce,
      this.neighbors.filter((neighbor) => neighbor.label[1] === this.label[1])
    );
    let coh2 = this.cohese(100, this.squareneighbors);

    sep.mult(this.graphlayout.separationFactor);
    coh.mult(0 * this.graphlayout.cohesionFactor);
    cohA.mult(1 * this.graphlayout.cohesionFactor);
    cohB.mult(1 * this.graphlayout.cohesionFactor);
    coh2.mult(0 * this.graphlayout.cohesionFactor);

    this.acceleration.add(sep);
    this.acceleration.add(coh);
    this.acceleration.add(cohA);
    this.acceleration.add(cohB);
    this.acceleration.add(coh2);

    // todo: find all squares containing this node
    // then, seek towards plane defined by three other nodes
    // perhaps easier to do this for each square
    // tell each square to “straighten out”

    if (this.graphlayout.centerAttraction) {
      let cen = this.seek(this.graphlayout.center);
      this.acceleration.add(cen);
    }
  }

  move() {
    if (!this.frozen) {
      limitVector(this.velocity, this.graphlayout.maxspeed);
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
        diff.normalize().mult(this.graphlayout.repulsion / (d * d));
        sum.add(diff);
      }
    }
    return sum;
  }

  cohese(edgelength, relevantnodes) {
    let sum = new createVector(0, 0, 0);
    for (let other of relevantnodes) {
      let diff = p5.Vector.sub(this.position, other.position);
      let d = diff.mag() - edgelength;
      if (abs(d) > this.graphlayout.cohesionthreshold) {
        diff.setMag(-this.graphlayout.neighborattraction * d);
        sum.add(diff);
      }
    }
    limitVector(sum, edgelength);
    return sum;
  }

  seek(goal) {
    let diff = p5.Vector.sub(this.position, this.graphlayout.center);
    let d = diff.mag();
    if (abs(d) > this.graphlayout.cohesionthreshold) {
      diff.setMag(-0.01 * d);
    }
    return diff;
  }

  show() {
    if (this.nodeBorder) {
      this.graphics.stroke(150);
      this.graphics.strokeWeight(v.nodeSize * this.graphlayout.nodeBorderWidth);
    } else {
      this.graphics.noStroke();
    }

    let thisSize = this.graphlayout.nodeSize;

    // Draw node
    if (this.graphlayout.layout3D) {
      this.graphics.push();
      this.graphics.translate(
        this.position.x,
        this.position.y,
        this.position.z
      );

      if (this.active) {
        this.graphics.fill(0, 255, 255);
      } else {
        this.graphics.fill(0, 0, 190);
      }

      if (parameters.sphereView) {
        // Two last arguments are sphere detail.
        this.graphics.sphere(0.5 * thisSize, 10, 10);
      } else {
        // Rotate such that ellipse faces front
        let rotation = this.graphics.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(
          rotation[0],
          rotation[1],
          rotation[2],
          rotation[3]
        );
        this.graphics.rotateX(-rotXYZ[0]);
        this.graphics.rotateY(-rotXYZ[1]);
        this.graphics.rotateZ(-rotXYZ[2]);
        // Draw the ellipse a little in front
        this.graphics.translate(0, 0, 0.5 * thisSize);
        this.graphics.stroke(0);
        this.graphics.strokeWeight(1.0);
        this.graphics.ellipse(0, 0, thisSize, thisSize);
      }
      this.graphics.pop();
    }

    // Draw text
    if (parameters.showText) {
      this.graphics.fill(0, 0, 0);
      this.graphics.textAlign(CENTER, CENTER);
      this.graphics.textFont(font);
      this.graphics.textSize(30);
      if (this.graphlayout.layout3D) {
        // 3D layout
        let rotation = this.graphics.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(
          rotation[0],
          rotation[1],
          rotation[2],
          rotation[3]
        );
        this.graphics.push();
        this.graphics.translate(
          this.position.x,
          this.position.y,
          this.position.z
        );
        this.graphics.rotateX(-rotXYZ[0]);
        this.graphics.rotateY(-rotXYZ[1]);
        this.graphics.rotateZ(-rotXYZ[2]);
        this.graphics.translate(0, 0, 0.75 * thisSize);
        this.graphics.text(this.labelText, 0, 0);
        this.graphics.pop();
      } else {
        // 2D layout
        this.graphics.push();
        this.graphics.translate(
          this.position.x,
          this.position.y,
          this.position.z
        );
        this.graphics.text(this.labelText, 0, 0);
        this.graphics.pop();
      }
    }
  }

  hasNodes() {
    return this.nodesInRange.length > 0;
  }
}

class Edge {
  constructor(graphlayout, label, nodeFrom, nodeTo) {
    this.graphlayout = graphlayout;
    this.graphics = graphlayout.graphics;
    this.label = label;
    this.nodeFrom = nodeFrom;
    this.nodeTo = nodeTo;
    this.subPoints = [];
    if (Array.isArray(this.nodeFrom.label) && Array.isArray(this.nodeTo.label)) {
      if (this.nodeFrom.label[0] === this.nodeTo.label[0]) {
        this.coordinate = 0;
      } else if (this.nodeFrom.label[1] === this.nodeTo.label[1]) {
        this.coordinate = 1;
      } else {
        print("ERRRORR");
      }
    } else {
      this.coordinate = -1;
    }

    for (let n = 1; n < parameters.granularity; n++) {
      this.subPoints[n] = p5.Vector.lerp(
        this.nodeFrom.position,
        this.nodeTo.position,
        (1.0 * n) / parameters.granularity
      );
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

  show() {
    if (this.coordinate === -1) {
      this.graphics.stroke(0, 0, 0, 255);
    } else if (this.coordinate === 1) {
      this.graphics.stroke(0, 200, 200, 255);
    } else if (this.coordinate === 0) {
      this.graphics.stroke(85, 200, 200, 255);
    }

    this.graphics.strokeWeight(this.graphlayout.edgeWidth);
    lineV(this.graphlayout, this.nodeFrom.position, this.nodeTo.position);

    for (let n = 1; n < parameters.granularity; n++) {
      this.subPoints[n] = p5.Vector.lerp(
        this.nodeFrom.position,
        this.nodeTo.position,
        (1.0 * n) / parameters.granularity
      );
      // this.graphics.push();
      // this.graphics.translate(
      //   this.subPoints[n].x,
      //   this.subPoints[n].y,
      //   this.subPoints[n].z);
      // this.graphics.fill(0, 0, 128);
      // this.graphics.stroke(0);
      // this.graphics.strokeWeight(1);
      // this.graphics.ellipse(0, 0, 5, 5);
      // this.graphics.pop();
    }
  }
}

class Square {
  constructor(graphlayout, label, edgeAfrom, edgeAto, edgeBfrom, edgeBto) {
    this.graphlayout = graphlayout;
    this.graphics = graphlayout.graphics;
    this.label = label;
    // edgeA refers to the first edge in the graph
    // edgeB refers to the second edge in the graph
    this.edgeAfrom = edgeAfrom;
    this.edgeAto = edgeAto;
    this.edgeBfrom = edgeBfrom;
    this.edgeBto = edgeBto;
    this.hue = random(0, 30);
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
    if (parameters.gridOn) {
      this.graphics.stroke(this.hue, 255, 255, 255);
      this.graphics.strokeWeight(1.0);
      for (let n = 1; n < parameters.granularity; n++) {
        let a = this.edgeAfrom.subPoints[n];
        let b = this.edgeAto.subPoints[n];
        this.graphics.stroke(0, 200, 200, 255);
        this.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      for (let n = 1; n < parameters.granularity; n++) {
        let a = this.edgeBfrom.subPoints[n];
        let b = this.edgeBto.subPoints[n];
        this.graphics.stroke(85, 200, 200, 255);
        this.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    if (parameters.squareOn) {
      this.graphics.noStroke();
      this.graphics.fill(this.hue, 255, 255, 200);
      this.graphics.beginShape();
      this.graphics.vertex(
        this.edgeAfrom.nodeFrom.position.x,
        this.edgeAfrom.nodeFrom.position.y,
        this.edgeAfrom.nodeFrom.position.z
      );
      this.graphics.vertex(
        this.edgeAfrom.nodeTo.position.x,
        this.edgeAfrom.nodeTo.position.y,
        this.edgeAfrom.nodeTo.position.z
      );
      this.graphics.vertex(
        this.edgeAto.nodeTo.position.x,
        this.edgeAto.nodeTo.position.y,
        this.edgeAto.nodeTo.position.z
      );
      this.graphics.vertex(
        this.edgeAto.nodeFrom.position.x,
        this.edgeAto.nodeFrom.position.y,
        this.edgeAto.nodeFrom.position.z
      );
      this.graphics.endShape(CLOSE);
    }
  }
}

class Robot {
  constructor(graph, node, hue) {
    // The graph is the abstract one with just labels.s
    this.graph = graph;
    // The node is from the graphLayout, because we then have neighbors.
    this.nodeFrom = node;
    this.nodeTo = node; // Initial placement. //pickRandomNeighbor();
    this.amount = 0;
    this.hue = hue;
  }

  occupyingNodes() {
    return [this.nodeFrom, this.nodeTo];
  }

  getRandomNeighbor() {
    let candidates = this.nodeFrom.neighbors.filter(x => !this.graph.otherRobot(this).occupyingNodes().includes(x));
    if (candidates.length > 0) {
      return candidates[floor(random(candidates.length))];
    } else {
      return false;
    }
  }

  move(amount) {
    if (this.amount === 0) {
      let nextNode = this.getRandomNeighbor();
      if (nextNode) {
        this.nodeTo = nextNode;
      } else {
        return false;
      }
    }
    this.amount += amount;
    if (this.amount >= 1) {
      this.amount = 0;
      this.nodeFrom = this.nodeTo;
    }
  }

  show(position) {
    if (this.nodeBorder) {
      this.graph.graphLayout.graphics.stroke(150);
      this.graph.graphLayout.graphics.strokeWeight(
        this.graph.graphLayout.nodeSize * this.graphLayout.nodeBorderWidth
      );
    } else {
      this.graph.graphLayout.graphics.noStroke();
    }

    let thisSize = this.graph.graphLayout.nodeSize;
    this.graph.graphLayout.graphics.fill(this.hue, 200, 200);

    // Draw node
    if (this.graph.graphLayout.layout3D) {
      this.graph.graphLayout.graphics.push();
      this.graph.graphLayout.graphics.translate(position.x, position.y, position.z);
      if (parameters.sphereView) {
        this.graph.graphLayout.graphics.sphere(0.55 * thisSize, 10, 10);
      } else {
        let rotation = this.graph.graphLayout.graphics.easycam.getRotation();
        let rotXYZ = QuaternionToEuler(
          rotation[0],
          rotation[1],
          rotation[2],
          rotation[3]
        );
        this.graph.graphLayout.graphics.rotateX(-rotXYZ[0]);
        this.graph.graphLayout.graphics.rotateY(-rotXYZ[1]);
        this.graph.graphLayout.graphics.rotateZ(-rotXYZ[2]);
        this.graph.graphLayout.graphics.translate(0, 0, 0.5 * thisSize);
        this.graph.graphLayout.graphics.ellipse(0, 0, thisSize, thisSize);
      }
      this.graph.graphLayout.graphics.pop();
    }
  }
}

class Configuration {
  constructor(graphLayout, robotA, robotB) {
    print(graphLayout);
    this.graphLayout = graphLayout;
    this.robotA = robotA;
    this.robotB = robotB;
  }

  show() {
    let thisSize = this.graphLayout.nodeSize;
    let position;

    if (this.robotA.amount === 0 && this.robotB.amount === 0) {
      let stateLabel = [this.robotA.nodeFrom.label, this.robotB.nodeFrom.label];
      let state = this.graphLayout.getNode(stateLabel);
      position = state.position;
    } else if (this.robotA.amount > 0 && this.robotB.amount === 0) {
      let stateFromLabel = [this.robotA.nodeFrom.label, this.robotB.nodeFrom.label];
      let stateToLabel = [this.robotA.nodeTo.label, this.robotB.nodeFrom.label];
      let stateFrom = this.graphLayout.getNode(stateFromLabel);
      let stateTo = this.graphLayout.getNode(stateToLabel);
      position = p5.Vector.lerp(stateFrom.position, stateTo.position, this.robotA.amount);

    } else if (this.robotA.amount === 0 && this.robotB.amount > 0) {
      let stateFromLabel = [this.robotA.nodeFrom.label, this.robotB.nodeFrom.label];
      let stateToLabel = [this.robotA.nodeFrom.label, this.robotB.nodeTo.label];
      let stateFrom = this.graphLayout.getNode(stateFromLabel);
      let stateTo = this.graphLayout.getNode(stateToLabel);
      position = p5.Vector.lerp(stateFrom.position, stateTo.position, this.robotB.amount);
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

      let amountA = this.robotA.amount;
      let amountB = this.robotB.amount;
      let topLeft = this.graphLayout.getNode([this.robotA.nodeFrom.label, this.robotB.nodeFrom.label]).position;
      let topRight = this.graphLayout.getNode([this.robotA.nodeTo.label, this.robotB.nodeFrom.label]).position;
      let botLeft = this.graphLayout.getNode([this.robotA.nodeFrom.label, this.robotB.nodeTo.label]).position;
      let botRight = this.graphLayout.getNode([this.robotA.nodeTo.label, this.robotB.nodeTo.label]).position;
      let topX = p5.Vector.lerp(topLeft, topRight, amountA);
      let botX = p5.Vector.lerp(botLeft, botRight, amountA);
      position = p5.Vector.lerp(topX, botX, amountB);
    }

    this.graphLayout.graphics.push();
    this.graphLayout.graphics.translate(position.x, position.y, position.z);
    this.graphLayout.graphics.fill(180, 255, 255);
    this.graphLayout.graphics.noStroke();

    if (parameters.sphereView) {
      this.graphLayout.graphics.sphere(0.55 * thisSize, 10, 10);
    } else {
      let rotation = this.graphLayout.graphics.easycam.getRotation();
      let rotXYZ = QuaternionToEuler(
        rotation[0],
        rotation[1],
        rotation[2],
        rotation[3]
      );
      this.graphLayout.graphics.rotateX(-rotXYZ[0]);
      this.graphLayout.graphics.rotateY(-rotXYZ[1]);
      this.graphLayout.graphics.rotateZ(-rotXYZ[2]);
      this.graphLayout.graphics.translate(0, 0, 0.5 * thisSize);
      this.graphLayout.graphics.ellipse(0, 0, thisSize, thisSize);
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
      if (F !== T) {
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

// Mouse

function mouseWheel(event) {
  return false;
}

function mousePressed() {
  reheat();
  // forcesActive = false;
  configuration_space.graphLayout.moveToCenter = false;
  graph.graphLayout.moveToCenter = false;
  cameraState = graphicsConfigSpace.easycam.getState();

  // print(configuration_space.graphLayout.nodes[0].label);
  // print(configuration_space.graphLayout.nodes[0].position);
  // print(graphicsConfigSpace.screenPosition(configuration_space.graphLayout.nodes[0].position));

  // print(graphicsConfigSpace);
  // print(configuration_space.graphLayout.graphics);

  // print(mouseX + " , " + mouseY);
  // print(graphicsConfigSpace.easycam.viewport);

  let relativeMouseX =
    mouseX -
    graphicsConfigSpace.easycam.viewport[0] -
    graphicsConfigSpace.easycam.viewport[2] / 2;
  let relativeMouseY =
    mouseY -
    graphicsConfigSpace.easycam.viewport[1] -
    graphicsConfigSpace.easycam.viewport[3] / 2;

  let selectedNode;
  let selectedDistance;
  let mousePos = createVector(relativeMouseX, relativeMouseY);
  for (let node of configuration_space.graphLayout.nodes) {
    node.active = false;
    let distance = mousePos.dist(
      graphicsConfigSpace.screenPosition(node.position)
    );
    if (
      distance < 10 &&
      (selectedNode === undefined || distance < selectedDistance)
    ) {
      selectedNode = node;
      selectedDistance = distance;
    }
  }
  if (selectedNode !== undefined) selectedNode.active = true;
}

function mouseDragged() {
  reheat();
  // let rotation = graphicsConfigSpace.easycam.getRotation();
  // print("getRotation");
  // print(rotation);
  let movingNode;
  for (let node of configuration_space.graphLayout.nodes) {
    if (node.active === true) {
      movingNode = node;
    }
  }
  if (movingNode !== undefined) {
    graphicsConfigSpace.easycam.setState(cameraState, 0);
    let dst = applyToVec3(cameraState.rotation, [movedX, movedY, 0]);
    if (verbose) print(dst);
    let xMovement = dst[0];
    let yMovement = dst[1];
    let zMovement = dst[2];
    movingNode.position.add(xMovement, yMovement, zMovement);
  }
}

function mouseReleased() {
  // forcesActive = true;
  configuration_space.graphLayout.moveToCenter = true;
  graph.graphLayout.moveToCenter = true;
  for (let node of configuration_space.graphLayout.nodes) {
    node.active = false;
  }
}

// Keyboard

function keyPressed() {
  if (key === "r") init();
  else if (key === " ") running = !running;
  else if (key === "f") forcesActive = !forcesActive;
  else if (key === "t") parameters.showText = !parameters.showText;
  else if (key === "v") toggleView();
  else if (key === "a") robotAmoving = !robotAmoving;
  else if (key === "b") robotBmoving = !robotBmoving;
  else if (key === "s") takeScreenshotGraph = !takeScreenshotGraph;
  else if (key === "S") takeScreenshotConfigSpace = !takeScreenshotConfigSpace;
  else if (key === "m") {
    graphicsConfigSpace.easycam.removeMouseListeners();
    graphicsGraph.easycam.removeMouseListeners();
  } else if (key === "M") {
    graphicsConfigSpace.easycam.attachMouseListeners(
      graphicsConfigSpace._renderer
    );
    graphicsGraph.easycam.attachMouseListeners(graphicsGraph._renderer);
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
    [
      []
    ]
  );
}

// Strings

function labelToString(L) {
  result = "";
  if (Array.isArray(L)) {
    for (let l of L) {
      result += l + ",";
    }
    result = result.slice(0, -1);
    return result;
  } else {
    return L;
  }
}

// Helpers

function lineV(graphlayout, A, B) {
  if (graphlayout.layout3D) {
    graphlayout.graphics.line(A.x, A.y, A.z, B.x, B.y, B.z);
  } else {
    graphlayout.graphics.line(A.x, A.y, B.x, B.y);
  }
}

function checkIfArrayIsUnique(myArray) {
  return myArray.length === new Set(myArray).size;
}

const flatten = (arr) => [].concat.apply([], arr);

const product = (...sets) =>
  sets.reduce(
    (acc, set) => flatten(acc.map((x) => set.map((y) => [...x, y]))),
    [
      []
    ]
  );

function arraysEqual(a1, a2) {
  /* WARNING: arrays must not contain {objects} or behavior may be undefined */
  return JSON.stringify(a1) == JSON.stringify(a2);
}

function is_state(p) {
  return checkIfArrayIsUnique(p.flat());
}