"use strict";
let graph,
  graphicsForGraph,
  graphicsForConfigurationSpace,
  configuration_space,
  cameraState,
  areWeOnTheLeft,
  font,
  infoStrings,
  layoutStrings,
  chooseFile,
  syncViewToggle,
  gui,
  customGraph,
  infoDiv,
  warningWrapper,
  infoString,
  nodeSelectedForEdgeAddition,
  GUIS,
  verbose = !1,
  vverbose = !1,
  easyCamActive = !0,
  temperature = 1,
  cold = 0.001,
  coolingRate = 0,
  octForces = !1,
  graphIsCustomized = !1,
  parameters = {},
  takeScreenshotGraph = !1,
  takeScreenshotConfigSpace = !1,
  loadingFromFile = !1,
  forcesActive = !0,
  robotAmoving = !0,
  robotBmoving = !0,
  addSingleNodeMode = !1,
  deleteNodeMode = !1,
  selectedNodesInGraph = [],
  selectedNodesInConfigSpace = [];
function preload() {
  (font = loadFont("fonts/Myriad_Pro_6809.otf")), initParameters();
  let e = getURL(),
    t = split(e, "?");
  if (2 !== t.length) return;
  let o = t[1],
    r = {};
  for (let e of split(o, "&")) {
    let t = split(e, "=");
    r[t[0]] = t[1];
  }
  void 0 !== r.file &&
    (readFromFile(r.file),
    (takeScreenshotConfigSpace = !0),
    (loadingFromFile = !0));
}
function initParameters() {
  verbose && console.log("initParameters"),
    (parameters.graphType = "K(2,3)"),
    (parameters.mode = "View"),
    (parameters.running = !0),
    (parameters.darkMode = !1),
    (parameters.showGraph = !0),
    (parameters.showConfigurationspace = !0),
    (parameters.showInfo = !1),
    (parameters.showRobots = !1),
    (parameters.showHyperplanes = !1),
    (parameters.showLoops = !1),
    (parameters.syncView = !1),
    (parameters.debugMode = !1),
    (parameters.distinguishDots = !1),
    (parameters.gridOn = !1),
    (parameters.layoutPreset = "layout-00.txt"),
    (parameters.squareOn = !0),
    (parameters.granularityGraph = 4),
    (parameters.granularityFirstCoordinate = 4),
    (parameters.granularitySecondCoordinate = 4),
    (parameters.showText = !0),
    (parameters.sphereView = !0),
    (parameters.lights = !0),
    (parameters.moveDotsRandomly = !1),
    (parameters.robotASpeed = 0.1),
    (parameters.robotBSpeed = 0.1),
    (parameters.amountMultiplier = 0.05),
    (parameters.recordHistory = !1),
    (parameters.showHistory = !1),
    (parameters.dualView = !1),
    (parameters.sphereDetail = 20),
    (parameters.resetHistory = function () {
      configuration_space.graphLayout.configuration.resetHistory();
    }),
    (parameters.speedUp = 1),
    (parameters.labelX = 0),
    (parameters.labelY = 0),
    (parameters.labelZ = 2),
    (parameters.fontSize = 30),
    (parameters.colorRobotA = "#bb0000"),
    (parameters.colorRobotB = "#444444"),
    (parameters.colorConfig = "#4499ee"),
    (parameters.colorNode = "#999999"),
    (parameters.colorGraphEdge = "#4499ee"),
    (parameters.squareColor = "#888888"),
    (parameters.squareOpacity = 100),
    (parameters.activeDotColor = "#cc7700"),
    (parameters.deleteNodeColor = "#6600ff"),
    (parameters.selectedNodeForEdgeColor = "#4455bb"),
    (parameters.maxspeed = 300),
    (parameters.nodeSize = 20),
    (parameters.robotsNodeSize = 21),
    (parameters.configNodeSize = 21),
    (parameters.edgeWidthGraph = 4.5),
    (parameters.edgeWidthConfigSpace = 2),
    (parameters.edgeWidthGrid = 0.4),
    (parameters.THETA = 2.6);
}
function setup() {
  verbose && console.log("setup"),
    noCanvas(),
    setAttributes("antialias", !0),
    (infoDiv = select("#info")),
    (warningWrapper = select("#warningWrapper")),
    loadingFromFile ||
      (setParametersFromURL(),
      verbose && console.log("setup continues"),
      init());
}
function init() {
  verbose && console.log("init"),
    (selectedNodesInGraph = []),
    initView(),
    initGraph(parameters.graphType),
    initGUI();
}
function updateMode() {
  switch (
    (verbose && console.log("updateMode: " + parameters.mode), parameters.mode)
  ) {
    case "View":
      console.log("updateMode: View mode"), easyCamOn(), (deleteNodeMode = !1);
      break;
    case "Move":
      console.log("updateMode: Move mode"), easyCamOff(), (deleteNodeMode = !1);
  }
  verbose && console.log("updateMode: refresh tweakpane");
}
function initView() {
  if (
    (verbose && console.log("initView"),
    resetCanvases(),
    parameters.dualView
      ? (initgraphicsForGraph(windowWidth / 2, windowHeight),
        initgraphicsForConfigurationSpace(windowWidth / 2, windowHeight))
      : (initgraphicsForGraph(0, windowHeight),
        initgraphicsForConfigurationSpace(windowWidth, windowHeight)),
    parameters.lights)
  ) {
    let e = 180,
      t = 180;
    graphicsForGraph.ambientLight(e, e, e),
      graphicsForGraph.directionalLight(t, t, t, -1, 0, 0),
      graphicsForConfigurationSpace.ambientLight(e, e, e),
      graphicsForConfigurationSpace.directionalLight(t, t, t, -1, 0, 0);
  }
}
function draw() {
  if (
    (temperature > cold &&
      (tick(), graph.update(), configuration_space.update()),
    parameters.moveDotsRandomly)
  )
    for (let e = 0; e < parameters.speedUp; e++) graph.moveRobots();
  if (
    (graph.show(),
    configuration_space.show(),
    takeScreenshotGraph &&
      ((takeScreenshotGraph = !1),
      saveCanvas(graph.graphLayout.graphics, makeFileName("-graph") + ".png")),
    takeScreenshotConfigSpace)
  ) {
    takeScreenshotConfigSpace = !1;
    let e = makeFileName("-configspace") + ".png";
    verbose && console.log("taking screenshot of config space: " + e),
      saveCanvas(configuration_space.graphLayout.graphics, e);
  }
  mouseIsPressed && ourMouseDragged();
}
function initGraph(e) {
  if ((reheat(), verbose && print("initGraph: " + e), "random" === e))
    graph = randomGraph();
  else if ("custom" === e && void 0 !== customGraph)
    graph = new Graph(customGraph.nodes, customGraph.edges);
  else if ("K" === e.charAt(0)) {
    e = e.slice(2, -1);
    let t = split(e, ",");
    2 == t.length
      ? (graph = completeBipartiteGraph(int(t[0]), int(t[1])))
      : 1 == t.length && (graph = completeGraph(int(t[0])));
  } else if ("C" === e.charAt(0)) {
    e = e.slice(2, -1);
    let t = split(e, ",");
    1 == t.length && (graph = chainGraph(int(t[0])));
  } else if ("W" === e.charAt(0)) {
    e = e.slice(2, -1);
    let t = split(e, ",");
    1 == t.length && (graph = wheelGraph(int(t[0])));
  }
  graph.createGraphLayout(graphicsForGraph, !0),
    (configuration_space = new Configuration_space(graph, 2)),
    vverbose && print(configuration_space),
    verbose && print("initGraph: call updateURL"),
    updateURL();
}
function addNode(e, t, o) {
  let r = Math.max(...graph.nodes) + 1;
  graph.nodes.push(r);
  let a = graph.graphLayout.addNode(r, e, t, o);
  return (
    configuration_space.addStates(r),
    (graph.graphLayout.centerForce = Math.max(
      0.02,
      graph.graphLayout.centerForce
    )),
    (configuration_space.graphLayout.centerForce = Math.max(
      0.02,
      configuration_space.graphLayout.centerForce
    )),
    (addSingleNodeMode = !1),
    updateURL(),
    (graphIsCustomized = !0),
    a
  );
}
function deleteSelectedNodesOrEdges() {
  if (selectedNodesInGraph.length > 1)
    for (let e = 0; e < selectedNodesInGraph.length - 1; e++)
      for (let t = e + 1; t < selectedNodesInGraph.length; t++)
        deleteEdge(selectedNodesInGraph[e], selectedNodesInGraph[t]);
  else 1 == selectedNodesInGraph.length && deleteNode(selectedNodesInGraph[0]);
}
function deleteNode(e) {
  if (e.occupied())
    return void startWarning("This node is occupied and can not be deleted.");
  for (neighbor of (selectedNodesInGraph.splice(
    selectedNodesInGraph.indexOf(e),
    1
  ),
  e.neighbors))
    neighbor.neighbors = neighbor.neighbors.filter((t) => !(t === e));
  graph.nodes.splice(graph.nodes.indexOf(e.label), 1);
  let t = [],
    o = [];
  for (edge of graph.edges)
    edge.includes(e.label) ? o.push(edge) : t.push(edge);
  for (edge of ((graph.edges = t), o)) graph.graphLayout.deleteEdge(edge);
  graph.graphLayout.deleteNode(e.label),
    configuration_space.removeStates(e.label),
    (graphIsCustomized = !0),
    updateURL();
}
function deleteEdge(e, t) {
  verbose && console.log("deleteEdge()");
  let o = graph.graphLayout.getEdge(e.label, t.label);
  if (void 0 === o.owner) {
    if (!1 !== o && null == o.owner) {
      let r = o.label;
      (e.neighbors = e.neighbors.filter((e) => !(e === t))),
        (t.neighbors = t.neighbors.filter((t) => !(t === e))),
        verbose && console.log("deleting edge"),
        (graph.edges = graph.edges.filter((e) => !arraysEqual(e, r))),
        graph.graphLayout.deleteEdge(r),
        configuration_space.removeStates(r),
        (graphIsCustomized = !0),
        updateURL();
    }
  } else
    startWarning(
      "Not able to delete edge from " + e.label + " to " + t.label + "."
    );
}
function addEdgesForSelectedNodes() {
  for (let e = 0; e < selectedNodesInGraph.length - 1; e++)
    for (let t = e + 1; t < selectedNodesInGraph.length; t++)
      addEdge(selectedNodesInGraph[e], selectedNodesInGraph[t]);
}
function addEdge(e, t) {
  if (!1 === graph.graphLayout.getEdge(e.label, t.label)) {
    console.log("adding edge");
    let o = [e.label, t.label];
    graph.edges.push(o),
      graph.graphLayout.addEdge(o, e, t),
      configuration_space.addStates(o),
      (graphIsCustomized = !0),
      updateURL();
  } else console.log("not adding edge");
}
function pickBestCandidateForA(e, t) {
  let o,
    r = e.robotA.getCandidates(),
    a = PI / 2;
  for (let s of r) {
    let r = configuration_space.graphLayout.getNode([
        s.label,
        e.robotB.nodeFrom.label,
      ]).position,
      i = configuration_space.graphLayout.getNode([
        s.label,
        e.robotB.nodeTo.label,
      ]).position,
      n = e.position,
      h = p5.Vector.lerp(r, i, e.robotB.amount),
      p = graphicsForConfigurationSpace.screenPosition(n),
      d = graphicsForConfigurationSpace.screenPosition(h),
      c = p5.Vector.sub(d, p),
      g = abs(t.angleBetween(c));
    g < a && ((o = s), (a = g));
  }
  return o;
}
function pickBestCandidateForB(e, t) {
  let o,
    r = e.robotB.getCandidates(),
    a = PI / 2;
  for (let s of r) {
    let r = configuration_space.graphLayout.getNode([
        e.robotA.nodeFrom.label,
        s.label,
      ]).position,
      i = configuration_space.graphLayout.getNode([
        e.robotA.nodeTo.label,
        s.label,
      ]).position,
      n = e.position,
      h = p5.Vector.lerp(r, i, e.robotA.amount),
      p = graphicsForConfigurationSpace.screenPosition(n),
      d = graphicsForConfigurationSpace.screenPosition(h),
      c = p5.Vector.sub(d, p),
      g = abs(t.angleBetween(c));
    g < a && ((o = s), (a = g));
  }
  return o;
}
function checkIfArrayIsUnique(e) {
  return e.length === new Set(e).size;
}
function edgesContainEdge(e, t) {
  for (let o of e) {
    if (arraysEqual(o, t)) return !0;
    if (arraysEqual(o, [t[1], t[0]])) return !0;
  }
  return !1;
}
function is_state_ordered(e) {
  return checkIfArrayIsUnique(e.flat());
}
function is_state_unordered(e) {
  if (!checkIfArrayIsUnique(e.flat())) return !1;
  let t = flatten(e).length - 2;
  switch ((console.log(labelToString(e)), t)) {
    case 0:
      return console.log(e[0] < e[1]), e[0] < e[1];
    case 1:
      return (
        console.log("number" == typeof e[0] && e[1][0] < e[1][1]),
        "number" == typeof e[0] && e[1][0] < e[1][1]
      );
    case 2:
      return (
        console.log(
          e[0][0] < e[0][1] && e[1][0] < e[1][1] && e[0][0] < e[1][0]
        ),
        e[0][0] < e[0][1] && e[1][0] < e[1][1] && e[0][0] < e[1][0]
      );
  }
}
function toggleForSelectedNode() {
  console.log("toggleForSelectedNode");
  for (let e of graph.graphLayout.nodes)
    !0 === e.lastSelected &&
      ((e.applyExtraCenterForce = !e.applyExtraCenterForce),
      verbose && print(e.applyExtraCenterForce));
  for (let e of configuration_space.graphLayout.nodes)
    !0 === e.lastSelected &&
      ((e.applyExtraCenterForce = !e.applyExtraCenterForce),
      verbose && print(e.applyExtraCenterForce));
}
function setupEasyCam(e, t) {
  let o = createEasyCam(e._renderer, { distance: t });
  o.setDistanceMin(10),
    o.setDistanceMax(3e4),
    o.attachMouseListeners(e._renderer),
    o.setWheelScale(300),
    o.setViewport([
      e.elt.offsetLeft,
      e.elt.offsetTop,
      e.elt.offsetWidth,
      e.elt.offsetHeight,
    ]),
    (e.easycam = o);
}
function easyCamOff() {
  (easyCamActive = !1),
    graphicsForConfigurationSpace.easycam.removeMouseListeners(),
    graphicsForGraph.easycam.removeMouseListeners(),
    (forcesActive = !1),
    (configuration_space.graphLayout.moveToCenter = !1),
    (graph.graphLayout.moveToCenter = !1);
}
function easyCamOn() {
  (easyCamActive = !0),
    vverbose && print("easyCamOn"),
    graphicsForConfigurationSpace.easycam.attachMouseListeners(
      graphicsForConfigurationSpace._renderer
    ),
    graphicsForGraph.easycam.attachMouseListeners(graphicsForGraph._renderer),
    (forcesActive = !0),
    (configuration_space.graphLayout.moveToCenter = !0),
    (graph.graphLayout.moveToCenter = !0);
}
function setDualView(e) {
  (parameters.dualView = e),
    parameters.dualView
      ? (syncViewToggle.hidden = !1)
      : (syncViewToggle.hidden = !0),
    init();
}
class Configuration {
  constructor(e, t, o) {
    (this.graphLayout = e),
      (this.robotA = t),
      (this.robotB = o),
      (this.history = []),
      this.updatePosition(
        this.robotA.nodeFrom,
        this.robotA.nodeTo,
        this.robotA.amount,
        this.robotB.nodeFrom,
        this.robotB.nodeTo,
        this.robotB.amount
      );
  }
  updatePosition(e, t, o, r, a, s) {
    this.position = this.getPosition(e, t, o, r, a, s);
  }
  getPosition(e, t, o, r, a, s) {
    let i;
    if (0 === o && 0 === s) {
      let t = [e.label, r.label];
      i = this.graphLayout.getNode(t).position;
    } else if (o > 0 && 0 === s) {
      let a = [e.label, r.label],
        s = [t.label, r.label],
        n = this.graphLayout.getNode(a),
        h = this.graphLayout.getNode(s);
      i = p5.Vector.lerp(n.position, h.position, o);
    } else if (0 === o && s > 0) {
      let t = [e.label, r.label],
        o = [e.label, a.label],
        n = this.graphLayout.getNode(t),
        h = this.graphLayout.getNode(o);
      i = p5.Vector.lerp(n.position, h.position, s);
    } else {
      let n = this.graphLayout.getNode([e.label, r.label]).position,
        h = this.graphLayout.getNode([t.label, r.label]).position,
        p = this.graphLayout.getNode([e.label, a.label]).position,
        d = this.graphLayout.getNode([t.label, a.label]).position,
        c = p5.Vector.lerp(n, h, o),
        g = p5.Vector.lerp(p, d, o);
      i = p5.Vector.lerp(c, g, s);
    }
    return i;
  }
  getCrosshair(e, t, o, r, a, s) {
    let i = this.graphLayout.getNode([e.label, r.label]).position,
      n = this.graphLayout.getNode([t.label, r.label]).position,
      h = this.graphLayout.getNode([e.label, a.label]).position,
      p = this.graphLayout.getNode([t.label, a.label]).position;
    return [
      p5.Vector.lerp(i, n, o),
      p5.Vector.lerp(h, p, o),
      p5.Vector.lerp(i, h, s),
      p5.Vector.lerp(n, p, s),
    ];
  }
  getHyperplaneLine(e, t, o, r, a) {
    if (a) {
      let a = this.graphLayout.getNode([e.label, r[0]]).position,
        s = this.graphLayout.getNode([t.label, r[0]]).position,
        i = this.graphLayout.getNode([e.label, r[1]]).position,
        n = this.graphLayout.getNode([t.label, r[1]]).position;
      return [p5.Vector.lerp(a, s, o), p5.Vector.lerp(i, n, o)];
    }
    {
      let a = this.graphLayout.getNode([r[0], e.label]).position,
        s = this.graphLayout.getNode([r[0], t.label]).position,
        i = this.graphLayout.getNode([r[1], e.label]).position,
        n = this.graphLayout.getNode([r[1], t.label]).position;
      return [p5.Vector.lerp(a, s, o), p5.Vector.lerp(i, n, o)];
    }
  }
  record(e, t, o, r, a, s) {
    this.history.push([e, t, o, r, a, s]);
  }
  resetHistory() {
    this.history = [];
  }
  show() {
    if (parameters.showHistory)
      for (let e = 0; e < this.history.length - 1; e++) {
        let t = this.history[e],
          o = this.history[e + 1],
          r = this.getPosition(t[0], t[1], t[2], t[3], t[4], t[5]),
          a = this.getPosition(o[0], o[1], o[2], o[3], o[4], o[5]);
        this.graphLayout.graphics.stroke(0),
          this.graphLayout.graphics.strokeWeight(1),
          this.graphLayout.graphics.line(r.x, r.y, r.z, a.x, a.y, a.z);
      }
    this.showAt(
      this.robotA.nodeFrom,
      this.robotA.nodeTo,
      this.robotA.amount,
      this.robotB.nodeFrom,
      this.robotB.nodeTo,
      this.robotB.amount
    );
  }
  showAt(e, t, o, r, a, s) {
    this.updatePosition(e, t, o, r, a, s);
    let i = this.robotA.getAllPossibleEdges(),
      n = this.robotB.getAllPossibleEdges();
    if (parameters.showHyperplanes) {
      for (let e of i) {
        let t = this.getHyperplaneLine(r, a, s, e, !1),
          o = t[0],
          i = t[1];
        this.graphLayout.graphics.stroke(parameters.colorRobotA),
          this.graphLayout.graphics.strokeWeight(8),
          this.graphLayout.graphics.line(o.x, o.y, o.z, i.x, i.y, i.z);
      }
      for (let r of n) {
        let a = this.getHyperplaneLine(e, t, o, r, !0),
          s = a[0],
          i = a[1];
        this.graphLayout.graphics.stroke(parameters.colorRobotB),
          this.graphLayout.graphics.strokeWeight(8),
          this.graphLayout.graphics.line(s.x, s.y, s.z, i.x, i.y, i.z);
      }
    } else if (this.active) {
      let i = this.getCrosshair(e, t, o, r, a, s);
      if ((this.graphLayout.graphics.strokeWeight(8), 4 === i.length)) {
        let e = i[0],
          t = i[1];
        this.graphLayout.graphics.stroke(parameters.colorRobotB),
          this.graphLayout.graphics.line(e.x, e.y, e.z, t.x, t.y, t.z);
        let o = i[2],
          r = i[3];
        this.graphLayout.graphics.stroke(parameters.colorRobotA),
          this.graphLayout.graphics.line(o.x, o.y, o.z, r.x, r.y, r.z);
      }
    }
    if (
      (this.graphLayout.graphics.push(),
      this.graphLayout.graphics.translate(
        this.position.x,
        this.position.y,
        this.position.z
      ),
      this.graphLayout.graphics.noStroke(),
      this.active
        ? (this.graphLayout.graphics.fill(parameters.activeDotColor),
          this.graphLayout.graphics.ambientMaterial(parameters.activeDotColor))
        : (this.graphLayout.graphics.fill(parameters.colorConfig),
          this.graphLayout.graphics.ambientMaterial(parameters.colorConfig)),
      parameters.sphereView)
    ) {
      let e = parameters.sphereDetail;
      this.graphLayout.graphics.sphere(0.5 * parameters.configNodeSize, e, e);
    } else {
      let e = this.graphLayout.graphics.easycam.getRotation(),
        t = QuaternionToEuler(e[0], e[1], e[2], e[3]);
      this.graphLayout.graphics.rotateX(-t[0]),
        this.graphLayout.graphics.rotateY(-t[1]),
        this.graphLayout.graphics.rotateZ(-t[2]),
        this.graphLayout.graphics.translate(0, 0, 20),
        this.graphLayout.graphics.ellipse(
          0,
          0,
          parameters.configNodeSize,
          parameters.configNodeSize
        );
    }
    this.graphLayout.graphics.pop();
  }
}
class Configuration_space {
  constructor(e, t, o = !1) {
    (this.type = "configuration_space"),
      (this.ordered = o),
      (this.dimension = t);
    let r = e.nodes.concat(e.edges),
      a = cartesianProductOf(r, r);
    console.log(a.map(labelToString)),
      (this.states = a.filter(
        this.ordered ? is_state_ordered : is_state_unordered
      )),
      console.log(this.states),
      vverbose && console.log(this.states),
      vverbose && print("States:"),
      vverbose && print(this.states),
      this.createGraphLayout(graphicsForConfigurationSpace, !0);
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
  getDegree(e) {
    return flatten(e).length - this.dimension;
  }
  addStates(e) {
    let t = graph.nodes.concat(graph.edges),
      o = cartesianProductOf([e], t).concat(cartesianProductOf(t, [e]));
    vverbose && console.log("newPossibleStates"), vverbose && console.log(o);
    let r = o.filter(this.ordered ? is_state_ordered : is_state_unordered);
    for (let e of r) this.addStateToGraphLayout(e), this.states.push(e);
  }
  removeStates(e) {
    verbose && console.log("removeStates: " + e);
    let t = [],
      o = [];
    if (Array.isArray(e))
      for (let r of this.states)
        arraysEqual(e, r[0]) || arraysEqual(e, r[1]) ? o.push(r) : t.push(r);
    else
      for (let r of this.states) flatten(r).includes(e) ? o.push(r) : t.push(r);
    verbose && console.log("survivingStates"),
      verbose && console.log(t),
      verbose && console.log("statesToDelete"),
      verbose && console.log(o);
    for (let e of o) {
      switch (this.getDegree(e)) {
        case 0:
          console.log("deleteNode "),
            console.log(e),
            this.graphLayout.deleteNode(e);
          break;
        case 1:
          console.log("deleteEdge "),
            console.log(e),
            this.graphLayout.deleteEdge(e);
          break;
        case 2:
          console.log("deleteSquare "),
            console.log(e),
            this.graphLayout.deleteSquare(e);
      }
      this.states = t;
    }
  }
  addStateToGraphLayout(e) {
    switch (this.getDegree(e)) {
      case 0:
        vverbose && print("state_1:"),
          vverbose && print(e),
          this.graphLayout.addNode(e);
        break;
      case 1:
        if (
          (vverbose && print("state_1:"),
          vverbose && print(e),
          Array.isArray(e[0]))
        ) {
          let t = this.graphLayout.getNode([e[0][0], e[1]]),
            o = this.graphLayout.getNode([e[0][1], e[1]]);
          this.graphLayout.addEdge(e, t, o);
        } else if (Array.isArray(e[1])) {
          let t = this.graphLayout.getNode([e[0], e[1][0]]),
            o = this.graphLayout.getNode([e[0], e[1][1]]);
          vverbose && print("nodeFrom:"),
            vverbose && print(t),
            this.graphLayout.addEdge(e, t, o);
        } else vverbose && print("error");
        break;
      case 2:
        vverbose && print("state_2:"), vverbose && print(e);
        let t = this.graphLayout.getEdge(e[0][0], e[1], !0),
          o = this.graphLayout.getEdge(e[0][1], e[1], !0),
          r = this.graphLayout.getEdge(e[0], e[1][0], !0),
          a = this.graphLayout.getEdge(e[0], e[1][1], !0);
        vverbose && print(t),
          vverbose && print(o),
          this.graphLayout.addSquare(e, t, o, r, a);
    }
  }
  createGraphLayout(e, t) {
    verbose && console.log("createGraphLayout"),
      (this.graphLayout = new GraphLayout(this, e, t)),
      (this.graphLayout.showConfiguration = !0);
    for (let e of this.states) this.addStateToGraphLayout(e);
    (this.graphLayout.configuration = new Configuration(
      this.graphLayout,
      graph.robotA,
      graph.robotB
    )),
      this.graphLayout.initlayout();
  }
}
class Edge {
  constructor(e, t, o, r) {
    vverbose && console.log("new Edge"),
      vverbose && console.log("nodeFrom"),
      vverbose && console.log(o),
      vverbose && console.log("nodeTo"),
      vverbose && console.log(r),
      (this.graphLayout = e),
      (this.graphics = e.graphics),
      (this.label = t),
      (this.nodeFrom = o),
      (this.nodeTo = r),
      (this.subPoints = []),
      Array.isArray(this.nodeFrom.label) && Array.isArray(this.nodeTo.label)
        ? this.nodeFrom.label[0] === this.nodeTo.label[0]
          ? (this.edgeType = "robotBedge")
          : this.nodeFrom.label[1] === this.nodeTo.label[1]
          ? (this.edgeType = "robotAedge")
          : console.log()
        : (this.edgeType = "graphEdge"),
      this.createInnerNodes();
  }
  createInnerNodes() {
    (this.innerNodes = []),
      (this.innerEdges = []),
      "graphEdge" === this.edgeType
        ? (this.granularity = parameters.granularityGraph)
        : "robotBedge" === this.edgeType
        ? (this.granularity = parameters.granularityFirstCoordinate)
        : "robotAedge" === this.edgeType &&
          (this.granularity = parameters.granularitySecondCoordinate);
    for (let e = 0; e <= this.granularity; e++)
      this.innerNodes[e] = new InnerNode(
        this,
        this.graphLayout,
        e,
        p5.Vector.lerp(
          this.nodeFrom.position,
          this.nodeTo.position,
          (1 * e) / this.granularity
        ),
        1 / this.granularity
      );
    for (let e = 0; e < this.granularity; e++) {
      let t = this.innerNodes[e],
        o = this.innerNodes[e + 1];
      (this.innerEdges[e] = new InnerEdge(this, this.graphLayout, e, t, o)),
        "robotBedge" === this.edgeType
          ? (t.neighborsB.push(o), o.neighborsB.push(t))
          : "robotAedge" === this.edgeType &&
            (t.neighborsA.push(o), o.neighborsA.push(t));
    }
  }
  amountAlong(e) {
    return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, e);
  }
  connectedTo(e) {
    return e === this.nodeFrom || e === this.nodeTo;
  }
  getPosition(e) {
    return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, e);
  }
  forceInnerNodesToTheirPositions() {
    for (let e = 0; e <= this.granularity; e++)
      this.innerNodes[e].position = p5.Vector.lerp(
        this.nodeFrom.position,
        this.nodeTo.position,
        (1 * e) / this.granularity
      );
  }
  show(e, t, o) {
    void 0 === this.owner
      ? 0 === this.candidateForRobot
        ? e.stroke(parameters.colorRobotA)
        : 1 === this.candidateForRobot || "robotBedge" === this.edgeType
        ? e.stroke(parameters.colorRobotB)
        : "robotAedge" === this.edgeType
        ? e.stroke(parameters.colorRobotA)
        : "graphEdge" === this.edgeType && e.stroke(parameters.colorGraphEdge)
      : parameters.showRobots && 0 === this.owner.index
      ? e.stroke(parameters.colorRobotA)
      : parameters.showRobots && 1 === this.owner.index
      ? e.stroke(parameters.colorRobotB)
      : e.stroke(parameters.colorGraphEdge),
      "graphEdge" === this.edgeType
        ? e.strokeWeight(parameters.edgeWidthGraph * (void 0 === t ? 1 : t))
        : e.strokeWeight(
            parameters.edgeWidthConfigSpace * (void 0 === t ? 1 : t)
          ),
      void 0 !== o && e.stroke(o);
    let r = p5.Vector.sub(this.nodeTo.position, this.nodeFrom.position).setMag(
        0.5 * parameters.nodeSize
      ),
      a = p5.Vector.add(this.nodeFrom.position, r),
      s = p5.Vector.sub(this.nodeTo.position, r);
    e.line(a.x, a.y, a.z, s.x, s.y, s.z);
    let i = p5.Vector.sub(s, r).add(
        createVector(0, 0.4 * parameters.nodeSize, 0)
      ),
      n = p5.Vector.sub(s, r).add(
        createVector(0, 0.4 * -parameters.nodeSize, 0)
      );
    e.line(i.x, i.y, i.z, s.x, s.y, s.z), e.line(n.x, n.y, n.z, s.x, s.y, s.z);
  }
}
function makeFileName(e) {
  let t =
    str(year()) +
    ("0" + str(month())).slice(-2) +
    ("0" + str(day())).slice(-2) +
    "_" +
    ("0" + str(hour())).slice(-2) +
    ("0" + str(minute())).slice(-2) +
    ("0" + str(second())).slice(-2);
  return parameters.graphType + e + "_" + t;
}
class Graph {
  constructor(e, t) {
    (this.type = "graph"), (this.nodes = e), (this.edges = t);
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
  otherRobot(e) {
    return this.robotA === e ? this.robotB : this.robotA;
  }
  moveRobots() {
    let e = parameters.amountMultiplier * parameters.robotASpeed,
      t = parameters.amountMultiplier * parameters.robotBSpeed,
      o = this.robotA.amount + e,
      r = this.robotB.amount + t;
    if (o >= 1 && r < 1)
      (o = 1), (r = this.robotB.amount + (t * (1 - this.robotA.amount)) / e);
    else if (o < 1 && r >= 1)
      (r = 1), (o = this.robotA.amount + (e * (1 - this.robotB.amount)) / t);
    else if (o >= 1 && r >= 1) {
      let a = (1 - this.robotA.amount) / (o - this.robotA.amount),
        s = (1 - this.robotB.amount) / (r - this.robotB.amount);
      a > s
        ? ((r = 1), (o = this.robotA.amount + e * s))
        : ((o = 1), (r = this.robotB.amount + t * a));
    }
    robotAmoving && this.robotA.setAmount(o),
      robotBmoving && this.robotB.setAmount(r),
      parameters.recordHistory &&
        configuration_space.graphLayout.configuration.record(
          this.robotA.nodeFrom,
          this.robotA.nodeTo,
          this.robotA.amount,
          this.robotB.nodeFrom,
          this.robotB.nodeTo,
          this.robotB.amount
        );
  }
  createGraphLayout(e, t) {
    this.graphLayout = new GraphLayout(this, e, t);
    for (let e of this.nodes) this.graphLayout.addNode(e);
    for (let e of this.edges) {
      let t = this.graphLayout.getNode(e[0]),
        o = this.graphLayout.getNode(e[1]);
      this.graphLayout.addEdge(e, t, o);
    }
    (this.robotA = new Robot(this, this.graphLayout.nodes[0], 0)),
      (this.robotB = new Robot(this, this.graphLayout.nodes[1], 1)),
      this.graphLayout.initlayout();
  }
}
function resetCanvases() {
  void 0 !== graphicsForGraph && graphicsForGraph.remove(),
    void 0 !== graphicsForConfigurationSpace &&
      graphicsForConfigurationSpace.remove();
}
function initgraphicsForGraph(e, t) {
  (graphicsForGraph = createGraphics(e, t, WEBGL)),
    graphicsForGraph.smooth(),
    graphicsForGraph.parent("graph"),
    graphicsForGraph.pixelDensity(2),
    graphicsForGraph.show(),
    setupEasyCam(graphicsForGraph, 500),
    addScreenPositionFunction(graphicsForGraph),
    vverbose && console.log(graphicsForGraph),
    graphicsForGraph.canvas.addEventListener("click", mousePressedOnLeft);
}
function initgraphicsForConfigurationSpace(e, t) {
  (graphicsForConfigurationSpace = createGraphics(e, t, WEBGL)),
    graphicsForConfigurationSpace.smooth(),
    graphicsForConfigurationSpace.parent("configspace"),
    graphicsForConfigurationSpace.pixelDensity(2),
    graphicsForConfigurationSpace.show();
  let o = graphicsForConfigurationSpace.canvas.getContext("webgl");
  o.disable(o.DEPTH_TEST),
    setupEasyCam(graphicsForConfigurationSpace, 500),
    addScreenPositionFunction(graphicsForConfigurationSpace);
}
class GraphLayout {
  constructor(e, t, o) {
    (this.source = e),
      (this.graphics = t),
      (this.layout3D = o),
      (this.updating = !1),
      (this.nodes = []),
      (this.nodeBorder = !0),
      (this.nodeBorderWidth = 0.05),
      (this.showNodes = !0),
      (this.edges = []),
      (this.showEdges = !0),
      (this.squares = []),
      (this.showSquares = !0),
      (this.planarForce = 0),
      (this.squarePlanarForce = 0),
      (this.centerForce = 0.001),
      (this.extraCenterForce = 0),
      (this.moveToCenter = !0),
      (this.edgelength = 100),
      (this.firstCoordinateEdgeLength = 100),
      (this.secondCoordinateEdgeLength = 100),
      (this.graphEdgeForce = 0.01),
      (this.firstCoordinateForce = 0.05),
      (this.secondCoordinateForce = 0.01),
      (this.firstCoordinateMirrorForce = 0.01),
      (this.secondCoordinateMirrorForce = -0.01),
      (this.extraCenterPreference = 0),
      (this.coordinatePreference = 0.01),
      (this.center = createVector(0, 0, 0)),
      (this.heat = 1),
      (this.coolDown = 0.01),
      (this.cohesionthreshold = 10),
      (this.cohesionFactor = 1),
      (this.repulsion = 5e4),
      (this.centroidRepulsion = 5e4),
      (this.separationFactor = 30),
      (this.keyboardactive = !0);
  }
  initlayout() {
    if (octForces)
      for (let e = 0; e < 100; e++) {
        this.updateOctree();
        for (let e of this.nodes) e.update(this.nodes), e.move();
      }
  }
  updateOctree() {
    vverbose && console.log("updateOctree");
    if (
      ((this.octree = new Octree(
        this,
        new Cube(
          0,
          0,
          0,
          4 * max(windowWidth, windowHeight),
          4 * max(windowWidth, windowHeight),
          4 * max(windowWidth, windowHeight)
        ),
        0
      )),
      "graph" === this.source.type)
    )
      for (let e of this.nodes) this.octree.insert(e);
    if ("configuration_space" === this.source.type)
      for (let e of this.nodes)
        void 0 !== e.innerNode && this.octree.insert(e.innerNode);
    this.octree.calculateMass();
  }
  show() {
    this.graphics.push(),
      this.graphics.reset(),
      parameters.darkMode
        ? this.graphics.clear()
        : this.graphics.clear(255, 255, 255, 255),
      this.graphics.ambientLight(128, 128, 128);
    let e = this.graphics.easycam.getPosition(),
      t = -e[0],
      o = -e[1],
      r = -e[2];
    this.graphics.directionalLight(255, 255, 255, t, o, r);
    let a = graphicsForConfigurationSpace.canvas.getContext("webgl");
    if (
      (a.disable(a.DEPTH_TEST),
      "configuration_space" === this.source.type &&
        parameters.showConfigurationspace &&
        this.showSquares)
    )
      for (let e of this.squares) e.show();
    if (
      (a.enable(a.DEPTH_TEST),
      "configuration_space" === this.source.type && parameters.showGraph)
    ) {
      for (let e of graph.graphLayout.nodes) e.show(this.graphics);
      for (let e of graph.graphLayout.edges) e.show(this.graphics);
      if (parameters.showRobots)
        for (let e of graph.getRobots()) e.show(this.graphics);
    }
    if ("graph" === this.source.type || parameters.showConfigurationspace) {
      if (this.showEdges) for (let e of this.edges) e.show(this.graphics);
      if (this.showNodes) for (let e of this.nodes) e.show(this.graphics);
    }
    if (
      "configuration_space" === this.source.type &&
      parameters.showLoops &&
      void 0 !== configuration_space.loops
    ) {
      let e = configuration_space.loops.length;
      for (let t = 0; t < e; t++)
        for (let o of configuration_space.loops[t]) {
          let r = this.getEdge(o[0], o[1], !0),
            a = color(map(t, 0, e, 0, 255), 255, 255);
          r.show(this.graphics, 2.5, a);
        }
    }
    if ("graph" === this.source.type && parameters.showRobots)
      for (let e of this.source.getRobots()) e.show(this.graphics);
    if (
      ("configuration_space" === this.source.type &&
        parameters.showConfigurationspace &&
        parameters.showRobots &&
        this.showConfiguration &&
        this.configuration.show(),
      "graph" === this.source.type && parameters.showText)
    )
      for (let e of this.nodes) e.showText(this.graphics);
    if (
      "configuration_space" === this.source.type &&
      this.showNodes &&
      parameters.showConfigurationspace &&
      parameters.showText
    )
      for (let e of this.nodes) e.showText(this.graphics);
    if (
      "configuration_space" === this.source.type &&
      parameters.showGraph &&
      parameters.showText
    )
      for (let e of graph.graphLayout.nodes) e.showText(this.graphics);
    this.graphics.pop(), this.counter++;
  }
  update() {
    if (forcesActive && parameters.running) {
      if ((octForces && this.updateOctree(), this.moveToCenter)) {
        let e = 0,
          t = 0,
          o = 0;
        for (let r of this.nodes)
          (e += (-r.position.x + this.center.x) / this.nodes.length),
            (t += (-r.position.y + this.center.y) / this.nodes.length),
            (o += (-r.position.z + this.center.z) / this.nodes.length);
        for (let r of this.nodes)
          r.frozen || r.position.add(0.1 * e, 0.1 * t, 0.1 * o);
      }
      for (let e of this.nodes) e.update(this.nodes);
      for (let e of this.nodes) e.move();
    }
    for (let e of this.edges) e.forceInnerNodesToTheirPositions();
  }
  getNode(e) {
    "number" == typeof e ||
      "configuration_space" !== this.source.type ||
      this.source.ordered ||
      e.sort();
    for (let t of this.nodes) if (arraysEqual(t.label, e)) return t;
    return vverbose && print("returning false"), !1;
  }
  getEdge(e, t, o) {
    vverbose && print("getEdge: "),
      vverbose && print(e),
      vverbose && print(t),
      vverbose && print(o);
    for (let r of this.edges)
      if (arraysEqual([e, t], r.label) || (!o && arraysEqual([t, e], r.label)))
        return vverbose && print("FOUND!"), vverbose && print(r), r;
    return !1;
  }
  getSquare(e, t) {
    vverbose && print("getSquare: "),
      vverbose && print(e),
      vverbose && print(t);
    for (let o of this.squares)
      if ((vverbose && print(o.label), arraysEqual([e, t], o.label)))
        return vverbose && print("FOUND!"), vverbose && print(o), o;
  }
  getCentroids(e) {
    let t = [];
    for (let e of this.squares) t.push(e.getCentroid());
    return t;
  }
  addNode(e, t, o, r) {
    vverbose && print("adding node " + e);
    let a = 10,
      s = new Node(
        this,
        e,
        void 0 === t ? random(-a, a) : t,
        void 0 === o ? random(-a, a) : o,
        void 0 === r ? random(-a, a) : r,
        1
      );
    return this.nodes.push(s), s;
  }
  deleteNode(e) {
    verbose && console.log("deleteNode: " + e);
    let t = this.getNode(e);
    for (neighbor of t.neighbors)
      (neighbor.neighbors = neighbor.neighbors.filter((e) => !(e === t))),
        verbose && console.log("neighbor.neighbors: " + neighbor.neighbors);
    this.nodes.splice(this.nodes.indexOf(t), 1);
  }
  addEdge(e, t, o) {
    vverbose && print("adding edge " + e),
      vverbose && print("connecting:"),
      vverbose && print(t.label + " to " + o.label);
    let r = new Edge(this, e, t, o);
    return this.edges.push(r), o.connectTo(t), t.connectTo(o), r;
  }
  deleteEdge(e) {
    verbose && console.log("deleteEdge: " + e);
    let t = this.getEdge(e[0], e[1], !1);
    (t.nodeFrom.neighbors = t.nodeFrom.neighbors.filter((e) => e !== t.nodeTo)),
      verbose &&
        console.log("edgeToDelete.nodeFrom.neighbors: " + t.nodeFrom.neighbors),
      (t.nodeTo.neighbors = t.nodeTo.neighbors.filter((e) => e !== t.nodeFrom)),
      verbose &&
        console.log("edgeToDelete.nodeTo.neighbors: " + t.nodeTo.neighbors),
      this.edges.splice(this.edges.indexOf(t), 1);
  }
  addSquare(e, t, o, r, a) {
    let s = new Square(this, e, t, o, r, a);
    this.squares.push(s);
  }
  deleteSquare(e) {
    let t = this.getSquare(e[0], e[1]);
    this.squares.splice(this.squares.indexOf(t), 1);
  }
}
function initGUI() {
  verbose && console.log("initGUI"), (GUIS = []);
  let e = document.getElementById("gui-left"),
    t = document.getElementById("gui-right");
  for (let e of document.getElementsByClassName("graphpicker"))
    e.addEventListener("click", (e) => {
      (parameters.graphType = e.target.innerHTML),
        (parameters.mode = "View"),
        (graphIsCustomized = !1),
        init();
    });
  (e.innerHTML = ""), (t.innerHTML = "");
  let o = new lil.GUI({ title: "Options", container: e, width: 300 });
  o.add(parameters, "darkMode").name("Dark mode").listen(),
    o.add(parameters, "showGraph").name("Show graph").listen(),
    o
      .add(parameters, "showConfigurationspace")
      .name("Show configuration space")
      .listen(),
    o.add(parameters, "showRobots").name("Show robots").listen(),
    o.add(parameters, "showText").name("Show text").listen(),
    o.add(parameters, "showHyperplanes").name("Show hyperplanes"),
    o.add(parameters, "squareOn").name("Show square surfaces"),
    o.add(parameters, "gridOn").name("Show square grids");
  let r = new lil.GUI({ title: "Advanced", container: e }).close();
  r.add(parameters, "mode").name("Mode").listen().disable(),
    r.add(parameters, "running").name("Running").listen(),
    r.add(parameters, "showLoops").name("Show loops"),
    r
      .add(parameters, "dualView")
      .name("Dual view")
      .onChange((e) => {
        setDualView(parameters.dualView);
      }),
    (syncViewToggle = r.add(parameters, "syncView").name("Sync cameras")),
    parameters.dualView || syncViewToggle.hide(),
    r.add(parameters, "maxspeed", 0, 30, 0.01).name("Max node speed");
  let a = new lil.GUI({ title: "Visuals", container: e }).close();
  a.add(parameters, "nodeSize", 0, 40, 1).name("Node size"),
    a.add(parameters, "robotsNodeSize", 0, 40, 1).name("Node size: Robot"),
    a
      .add(parameters, "configNodeSize", 0, 40, 1)
      .name("Node size: Configuration"),
    a.add(parameters, "edgeWidthConfigSpace", 0, 10, 0.1).name("Edge width"),
    a.add(parameters, "edgeWidthGraph", 0, 10, 0.1).name("Edge width: Graph"),
    a.add(parameters, "edgeWidthGrid", 0, 10, 0.1).name("Edge width: Grid"),
    a.add(parameters, "fontSize", 10, 100, 1).name("Text size"),
    a.add(parameters, "labelZ", 0, 100, 1).name("Text offset from node"),
    a.add(parameters, "sphereView").name("Spheres as nodes"),
    a.add(parameters, "sphereDetail", 4, 40, 1).name("Sphere detail"),
    a
      .add(parameters, "granularityGraph", 0, 80, 1)
      .name("Edge granularity: Graph"),
    a
      .add(parameters, "granularityFirstCoordinate", 0, 80, 1)
      .name("Edge granularity: First coordinate")
      .onChange((e) => {
        configuration_space.graphLayout.createInnerNodes();
      }),
    a
      .add(parameters, "granularitySecondCoordinate", 0, 80, 1)
      .name("Edge granularity: Second coordinate")
      .onChange((e) => {
        configuration_space.graphLayout.createInnerNodes();
      });
  let s = new lil.GUI({ title: "Colors", container: e }).close();
  s.addColor(parameters, "colorNode").name("Nodes"),
    s.addColor(parameters, "colorRobotA").name("First robot/edges"),
    s.addColor(parameters, "colorRobotB").name("Second robot/edges"),
    s.addColor(parameters, "colorConfig").name("Configuration"),
    s.addColor(parameters, "colorGraphEdge").name("Graph edges"),
    s.addColor(parameters, "activeDotColor").name("Selected node"),
    s.addColor(parameters, "deleteNodeColor").name("Marked for deletion"),
    s
      .addColor(parameters, "selectedNodeForEdgeColor")
      .name("Selected node for edge"),
    s.addColor(parameters, "squareColor").name("Squares"),
    s.add(parameters, "squareOpacity", 0, 255, 1).name("Square opacity");
  let i = new lil.GUI({
    title: "Configuration space layout",
    container: t,
    width: 400,
  });
  i
    .add(parameters, "layoutPreset", {
      "Layout 00": "layout-00.txt",
      "Layout 01": "layout-01.txt",
      "Layout 02": "layout-02.txt",
    })
    .name("Layout presets")
    .onChange((e) => {
      readLayoutFromFile(parameters.layoutPreset);
    }),
    i
      .add(
        configuration_space.graphLayout,
        "firstCoordinateEdgeLength",
        1,
        1e3,
        1
      )
      .name("Edge length: First coordinate"),
    i
      .add(
        configuration_space.graphLayout,
        "firstCoordinateForce",
        0,
        0.1,
        0.01
      )
      .name("Edge force: First coordinate"),
    i
      .add(
        configuration_space.graphLayout,
        "secondCoordinateEdgeLength",
        1,
        1e3,
        1
      )
      .name("Edge length: Second coordinate"),
    i
      .add(
        configuration_space.graphLayout,
        "secondCoordinateForce",
        0,
        0.1,
        1e-4
      )
      .name("Edge force: Second coordinate"),
    i
      .add(
        configuration_space.graphLayout,
        "firstCoordinateMirrorForce",
        -0.2,
        0.2,
        1e-4
      )
      .name("Force bias: First projection"),
    i
      .add(
        configuration_space.graphLayout,
        "secondCoordinateMirrorForce",
        -0.2,
        0.2,
        1e-4
      )
      .name("Force bias: Second projection"),
    i
      .add(
        configuration_space.graphLayout,
        "coordinatePreference",
        -0.1,
        0.1,
        0.01
      )
      .name("Coordinate preference"),
    i
      .add(
        configuration_space.graphLayout,
        "extraCenterPreference",
        0,
        0.1,
        1e-4
      )
      .name("Extra center preference"),
    i
      .add(configuration_space.graphLayout, "cohesionthreshold", 0, 2, 0.01)
      .name("Neighbor attraction threshold"),
    i
      .add(configuration_space.graphLayout, "repulsion", 0, 5e5, 1)
      .name("Repulsion"),
    i
      .add(configuration_space.graphLayout, "centroidRepulsion", 0, 5e5, 1)
      .name("Centroid Repulsion"),
    i
      .add(configuration_space.graphLayout, "separationFactor", 0, 1300, 1)
      .name("Separation factor"),
    i
      .add(configuration_space.graphLayout, "centerForce", 0, 0.15, 1e-4)
      .name("Center Force")
      .listen(),
    i
      .add(configuration_space.graphLayout, "extraCenterForce", 0, 0.15, 1e-4)
      .name("Extra center force"),
    i
      .add(configuration_space.graphLayout, "moveToCenter")
      .name("Adjust to center"),
    i.add(parameters, "THETA", 0, 10, 0.01).name("THETA"),
    i
      .add(configuration_space.graphLayout, "squarePlanarForce", 0, 0.1, 1e-4)
      .name("Square Planar Force");
  let n = new lil.GUI({
    title: "Graph layout",
    container: t,
    width: 400,
  }).close();
  n.add(graph.graphLayout, "edgelength", 1, 400).name("Edge length"),
    n
      .add(graph.graphLayout, "graphEdgeForce", 0, 0.1, 0.001)
      .name("Edge force"),
    n
      .add(graph.graphLayout, "cohesionthreshold", 0, 2, 0.01)
      .name("Neighbor attraction threshold"),
    n.add(graph.graphLayout, "repulsion", 0, 1e5, 1).name("Repulsion"),
    n
      .add(graph.graphLayout, "separationFactor", 0, 1300, 1)
      .name("Separation factor"),
    n.add(graph.graphLayout, "planarForce", 0, 0.15, 1e-4).name("Planar force"),
    n
      .add(graph.graphLayout, "centerForce", 0, 0.15, 1e-4)
      .name("Center force")
      .listen(),
    n
      .add(graph.graphLayout, "extraCenterForce", 0, 0.15, 1e-4)
      .name("Extra center force"),
    n.add(graph.graphLayout, "moveToCenter").name("Adjust to center");
  let h = new lil.GUI({ title: "Movement", container: t, width: 400 }).close();
  h
    .add(parameters, "moveDotsRandomly")
    .name("Move robots")
    .onChange((e) => {
      parameters.moveDotsRandomly && (parameters.showRobots = !0);
    }),
    h.add(parameters, "robotASpeed", 0, 1, 0.01).name("Speed of first robot"),
    h.add(parameters, "robotBSpeed", 0, 1, 0.01).name("Speed of second robot"),
    h.add(parameters, "amountMultiplier", 0, 1, 0.01).name("Multiplier"),
    h.add(parameters, "speedUp", 0, 1, 0.01).name("Speed-up"),
    h.add(parameters, "recordHistory").name("Record path"),
    h.add(parameters, "showHistory").name("Show path"),
    h
      .add(
        {
          resetHistory() {
            configuration_space.graphLayout.configuration.resetHistory();
          },
        },
        "resetHistory"
      )
      .name("resetHistory"),
    GUIS.push(o, r, a, s, i, n, h);
}
function windowResized() {
  parameters.dualView
    ? (graphicsForGraph.resizeCanvas(windowWidth / 2, windowHeight),
      graphicsForConfigurationSpace.resizeCanvas(windowWidth / 2, windowHeight))
    : (graphicsForGraph.resizeCanvas(0, windowHeight),
      graphicsForConfigurationSpace.resizeCanvas(windowWidth, windowHeight));
}
function startWarning(e) {
  let t = createDiv(e);
  t.class("warning"),
    t.parent(warningWrapper),
    setTimeout(function () {
      endWarning(t);
    }, 3e3);
}
function endWarning(e) {
  e.remove();
}
class BuildHistory {
  constructor() {}
  show(e) {
    e.fill(128);
  }
}
class InnerNode {
  constructor(e, t, o, r) {
    (this.parent = e),
      (this.label = o),
      (this.graphLayout = t),
      (this.graphics = t.graphics),
      t.layout3D
        ? ((this.position = r),
          (this.velocity = createVector(0, 0, 0)),
          (this.acceleration = createVector(0, 0, 0)))
        : ((this.position = r),
          (this.velocity = createVector(0, 0)),
          (this.acceleration = createVector(0, 0))),
      (this.neighborsA = []),
      (this.neighborsB = []);
  }
  update(e) {
    let t;
    this.acceleration.mult(0),
      (t = octForces
        ? this.graphLayout.octree.getAllNodesForces(this)
        : this.getSeparationFromNodes(e));
    let o = this.getSpringForce(
        this.graphLayout.firstCoordinateEdgeLength /
          parameters.granularityFirstCoordinate,
        10 * this.graphLayout.firstCoordinateForce,
        this.neighborsA
      ),
      r = this.getSpringForce(
        this.graphLayout.secondCoordinateEdgeLength /
          parameters.granularitySecondCoordinate,
        10 * this.graphLayout.secondCoordinateForce,
        this.neighborsB
      );
    this.acceleration.add(t),
      this.acceleration.add(o),
      this.acceleration.add(r);
  }
  move() {
    this.velocity.add(this.acceleration),
      limitVector(this.velocity, parameters.maxspeed),
      this.position.add(this.velocity),
      this.velocity.mult(0.9);
  }
  getSpringForce(e, t, o) {
    let r = new createVector(0, 0, 0);
    for (let a of o) {
      let o = p5.Vector.sub(this.position, a.position),
        s = o.mag() - e;
      abs(s) > this.graphLayout.cohesionthreshold &&
        (o.normalize().mult(-t * s), r.add(o));
    }
    return limitVector(r, e), r;
  }
  show(e) {
    if (
      (this.nodeBorder
        ? (e.stroke(150),
          e.strokeWeight(
            parameters.nodeSize * this.graphLayout.nodeBorderWidth
          ))
        : e.noStroke(),
      this.graphLayout.layout3D)
    ) {
      e.push(),
        e.translate(this.position.x, this.position.y, this.position.z),
        e.fill(parameters.colorNode);
      let t = e.easycam.getRotation(),
        o = QuaternionToEuler(t[0], t[1], t[2], t[3]);
      e.rotateX(-o[0]),
        e.rotateY(-o[1]),
        e.rotateZ(-o[2]),
        e.translate(0, 0, 1),
        e.stroke(0),
        e.strokeWeight(1),
        e.ellipse(0, 0, 0.25 * parameters.nodeSize, 0.25 * parameters.nodeSize),
        e.pop();
    }
    for (let t of this.neighborsA)
      e.stroke(0, 255, 0),
        e.strokeWeight(1),
        e.line(
          this.position.x,
          this.position.y,
          this.position.z,
          t.position.x,
          t.position.y,
          t.position.z
        );
    for (let t of this.neighborsB)
      e.stroke(0, 0, 255),
        e.strokeWeight(1),
        e.line(
          this.position.x,
          this.position.y,
          this.position.z,
          t.position.x,
          t.position.y,
          t.position.z
        );
  }
  showText(e) {
    if (
      (e.fill(0, 0, 0),
      e.textAlign(CENTER, CENTER),
      e.textFont(font),
      e.textSize(parameters.fontSize),
      this.graphLayout.layout3D)
    ) {
      let t = e.easycam.getRotation(),
        o = QuaternionToEuler(t[0], t[1], t[2], t[3]);
      e.push(),
        e.translate(this.position.x, this.position.y, this.position.z),
        e.rotateX(-o[0]),
        e.rotateY(-o[1]),
        e.rotateZ(-o[2]);
      let r = max(
        parameters.nodeSize,
        parameters.configNodeSize,
        parameters.robotsNodeSize
      );
      e.translate(parameters.labelX, parameters.labelY, r + parameters.labelZ),
        e.text(this.labelText, 0, 0),
        e.pop();
    } else
      e.push(),
        e.translate(this.position.x, this.position.y, this.position.z),
        e.text(this.labelText, 0, 0),
        e.pop();
  }
}
class InnerEdge {
  constructor(e, t, o, r, a) {
    (this.graphLayout = t),
      (this.graphics = t.graphics),
      (this.label = o),
      (this.nodeFrom = r),
      (this.nodeTo = a),
      (this.edgeType = e.edgeType);
  }
  show(e, t, o) {
    e.strokeWeight(
      2 * parameters.edgeWidthConfigSpace * (void 0 === t ? 1 : t)
    ),
      e.stroke(255, 0, 0),
      void 0 !== o && e.stroke(o),
      e.line(
        this.nodeFrom.position.x,
        this.nodeFrom.position.y,
        this.nodeFrom.position.z,
        this.nodeTo.position.x,
        this.nodeTo.position.y,
        this.nodeTo.position.z
      );
  }
}
let keyboardFlags = {};
function downKey(e) {
  return keyboardFlags[e.charCodeAt(0)];
}
function keyPressed() {
  if (
    (verbose &&
      print(
        "keyPressed: keyCode = " +
          keyCode +
          " / key = " +
          key +
          " / key.charCodeAt(0) = " +
          key.charCodeAt(0)
      ),
    (keyboardFlags[keyCode] = !0),
    (keyCode !== SHIFT && "a" !== key && "b" !== key) ||
      (verbose && console.log(" move mode"),
      (parameters.mode = "Move"),
      updateMode()),
    ("a" === key && !downKey("B")) || ("b" === key && !downKey("A")))
  ) {
    let e = "a" === key ? graph.robotA : graph.robotB,
      t = e.getAllPossibleEdges();
    for (let o of t)
      graph.graphLayout.getEdge(o[0], o[1]).candidateForRobot = e.index;
  }
  if ("e" === key) addEdgesForSelectedNodes();
  else if ("Escape" === key)
    parameters.showInfo && ((parameters.showInfo = !1), infoDiv.hide());
  else if ("d" === key) deleteSelectedNodesOrEdges();
  else if (" " === key) parameters.running = !parameters.running;
  else if ("o" === key)
    (octForces = !octForces), console.log("octForces = " + octForces);
  else if ("f" === key) forcesActive = !forcesActive;
  else if ("q" === key) parameters.debugMode = !parameters.debugMode;
  else if ("t" === key) parameters.showText = !parameters.showText;
  else if ("n" === key) addNode();
  else if ("i" === key)
    (parameters.showInfo = !parameters.showInfo),
      parameters.showInfo
        ? (console.log("show info"), updateInfoString(), infoDiv.show())
        : infoDiv.hide();
  else if ("a" === key) robotAmoving = !robotAmoving;
  else if ("b" === key) robotBmoving = !robotBmoving;
  else if ("c" === key) toggleForSelectedNode();
  else if ("d" === key) parameters.darkMode = !parameters.darkMode;
  else if ("C" === key)
    parameters.showConfigurationspace = !parameters.showConfigurationspace;
  else if ("s" === key) takeScreenshotGraph = !takeScreenshotGraph;
  else if ("S" === key) takeScreenshotConfigSpace = !takeScreenshotConfigSpace;
  else if ("g" === key) {
    let e = GUIS.every((e) => e._closed);
    if (e) for (let e of GUIS) e.open();
    else for (let e of GUIS) e.close();
  } else
    "r" === key
      ? (parameters.showRobots = !parameters.showRobots)
      : "w" === key
      ? writeToFiles()
      : "z" === key
      ? (graphicsForConfigurationSpace.easycam.removeMouseListeners(),
        graphicsForGraph.easycam.removeMouseListeners())
      : "Z" === key &&
        (graphicsForConfigurationSpace.easycam.attachMouseListeners(
          graphicsForConfigurationSpace._renderer
        ),
        graphicsForGraph.easycam.attachMouseListeners(
          graphicsForGraph._renderer
        ));
}
function keyReleased() {
  if (
    (verbose && console.log("keyReleased: " + keyCode),
    (keyboardFlags[keyCode] = !1),
    (keyCode !== SHIFT && "a" !== key && "b" !== key) ||
      (verbose && console.log("keyReleased: parameters.mode = View"),
      (parameters.mode = "View"),
      updateMode()),
    !downKey("A") && !downKey("B"))
  )
    for (let e of graph.graphLayout.edges) e.candidateForRobot = void 0;
}
function applyToVec3(e, t) {
  let o;
  var [r, a, s] = t,
    [i, n, h, p] = e,
    d = n * r + h * a + p * s;
  return (
    (o = [0, 0, 0]),
    (o[0] = 2 * (i * (r * i - (h * s - p * a)) + d * n) - r),
    (o[1] = 2 * (i * (a * i - (p * r - n * s)) + d * h) - a),
    (o[2] = 2 * (i * (s * i - (n * a - h * r)) + d * p) - s),
    o
  );
}
function limitVector(e, t) {
  e.mag() > t && e.normalize().mult(t);
}
function EulerToQuaternion(e, t, o) {
  var r = cos(0.5 * o),
    a = sin(0.5 * o),
    s = cos(0.5 * t),
    i = sin(0.5 * t),
    n = cos(0.5 * e),
    h = sin(0.5 * e);
  return [
    r * s * n + a * i * h,
    r * s * h - a * i * n,
    a * s * h + r * i * n,
    a * s * n - r * i * h,
  ];
}
function QuaternionToEuler(e, t, o, r) {
  var a = 2 * (e * o - r * t);
  return [
    atan2(2 * (e * t + o * r), 1 - 2 * (t * t + o * o)),
    abs(a) >= 1 ? copysign(M_PI / 2, a) : asin(a),
    atan2(2 * (e * r + t * o), 1 - 2 * (o * o + r * r)),
  ];
}
function cartesianProductOf() {
  return Array.prototype.reduce.call(
    arguments,
    function (e, t) {
      var o = [];
      return (
        e.forEach(function (e) {
          t.forEach(function (t) {
            o.push(e.concat([t]));
          });
        }),
        o
      );
    },
    [[]]
  );
}
function getFourthPoint(e, t, o) {
  return p5.Vector.add(t, o).sub(e);
}
function completeGraph(e) {
  let t = [...Array(e).keys()],
    o = [];
  for (let e of t) for (let r of t) e !== r && e < r && o.push([e, r]);
  return new Graph(t, o);
}
function chainGraph(e) {
  let t = [...Array(e).keys()],
    o = [];
  for (let r of t) o.push([r, (r + 1) % e].sort()), vverbose && print(r);
  return new Graph(t, o);
}
function wheelGraph(e) {
  let t = [...Array(e + 1).keys()],
    o = [];
  for (let r of t)
    r !== e && o.push([r, e]), o.push([r, (r + 1) % e]), vverbose && print(r);
  return new Graph(t, o);
}
function randomGraph() {
  let e = [...Array(30).keys()];
  return new Graph(e, []);
}
function completeBipartiteGraph(e, t) {
  vverbose && print("completeBipartiteGraph: " + e + " " + t);
  let o = [...Array(e).keys()],
    r = [...Array(t).keys()].map((t) => t + e),
    a = [...Array(e + t).keys()],
    s = [];
  for (let e of o) for (let t of r) s.push([e, t]);
  return new Graph(a, s);
}
function mouseWheel(e) {
  areWeOnTheLeft
    ? parameters.syncView &&
      configuration_space.graphLayout.graphics.easycam.setState(
        graph.graphLayout.graphics.easycam.getState()
      )
    : parameters.syncView &&
      graph.graphLayout.graphics.easycam.setState(
        configuration_space.graphLayout.graphics.easycam.getState()
      );
}
let mouseIsPressedOnLeftSide = !1;
function mousePressedOnLeft(e) {
  console.log("mousePressedOnLeft");
}
function mousePressed(e) {
  let t, o;
  if (
    ((areWeOnTheLeft = e.target === graphicsForGraph.canvas),
    vverbose && console.log("mouse pressed"),
    vverbose && console.log(areWeOnTheLeft),
    vverbose && console.log(parameters.mode),
    "Move" === parameters.mode)
  ) {
    let e = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace,
      r = mouseX - e.easycam.viewport[0] - e.easycam.viewport[2] / 2,
      a = mouseY - e.easycam.viewport[1] - e.easycam.viewport[3] / 2,
      s = createVector(r, a),
      i = e.easycam.getUpVector();
    if (((cameraState = e.easycam.getState()), parameters.showRobots)) {
      let o = createVector(i[0], i[1], i[2]).setMag(
          0.5 * parameters.robotsNodeSize
        ),
        r = graph.robotA,
        a = graph.robotB;
      (r.active = !1), (a.active = !1);
      let n = r.getPosition(),
        h = a.getPosition(),
        p = e.screenPosition(n),
        d = e.screenPosition(h),
        c = s.dist(p),
        g = s.dist(d),
        l = e.screenPosition(p5.Vector.add(n, o)),
        u = e.screenPosition(p5.Vector.add(h, o)),
        f = p.dist(l),
        m = d.dist(u);
      c < f ? (t = r) : g < m && (t = a);
    }
    let n = createVector(i[0], i[1], i[2]).setMag(
        0.5 * parameters.configNodeSize
      ),
      h = configuration_space.graphLayout.configuration;
    h.active = !1;
    let p = e.screenPosition(h.position),
      d = s.dist(p),
      c = e.screenPosition(p5.Vector.add(h.position, n));
    if ((d < p.dist(c) && (t = h), void 0 === t)) {
      let r = createVector(i[0], i[1], i[2]).setMag(0.5 * parameters.nodeSize),
        a = []
          .concat(graph.graphLayout.nodes)
          .concat(configuration_space.graphLayout.nodes);
      for (let e of a) e.lastSelected = !1;
      for (let i of a) {
        i.active = !1;
        let a = e.screenPosition(i.position),
          n = s.dist(a),
          h = e.screenPosition(p5.Vector.add(i.position, r)),
          p = a.dist(h);
        vverbose && print(e.screenPosition(i.position)),
          n < p && (void 0 === t || n < o) && ((t = i), (o = n));
      }
    }
    if (void 0 !== t) {
      if (((t.lastSelected = !0), void 0 !== t.graphLayout)) {
        "graph" === t.graphLayout.source.type &&
          (selectedNodesInGraph.includes(t)
            ? (selectedNodesInGraph = selectedNodesInGraph.filter(
                (e) => e !== t
              ))
            : selectedNodesInGraph.push(t));
      }
    } else selectedNodesInGraph = [];
    if (void 0 !== t && t.lastSelected)
      "Edit" === parameters.mode
        ? void 0 !== nodeSelectedForEdgeAddition
          ? (nodeSelectedForEdgeAddition !== t &&
              void 0 ===
                graph.graphLayout.getEdge(
                  nodeSelectedForEdgeAddition.label,
                  t.label,
                  !1
                ) &&
              addEdge(nodeSelectedForEdgeAddition, t),
            (nodeSelectedForEdgeAddition.firstNodeOfEdge = !1),
            (nodeSelectedForEdgeAddition = void 0))
          : deleteNodeMode
          ? t.occupied() || deleteNode(t)
          : ((nodeSelectedForEdgeAddition = t), (t.firstNodeOfEdge = !0))
        : "Move" === parameters.mode &&
          ((t.active = !0),
          vverbose || console.log("selectedNode.active = true"));
    else if ("Edit" === parameters.mode) {
      let e = addNode(),
        t = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace,
        o = mouseX - t.easycam.viewport[0] - t.easycam.viewport[2] / 2,
        r = mouseY - t.easycam.viewport[1] - t.easycam.viewport[3] / 2,
        a = createVector(o, r);
      for (let o = 0; o < 10; o++) {
        let o = t.screenPosition(e.position),
          r = p5.Vector.sub(a, o),
          s = applyToVec3(cameraState.rotation, [r.x, r.y, 0]),
          i = s[0],
          n = s[1],
          h = s[2],
          p = createVector(i, n, h).setMag(0.5 * r.mag());
        e.position.add(p);
      }
    }
    if (!0 === graph.robotA.active || !0 === graph.robotB.active) {
      let e = !0 === graph.robotA.active ? graph.robotA : graph.robotB,
        t = e.getAllPossibleEdges();
      for (let o of t)
        graph.graphLayout.getEdge(o[0], o[1]).candidateForRobot = e.index;
    }
  } else "View" === parameters.mode && reheat();
}
function ourMouseDragged() {
  if (
    (vverbose && console.log("ourMouseDragged"), "Move" === parameters.mode)
  ) {
    reheat();
    let e,
      t,
      o = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace,
      r = mouseX - o.easycam.viewport[0] - o.easycam.viewport[2] / 2,
      a = mouseY - o.easycam.viewport[1] - o.easycam.viewport[3] / 2,
      s = createVector(r, a);
    if (!0 === graph.robotA.active || !0 === graph.robotB.active) {
      let e = !0 === graph.robotA.active ? graph.robotA : graph.robotB;
      if (e.inANode()) {
        let t,
          r,
          a = o.screenPosition(e.getPosition()),
          i = p5.Vector.sub(s, a),
          n = e.getCandidates();
        for (let e of n) {
          let s = o.screenPosition(e.position),
            n = p5.Vector.sub(s, a),
            h = p5.Vector.dot(n, i) / (i.mag() * n.mag());
          n.dot(i) / pow(n.mag(), 2) > 0.05 &&
            (void 0 === t || h > r) &&
            ((t = e), (r = h));
        }
        void 0 !== t && e.setNodeTo(t);
      } else {
        let t = o.screenPosition(e.getPosition()),
          r = p5.Vector.sub(s, t).mult(0.9),
          a = o.screenPosition(e.nodeFrom.position),
          i = o.screenPosition(e.nodeTo.position),
          n = p5.Vector.sub(i, a),
          h = n.dot(r) / pow(n.mag(), 2);
        e.setAmount(e.amount + h);
      }
    } else {
      vverbose && console.log("moving node");
      for (let e of graph.graphLayout.nodes)
        !0 === e.active &&
          ((t = e),
          vverbose && console.log("movingNode = node"),
          vverbose && console.log(e));
    }
    if (!0 === configuration_space.graphLayout.configuration.active) {
      e = configuration_space.graphLayout.configuration;
      let t = graphicsForConfigurationSpace.screenPosition(e.position),
        o = p5.Vector.sub(s, t).mult(0.9),
        r = configuration_space.graphLayout.getNode([
          e.robotA.nodeFrom.label,
          e.robotB.nodeFrom.label,
        ]).position,
        a = configuration_space.graphLayout.getNode([
          e.robotA.nodeTo.label,
          e.robotB.nodeFrom.label,
        ]).position,
        i = configuration_space.graphLayout.getNode([
          e.robotA.nodeFrom.label,
          e.robotB.nodeTo.label,
        ]).position,
        n = configuration_space.graphLayout.getNode([
          e.robotA.nodeTo.label,
          e.robotB.nodeTo.label,
        ]).position;
      if (keyboardFlags[SHIFT] || keyboardFlags[66])
        if (e.robotB.inANode()) {
          let t = pickBestCandidateForB(e, o);
          void 0 !== t && !1 !== t && e.robotB.setNeighbor(t);
        } else {
          let t = p5.Vector.lerp(r, a, e.robotA.amount),
            s = p5.Vector.lerp(i, n, e.robotA.amount),
            h = graphicsForConfigurationSpace.screenPosition(t),
            p = graphicsForConfigurationSpace.screenPosition(s),
            d = p5.Vector.sub(p, h),
            c = d.dot(o) / pow(d.mag(), 2);
          e.robotB.setAmount(e.robotB.amount + c);
        }
      if (keyboardFlags[SHIFT] || keyboardFlags[65])
        if (e.robotA.inANode()) {
          let t = pickBestCandidateForA(e, o);
          void 0 !== t && !1 !== t && e.robotA.setNeighbor(t);
        } else {
          let t = p5.Vector.lerp(r, i, e.robotB.amount),
            s = p5.Vector.lerp(a, n, e.robotB.amount),
            h = graphicsForConfigurationSpace.screenPosition(t),
            p = graphicsForConfigurationSpace.screenPosition(s),
            d = p5.Vector.sub(p, h),
            c = d.dot(o) / pow(d.mag(), 2);
          e.robotA.setAmount(e.robotA.amount + c);
        }
    } else
      for (let e of configuration_space.graphLayout.nodes)
        !0 === e.active && (t = e);
    if (void 0 !== t) {
      vverbose && console.log("moving ordinaryNodeMoving");
      let e = o.screenPosition(t.position),
        r = p5.Vector.sub(s, e),
        a = applyToVec3(cameraState.rotation, [r.x, r.y, 0]),
        i = o.easycam.getPosition(),
        n = createVector(i[0], i[1], i[2]),
        h = t.position.dist(n);
      vverbose && print(a);
      let p = a[0],
        d = a[1],
        c = a[2],
        g = createVector(p, d, c).mult((0.5 * h) / cameraState.distance);
      t.position.add(g);
    }
  } else
    "View" === parameters.mode &&
      (areWeOnTheLeft
        ? parameters.syncView &&
          configuration_space.graphLayout.graphics.easycam.setState(
            graph.graphLayout.graphics.easycam.getState()
          )
        : parameters.syncView &&
          graph.graphLayout.graphics.easycam.setState(
            configuration_space.graphLayout.graphics.easycam.getState()
          ),
      reheat());
}
function mouseReleased() {
  configuration_space.graphLayout.configuration.active = !1;
  for (let e of configuration_space.graphLayout.nodes) e.active = !1;
  (graph.robotA.active = !1), (graph.robotB.active = !1);
  for (let e of graph.graphLayout.nodes) e.active = !1;
  if ("a" !== key && "b" !== key)
    for (let e of graph.graphLayout.edges) e.candidateForRobot = void 0;
}
class Node {
  constructor(e, t, o, r, a, s) {
    (this.graphLayout = e),
      (this.graphics = e.graphics),
      (this.labelText = labelToString(t)),
      (this.applyExtraCenterForce = !1),
      (this.label = t),
      (this.mass = s),
      vverbose && print(t),
      (this.active = !1),
      e.layout3D
        ? ((this.position = createVector(o, r, a)),
          (this.velocity = createVector(0, 0, 0)),
          (this.acceleration = createVector(0, 0, 0)))
        : ((this.position = createVector(o, r)),
          (this.velocity = createVector(0, 0)),
          (this.acceleration = createVector(0, 0))),
      (this.frozen = !1),
      (this.alive = !0),
      (this.neighbors = []),
      (this.neighborsA = []),
      (this.neighborsB = []);
  }
  createInnerNode() {
    this.innerNode = new InnerNode(
      this,
      this.graphLayout,
      0,
      this.position.copy()
    );
  }
  connectTo(e) {
    this.neighbors.push(e);
  }
  update(e) {
    let t;
    if (
      (this.acceleration.mult(0),
      (t = octForces
        ? this.graphLayout.octree.getAllNodesForces(this)
        : this.getSeparationFromNodes(e)),
      "graph" === this.graphLayout.source.type)
    ) {
      let e = this.getSpringForce(
        this.graphLayout.edgelength,
        this.graphLayout.graphEdgeForce,
        this.neighbors
      );
      if (
        (e.mult(1 * this.graphLayout.cohesionFactor),
        this.acceleration.add(e),
        this.acceleration.add(t),
        this.graphLayout.planarForce > 0)
      ) {
        let e = createVector(this.position.x, this.position.y, 0),
          t = this.getForceTowardsGoal(this.graphLayout.planarForce, e);
        this.acceleration.add(t);
      }
    } else {
      let e, o, r, a;
      if (
        (t.mult(this.graphLayout.separationFactor),
        this.acceleration.add(t),
        this.graphLayout.source.ordered
          ? ((e = this.getSpringForce(
              this.graphLayout.secondCoordinateEdgeLength,
              this.graphLayout.secondCoordinateForce,
              this.neighbors.filter((e) => e.label[0] === this.label[0])
            )),
            (o = this.getSpringForce(
              this.graphLayout.firstCoordinateEdgeLength,
              this.graphLayout.firstCoordinateForce,
              this.neighbors.filter((e) => e.label[1] === this.label[1])
            )))
          : ((e = createVector()),
            (e = this.getSpringForce(
              this.graphLayout.secondCoordinateEdgeLength,
              this.graphLayout.secondCoordinateForce,
              this.neighbors.filter(
                (e) =>
                  e.label[0] === this.label[0] ||
                  e.label[0] === this.label[1] ||
                  e.label[1] === this.label[0] ||
                  e.label[1] === this.label[1]
              )
            )),
            (o = createVector())),
        this.graphLayout.source.ordered
          ? ((r = this.getForceTowardsGoal(
              this.graphLayout.firstCoordinateMirrorForce,
              graph.graphLayout.getNode(this.label[0]).position
            )),
            (a = this.getForceTowardsGoal(
              this.graphLayout.secondCoordinateMirrorForce,
              graph.graphLayout.getNode(this.label[1]).position
            )))
          : ((r = this.getForceTowardsGoal(
              this.graphLayout.firstCoordinateMirrorForce,
              graph.graphLayout.getNode(this.label[0]).position
            )),
            (a = this.getForceTowardsGoal(
              this.graphLayout.firstCoordinateMirrorForce,
              graph.graphLayout.getNode(this.label[1]).position
            ))),
        graph.graphLayout.nodes.forEach((e) => {
          e.applyExtraCenterForce &&
            (this.label[0] === e.label &&
              (r = r.add(
                this.getForceTowardsGoal(
                  this.graphLayout.extraCenterPreference,
                  e.position
                )
              )),
            this.label[1] === e.label &&
              (a = a.add(
                this.getForceTowardsGoal(
                  -this.graphLayout.extraCenterPreference,
                  e.position
                )
              )));
        }),
        this.graphLayout.squarePlanarForce > 0)
      )
        for (let e of this.neighbors.filter(
          (e) => e.label[0] === this.label[0]
        ))
          for (let t of this.neighbors.filter(
            (e) => e.label[1] === this.label[1]
          ))
            if (t.label[0] !== e.label[1]) {
              let o = getFourthPoint(
                  this.graphLayout.getNode([t.label[0], e.label[1]]).position,
                  e.position,
                  t.position
                ),
                r = this.getForceTowardsGoal(
                  this.graphLayout.squarePlanarForce,
                  o
                );
              this.acceleration.add(r);
            }
      e.mult(1 * this.graphLayout.cohesionFactor),
        o.mult(1 * this.graphLayout.cohesionFactor),
        this.acceleration.add(e),
        this.acceleration.add(o),
        this.acceleration.add(r),
        this.acceleration.add(a);
    }
    let o = this.getForceTowardsGoal(
      this.graphLayout.centerForce,
      this.graphLayout.center
    );
    if ((this.acceleration.add(o), this.applyExtraCenterForce)) {
      let e = this.getForceTowardsGoal(
        this.graphLayout.extraCenterForce,
        this.graphLayout.center
      );
      this.acceleration.add(e);
    }
  }
  move() {
    this.frozen ||
      (this.velocity.add(this.acceleration),
      limitVector(this.velocity, parameters.maxspeed),
      this.position.add(this.velocity),
      this.velocity.mult(0.9));
  }
  getCenter(e) {
    let t = new createVector(0, 0, 0);
    const o = e.length;
    for (let r of e) {
      const e = p5.Vector.div(r.position, o);
      t.add(e);
    }
    return t;
  }
  getSeparationFromNodes(e) {
    let t = new createVector(0, 0, 0);
    for (let o of e) {
      let e = p5.Vector.sub(this.position, o.position),
        r = e.mag();
      r > 1 &&
        (e.normalize().mult(this.graphLayout.repulsion / (r * r)), t.add(e));
    }
    return t;
  }
  getSpringForce(e, t, o) {
    let r = new createVector(0, 0, 0);
    for (let a of o) {
      let o = p5.Vector.sub(this.position, a.position),
        s = o.mag() - e;
      abs(s) > this.graphLayout.cohesionthreshold &&
        (o.normalize().mult(-t * s), r.add(o));
    }
    return limitVector(r, e), r;
  }
  getForceTowardsGoal(e, t) {
    let o = p5.Vector.sub(t, this.position),
      r = o.mag();
    return (
      abs(r) > this.graphLayout.cohesionthreshold && o.normalize().mult(e * r),
      o
    );
  }
  occupied() {
    let e = !1;
    return (
      (this !== graph.robotA.nodeFrom &&
        this !== graph.robotA.nodeTo &&
        this !== graph.robotB.nodeFrom &&
        this !== graph.robotB.nodeTo) ||
        (e = !0),
      e
    );
  }
  isInner() {
    return Array.isArray(this.label) && Array.isArray(this.label[0]);
  }
  show(e) {
    if (
      parameters.debugMode &&
      "graph" !== this.graphLayout.source.type &&
      !this.isInner()
    ) {
      e.strokeWeight(parameters.edgeWidthConfigSpace);
      let t = graph.graphLayout.getNode(this.label[0]).position,
        o = graph.graphLayout.getNode(this.label[1]).position;
      e.stroke(255, 127, 80, 100),
        e.line(
          this.position.x,
          this.position.y,
          this.position.z,
          t.x,
          t.y,
          t.z
        ),
        e.stroke(153, 50, 204, 100),
        e.line(
          this.position.x,
          this.position.y,
          this.position.z,
          o.x,
          o.y,
          o.z
        );
      for (let t of this.getSquareNeighbors()) {
        let o = t.getCentroid();
        e.strokeWeight(parameters.edgeWidthConfigSpace);
        let r = o;
        e.stroke(50, 50, 255, 50),
          e.line(
            this.position.x,
            this.position.y,
            this.position.z,
            r.x,
            r.y,
            r.z
          ),
          e.push(),
          e.translate(r.x, r.y, r.z),
          e.fill(120, 255, 255),
          e.ambientMaterial(120, 255, 255),
          e.sphere(
            0.25 * parameters.nodeSize,
            parameters.sphereDetail,
            parameters.sphereDetail
          ),
          e.pop();
      }
    }
    if (
      (this.nodeBorder
        ? (e.stroke(150),
          e.strokeWeight(
            parameters.nodeSize * this.graphLayout.nodeBorderWidth
          ))
        : e.noStroke(),
      this.graphLayout.layout3D)
    ) {
      if (
        (e.push(),
        e.translate(this.position.x, this.position.y, this.position.z),
        deleteNodeMode && !this.occupied() && e === graphicsForGraph
          ? (e.fill(parameters.deleteNodeColor),
            e.ambientMaterial(parameters.deleteNodeColor))
          : (this.applyExtraCenterForce
              ? (e.fill(0, 255, 0), e.ambientMaterial(0, 255, 0))
              : this.active
              ? (e.fill(parameters.activeDotColor),
                e.ambientMaterial(parameters.activeDotColor))
              : this.firstNodeOfEdge
              ? (e.fill(parameters.selectedNodeForEdgeColor),
                e.ambientMaterial(parameters.selectedNodeForEdgeColor))
              : (e.fill(parameters.colorNode),
                e.ambientMaterial(parameters.colorNode)),
            e.specularMaterial(128),
            e.shininess(64)),
        parameters.sphereView)
      )
        e.sphere(
          0.5 * parameters.nodeSize,
          parameters.sphereDetail,
          parameters.sphereDetail
        );
      else {
        let t = e.easycam.getRotation(),
          o = QuaternionToEuler(t[0], t[1], t[2], t[3]);
        e.rotateX(-o[0]),
          e.rotateY(-o[1]),
          e.rotateZ(-o[2]),
          e.translate(0, 0, 1),
          e.stroke(0),
          e.strokeWeight(1),
          e.ellipse(
            0,
            0,
            parameters.nodeSize * (this.isInner() ? 0.5 : 1),
            parameters.nodeSize * (this.isInner() ? 0.5 : 1)
          );
      }
      if (
        selectedNodesInGraph.includes(this) ||
        selectedNodesInConfigSpace.includes(this)
      ) {
        let t = e.easycam.getRotation(),
          o = QuaternionToEuler(t[0], t[1], t[2], t[3]);
        e.rotateX(-o[0]),
          e.rotateY(-o[1]),
          e.rotateZ(-o[2]),
          e.stroke(128),
          e.noFill(),
          e.strokeWeight(2),
          e.ellipse(0, 0, 1.5 * parameters.nodeSize, 1.5 * parameters.nodeSize);
      }
      e.pop();
    }
  }
  showText(e) {
    if (
      (parameters.darkMode
        ? (e.fill(255, 255, 255), e.ambientMaterial(255, 255, 255))
        : (e.fill(0, 0, 0), e.ambientMaterial(0, 0, 0)),
      e.textAlign(CENTER, CENTER),
      e.textFont(font),
      e.textSize(parameters.fontSize),
      this.graphLayout.layout3D)
    ) {
      const t = e.easycam.getRotation(),
        o = QuaternionToEuler(t[0], t[1], t[2], t[3]);
      e.push(),
        e.translate(this.position.x, this.position.y, this.position.z),
        e.rotateX(-o[0]),
        e.rotateY(-o[1]),
        e.rotateZ(-o[2]),
        e.translate(
          parameters.labelX,
          parameters.labelY,
          max(
            parameters.nodeSize,
            parameters.configNodeSize,
            parameters.robotsNodeSize
          ) + parameters.labelZ
        ),
        e.text(this.labelText, 0, -textDescent() / 2),
        e.pop();
    } else
      e.push(),
        e.translate(this.position.x, this.position.y, this.position.z),
        e.text(this.labelText, 0, 0),
        e.pop();
  }
  getSquareNeighbors() {
    let e = [];
    for (let t of this.graphLayout.squares)
      t.label[0].includes(this.label[0]) &&
        t.label[1].includes(this.label[1]) &&
        e.push(t);
    return e;
  }
}
let MAXLEVEL = 10,
  BUCKETSIZE = 10,
  NODEMASS = 1;
const EMPTY = 0,
  LEAF = 1,
  DIVIDED = 2,
  allNodesForce = -0.33,
  gravityPower = 2;
class Octree {
  constructor(e, t, o) {
    (this.graphLayout = e),
      (this.boundary = t),
      (this.level = o),
      (this.state = 0),
      (this.children = void 0),
      (this.centerOfMass = createVector()),
      (this.centerMass = 0);
  }
  subdivide() {
    this.state = 2;
    let e = this.boundary.x,
      t = this.boundary.y,
      o = this.boundary.z,
      r = this.boundary.w / 2,
      a = this.boundary.h / 2,
      s = this.boundary.d / 2;
    (this.URF = new Octree(
      this.graphLayout,
      new Cube(e + r, t - a, o + s, r, a, s),
      this.level + 1
    )),
      (this.ULF = new Octree(
        this.graphLayout,
        new Cube(e - r, t - a, o + s, r, a, s),
        this.level + 1
      )),
      (this.LRF = new Octree(
        this.graphLayout,
        new Cube(e + r, t + a, o + s, r, a, s),
        this.level + 1
      )),
      (this.LLF = new Octree(
        this.graphLayout,
        new Cube(e - r, t + a, o + s, r, a, s),
        this.level + 1
      )),
      (this.URB = new Octree(
        this.graphLayout,
        new Cube(e + r, t - a, o - s, r, a, s),
        this.level + 1
      )),
      (this.ULB = new Octree(
        this.graphLayout,
        new Cube(e - r, t - a, o - s, r, a, s),
        this.level + 1
      )),
      (this.LRB = new Octree(
        this.graphLayout,
        new Cube(e + r, t + a, o - s, r, a, s),
        this.level + 1
      )),
      (this.LLB = new Octree(
        this.graphLayout,
        new Cube(e - r, t + a, o - s, r, a, s),
        this.level + 1
      ));
  }
  insert(e) {
    if (0 == this.state)
      null == this.children && (this.children = []),
        this.children.push(e),
        (this.state = 1);
    else if (1 == this.state)
      if (this.children.length < BUCKETSIZE || this.level == MAXLEVEL)
        this.children.push(e);
      else {
        this.subdivide();
        for (let e of this.children) this.insertInOctant(e);
        (this.children = []), this.insertInOctant(e);
      }
    else
      2 == this.state ? this.insertInOctant(e) : error("insert: state unknown");
  }
  insertInOctant(e) {
    this.ULF.boundary.contains(e)
      ? this.ULF.insert(e)
      : this.URF.boundary.contains(e)
      ? this.URF.insert(e)
      : this.LLF.boundary.contains(e)
      ? this.LLF.insert(e)
      : this.LRF.boundary.contains(e)
      ? this.LRF.insert(e)
      : this.ULB.boundary.contains(e)
      ? this.ULB.insert(e)
      : this.URB.boundary.contains(e)
      ? this.URB.insert(e)
      : this.LLB.boundary.contains(e)
      ? this.LLB.insert(e)
      : this.LRB.boundary.contains(e)
      ? this.LRB.insert(e)
      : vverbose &&
        console.error(
          "insertInOctant: not in any octant: " +
            e.position +
            " " +
            this.boundary.toString() +
            "\nthis.ULF.boundary = " +
            this.ULF.boundary.toString() +
            "\nthis.URF.boundary = " +
            this.URF.boundary.toString() +
            "\nthis.LLF.boundary = " +
            this.LLF.boundary.toString() +
            "\nthis.LRF.boundary = " +
            this.LRF.boundary.toString() +
            "\nthis.ULB.boundary = " +
            this.ULB.boundary.toString() +
            "\nthis.URB.boundary = " +
            this.URB.boundary.toString() +
            "\nthis.LLB.boundary = " +
            this.LLB.boundary.toString() +
            "\nthis.LRB.boundary = " +
            this.LRB.boundary.toString() +
            "\n"
        );
  }
  calculateMass() {
    if ((vverbose && console.log("calculateMass"), 0 == this.state));
    else if (1 == this.state) {
      this.centerOfMass.set(0, 0, 0), (this.centerMass = 0);
      let e = 0;
      for (let t of this.children)
        this.centerOfMass.add(p5.Vector.mult(t.position, t.mass)),
          (this.centerMass += t.mass),
          e++;
      this.centerOfMass.div(e);
    } else
      2 == this.state
        ? (this.centerOfMass.set(0, 0, 0),
          (this.centerMass = 0),
          this.URF.calculateMass(),
          this.ULF.calculateMass(),
          this.LRF.calculateMass(),
          this.LLF.calculateMass(),
          this.URB.calculateMass(),
          this.ULB.calculateMass(),
          this.LRB.calculateMass(),
          this.LLB.calculateMass(),
          this.centerOfMass.add(
            p5.Vector.mult(this.URF.centerOfMass, this.URF.centerMass)
          ),
          (this.centerMass += this.URF.centerMass),
          this.centerOfMass.add(
            p5.Vector.mult(this.ULF.centerOfMass, this.ULF.centerMass)
          ),
          (this.centerMass += this.ULF.centerMass),
          this.centerOfMass.add(
            p5.Vector.mult(this.LRF.centerOfMass, this.LRF.centerMass)
          ),
          (this.centerMass += this.LRF.centerMass),
          this.centerOfMass.add(
            p5.Vector.mult(this.LLF.centerOfMass, this.LLF.centerMass)
          ),
          (this.centerMass += this.LLF.centerMass),
          this.centerOfMass.add(
            p5.Vector.mult(this.URB.centerOfMass, this.URB.centerMass)
          ),
          (this.centerMass += this.URB.centerMass),
          this.centerOfMass.add(
            p5.Vector.mult(this.ULB.centerOfMass, this.ULB.centerMass)
          ),
          (this.centerMass += this.ULB.centerMass),
          this.centerOfMass.add(
            p5.Vector.mult(this.LRB.centerOfMass, this.LRB.centerMass)
          ),
          (this.centerMass += this.LRB.centerMass),
          this.centerOfMass.add(
            p5.Vector.mult(this.LLB.centerOfMass, this.LLB.centerMass)
          ),
          (this.centerMass += this.LLB.centerMass),
          this.centerOfMass.div(this.centerMass))
        : (vverbose && console.log("ERROR"),
          error("calculateMass: state unknown"));
  }
  getAllNodesForces(e) {
    let t = createVector();
    if (0 == this.state);
    else if (1 == this.state) {
      for (let o of this.children)
        if (e != o) {
          let r = p5.Vector.sub(e.position, o.position),
            a = r.mag();
          a > 1 &&
            (r.normalize().mult(this.graphLayout.repulsion / pow(a, 2)),
            t.add(r));
        }
    } else if (2 == this.state) {
      let o = this.centerOfMass.dist(e.position);
      if (o > parameters.THETA * this.boundary.w) {
        let r = p5.Vector.sub(e.position, this.centerOfMass);
        o > 1 &&
          (r
            .normalize()
            .mult((this.graphLayout.repulsion * this.centerMass) / pow(o, 2)),
          t.add(r));
      } else
        t.add(this.ULF.getAllNodesForces(e)),
          t.add(this.URF.getAllNodesForces(e)),
          t.add(this.LLF.getAllNodesForces(e)),
          t.add(this.LRF.getAllNodesForces(e)),
          t.add(this.ULB.getAllNodesForces(e)),
          t.add(this.URB.getAllNodesForces(e)),
          t.add(this.LLB.getAllNodesForces(e)),
          t.add(this.LRB.getAllNodesForces(e));
    } else vverbose && error("forcesOnNode: state missing");
    return t;
  }
  show(e) {
    if (
      (e.push(),
      e.translate(this.boundary.x, this.boundary.y, this.boundary.z),
      e.stroke(0),
      e.strokeWeight(1),
      e.noFill(),
      e.box(2 * this.boundary.w, 2 * this.boundary.h, 2 * this.boundary.d),
      e.pop(),
      null != this.children)
    )
      for (let t of this.children)
        e.stroke(60, 255, 255, 255),
          e.strokeWeight(1),
          e.line(
            this.centerOfMass.x,
            this.centerOfMass.y,
            this.centerOfMass.z,
            t.position.x,
            t.position.y,
            t.position.z
          ),
          e.push(),
          e.translate(
            this.centerOfMass.x,
            this.centerOfMass.y,
            this.centerOfMass.z
          ),
          e.fill(210, 255, 255, 255),
          e.noStroke(),
          e.sphere(10),
          e.pop();
    2 == this.state &&
      (this.URF.show(e),
      this.ULF.show(e),
      this.LRF.show(e),
      this.LLF.show(e),
      this.URB.show(e),
      this.ULB.show(e),
      this.LRB.show(e),
      this.LLB.show(e));
  }
}
class Cube {
  constructor(e, t, o, r, a, s) {
    (this.x = e),
      (this.y = t),
      (this.z = o),
      (this.w = r),
      (this.h = a),
      (this.d = s);
  }
  contains(e) {
    return (
      e.position.x >= this.x - this.w &&
      e.position.x <= this.x + this.w &&
      e.position.y >= this.y - this.h &&
      e.position.y <= this.y + this.h &&
      e.position.z >= this.z - this.d &&
      e.position.z <= this.z + this.d
    );
  }
  intersects(e) {
    return !(
      e.x - e.w > this.x + this.w ||
      e.x + e.w < this.x - this.w ||
      e.y - e.h > this.y + this.h ||
      e.y + e.h < this.y - this.h ||
      e.z - e.d > this.z + this.d ||
      e.z + e.d < this.z - this.d
    );
  }
  toString() {
    return (
      "x=" +
      this.x +
      " y=" +
      this.y +
      " z=" +
      this.z +
      " w=" +
      this.w +
      " h=" +
      this.h +
      " d=" +
      this.d
    );
  }
}
class Robot {
  constructor(e, t, o) {
    (this.graph = e),
      (this.nodeFrom = t),
      (this.nodeTo = t),
      (this.amount = 0),
      (this.index = o),
      (this.visited = []);
  }
  occupyingNodes() {
    return [this.nodeFrom, this.nodeTo];
  }
  getCandidates() {
    return this.nodeFrom.neighbors.filter(
      (e) => !this.graph.otherRobot(this).occupyingNodes().includes(e)
    );
  }
  getAllPossibleEdges() {
    let e = this.graph
      .otherRobot(this)
      .occupyingNodes()
      .map((e) => e.label);
    return this.graph.edges.filter(
      (t) => !e.includes(t[0]) && !e.includes(t[1])
    );
  }
  getRandomNeighbor() {
    let e = this.getCandidates();
    return e.length > 0 && e[floor(random(e.length))];
  }
  setNodeTo(e) {
    this.visited.push(e),
      (this.nodeTo = e),
      (this.amount = 1e-4),
      (this.graph.graphLayout.getEdge(
        this.nodeFrom.label,
        this.nodeTo.label,
        !1
      ).owner = this);
  }
  setNeighbor(e) {
    (this.nodeTo = e),
      (this.graph.graphLayout.getEdge(
        this.nodeFrom.label,
        this.nodeTo.label,
        !1
      ).owner = this);
  }
  setRandomNeighborIfPossible() {
    console.log("setRandomNeighborIfPossible");
    let e = this.getCandidates();
    e.length > 0 && (this.nodeTo = e[floor(random(e.length))]);
  }
  setAmount(e) {
    if (
      (this.nodeFrom !== this.nodeTo && (this.amount = constrain(e, 0, 1)),
      0 === this.amount &&
        (vverbose && console.log("this.amount === 0.0"),
        vverbose && console.log(this.nodeFrom.label + " " + this.nodeTo.label),
        vverbose &&
          console.log(
            this.graph.graphLayout.getEdge(
              this.nodeFrom.label,
              this.nodeTo.label,
              !1
            )
          ),
        this.nodeFrom !== this.nodeTo &&
          ((this.graph.graphLayout.getEdge(
            this.nodeFrom.label,
            this.nodeTo.label,
            !1
          ).owner = void 0),
          (this.nodeTo = this.nodeFrom)),
        parameters.moveDotsRandomly))
    ) {
      let e = this.getRandomNeighbor();
      if (!e) return !1;
      this.setNodeTo(e);
    }
    1 === this.amount &&
      (vverbose && console.log("this.amount === 1.0"),
      vverbose && console.log(this.nodeFrom.label + " " + this.nodeTo.label),
      vverbose &&
        console.log(
          this.graph.graphLayout.getEdge(
            this.nodeFrom.label,
            this.nodeTo.label,
            !1
          )
        ),
      this.nodeFrom !== this.nodeTo &&
        (vverbose && console.log("resetting!"),
        (this.graph.graphLayout.getEdge(
          this.nodeFrom.label,
          this.nodeTo.label,
          !1
        ).owner = void 0),
        (this.amount = 0),
        (this.nodeFrom = this.nodeTo)));
  }
  getPosition() {
    return p5.Vector.lerp(
      this.nodeFrom.position,
      this.nodeTo.position,
      this.amount
    );
  }
  inANode() {
    return this.nodeFrom === this.nodeTo;
  }
  show(e) {
    let t = this.getPosition();
    if (
      (this.nodeBorder
        ? (e.stroke(150),
          e.strokeWeight(
            parameters.graphRobotSize * this.graphLayout.nodeBorderWidth
          ))
        : e.noStroke(),
      e.fill(
        0 === this.index ? parameters.colorRobotA : parameters.colorRobotB
      ),
      e.ambientMaterial(
        0 === this.index ? parameters.colorRobotA : parameters.colorRobotB
      ),
      this.graph.graphLayout.layout3D)
    ) {
      if ((e.push(), e.translate(t.x, t.y, t.z), parameters.sphereView)) {
        let t = parameters.sphereDetail;
        e.sphere((this.active ? 0.55 : 0.5) * parameters.robotsNodeSize, t, t);
      } else {
        let t = e.easycam.getRotation(),
          o = QuaternionToEuler(t[0], t[1], t[2], t[3]);
        e.rotateX(-o[0]),
          e.rotateY(-o[1]),
          e.rotateZ(-o[2]),
          e.translate(0, 0, 20),
          e.ellipse(
            0,
            0,
            (this.active ? 1.1 : 1) * parameters.robotsNodeSize,
            (this.active ? 1.1 : 1) * parameters.robotsNodeSize
          );
      }
      e.pop();
    }
  }
}
class Square {
  constructor(e, t, o, r, a, s) {
    (this.graphLayout = e),
      (this.graphics = e.graphics),
      (this.label = t),
      (this.edgeAfrom = o),
      (this.edgeAto = r),
      (this.edgeBfrom = a),
      (this.edgeBto = s),
      (this.innerEdges = []),
      (this.innerSquares = []),
      vverbose && print("square created!"),
      vverbose && print(this);
  }
  getInnernode(e) {
    for (let t of this.innerNodes) if (arraysEqual(t.label, e)) return t;
  }
  createInnerNodes() {
    this.innerNodes = [];
    for (let e = 1; e < this.edgeAfrom.granularity; e++)
      for (let t = 1; t < this.edgeBfrom.granularity; t++) {
        let o = e / this.edgeAfrom.granularity,
          r = t / this.edgeBfrom.granularity,
          a = this.getPosition(o, r),
          s = new InnerNode(
            this,
            this.graphLayout,
            [e, t],
            a,
            (1 / this.edgeAfrom.granularity) * (1 / this.edgeBfrom.granularity)
          );
        this.innerNodes.push(s);
      }
    for (let e = 1; e < this.edgeAfrom.granularity; e++)
      for (let t = 1; t < this.edgeBfrom.granularity; t++) {
        let o = this.getInnernode([e, t]),
          r = this.getInnernode([e, t - 1]),
          a = this.getInnernode([e, t + 1]),
          s = this.getInnernode([e - 1, t]),
          i = this.getInnernode([e + 1, t]);
        void 0 !== r && o.neighborsA.push(r),
          void 0 !== a && o.neighborsA.push(a),
          void 0 !== s && o.neighborsB.push(s),
          void 0 !== i && o.neighborsB.push(i);
      }
    for (let e = 1; e < this.edgeAfrom.granularity; e++)
      this.getInnernode([e, 1]).neighborsA.push(this.edgeAfrom.innerNodes[e]),
        this.edgeAfrom.innerNodes[e].neighborsA.push(this.getInnernode([e, 1])),
        this.getInnernode([e, this.edgeAfrom.granularity - 1]).neighborsA.push(
          this.edgeAto.innerNodes[e]
        ),
        this.edgeAto.innerNodes[e].neighborsA.push(
          this.getInnernode([e, this.edgeAfrom.granularity - 1])
        );
    for (let e = 1; e < this.edgeBfrom.granularity; e++)
      this.getInnernode([1, e]).neighborsB.push(this.edgeBfrom.innerNodes[e]),
        this.edgeBfrom.innerNodes[e].neighborsB.push(this.getInnernode([1, e])),
        this.getInnernode([this.edgeAfrom.granularity - 1, e]).neighborsB.push(
          this.edgeBto.innerNodes[e]
        ),
        this.edgeBto.innerNodes[e].neighborsB.push(
          this.getInnernode([this.edgeAfrom.granularity - 1, e])
        );
  }
  forceInnerNodesToTheirPositions() {
    for (let e of this.innerNodes) {
      let t = e.label[0] / this.edgeAfrom.granularity,
        o = e.label[1] / this.edgeBfrom.granularity;
      e.position = this.getPosition(t, o);
    }
  }
  updateRepulsionForce(e) {
    let t = this.getCentroid(),
      o = new createVector(0, 0, 0);
    for (let r of e) {
      let e = p5.Vector.sub(t, r),
        a = e.mag();
      a > 1 &&
        (e.normalize().mult(this.graphLayout.centroidRepulsion / (a * a)),
        o.add(e));
    }
    this.centroidRepulsionForce = o;
  }
  getPosition(e, t) {
    let o = this.edgeAfrom.amountAlong(e),
      r = this.edgeAto.amountAlong(e);
    return p5.Vector.lerp(o, r, t);
  }
  show() {
    if (parameters.gridOn) {
      this.graphics.strokeWeight(parameters.edgeWidthGrid);
      for (let e = 1; e < this.edgeAfrom.innerNodes.length; e++) {
        let t = this.edgeAfrom.innerNodes[e].position,
          o = this.edgeAto.innerNodes[e].position;
        this.graphics.stroke(parameters.colorRobotA),
          this.graphics.line(t.x, t.y, t.z, o.x, o.y, o.z);
      }
      for (let e = 1; e < this.edgeBfrom.innerNodes.length; e++) {
        let t = this.edgeBfrom.innerNodes[e].position,
          o = this.edgeBto.innerNodes[e].position;
        this.graphics.stroke(parameters.colorRobotB),
          this.graphics.line(t.x, t.y, t.z, o.x, o.y, o.z);
      }
    }
    parameters.squareOn &&
      (this.graphics.noStroke(),
      this.graphics.fill(
        red(parameters.squareColor),
        green(parameters.squareColor),
        blue(parameters.squareColor),
        parameters.squareOpacity
      ),
      this.graphics.beginShape(),
      this.graphics.vertex(
        this.edgeAfrom.nodeFrom.position.x,
        this.edgeAfrom.nodeFrom.position.y,
        this.edgeAfrom.nodeFrom.position.z
      ),
      this.graphics.vertex(
        this.edgeAfrom.nodeTo.position.x,
        this.edgeAfrom.nodeTo.position.y,
        this.edgeAfrom.nodeTo.position.z
      ),
      this.graphics.vertex(
        this.edgeAto.nodeTo.position.x,
        this.edgeAto.nodeTo.position.y,
        this.edgeAto.nodeTo.position.z
      ),
      this.graphics.vertex(
        this.edgeAto.nodeFrom.position.x,
        this.edgeAto.nodeFrom.position.y,
        this.edgeAto.nodeFrom.position.z
      ),
      this.graphics.endShape(CLOSE));
  }
  getCentroid() {
    let e = createVector();
    return (
      e.add(this.edgeAfrom.nodeFrom.position),
      e.add(this.edgeAfrom.nodeTo.position),
      e.add(this.edgeAto.nodeTo.position),
      e.add(this.edgeAto.nodeFrom.position),
      e.div(4),
      e
    );
  }
}
function updateURL() {
  if ((verbose && console.log("updateURL"), history.pushState)) {
    let e =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      ("custom" === parameters.graphType || graphIsCustomized
        ? "graph=custom&nodes=" +
          graph.nodes +
          "&edges=" +
          edgesToString(graph.edges)
        : "graph=" + parameters.graphType) +
      "&view=" +
      (parameters.dualView ? "dual" : "single") +
      "&showgraph=" +
      parameters.showGraph +
      "&showconfigspace=" +
      parameters.showConfigurationspace +
      "&showrobots=" +
      parameters.showRobots;
    window.history.pushState({ path: e }, "", e), verbose && console.log(e);
  }
}
function setParametersFromURL() {
  verbose && console.log("setParametersFromURL");
  let e = getURL(),
    t = split(e, "?");
  if (2 !== t.length) return;
  let o,
    r,
    a = t[1],
    s = {};
  for (let e of split(a, "&")) {
    let t = split(e, "=");
    s[t[0]] = t[1];
  }
  if (void 0 !== s.file) return void readFromFile(s.file);
  verbose && console.log("setParametersFromURL continues");
  let i = [],
    n = s.view;
  "single" === n
    ? (parameters.dualView = !1)
    : "dual" === n && (parameters.dualView = !0);
  let h = s.showgraph;
  parameters.showGraph = "false" !== h;
  let p = s.showconfigspace;
  parameters.showConfigurationspace = "false" !== p;
  let d = s.showrobots;
  parameters.showRobots = "false" !== d;
  let c = s.graph;
  if (void 0 !== c && "custom" !== c) parameters.graphType = c;
  else {
    let e = s.nodes;
    if (void 0 === e) return;
    o = e.split(",").map(Number);
    for (let e of o) if (isNaN(e)) return;
    let t = s.edges;
    vverbose && console.log(t),
      null !== t && (t = decodeURIComponent(t)),
      vverbose && console.log(t),
      void 0 !== t &&
        "[" == t.charAt(0) &&
        "]" == t.charAt(t.length - 1) &&
        (vverbose && console.log("🎉 success []"),
        (t = t.slice(1, -1)),
        (i = t.split(/[^\d],[^\d]/).map((e) => e.split(",").map(Number)))),
      (r = []);
    for (let e of i)
      2 === e.length &&
        o.includes(e[0]) &&
        o.includes(e[1]) &&
        e[0] !== e[1] &&
        !edgesContainEdge(r, e) &&
        r.push(e);
    void 0 !== o &&
      ((customGraph = {}),
      (customGraph.nodes = o),
      (customGraph.edges = r),
      (graphIsCustomized = !0),
      (parameters.graphType = "custom"));
  }
}
function handleFile(e) {
  readFromString(e.data.split("\n"));
}
function writeToFiles() {
  writeParametersToFile();
}
function writeParametersToFile() {
  let e = makeFileName("");
  updateInfoString(),
    saveStrings(infoStrings, e, "txt"),
    saveCanvas(configuration_space.graphLayout.graphics, e + ".png");
}
function writeLayoutToFile() {
  updateLayoutStrings(),
    saveStrings(layoutStrings, makeFileName("-layout"), "txt");
}
function writeChainComplexToFile() {
  let e = getChompString();
  saveStrings([e], makeFileName(""), "chn");
}
function writeObjToFile() {
  let e = getObjString();
  saveStrings([e], makeFileName(""), "obj");
}
function readHomology() {
  const e = "catalog/" + parameters.graphType + ".gen";
  loadStrings(e, saveLoopsInConfigurationSpace);
}
function readFromFile(e) {
  loadStrings(e, readFromString);
}
function readLayoutFromFile(e) {
  loadStrings(e, readLayoutFromStrings);
}
function readFromString(e) {
  verbose && console.log("readFromString");
  let t = {};
  for (let o of e) {
    if ("" === o) continue;
    let e = split(o, " = ");
    2 === e.length && (t[e[0]] = e[1]);
  }
  (parameters.graphType = t.Graph),
    "custom" === parameters.graphType &&
      ((customGraph = {}),
      (customGraph.nodes = JSON.parse(t.Nodes)),
      (customGraph.edges = JSON.parse(t.Edges)));
  let o = t.Parameters,
    r = JSON.parse(o);
  (parameters.mode = r.mode),
    (parameters.showGraph = r.showGraph),
    (parameters.showConfigurationspace = r.showConfigurationspace),
    (parameters.showRobots = r.showRobots),
    (parameters.syncView = r.syncView),
    (parameters.distinguishDots = r.distinguishDots),
    (parameters.gridOn = r.gridOn),
    (parameters.squareOn = r.squareOn),
    (parameters.showHyperplanes = r.showHyperplanes),
    (parameters.granularityFirstCoordinate = r.granularityFirstCoordinate),
    (parameters.granularitySecondCoordinate = r.granularitySecondCoordinate),
    (parameters.showText = r.showText),
    (parameters.sphereView = r.sphereView),
    (parameters.lights = r.lights),
    (parameters.moveDotsRandomly = r.moveDotsRandomly),
    (parameters.robotASpeed = r.robotASpeed),
    (parameters.robotBSpeed = r.robotBSpeed),
    (parameters.amountMultiplier = r.amountMultiplier),
    (parameters.recordHistory = r.recordHistory),
    (parameters.showHistory = r.showHistory),
    (parameters.sphereDetail = r.sphereDetail),
    (parameters.speedUp = r.speedUp),
    (parameters.labelX = r.labelX),
    (parameters.labelY = r.labelY),
    (parameters.labelZ = r.labelZ),
    (parameters.colorRobotA = r.colorRobotA),
    (parameters.colorRobotB = r.colorRobotB),
    (parameters.colorConfig = r.colorConfig),
    (parameters.colorNode = r.colorNode),
    (parameters.colorGraphEdge = r.colorGraphEdge),
    (parameters.squareColor = r.squareColor),
    (parameters.squareOpacity = r.squareOpacity),
    (parameters.activeDotColor = r.activeDotColor),
    (parameters.deleteNodeColor = r.deleteNodeColor),
    (parameters.selectedNodeForEdgeColor = r.selectedNodeForEdgeColor),
    (parameters.nodeSize = r.nodeSize),
    (parameters.robotsNodeSize = r.robotsNodeSize),
    (parameters.configNodeSize = r.configNodeSize),
    (parameters.edgeWidthGraph = r.edgeWidthGraph),
    (parameters.edgeWidthConfigSpace = r.edgeWidthConfigSpace),
    (parameters.edgeWidthGrid = r.edgeWidthGrid),
    (parameters.maxspeed = r.maxspeed),
    verbose && console.log("readFromString: call initView and initGraph"),
    initView(),
    initGraph(parameters.graphType);
  let a = JSON.parse(t["Graph nodes with extra center force"]);
  for (let e of a) graph.graphLayout.getNode(e).applyExtraCenterForce = !0;
  let s = t["Graph parameters"],
    i = JSON.parse(s);
  (graph.graphLayout.edgelength = i.edgelength),
    (graph.graphLayout.cohesionthreshold = i.cohesionthreshold),
    (graph.graphLayout.repulsion = i.repulsion),
    (graph.graphLayout.separationFactor = i.separationFactor),
    (graph.graphLayout.planarForce = i.planarForce),
    (graph.graphLayout.centerForce = i.centerForce),
    (graph.graphLayout.extraCenterForce = i.extraCenterForce),
    (graph.graphLayout.moveToCenter = i.moveToCenter);
  let n = t["Configuration space parameters"],
    h = JSON.parse(n);
  (configuration_space.graphLayout.firstCoordinateEdgeLength =
    h.firstCoordinateEdgeLength),
    (configuration_space.graphLayout.firstCoordinateForce =
      h.firstCoordinateForce),
    (configuration_space.graphLayout.secondCoordinateEdgeLength =
      h.secondCoordinateEdgeLength),
    (configuration_space.graphLayout.secondCoordinateForce =
      h.secondCoordinateForce),
    (configuration_space.graphLayout.firstCoordinateMirrorForce =
      h.firstCoordinateMirrorForce),
    (configuration_space.graphLayout.secondCoordinateMirrorForce =
      h.secondCoordinateMirrorForce),
    (configuration_space.graphLayout.coordinatePreference =
      h.coordinatePreference),
    (configuration_space.graphLayout.extraCenterPreference =
      h.extraCenterPreference),
    (configuration_space.graphLayout.cohesionthreshold = h.cohesionthreshold),
    (configuration_space.graphLayout.repulsion = h.repulsion),
    (configuration_space.graphLayout.separationFactor = h.separationFactor),
    (configuration_space.graphLayout.centerForce = h.centerForce),
    (configuration_space.graphLayout.extraCenterForce = h.extraCenterForce),
    (configuration_space.graphLayout.moveToCenter = h.moveToCenter),
    verbose && console.log("readFromString: call initGUI");
  for (let e of graph.nodes) {
    let o = graph.graphLayout.getNode(e),
      r = t["Node position (" + e + ")"];
    void 0 !== r &&
      "[" == r.charAt(0) &&
      "]" == r.charAt(r.length - 1) &&
      ((r = r.slice(1, -1)), (r = r.split(",").map(Number))),
      (o.position = createVector(r[0], r[1], r[2]));
  }
  for (let e of configuration_space.graphLayout.nodes) {
    let o = t["Configuration position (" + e.label[0] + "," + e.label[1] + ")"];
    void 0 !== o &&
      "[" == o.charAt(0) &&
      "]" == o.charAt(o.length - 1) &&
      ((o = o.slice(1, -1)), (o = o.split(",").map(Number))),
      verbose && console.log("configuration coordinates = " + o),
      (e.position = createVector(o[0], o[1], o[2]));
  }
  let p = t["Camera state"];
  graphicsForConfigurationSpace.easycam.setState(JSON.parse(p), 0),
    (parameters.mode = "Move"),
    verbose && console.log("readFromString: call updateMode"),
    easyCamOff();
}
function readLayoutFromStrings(e) {
  vverbose && console.log("readLayoutFromStrings");
  let t = {};
  for (let o of e) {
    if ("" === o) continue;
    let e = split(o, " = ");
    2 === e.length && (t[e[0]] = e[1]);
  }
  let o = t["Graph parameters"],
    r = JSON.parse(o);
  (graph.graphLayout.edgelength = r.edgelength),
    (graph.graphLayout.cohesionthreshold = r.cohesionthreshold),
    (graph.graphLayout.repulsion = r.repulsion),
    (graph.graphLayout.separationFactor = r.separationFactor),
    (graph.graphLayout.planarForce = r.planarForce),
    (graph.graphLayout.centerForce = r.centerForce),
    (graph.graphLayout.extraCenterForce = r.extraCenterForce),
    (graph.graphLayout.moveToCenter = r.moveToCenter);
  let a = t["Configuration space parameters"],
    s = JSON.parse(a);
  (configuration_space.graphLayout.firstCoordinateEdgeLength =
    s.firstCoordinateEdgeLength),
    (configuration_space.graphLayout.firstCoordinateForce =
      s.firstCoordinateForce),
    (configuration_space.graphLayout.secondCoordinateEdgeLength =
      s.secondCoordinateEdgeLength),
    (configuration_space.graphLayout.secondCoordinateForce =
      s.secondCoordinateForce),
    (configuration_space.graphLayout.firstCoordinateMirrorForce =
      s.firstCoordinateMirrorForce),
    (configuration_space.graphLayout.secondCoordinateMirrorForce =
      s.secondCoordinateMirrorForce),
    (configuration_space.graphLayout.coordinatePreference =
      s.coordinatePreference),
    (configuration_space.graphLayout.extraCenterPreference =
      s.extraCenterPreference),
    (configuration_space.graphLayout.cohesionthreshold = s.cohesionthreshold),
    (configuration_space.graphLayout.repulsion = s.repulsion),
    (configuration_space.graphLayout.separationFactor = s.separationFactor),
    (configuration_space.graphLayout.centerForce = s.centerForce),
    (configuration_space.graphLayout.extraCenterForce = s.extraCenterForce),
    (configuration_space.graphLayout.moveToCenter = s.moveToCenter),
    (configuration_space.graphLayout.squarePlanarForce = s.squarePlanarForce);
}
function labelToString(e) {
  let t = "";
  if (Array.isArray(e)) {
    for (let o of e) t += o + " ";
    return (t = t.slice(0, -1)), t;
  }
  return e;
}
function posToString(e) {
  return "[" + e.x + "," + e.y + "," + e.z + "]";
}
function edgesToString(e) {
  let t = "";
  for (let o of e) t += "[" + o + "],";
  return (t = t.substr(0, t.length - 1)), t;
}
function updateInfoString() {
  (infoStrings = []),
    infoStrings.push("Graph = " + parameters.graphType),
    infoStrings.push("Nodes = " + JSON.stringify(graph.nodes)),
    infoStrings.push("Edges = " + JSON.stringify(graph.edges));
  let e = [];
  for (let t of graph.graphLayout.nodes)
    t.applyExtraCenterForce && e.push(t.label);
  infoStrings.push(
    "Graph nodes with extra center force = " + JSON.stringify(e)
  );
  let t = graphicsForConfigurationSpace.easycam.getState();
  infoStrings.push("Camera state = " + JSON.stringify(t));
  let o = {};
  (o.mode = parameters.mode),
    (o.showGraph = parameters.showGraph),
    (o.showConfigurationspace = parameters.showConfigurationspace),
    (o.showRobots = parameters.showRobots),
    (o.syncView = parameters.syncView),
    (o.distinguishDots = parameters.distinguishDots),
    (o.gridOn = parameters.gridOn),
    (o.squareOn = parameters.squareOn),
    (o.showHyperplanes = parameters.showHyperplanes),
    (o.granularityFirstCoordinate = parameters.granularityFirstCoordinate),
    (o.granularitySecondCoordinate = parameters.granularitySecondCoordinate),
    (o.showText = parameters.showText),
    (o.sphereView = parameters.sphereView),
    (o.lights = parameters.lights),
    (o.moveDotsRandomly = parameters.moveDotsRandomly),
    (o.robotASpeed = parameters.robotASpeed),
    (o.robotBSpeed = parameters.robotBSpeed),
    (o.amountMultiplier = parameters.amountMultiplier),
    (o.recordHistory = parameters.recordHistory),
    (o.showHistory = parameters.showHistory),
    (o.sphereDetail = parameters.sphereDetail),
    (o.speedUp = parameters.speedUp),
    (o.labelX = parameters.labelX),
    (o.labelY = parameters.labelY),
    (o.labelZ = parameters.labelZ),
    (o.colorRobotA = parameters.colorRobotA),
    (o.colorRobotB = parameters.colorRobotB),
    (o.colorConfig = parameters.colorConfig),
    (o.colorNode = parameters.colorNode),
    (o.colorGraphEdge = parameters.colorGraphEdge),
    (o.squareColor = parameters.squareColor),
    (o.squareOpacity = parameters.squareOpacity),
    (o.activeDotColor = parameters.activeDotColor),
    (o.deleteNodeColor = parameters.deleteNodeColor),
    (o.selectedNodeForEdgeColor = parameters.selectedNodeForEdgeColor),
    (o.nodeSize = parameters.nodeSize),
    (o.robotsNodeSize = parameters.robotsNodeSize),
    (o.configNodeSize = parameters.configNodeSize),
    (o.edgeWidthGraph = parameters.edgeWidthGraph),
    (o.edgeWidthConfigSpace = parameters.edgeWidthConfigSpace),
    (o.edgeWidthGrid = parameters.edgeWidthGrid),
    (o.maxspeed = parameters.maxspeed),
    infoStrings.push("Parameters = " + JSON.stringify(o));
  let r = {};
  (r.edgelength = graph.graphLayout.edgelength),
    (r.cohesionthreshold = graph.graphLayout.cohesionthreshold),
    (r.repulsion = graph.graphLayout.repulsion),
    (r.separationFactor = graph.graphLayout.separationFactor),
    (r.planarForce = graph.graphLayout.planarForce),
    (r.centerForce = graph.graphLayout.centerForce),
    (r.extraCenterForce = graph.graphLayout.extraCenterForce),
    (r.moveToCenter = graph.graphLayout.moveToCenter),
    infoStrings.push("Graph parameters = " + JSON.stringify(r));
  let a = {};
  (a.firstCoordinateEdgeLength =
    configuration_space.graphLayout.firstCoordinateEdgeLength),
    (a.firstCoordinateForce =
      configuration_space.graphLayout.firstCoordinateForce),
    (a.secondCoordinateEdgeLength =
      configuration_space.graphLayout.secondCoordinateEdgeLength),
    (a.secondCoordinateForce =
      configuration_space.graphLayout.secondCoordinateForce),
    (a.firstCoordinateMirrorForce =
      configuration_space.graphLayout.firstCoordinateMirrorForce),
    (a.secondCoordinateMirrorForce =
      configuration_space.graphLayout.secondCoordinateMirrorForce),
    (a.coordinatePreference =
      configuration_space.graphLayout.coordinatePreference),
    (a.extraCenterPreference =
      configuration_space.graphLayout.extraCenterPreference),
    (a.cohesionthreshold = configuration_space.graphLayout.cohesionthreshold),
    (a.repulsion = configuration_space.graphLayout.repulsion),
    (a.separationFactor = configuration_space.graphLayout.separationFactor),
    (a.centerForce = configuration_space.graphLayout.centerForce),
    (a.extraCenterForce = configuration_space.graphLayout.extraCenterForce),
    (a.moveToCenter = configuration_space.graphLayout.moveToCenter),
    infoStrings.push("Configuration space parameters = " + JSON.stringify(a));
  for (let e of graph.nodes)
    infoStrings.push(
      "Node position (" +
        e +
        ") = " +
        posToString(graph.graphLayout.getNode(e).position)
    );
  for (let e of configuration_space.graphLayout.nodes)
    infoStrings.push(
      "Configuration position (" + e.label + ") = " + posToString(e.position)
    );
  let s = "";
  s += "<div class='break-all'>";
  for (let e of infoStrings) s += e + "<br>";
  (s += "</div>"), infoDiv.html(s);
}
function updateLayoutStrings() {
  layoutStrings = [];
  let e = {};
  (e.edgelength = graph.graphLayout.edgelength),
    (e.cohesionthreshold = graph.graphLayout.cohesionthreshold),
    (e.repulsion = graph.graphLayout.repulsion),
    (e.separationFactor = graph.graphLayout.separationFactor),
    (e.planarForce = graph.graphLayout.planarForce),
    (e.centerForce = graph.graphLayout.centerForce),
    (e.extraCenterForce = graph.graphLayout.extraCenterForce),
    (e.moveToCenter = graph.graphLayout.moveToCenter),
    layoutStrings.push("Graph parameters = " + JSON.stringify(e));
  let t = {};
  (t.firstCoordinateEdgeLength =
    configuration_space.graphLayout.firstCoordinateEdgeLength),
    (t.firstCoordinateForce =
      configuration_space.graphLayout.firstCoordinateForce),
    (t.secondCoordinateEdgeLength =
      configuration_space.graphLayout.secondCoordinateEdgeLength),
    (t.secondCoordinateForce =
      configuration_space.graphLayout.secondCoordinateForce),
    (t.firstCoordinateMirrorForce =
      configuration_space.graphLayout.firstCoordinateMirrorForce),
    (t.secondCoordinateMirrorForce =
      configuration_space.graphLayout.secondCoordinateMirrorForce),
    (t.coordinatePreference =
      configuration_space.graphLayout.coordinatePreference),
    (t.extraCenterPreference =
      configuration_space.graphLayout.extraCenterPreference),
    (t.cohesionthreshold = configuration_space.graphLayout.cohesionthreshold),
    (t.repulsion = configuration_space.graphLayout.repulsion),
    (t.separationFactor = configuration_space.graphLayout.separationFactor),
    (t.centerForce = configuration_space.graphLayout.centerForce),
    (t.extraCenterForce = configuration_space.graphLayout.extraCenterForce),
    (t.moveToCenter = configuration_space.graphLayout.moveToCenter),
    (t.squarePlanarForce = configuration_space.graphLayout.squarePlanarForce),
    layoutStrings.push("Configuration space parameters = " + JSON.stringify(t));
}
function getChompString() {
  let e = "";
  (e += "chain complex\n\n"),
    (e += "max dimension = 2\n\n"),
    (e += "dimension 0\n");
  for (let t of configuration_space.states)
    0 === configuration_space.getDegree(t) &&
      (e += " # " + JSON.stringify(t) + "\n");
  e += "\n\ndimension 1\n";
  for (let t of configuration_space.states)
    if (1 === configuration_space.getDegree(t)) {
      let o;
      (o = Array.isArray(t[0])
        ? cartesianProductOf(t[0], [t[1]])
        : cartesianProductOf([t[0]], t[1])),
        (e +=
          " # " +
          JSON.stringify(t) +
          " = - " +
          JSON.stringify(o[0]) +
          " + " +
          JSON.stringify(o[1]) +
          "\n");
    }
  e += "\n\ndimension 2\n";
  for (let t of configuration_space.states)
    2 === configuration_space.getDegree(t) &&
      ((e += " # " + JSON.stringify(t) + " ="),
      (e += " + " + JSON.stringify([t[0], t[1][0]])),
      (e += " + " + JSON.stringify([t[0][1], t[1]])),
      (e += " - " + JSON.stringify([t[0], t[1][1]])),
      (e += " - " + JSON.stringify([t[0][0], t[1]])),
      (e += "\n"));
  return e;
}
function getObjString() {
  let e = "";
  e += "# OBJ\n###########################################\n\n";
  let t = 1;
  for (let o of configuration_space.graphLayout.nodes)
    (o.OBJindex = t),
      (e += "# vertex " + t + " = " + o.label + "\n"),
      (e +=
        "v " + o.position.x + " " + o.position.y + " " + o.position.z + "\n"),
      (t += 1);
  for (let t of configuration_space.states)
    2 === configuration_space.getDegree(t) &&
      ((e += "# face " + JSON.stringify(t) + "\n"),
      (e += "f"),
      (e +=
        " " +
        str(
          configuration_space.graphLayout.getNode([t[0][0], t[1][0]]).OBJindex
        )),
      (e +=
        " " +
        str(
          configuration_space.graphLayout.getNode([t[0][0], t[1][1]]).OBJindex
        )),
      (e +=
        " " +
        str(
          configuration_space.graphLayout.getNode([t[0][1], t[1][1]]).OBJindex
        )),
      (e +=
        " " +
        str(
          configuration_space.graphLayout.getNode([t[0][1], t[1][0]]).OBJindex
        )),
      (e += "\n"),
      (e += "f"),
      (e +=
        " " +
        str(
          configuration_space.graphLayout.getNode([t[0][1], t[1][0]]).OBJindex
        )),
      (e +=
        " " +
        str(
          configuration_space.graphLayout.getNode([t[0][1], t[1][1]]).OBJindex
        )),
      (e +=
        " " +
        str(
          configuration_space.graphLayout.getNode([t[0][0], t[1][1]]).OBJindex
        )),
      (e +=
        " " +
        str(
          configuration_space.graphLayout.getNode([t[0][0], t[1][0]]).OBJindex
        )),
      (e += "\n"));
  for (let t of configuration_space.states)
    1 === configuration_space.getDegree(t) &&
      ((e += "# line " + JSON.stringify(t) + "\n"),
      (e += "l"),
      Array.isArray(t[0])
        ? ((e +=
            " " +
            str(
              configuration_space.graphLayout.getNode([t[0][0], t[1]]).OBJindex
            )),
          (e +=
            " " +
            str(
              configuration_space.graphLayout.getNode([t[0][1], t[1]]).OBJindex
            )))
        : ((e +=
            " " +
            str(
              configuration_space.graphLayout.getNode([t[0], t[1][0]]).OBJindex
            )),
          (e +=
            " " +
            str(
              configuration_space.graphLayout.getNode([t[0], t[1][1]]).OBJindex
            ))),
      (e += "\n"));
  return e;
}
function saveLoopsInConfigurationSpace(e) {
  let t = getLoops(e);
  (configuration_space.loops = t), console.log("loops loaded"), console.log(t);
}
function getLoops(e) {
  let t = !1,
    o = [];
  for (let r of e)
    if (t || "[H_1]" !== r) {
      if (t) {
        if ("" === r) return o;
        {
          let e = r
            .split(/[+-]/)
            .filter((e) => "" !== e)
            .map(trim)
            .map((e) => JSON.parse(e));
          o.push(e);
        }
      }
    } else t = !0;
}
function tick() {
  temperature *= 1 - coolingRate;
}
function reheat() {
  temperature = 1;
}
function arraysEqual(e, t) {
  return JSON.stringify(e) == JSON.stringify(t);
}
const flatten = (e) => [].concat.apply([], e),
  product = (...e) =>
    e.reduce((e, t) => flatten(e.map((e) => t.map((t) => [...e, t]))), [[]]);
