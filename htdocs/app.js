"use strict";
let graph, graphicsForGraph, graphicsForConfigurationSpace, configuration_space, cameraState, areWeOnTheLeft, font, infoStrings, layoutStrings, chooseFile, syncViewToggle, gui, customGraph, infoDiv, warningWrapper, infoString, nodeSelectedForEdgeAddition, verbose = !0, vverbose = !1, graphs = {}, easyCamActive = !0, temperature = 1, cold = .001, coolingRate = 0, octForces = !0, graphIsCustomized = !1, parameters = {}, takeScreenshotGraph = !1, takeScreenshotConfigSpace = !1, loadingFromFile = !1, forcesActive = !0, robotAmoving = !0, robotBmoving = !0, addSingleNodeMode = !1, deleteNodeMode = !1, selectedNodesInGraph = [], selectedNodesInConfigSpace = [];
function preload() {
  font = loadFont("fonts/Oswald-Medium.otf"), initParameters();
  let e = getURL(), o = split(e, "?");
  if (2 !== o.length) return;
  let t = o[1], r = {};
  for (let e of split(t, "&")) {
    let o = split(e, "=");
    r[o[0]] = o[1]
  } void 0 !== r.file && (readFromFile(r.file), takeScreenshotConfigSpace = !0, loadingFromFile = !0)
} function initParameters() { verbose && console.log("initParameters"), parameters.graphType = "K(2,3)", parameters.mode = "View", parameters.running = !0, parameters.darkMode = !1, parameters.showGraph = !0, parameters.showConfigurationspace = !0, parameters.showInfo = !1, parameters.showRobots = !1, parameters.showHyperplanes = !1, parameters.showLoops = !1, parameters.syncView = !1, parameters.debugMode = !1, parameters.distinguishDots = !1, parameters.gridOn = !1, parameters.layoutPreset = "layout-00.txt", parameters.squareOn = !0, parameters.granularityGraph = 2, parameters.granularityFirstCoordinate = 2, parameters.granularitySecondCoordinate = 2, parameters.showText = !0, parameters.sphereView = !0, parameters.lights = !0, parameters.moveDotsRandomly = !1, parameters.robotASpeed = .1, parameters.robotBSpeed = .1, parameters.amountMultiplier = .05, parameters.recordHistory = !1, parameters.showHistory = !1, parameters.dualView = !1, parameters.sphereDetail = 20, parameters.resetHistory = function () { configuration_space.graphLayout.configuration.resetHistory() }, parameters.speedUp = 1, parameters.labelX = 0, parameters.labelY = 0, parameters.labelZ = 2, parameters.fontSize = 30, parameters.colorRobotA = "#bb0000", parameters.colorRobotB = "#444444", parameters.colorConfig = "#4499ee", parameters.colorNode = "#999999", parameters.colorGraphEdge = "#4499ee", parameters.squareColor = "#888888", parameters.squareOpacity = 100, parameters.activeDotColor = "#cc7700", parameters.deleteNodeColor = "#6600ff", parameters.selectedNodeForEdgeColor = "#4455bb", parameters.maxspeed = 300, parameters.nodeSize = 20, parameters.robotsNodeSize = 21, parameters.configNodeSize = 21, parameters.edgeWidthGraph = 4.5, parameters.edgeWidthConfigSpace = 2, parameters.edgeWidthGrid = .4, parameters.THETA = 2.6 } function setup() { verbose && console.log("setup"), noCanvas(), setAttributes("antialias", !0), infoDiv = select("#info"), warningWrapper = select("#warningWrapper"), loadingFromFile || (setParametersFromURL(), verbose && console.log("setup continues"), init()) } function init() { verbose && console.log("init"), selectedNodesInGraph = [], initView(), initGraph(parameters.graphType), initGUI() } function updateMode() {
  switch (verbose && console.log("updateMode: " + parameters.mode), parameters.mode) {
    case "View": console.log("updateMode: View mode"), easyCamOn(), deleteNodeMode = !1;
      break;
    case "Move": console.log("updateMode: Move mode"), easyCamOff(), deleteNodeMode = !1
  }verbose && console.log("updateMode: refresh tweakpane")
} function initView() {
  if (verbose && console.log("initView"), resetCanvases(), parameters.dualView ? (initgraphicsForGraph(windowWidth / 2, windowHeight), initgraphicsForConfigurationSpace(windowWidth / 2, windowHeight)) : (initgraphicsForGraph(0, windowHeight), initgraphicsForConfigurationSpace(windowWidth, windowHeight)), parameters.lights) {
    let e = 180, o = 180;
    graphicsForGraph.ambientLight(e, e, e), graphicsForGraph.directionalLight(o, o, o, -1, 0, 0), graphicsForConfigurationSpace.ambientLight(e, e, e), graphicsForConfigurationSpace.directionalLight(o, o, o, -1, 0, 0)
  }
} function draw() {
  if (temperature > cold && (tick(), graph.update(), configuration_space.update()), parameters.moveDotsRandomly) for (let e = 0;
    e < parameters.speedUp;
    e++)graph.moveRobots();
  if (graph.show(), configuration_space.show(), takeScreenshotGraph && (takeScreenshotGraph = !1, saveCanvas(graph.graphLayout.graphics, makeFileName("-graph") + ".png")), takeScreenshotConfigSpace) {
    takeScreenshotConfigSpace = !1;
    let e = makeFileName("-configspace") + ".png";
    verbose && console.log("taking screenshot of config space: " + e), saveCanvas(configuration_space.graphLayout.graphics, e)
  } mouseIsPressed && ourMouseDragged()
} function initGraph(e) {
  if (reheat(), verbose && print("initGraph: " + e), "random" === e) graph = randomGraph();
  else if ("custom" === e && void 0 !== customGraph) graph = new Graph(customGraph.nodes, customGraph.edges);
  else if ("K" === e.charAt(0)) {
    e = e.slice(2, -1);
    let o = split(e, ",");
    2 == o.length ? graph = completeBipartiteGraph(int(o[0]), int(o[1])) : 1 == o.length && (graph = completeGraph(int(o[0])))
  } else if ("C" === e.charAt(0)) {
    e = e.slice(2, -1);
    let o = split(e, ",");
    1 == o.length && (graph = chainGraph(int(o[0])))
  } else if ("W" === e.charAt(0)) {
    e = e.slice(2, -1);
    let o = split(e, ",");
    1 == o.length && (graph = wheelGraph(int(o[0])))
  } graph.createGraphLayout(graphicsForGraph, !0), configuration_space = new Configuration_space(graph, 2), vverbose && print(configuration_space), verbose && print("initGraph: call updateURL"), updateURL()
} function addNode(e, o, t) {
  let r = Math.max(...graph.nodes) + 1;
  graph.nodes.push(r);
  let a = graph.graphLayout.addNode(r, e, o, t);
  return configuration_space.addStates(r), graph.graphLayout.centerForce = Math.max(.02, graph.graphLayout.centerForce), configuration_space.graphLayout.centerForce = Math.max(.02, configuration_space.graphLayout.centerForce), addSingleNodeMode = !1, updateURL(), graphIsCustomized = !0, a
} function deleteSelectedNodesOrEdges() {
  if (selectedNodesInGraph.length > 1) for (let e = 0;
    e < selectedNodesInGraph.length - 1;
    e++)for (let o = e + 1;
      o < selectedNodesInGraph.length;
      o++)deleteEdge(selectedNodesInGraph[e], selectedNodesInGraph[o]);
  else 1 == selectedNodesInGraph.length && deleteNode(selectedNodesInGraph[0])
} function deleteNode(e) {
  if (e.occupied()) return void startWarning("This node is occupied and can not be deleted.");
  for (neighbor of (selectedNodesInGraph.splice(selectedNodesInGraph.indexOf(e), 1), e.neighbors)) neighbor.neighbors = neighbor.neighbors.filter((o => !(o === e)));
  graph.nodes.splice(graph.nodes.indexOf(e.label), 1);
  let o = [], t = [];
  for (edge of graph.edges) edge.includes(e.label) ? t.push(edge) : o.push(edge);
  for (edge of (graph.edges = o, t)) graph.graphLayout.deleteEdge(edge);
  graph.graphLayout.deleteNode(e.label), configuration_space.removeStates(e.label), graphIsCustomized = !0, updateURL()
} function deleteEdge(e, o) {
  verbose && console.log("deleteEdge()");
  let t = graph.graphLayout.getEdge(e.label, o.label);
  if (void 0 === t.owner) {
    if (!1 !== t && null == t.owner) {
      let r = t.label;
      e.neighbors = e.neighbors.filter((e => !(e === o))), o.neighbors = o.neighbors.filter((o => !(o === e))), verbose && console.log("deleting edge"), graph.edges = graph.edges.filter((e => !arraysEqual(e, r))), graph.graphLayout.deleteEdge(r), configuration_space.removeStates(r), graphIsCustomized = !0, updateURL()
    }
  } else startWarning("Not able to delete edge from " + e.label + " to " + o.label + ".")
} function addEdgesForSelectedNodes() {
  for (let e = 0;
    e < selectedNodesInGraph.length - 1;
    e++)for (let o = e + 1;
      o < selectedNodesInGraph.length;
      o++)addEdge(selectedNodesInGraph[e], selectedNodesInGraph[o])
} function addEdge(e, o) {
  if (!1 === graph.graphLayout.getEdge(e.label, o.label)) {
    console.log("adding edge");
    let t = [e.label, o.label];
    graph.edges.push(t), graph.graphLayout.addEdge(t, e, o), configuration_space.addStates(t), graphIsCustomized = !0, updateURL()
  } else console.log("not adding edge")
} function pickBestCandidateForA(e, o) {
  let t, r = e.robotA.getCandidates(), a = PI / 2;
  for (let s of r) {
    let r = configuration_space.graphLayout.getNode([s.label, e.robotB.nodeFrom.label]).position, i = configuration_space.graphLayout.getNode([s.label, e.robotB.nodeTo.label]).position, n = e.position, h = p5.Vector.lerp(r, i, e.robotB.amount), p = graphicsForConfigurationSpace.screenPosition(n), g = graphicsForConfigurationSpace.screenPosition(h), d = p5.Vector.sub(g, p), c = abs(o.angleBetween(d));
    c < a && (t = s, a = c)
  } return t
} function pickBestCandidateForB(e, o) {
  let t, r = e.robotB.getCandidates(), a = PI / 2;
  for (let s of r) {
    let r = configuration_space.graphLayout.getNode([e.robotA.nodeFrom.label, s.label]).position, i = configuration_space.graphLayout.getNode([e.robotA.nodeTo.label, s.label]).position, n = e.position, h = p5.Vector.lerp(r, i, e.robotA.amount), p = graphicsForConfigurationSpace.screenPosition(n), g = graphicsForConfigurationSpace.screenPosition(h), d = p5.Vector.sub(g, p), c = abs(o.angleBetween(d));
    c < a && (t = s, a = c)
  } return t
} function checkIfArrayIsUnique(e) { return e.length === new Set(e).size } function edgesContainEdge(e, o) {
  for (let t of e) {
    if (arraysEqual(t, o)) return !0;
    if (arraysEqual(t, [o[1], o[0]])) return !0
  } return !1
} function is_state(e) { return checkIfArrayIsUnique(e.flat()) } function toggleForSelectedNode() {
  console.log("toggleForSelectedNode");
  for (let e of graph.graphLayout.nodes) !0 === e.lastSelected && (e.applyExtraCenterForce = !e.applyExtraCenterForce, verbose && print(e.applyExtraCenterForce));
  for (let e of configuration_space.graphLayout.nodes) !0 === e.lastSelected && (e.applyExtraCenterForce = !e.applyExtraCenterForce, verbose && print(e.applyExtraCenterForce))
} function setupEasyCam(e, o) {
  let t = createEasyCam(e._renderer, { distance: o });
  t.setDistanceMin(10), t.setDistanceMax(3e4), t.attachMouseListeners(e._renderer), t.setWheelScale(300), t.setViewport([e.elt.offsetLeft, e.elt.offsetTop, e.elt.offsetWidth, e.elt.offsetHeight]), e.easycam = t
} function easyCamOff() { easyCamActive = !1, graphicsForConfigurationSpace.easycam.removeMouseListeners(), graphicsForGraph.easycam.removeMouseListeners(), forcesActive = !1, configuration_space.graphLayout.moveToCenter = !1, graph.graphLayout.moveToCenter = !1 } function easyCamOn() { easyCamActive = !0, vverbose && print("easyCamOn"), graphicsForConfigurationSpace.easycam.attachMouseListeners(graphicsForConfigurationSpace._renderer), graphicsForGraph.easycam.attachMouseListeners(graphicsForGraph._renderer), forcesActive = !0, configuration_space.graphLayout.moveToCenter = !0, graph.graphLayout.moveToCenter = !0 } function setDualView(e) { parameters.dualView = e, parameters.dualView ? syncViewToggle.hidden = !1 : syncViewToggle.hidden = !0, init() } class Configuration {
  constructor(e, o, t) { this.graphLayout = e, this.robotA = o, this.robotB = t, this.history = [], this.updatePosition(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount) } updatePosition(e, o, t, r, a, s) { this.position = this.getPosition(e, o, t, r, a, s) } getPosition(e, o, t, r, a, s) {
    let i;
    if (0 === t && 0 === s) {
      let o = [e.label, r.label];
      i = this.graphLayout.getNode(o).position
    } else if (t > 0 && 0 === s) {
      let a = [e.label, r.label], s = [o.label, r.label], n = this.graphLayout.getNode(a), h = this.graphLayout.getNode(s);
      i = p5.Vector.lerp(n.position, h.position, t)
    } else if (0 === t && s > 0) {
      let o = [e.label, r.label], t = [e.label, a.label], n = this.graphLayout.getNode(o), h = this.graphLayout.getNode(t);
      i = p5.Vector.lerp(n.position, h.position, s)
    } else {
      let n = this.graphLayout.getNode([e.label, r.label]).position, h = this.graphLayout.getNode([o.label, r.label]).position, p = this.graphLayout.getNode([e.label, a.label]).position, g = this.graphLayout.getNode([o.label, a.label]).position, d = p5.Vector.lerp(n, h, t), c = p5.Vector.lerp(p, g, t);
      i = p5.Vector.lerp(d, c, s)
    } return i
  } getCrosshair(e, o, t, r, a, s) {
    let i = this.graphLayout.getNode([e.label, r.label]).position, n = this.graphLayout.getNode([o.label, r.label]).position, h = this.graphLayout.getNode([e.label, a.label]).position, p = this.graphLayout.getNode([o.label, a.label]).position;
    return [p5.Vector.lerp(i, n, t), p5.Vector.lerp(h, p, t), p5.Vector.lerp(i, h, s), p5.Vector.lerp(n, p, s)]
  } getHyperplaneLine(e, o, t, r, a) {
    if (a) {
      let a = this.graphLayout.getNode([e.label, r[0]]).position, s = this.graphLayout.getNode([o.label, r[0]]).position, i = this.graphLayout.getNode([e.label, r[1]]).position, n = this.graphLayout.getNode([o.label, r[1]]).position;
      return [p5.Vector.lerp(a, s, t), p5.Vector.lerp(i, n, t)]
    } {
      let a = this.graphLayout.getNode([r[0], e.label]).position, s = this.graphLayout.getNode([r[0], o.label]).position, i = this.graphLayout.getNode([r[1], e.label]).position, n = this.graphLayout.getNode([r[1], o.label]).position;
      return [p5.Vector.lerp(a, s, t), p5.Vector.lerp(i, n, t)]
    }
  } record(e, o, t, r, a, s) { this.history.push([e, o, t, r, a, s]) } resetHistory() { this.history = [] } show() {
    if (parameters.showHistory) for (let e = 0;
      e < this.history.length - 1;
      e++) {
        let o = this.history[e], t = this.history[e + 1], r = this.getPosition(o[0], o[1], o[2], o[3], o[4], o[5]), a = this.getPosition(t[0], t[1], t[2], t[3], t[4], t[5]);
      this.graphLayout.graphics.stroke(0), this.graphLayout.graphics.strokeWeight(1), this.graphLayout.graphics.line(r.x, r.y, r.z, a.x, a.y, a.z)
    } this.showAt(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount)
  } showAt(e, o, t, r, a, s) {
    this.updatePosition(e, o, t, r, a, s);
    let i = this.robotA.getAllPossibleEdges(), n = this.robotB.getAllPossibleEdges();
    if (parameters.showHyperplanes) {
      for (let e of i) {
        let o = this.getHyperplaneLine(r, a, s, e, !1), t = o[0], i = o[1];
        this.graphLayout.graphics.stroke(parameters.colorRobotA), this.graphLayout.graphics.strokeWeight(8), this.graphLayout.graphics.line(t.x, t.y, t.z, i.x, i.y, i.z)
      } for (let r of n) {
        let a = this.getHyperplaneLine(e, o, t, r, !0), s = a[0], i = a[1];
        this.graphLayout.graphics.stroke(parameters.colorRobotB), this.graphLayout.graphics.strokeWeight(8), this.graphLayout.graphics.line(s.x, s.y, s.z, i.x, i.y, i.z)
      }
    } else if (this.active) {
      let i = this.getCrosshair(e, o, t, r, a, s);
      if (this.graphLayout.graphics.strokeWeight(8), 4 === i.length) {
        let e = i[0], o = i[1];
        this.graphLayout.graphics.stroke(parameters.colorRobotB), this.graphLayout.graphics.line(e.x, e.y, e.z, o.x, o.y, o.z);
        let t = i[2], r = i[3];
        this.graphLayout.graphics.stroke(parameters.colorRobotA), this.graphLayout.graphics.line(t.x, t.y, t.z, r.x, r.y, r.z)
      }
    } if (this.graphLayout.graphics.push(), this.graphLayout.graphics.translate(this.position.x, this.position.y, this.position.z), this.graphLayout.graphics.noStroke(), this.active ? this.graphLayout.graphics.fill(parameters.activeDotColor) : this.graphLayout.graphics.fill(parameters.colorConfig), parameters.sphereView) {
      let e = parameters.sphereDetail;
      this.graphLayout.graphics.sphere(.5 * parameters.configNodeSize, e, e)
    } else {
      let e = this.graphLayout.graphics.easycam.getRotation(), o = QuaternionToEuler(e[0], e[1], e[2], e[3]);
      this.graphLayout.graphics.rotateX(-o[0]), this.graphLayout.graphics.rotateY(-o[1]), this.graphLayout.graphics.rotateZ(-o[2]), this.graphLayout.graphics.translate(0, 0, 20), this.graphLayout.graphics.ellipse(0, 0, parameters.configNodeSize, parameters.configNodeSize)
    } this.graphLayout.graphics.pop()
  }
} class Configuration_space {
  constructor(e, o) {
    this.type = "configuration_space", this.dimension = o;
    let t = e.nodes.concat(e.edges), r = cartesianProductOf(t, t);
    this.states = r.filter(is_state), vverbose && console.log(this.states), vverbose && print("States:"), vverbose && print(this.states), this.createGraphLayout(graphicsForConfigurationSpace, !0)
  } update() { this.graphLayout.update() } show() { this.graphLayout.show() } getRobots() { return [] } getDegree(e) { return flatten(e).length - this.dimension } addStates(e) {
    let o = graph.nodes.concat(graph.edges), t = cartesianProductOf([e], o).concat(cartesianProductOf(o, [e]));
    vverbose && console.log("newPossibleStates"), vverbose && console.log(t);
    let r = t.filter(is_state);
    for (let e of r) this.addStateToGraphLayout(e), this.states.push(e)
  } removeStates(e) {
    verbose && console.log("removeStates: " + e);
    let o = [], t = [];
    if (Array.isArray(e)) for (let r of this.states) arraysEqual(e, r[0]) || arraysEqual(e, r[1]) ? t.push(r) : o.push(r);
    else for (let r of this.states) flatten(r).includes(e) ? t.push(r) : o.push(r);
    verbose && console.log("survivingStates"), verbose && console.log(o), verbose && console.log("statesToDelete"), verbose && console.log(t);
    for (let e of t) {
      switch (this.getDegree(e)) {
        case 0: console.log("deleteNode "), console.log(e), this.graphLayout.deleteNode(e);
          break;
        case 1: console.log("deleteEdge "), console.log(e), this.graphLayout.deleteEdge(e);
          break;
        case 2: console.log("deleteSquare "), console.log(e), this.graphLayout.deleteSquare(e)
      }this.states = o
    }
  } addStateToGraphLayout(e) {
    switch (this.getDegree(e)) {
      case 0: vverbose && print("state_1:"), vverbose && print(e), this.graphLayout.addNode(e);
        break;
      case 1: if (vverbose && print("state_1:"), vverbose && print(e), Array.isArray(e[0])) {
        let o = this.graphLayout.getNode([e[0][0], e[1]]), t = this.graphLayout.getNode([e[0][1], e[1]]);
        this.graphLayout.addEdge(e, o, t)
      } else if (Array.isArray(e[1])) {
        let o = this.graphLayout.getNode([e[0], e[1][0]]), t = this.graphLayout.getNode([e[0], e[1][1]]);
        vverbose && print("nodeFrom:"), vverbose && print(o), this.graphLayout.addEdge(e, o, t)
      } else vverbose && print("error");
        break;
      case 2: vverbose && print("state_2:"), vverbose && print(e);
        let o = this.graphLayout.getEdge(e[0][0], e[1], !0), t = this.graphLayout.getEdge(e[0][1], e[1], !0), r = this.graphLayout.getEdge(e[0], e[1][0], !0), a = this.graphLayout.getEdge(e[0], e[1][1], !0);
        vverbose && print(o), vverbose && print(t), this.graphLayout.addSquare(e, o, t, r, a)
    }
  } createGraphLayout(e, o) {
    verbose && console.log("createGraphLayout"), this.graphLayout = new GraphLayout(this, e, o), this.graphLayout.showConfiguration = !0;
    for (let e of this.states) this.addStateToGraphLayout(e);
    this.graphLayout.configuration = new Configuration(this.graphLayout, graph.robotA, graph.robotB), this.graphLayout.initlayout()
  }
} class Edge {
  constructor(e, o, t, r) { vverbose && console.log("new Edge"), vverbose && console.log("nodeFrom"), vverbose && console.log(t), vverbose && console.log("nodeTo"), vverbose && console.log(r), this.graphLayout = e, this.graphics = e.graphics, this.label = o, this.nodeFrom = t, this.nodeTo = r, this.subPoints = [], Array.isArray(this.nodeFrom.label) && Array.isArray(this.nodeTo.label) ? this.nodeFrom.label[0] === this.nodeTo.label[0] ? this.edgeType = "robotBedge" : this.nodeFrom.label[1] === this.nodeTo.label[1] ? this.edgeType = "robotAedge" : console.log() : this.edgeType = "graphEdge", this.createInnerNodes() } createInnerNodes() {
    this.innerNodes = [], this.innerEdges = [], "graphEdge" === this.edgeType ? this.granularity = parameters.granularityGraph : "robotBedge" === this.edgeType ? this.granularity = parameters.granularityFirstCoordinate : "robotAedge" === this.edgeType && (this.granularity = parameters.granularitySecondCoordinate);
    for (let e = 0;
      e <= this.granularity;
      e++)this.innerNodes[e] = new InnerNode(this, this.graphLayout, e, p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, 1 * e / this.granularity), 1 / this.granularity);
    for (let e = 0;
      e < this.granularity;
      e++) {
        let o = this.innerNodes[e], t = this.innerNodes[e + 1];
      this.innerEdges[e] = new InnerEdge(this, this.graphLayout, e, o, t), "robotBedge" === this.edgeType ? (o.neighborsB.push(t), t.neighborsB.push(o)) : "robotAedge" === this.edgeType && (o.neighborsA.push(t), t.neighborsA.push(o))
    }
  } amountAlong(e) { return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, e) } connectedTo(e) { return e === this.nodeFrom || e === this.nodeTo } getPosition(e) { return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, e) } forceInnerNodesToTheirPositions() {
    for (let e = 0;
      e <= this.granularity;
      e++)this.innerNodes[e].position = p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, 1 * e / this.granularity)
  } show(e, o, t) { void 0 === this.owner ? 0 === this.candidateForRobot ? e.stroke(parameters.colorRobotA) : 1 === this.candidateForRobot || "robotBedge" === this.edgeType ? e.stroke(parameters.colorRobotB) : "robotAedge" === this.edgeType ? e.stroke(parameters.colorRobotA) : "graphEdge" === this.edgeType && e.stroke(parameters.colorGraphEdge) : parameters.showRobots && 0 === this.owner.index ? e.stroke(parameters.colorRobotA) : parameters.showRobots && 1 === this.owner.index ? e.stroke(parameters.colorRobotB) : e.stroke(parameters.colorGraphEdge), "graphEdge" === this.edgeType ? e.strokeWeight(parameters.edgeWidthGraph * (void 0 === o ? 1 : o)) : e.strokeWeight(parameters.edgeWidthConfigSpace * (void 0 === o ? 1 : o)), void 0 !== t && e.stroke(t), e.line(this.nodeFrom.position.x, this.nodeFrom.position.y, this.nodeFrom.position.z, this.nodeTo.position.x, this.nodeTo.position.y, this.nodeTo.position.z) }
} function makeFileName(e) {
  let o = str(year()) + ("0" + str(month())).slice(-2) + ("0" + str(day())).slice(-2) + "_" + ("0" + str(hour())).slice(-2) + ("0" + str(minute())).slice(-2) + ("0" + str(second())).slice(-2);
  return parameters.graphType + e + "_" + o
} class Graph {
  constructor(e, o) { this.type = "graph", this.nodes = e, this.edges = o } update() { this.graphLayout.update() } show() { this.graphLayout.show() } getRobots() { return [this.robotA, this.robotB] } otherRobot(e) { return this.robotA === e ? this.robotB : this.robotA } moveRobots() {
    let e = parameters.amountMultiplier * parameters.robotASpeed, o = parameters.amountMultiplier * parameters.robotBSpeed, t = this.robotA.amount + e, r = this.robotB.amount + o;
    if (t >= 1 && r < 1) t = 1, r = this.robotB.amount + o * (1 - this.robotA.amount) / e;
    else if (t < 1 && r >= 1) r = 1, t = this.robotA.amount + e * (1 - this.robotB.amount) / o;
    else if (t >= 1 && r >= 1) {
      let a = (1 - this.robotA.amount) / (t - this.robotA.amount), s = (1 - this.robotB.amount) / (r - this.robotB.amount);
      a > s ? (r = 1, t = this.robotA.amount + e * s) : (t = 1, r = this.robotB.amount + o * a)
    } robotAmoving && this.robotA.setAmount(t), robotBmoving && this.robotB.setAmount(r), parameters.recordHistory && configuration_space.graphLayout.configuration.record(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount)
  } createGraphLayout(e, o) {
    this.graphLayout = new GraphLayout(this, e, o);
    for (let e of this.nodes) this.graphLayout.addNode(e);
    for (let e of this.edges) {
      let o = this.graphLayout.getNode(e[0]), t = this.graphLayout.getNode(e[1]);
      this.graphLayout.addEdge(e, o, t)
    } this.robotA = new Robot(this, this.graphLayout.nodes[0], 0), this.robotB = new Robot(this, this.graphLayout.nodes[1], 1), this.graphLayout.initlayout()
  }
} function resetCanvases() { void 0 !== graphicsForGraph && graphicsForGraph.remove(), void 0 !== graphicsForConfigurationSpace && graphicsForConfigurationSpace.remove() } function initgraphicsForGraph(e, o) { graphicsForGraph = createGraphics(e, o, WEBGL), graphicsForGraph.smooth(), graphicsForGraph.parent("graph"), graphicsForGraph.pixelDensity(2), graphicsForGraph.show(), setupEasyCam(graphicsForGraph, 500), addScreenPositionFunction(graphicsForGraph), vverbose && console.log(graphicsForGraph), graphicsForGraph.canvas.addEventListener("click", mousePressedOnLeft) } function initgraphicsForConfigurationSpace(e, o) {
  graphicsForConfigurationSpace = createGraphics(e, o, WEBGL), graphicsForConfigurationSpace.smooth(), graphicsForConfigurationSpace.parent("configspace"), graphicsForConfigurationSpace.pixelDensity(2), graphicsForConfigurationSpace.show();
  let t = graphicsForConfigurationSpace.canvas.getContext("webgl");
  t.disable(t.DEPTH_TEST), setupEasyCam(graphicsForConfigurationSpace, 500), addScreenPositionFunction(graphicsForConfigurationSpace)
} class GraphLayout {
  constructor(e, o, t) { this.source = e, this.graphics = o, this.layout3D = t, this.updating = !1, this.nodes = [], this.nodeBorder = !0, this.nodeBorderWidth = .05, this.showNodes = !0, this.edges = [], this.showEdges = !0, this.squares = [], this.showSquares = !0, this.planarForce = 0, this.squarePlanarForce = 0, this.centerForce = .001, this.extraCenterForce = 0, this.moveToCenter = !0, this.edgelength = 100, this.firstCoordinateEdgeLength = 100, this.secondCoordinateEdgeLength = 100, this.graphEdgeForce = .01, this.firstCoordinateForce = .05, this.secondCoordinateForce = .01, this.firstCoordinateMirrorForce = .01, this.secondCoordinateMirrorForce = -.01, this.extraCenterPreference = 0, this.coordinatePreference = .01, this.center = createVector(0, 0, 0), this.heat = 1, this.coolDown = .01, this.cohesionthreshold = 10, this.cohesionFactor = 1, this.repulsion = 5e4, this.centroidRepulsion = 5e4, this.separationFactor = 30, this.keyboardactive = !0 } initlayout() {
    if (octForces) for (let e = 0;
      e < 100;
      e++) {
        this.updateOctree();
      for (let e of this.nodes) e.update(this.nodes), e.move()
    }
  } updateOctree() {
    vverbose && console.log("updateOctree");
    if (this.octree = new Octree(this, new Cube(0, 0, 0, 4 * max(windowWidth, windowHeight), 4 * max(windowWidth, windowHeight), 4 * max(windowWidth, windowHeight)), 0), "graph" === this.source.type) for (let e of this.nodes) this.octree.insert(e);
    if ("configuration_space" === this.source.type) for (let e of this.nodes) void 0 !== e.innerNode && this.octree.insert(e.innerNode);
    this.octree.calculateMass()
  } show() {
    parameters.darkMode ? this.graphics.clear() : this.graphics.clear(255, 255, 255, 255);
    let e = graphicsForConfigurationSpace.canvas.getContext("webgl");
    if (e.disable(e.DEPTH_TEST), "configuration_space" === this.source.type && parameters.showConfigurationspace && this.showSquares) for (let e of this.squares) e.show();
    if (e.enable(e.DEPTH_TEST), "configuration_space" === this.source.type && parameters.showGraph) {
      for (let e of graph.graphLayout.nodes) e.show(this.graphics);
      for (let e of graph.graphLayout.edges) e.show(this.graphics);
      if (parameters.showRobots) for (let e of graph.getRobots()) e.show(this.graphics)
    } if ("graph" === this.source.type || parameters.showConfigurationspace) {
      if (this.showEdges) for (let e of this.edges) e.show(this.graphics);
      if (this.showNodes) for (let e of this.nodes) e.show(this.graphics)
    } if ("configuration_space" === this.source.type && parameters.showLoops && void 0 !== configuration_space.loops) {
      let e = configuration_space.loops.length;
      for (let o = 0;
        o < e;
        o++)for (let t of configuration_space.loops[o]) {
          let r = this.getEdge(t[0], t[1], !0), a = color(map(o, 0, e, 0, 255), 255, 255);
          r.show(this.graphics, 2.5, a)
        }
    } if ("graph" === this.source.type && parameters.showRobots) for (let e of this.source.getRobots()) e.show(this.graphics);
    if ("configuration_space" === this.source.type && parameters.showConfigurationspace && parameters.showRobots && this.showConfiguration && this.configuration.show(), "graph" === this.source.type && parameters.showText) for (let e of this.nodes) e.showText(this.graphics);
    if ("configuration_space" === this.source.type && this.showNodes && parameters.showConfigurationspace && parameters.showText) for (let e of this.nodes) e.showText(this.graphics);
    if ("configuration_space" === this.source.type && parameters.showGraph && parameters.showText) for (let e of graph.graphLayout.nodes) e.showText(this.graphics);
    this.counter++
  } update() {
    if (forcesActive && parameters.running) {
      if (octForces && this.updateOctree(), this.moveToCenter) {
        let e = 0, o = 0, t = 0;
        for (let r of this.nodes) e += (-r.position.x + this.center.x) / this.nodes.length, o += (-r.position.y + this.center.y) / this.nodes.length, t += (-r.position.z + this.center.z) / this.nodes.length;
        for (let r of this.nodes) r.frozen || r.position.add(.1 * e, .1 * o, .1 * t)
      } for (let e of this.nodes) e.update(this.nodes);
      for (let e of this.nodes) e.move()
    } for (let e of this.edges) e.forceInnerNodesToTheirPositions()
  } getNode(e) {
    for (let o of this.nodes) if (arraysEqual(o.label, e)) return o;
    return vverbose && print("returning false"), !1
  } getEdge(e, o, t) {
    vverbose && print("getEdge: "), vverbose && print(e), vverbose && print(o), vverbose && print(t);
    for (let r of this.edges) if (arraysEqual([e, o], r.label) || !t && arraysEqual([o, e], r.label)) return vverbose && print("FOUND!"), vverbose && print(r), r;
    return !1
  } getSquare(e, o) {
    vverbose && print("getSquare: "), vverbose && print(e), vverbose && print(o);
    for (let t of this.squares) if (vverbose && print(t.label), arraysEqual([e, o], t.label)) return vverbose && print("FOUND!"), vverbose && print(t), t
  } getCentroids(e) {
    let o = [];
    for (let e of this.squares) o.push(e.getCentroid());
    return o
  } addNode(e, o, t, r) {
    vverbose && print("adding node " + e);
    let a = 10, s = new Node(this, e, void 0 === o ? random(-a, a) : o, void 0 === t ? random(-a, a) : t, void 0 === r ? random(-a, a) : r, 1);
    return this.nodes.push(s), s
  } deleteNode(e) {
    verbose && console.log("deleteNode: " + e);
    let o = this.getNode(e);
    for (neighbor of o.neighbors) neighbor.neighbors = neighbor.neighbors.filter((e => !(e === o))), verbose && console.log("neighbor.neighbors: " + neighbor.neighbors);
    this.nodes.splice(this.nodes.indexOf(o), 1)
  } addEdge(e, o, t) {
    vverbose && print("adding edge " + e), vverbose && print("connecting:"), vverbose && print(o.label + " to " + t.label);
    let r = new Edge(this, e, o, t);
    return this.edges.push(r), t.connectTo(o), o.connectTo(t), r
  } deleteEdge(e) {
    verbose && console.log("deleteEdge: " + e);
    let o = this.getEdge(e[0], e[1], !1);
    o.nodeFrom.neighbors = o.nodeFrom.neighbors.filter((e => e !== o.nodeTo)), verbose && console.log("edgeToDelete.nodeFrom.neighbors: " + o.nodeFrom.neighbors), o.nodeTo.neighbors = o.nodeTo.neighbors.filter((e => e !== o.nodeFrom)), verbose && console.log("edgeToDelete.nodeTo.neighbors: " + o.nodeTo.neighbors), this.edges.splice(this.edges.indexOf(o), 1)
  } addSquare(e, o, t, r, a) {
    let s = new Square(this, e, o, t, r, a);
    this.squares.push(s)
  } deleteSquare(e) {
    let o = this.getSquare(e[0], e[1]);
    this.squares.splice(this.squares.indexOf(o), 1)
  }
} function initGUI() {
  verbose && console.log("initGUI");
  let e = document.getElementById("gui-left"), o = document.getElementById("gui-right");
  for (let e of document.getElementsByClassName("graphpicker")) e.addEventListener("click", (e => { parameters.graphType = e.target.innerHTML, parameters.mode = "View", graphIsCustomized = !1, init() }));
  e.innerHTML = "", o.innerHTML = "";
  let t = new lil.GUI({ title: "Options", container: e, width: 300 });
  t.add(parameters, "darkMode").name("Dark mode").listen(), t.add(parameters, "showGraph").name("Show graph").listen(), t.add(parameters, "showConfigurationspace").name("Show configuration space").listen(), t.add(parameters, "showRobots").name("Show robots").listen(), t.add(parameters, "showText").name("Show text").listen(), t.add(parameters, "showHyperplanes").name("Show hyperplanes"), t.add(parameters, "squareOn").name("Show square surfaces"), t.add(parameters, "gridOn").name("Show square grids");
  let r = new lil.GUI({ title: "Advanced", container: e }).close();
  r.add(parameters, "mode").name("Mode").listen().disable(), r.add(parameters, "running").name("Running").listen(), r.add(parameters, "showLoops").name("Show loops"), r.add(parameters, "dualView").name("Dual view").onChange((e => { setDualView(parameters.dualView) })), syncViewToggle = r.add(parameters, "syncView").name("Sync cameras"), parameters.dualView || syncViewToggle.hide(), r.add(parameters, "maxspeed", 0, 30, .01).name("Max node speed");
  let a = new lil.GUI({ title: "Visuals", container: e }).close();
  a.add(parameters, "nodeSize", 0, 40, 1).name("Node size"), a.add(parameters, "robotsNodeSize", 0, 40, 1).name("Node size: Robot"), a.add(parameters, "configNodeSize", 0, 40, 1).name("Node size: Configuration"), a.add(parameters, "edgeWidthConfigSpace", 0, 10, .1).name("Edge width"), a.add(parameters, "edgeWidthGraph", 0, 10, .1).name("Edge width: Graph"), a.add(parameters, "edgeWidthGrid", 0, 10, .1).name("Edge width: Grid"), a.add(parameters, "fontSize", 10, 100, 1).name("Text size"), a.add(parameters, "labelZ", 0, 100, 1).name("Text offset from node"), a.add(parameters, "sphereView").name("Spheres as nodes"), a.add(parameters, "sphereDetail", 4, 40, 1).name("Sphere detail"), a.add(parameters, "granularityGraph", 0, 80, 1).name("Edge granularity: Graph"), a.add(parameters, "granularityFirstCoordinate", 0, 80, 1).name("Edge granularity: First coordinate").onChange((e => { configuration_space.graphLayout.createInnerNodes() })), a.add(parameters, "granularitySecondCoordinate", 0, 80, 1).name("Edge granularity: Second coordinate").onChange((e => { configuration_space.graphLayout.createInnerNodes() }));
  let s = new lil.GUI({ title: "Colors", container: e }).close();
  s.addColor(parameters, "colorNode").name("Nodes"), s.addColor(parameters, "colorRobotA").name("First robot/edges"), s.addColor(parameters, "colorRobotB").name("Second robot/edges"), s.addColor(parameters, "colorConfig").name("Configuration"), s.addColor(parameters, "colorGraphEdge").name("Graph edges"), s.addColor(parameters, "activeDotColor").name("Selected node"), s.addColor(parameters, "deleteNodeColor").name("Marked for deletion"), s.addColor(parameters, "selectedNodeForEdgeColor").name("Selected node for edge"), s.addColor(parameters, "squareColor").name("Squares"), s.add(parameters, "squareOpacity", 0, 255, 1).name("Square opacity");
  let i = new lil.GUI({ title: "Movement", container: o, width: 400 }).close();
  i.add(parameters, "moveDotsRandomly").name("Move robots").onChange((e => { parameters.moveDotsRandomly && (parameters.showRobots = !0) })), i.add(parameters, "robotASpeed", 0, 1, .01).name("Speed of first robot"), i.add(parameters, "robotBSpeed", 0, 1, .01).name("Speed of second robot"), i.add(parameters, "amountMultiplier", 0, 1, .01).name("Multiplier"), i.add(parameters, "speedUp", 0, 1, .01).name("Speed-up"), i.add(parameters, "recordHistory").name("Record path"), i.add(parameters, "showHistory").name("Show path"), i.add({ resetHistory() { configuration_space.graphLayout.configuration.resetHistory() } }, "resetHistory").name("resetHistory");
  let n = new lil.GUI({ title: "Configuration space layout", container: o, width: 400 }).close();
  n.add(parameters, "layoutPreset", { "Layout 00": "layout-00.txt", "Layout 01": "layout-01.txt", "Layout 02": "layout-02.txt" }).name("Layout presets").onChange((e => { readLayoutFromFile(parameters.layoutPreset) })), n.add(configuration_space.graphLayout, "firstCoordinateEdgeLength", 1, 1e3, 1).name("First coordinate target edge length"), n.add(configuration_space.graphLayout, "firstCoordinateForce", 0, .1, .01).name("Force for first coordinate edge"), n.add(configuration_space.graphLayout, "secondCoordinateEdgeLength", 1, 1e3, 1).name("Second coordinate target edge length"), n.add(configuration_space.graphLayout, "secondCoordinateForce", 0, .1, 1e-4).name("Force for second coordinate edge"), n.add(configuration_space.graphLayout, "firstCoordinateMirrorForce", -.2, .2, 1e-4).name("First projection bias"), n.add(configuration_space.graphLayout, "secondCoordinateMirrorForce", -.2, .2, 1e-4).name("Second projection bias"), n.add(configuration_space.graphLayout, "coordinatePreference", -.1, .1, .01).name("Coordinate preference"), n.add(configuration_space.graphLayout, "extraCenterPreference", 0, .1, 1e-4).name("Extra center preference"), n.add(configuration_space.graphLayout, "cohesionthreshold", 0, 2, .01).name("Neighbor attraction threshold"), n.add(configuration_space.graphLayout, "repulsion", 0, 5e5, 1).name("Repulsion"), n.add(configuration_space.graphLayout, "centroidRepulsion", 0, 5e5, 1).name("Centroid Repulsion"), n.add(configuration_space.graphLayout, "separationFactor", 0, 1300, 1).name("Separation factor"), n.add(configuration_space.graphLayout, "centerForce", 0, .15, 1e-4).name("Center Force").listen(), n.add(configuration_space.graphLayout, "extraCenterForce", 0, .15, 1e-4).name("Extra center force"), n.add(configuration_space.graphLayout, "moveToCenter").name("Adjust to center"), n.add(parameters, "THETA", 0, 10, .01).name("THETA"), n.add(configuration_space.graphLayout, "squarePlanarForce", 0, .2, 1e-4).name(";Square Planar Force");
  let h = new lil.GUI({ title: "Graph layout", container: o, width: 400 }).close();
  h.add(graph.graphLayout, "edgelength", 1, 400).name("Target edge length"), h.add(graph.graphLayout, "graphEdgeForce", 0, .1, .001).name("Edge force"), h.add(graph.graphLayout, "cohesionthreshold", 0, 2, .01).name("Neighbor attraction threshold"), h.add(graph.graphLayout, "repulsion", 0, 1e5, 1).name("Repulsion"), h.add(graph.graphLayout, "separationFactor", 0, 1300, 1).name("Separation factor"), h.add(graph.graphLayout, "planarForce", 0, .15, 1e-4).name("Planar force"), h.add(graph.graphLayout, "centerForce", 0, .15, 1e-4).name("Center force").listen(), h.add(graph.graphLayout, "extraCenterForce", 0, .15, 1e-4).name("Extra center force"), h.add(graph.graphLayout, "moveToCenter").name("Adjust to center")
} function windowResized() { parameters.dualView ? (graphicsForGraph.resizeCanvas(windowWidth / 2, windowHeight), graphicsForConfigurationSpace.resizeCanvas(windowWidth / 2, windowHeight)) : (graphicsForGraph.resizeCanvas(0, windowHeight), graphicsForConfigurationSpace.resizeCanvas(windowWidth, windowHeight)) } function startWarning(e) {
  let o = createDiv(e);
  o.class("warning"), o.parent(warningWrapper), setTimeout((function () { endWarning(o) }), 3e3)
} function endWarning(e) { e.remove() } function toggleGUI(e) { -1 === e && (!0 === gui.closed ? gui.open() : gui.close()) } class BuildHistory { constructor() { } show(e) { e.fill(128) } } class InnerNode {
  constructor(e, o, t, r) { this.parent = e, this.label = t, this.graphLayout = o, this.graphics = o.graphics, o.layout3D ? (this.position = r, this.velocity = createVector(0, 0, 0), this.acceleration = createVector(0, 0, 0)) : (this.position = r, this.velocity = createVector(0, 0), this.acceleration = createVector(0, 0)), this.neighborsA = [], this.neighborsB = [] } update(e) {
    let o;
    this.acceleration.mult(0), o = octForces ? this.graphLayout.octree.getAllNodesForces(this) : this.getSeparationFromNodes(e);
    let t = this.getSpringForce(this.graphLayout.firstCoordinateEdgeLength / parameters.granularityFirstCoordinate, 10 * this.graphLayout.firstCoordinateForce, this.neighborsA), r = this.getSpringForce(this.graphLayout.secondCoordinateEdgeLength / parameters.granularitySecondCoordinate, 10 * this.graphLayout.secondCoordinateForce, this.neighborsB);
    this.acceleration.add(o), this.acceleration.add(t), this.acceleration.add(r)
  } move() { this.velocity.add(this.acceleration), limitVector(this.velocity, parameters.maxspeed), this.position.add(this.velocity), this.velocity.mult(.9) } getSpringForce(e, o, t) {
    let r = new createVector(0, 0, 0);
    for (let a of t) {
      let t = p5.Vector.sub(this.position, a.position), s = t.mag() - e;
      abs(s) > this.graphLayout.cohesionthreshold && (t.normalize().mult(-o * s), r.add(t))
    } return limitVector(r, e), r
  } show(e) {
    if (this.nodeBorder ? (e.stroke(150), e.strokeWeight(parameters.nodeSize * this.graphLayout.nodeBorderWidth)) : e.noStroke(), this.graphLayout.layout3D) {
      e.push(), e.translate(this.position.x, this.position.y, this.position.z), e.fill(parameters.colorNode);
      let o = e.easycam.getRotation(), t = QuaternionToEuler(o[0], o[1], o[2], o[3]);
      e.rotateX(-t[0]), e.rotateY(-t[1]), e.rotateZ(-t[2]), e.translate(0, 0, 1), e.stroke(0), e.strokeWeight(1), e.ellipse(0, 0, .25 * parameters.nodeSize, .25 * parameters.nodeSize), e.pop()
    } for (let o of this.neighborsA) e.stroke(0, 255, 0), e.strokeWeight(1), e.line(this.position.x, this.position.y, this.position.z, o.position.x, o.position.y, o.position.z);
    for (let o of this.neighborsB) e.stroke(0, 0, 255), e.strokeWeight(1), e.line(this.position.x, this.position.y, this.position.z, o.position.x, o.position.y, o.position.z)
  } showText(e) {
    if (e.fill(0, 0, 0), e.textAlign(CENTER, CENTER), e.textFont(font), e.textSize(parameters.fontSize), this.graphLayout.layout3D) {
      let o = e.easycam.getRotation(), t = QuaternionToEuler(o[0], o[1], o[2], o[3]);
      e.push(), e.translate(this.position.x, this.position.y, this.position.z), e.rotateX(-t[0]), e.rotateY(-t[1]), e.rotateZ(-t[2]);
      let r = max(parameters.nodeSize, parameters.configNodeSize, parameters.robotsNodeSize);
      e.translate(parameters.labelX, parameters.labelY, r + parameters.labelZ), e.text(this.labelText, 0, 0), e.pop()
    } else e.push(), e.translate(this.position.x, this.position.y, this.position.z), e.text(this.labelText, 0, 0), e.pop()
  }
} class InnerEdge { constructor(e, o, t, r, a) { this.graphLayout = o, this.graphics = o.graphics, this.label = t, this.nodeFrom = r, this.nodeTo = a, this.edgeType = e.edgeType } show(e, o, t) { e.strokeWeight(2 * parameters.edgeWidthConfigSpace * (void 0 === o ? 1 : o)), e.stroke(255, 0, 0), void 0 !== t && e.stroke(t), e.line(this.nodeFrom.position.x, this.nodeFrom.position.y, this.nodeFrom.position.z, this.nodeTo.position.x, this.nodeTo.position.y, this.nodeTo.position.z) } } let keyboardFlags = {};
function downKey(e) { return keyboardFlags[e.charCodeAt(0)] } function keyPressed() {
  if (verbose && console.log("keyPressed: " + keyCode), keyboardFlags[keyCode] = !0, keyCode !== SHIFT && "a" !== key && "b" !== key || (verbose && console.log(" move mode"), parameters.mode = "Move", updateMode()), "a" === key && !downKey("B") || "b" === key && !downKey("A")) {
    let e = "a" === key ? graph.robotA : graph.robotB, o = e.getAllPossibleEdges();
    for (let t of o) graph.graphLayout.getEdge(t[0], t[1]).candidateForRobot = e.index
  } "e" === key ? addEdgesForSelectedNodes() : "d" === key ? deleteSelectedNodesOrEdges() : " " === key ? parameters.running = !parameters.running : "o" === key ? (octForces = !octForces, console.log("octForces = " + octForces)) : "f" === key ? forcesActive = !forcesActive : "q" === key ? parameters.debugMode = !parameters.debugMode : "t" === key ? parameters.showText = !parameters.showText : "g" === key ? toggleGUI(-1) : "0" === key ? toggleGUI(0) : "1" === key ? toggleGUI(1) : "2" === key ? toggleGUI(2) : "3" === key ? toggleGUI(3) : "n" === key ? addNode() : "i" === key ? (parameters.showInfo = !parameters.showInfo, parameters.showInfo ? (console.log("show info"), updateInfoString(), infoDiv.show()) : infoDiv.hide()) : "a" === key ? robotAmoving = !robotAmoving : "b" === key ? robotBmoving = !robotBmoving : "c" === key ? toggleForSelectedNode() : "d" === key ? parameters.darkMode = !parameters.darkMode : "C" === key ? parameters.showConfigurationspace = !parameters.showConfigurationspace : "s" === key ? takeScreenshotGraph = !takeScreenshotGraph : "S" === key ? takeScreenshotConfigSpace = !takeScreenshotConfigSpace : "r" === key ? parameters.showRobots = !parameters.showRobots : "w" === key ? writeToFiles() : "z" === key ? (graphicsForConfigurationSpace.easycam.removeMouseListeners(), graphicsForGraph.easycam.removeMouseListeners()) : "Z" === key && (graphicsForConfigurationSpace.easycam.attachMouseListeners(graphicsForConfigurationSpace._renderer), graphicsForGraph.easycam.attachMouseListeners(graphicsForGraph._renderer))
} function keyReleased() { if (verbose && console.log("keyReleased: " + keyCode), keyboardFlags[keyCode] = !1, keyCode !== SHIFT && "a" !== key && "b" !== key || (verbose && console.log("keyReleased: parameters.mode = View"), parameters.mode = "View", updateMode()), !downKey("A") && !downKey("B")) for (let e of graph.graphLayout.edges) e.candidateForRobot = void 0 } function applyToVec3(e, o) {
  let t;
  var [r, a, s] = o, [i, n, h, p] = e, g = n * r + h * a + p * s;
  return t = [0, 0, 0], t[0] = 2 * (i * (r * i - (h * s - p * a)) + g * n) - r, t[1] = 2 * (i * (a * i - (p * r - n * s)) + g * h) - a, t[2] = 2 * (i * (s * i - (n * a - h * r)) + g * p) - s, t
} function limitVector(e, o) { e.mag() > o && e.normalize().mult(o) } function EulerToQuaternion(e, o, t) {
  var r = cos(.5 * t), a = sin(.5 * t), s = cos(.5 * o), i = sin(.5 * o), n = cos(.5 * e), h = sin(.5 * e);
  return [r * s * n + a * i * h, r * s * h - a * i * n, a * s * h + r * i * n, a * s * n - r * i * h]
} function QuaternionToEuler(e, o, t, r) {
  var a = 2 * (e * t - r * o);
  return [atan2(2 * (e * o + t * r), 1 - 2 * (o * o + t * t)), abs(a) >= 1 ? copysign(M_PI / 2, a) : asin(a), atan2(2 * (e * r + o * t), 1 - 2 * (t * t + r * r))]
} function cartesianProductOf() {
  return Array.prototype.reduce.call(arguments, (function (e, o) {
    var t = [];
    return e.forEach((function (e) { o.forEach((function (o) { t.push(e.concat([o])) })) })), t
  }), [[]])
} function getFourthPoint(e, o, t) { return p5.Vector.add(o, t).sub(e) } function completeGraph(e) {
  let o = [...Array(e).keys()], t = [];
  for (let e of o) for (let r of o) e !== r && e < r && t.push([e, r]);
  return new Graph(o, t)
} function chainGraph(e) {
  let o = [...Array(e).keys()], t = [];
  for (let r of o) t.push([r, (r + 1) % e]), vverbose && print(r);
  return new Graph(o, t)
} function wheelGraph(e) {
  let o = [...Array(e + 1).keys()], t = [];
  for (let r of o) r !== e && t.push([r, e]), t.push([r, (r + 1) % e]), vverbose && print(r);
  return new Graph(o, t)
} function randomGraph() {
  let e = [...Array(30).keys()];
  return new Graph(e, [])
} function completeBipartiteGraph(e, o) {
  vverbose && print("completeBipartiteGraph: " + e + " " + o);
  let t = [...Array(e).keys()], r = [...Array(o).keys()].map((o => o + e)), a = [...Array(e + o).keys()], s = [];
  for (let e of t) for (let o of r) s.push([e, o]);
  return new Graph(a, s)
} function mouseWheel(e) { areWeOnTheLeft ? parameters.syncView && configuration_space.graphLayout.graphics.easycam.setState(graph.graphLayout.graphics.easycam.getState()) : parameters.syncView && graph.graphLayout.graphics.easycam.setState(configuration_space.graphLayout.graphics.easycam.getState()) } let mouseIsPressedOnLeftSide = !1;
function mousePressedOnLeft(e) { console.log("mousePressedOnLeft") } function mousePressed(e) {
  let o, t;
  if (areWeOnTheLeft = e.target === graphicsForGraph.canvas, vverbose && console.log("mouse pressed"), vverbose && console.log(areWeOnTheLeft), vverbose && console.log(parameters.mode), "Move" === parameters.mode) {
    let e = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace, r = mouseX - e.easycam.viewport[0] - e.easycam.viewport[2] / 2, a = mouseY - e.easycam.viewport[1] - e.easycam.viewport[3] / 2, s = createVector(r, a), i = e.easycam.getUpVector();
    if (cameraState = e.easycam.getState(), parameters.showRobots) {
      let t = createVector(i[0], i[1], i[2]).setMag(.5 * parameters.robotsNodeSize), r = graph.robotA, a = graph.robotB;
      r.active = !1, a.active = !1;
      let n = r.getPosition(), h = a.getPosition(), p = e.screenPosition(n), g = e.screenPosition(h), d = s.dist(p), c = s.dist(g), l = e.screenPosition(p5.Vector.add(n, t)), u = e.screenPosition(p5.Vector.add(h, t)), f = p.dist(l), m = g.dist(u);
      d < f ? o = r : c < m && (o = a)
    } let n = createVector(i[0], i[1], i[2]).setMag(.5 * parameters.configNodeSize), h = configuration_space.graphLayout.configuration;
    h.active = !1;
    let p = e.screenPosition(h.position), g = s.dist(p), d = e.screenPosition(p5.Vector.add(h.position, n));
    if (g < p.dist(d) && (o = h), void 0 === o) {
      let r = createVector(i[0], i[1], i[2]).setMag(.5 * parameters.nodeSize), a = [].concat(graph.graphLayout.nodes).concat(configuration_space.graphLayout.nodes);
      for (let e of a) e.lastSelected = !1;
      for (let i of a) {
        i.active = !1;
        let a = e.screenPosition(i.position), n = s.dist(a), h = e.screenPosition(p5.Vector.add(i.position, r)), p = a.dist(h);
        vverbose && print(e.screenPosition(i.position)), n < p && (void 0 === o || n < t) && (o = i, t = n)
      }
    } if (void 0 !== o) { if (o.lastSelected = !0, void 0 !== o.graphLayout) { "graph" === o.graphLayout.source.type && (selectedNodesInGraph.includes(o) ? selectedNodesInGraph = selectedNodesInGraph.filter((e => e !== o)) : selectedNodesInGraph.push(o)) } } else selectedNodesInGraph = [];
    if (void 0 !== o && o.lastSelected) "Edit" === parameters.mode ? void 0 !== nodeSelectedForEdgeAddition ? (nodeSelectedForEdgeAddition !== o && void 0 === graph.graphLayout.getEdge(nodeSelectedForEdgeAddition.label, o.label, !1) && addEdge(nodeSelectedForEdgeAddition, o), nodeSelectedForEdgeAddition.firstNodeOfEdge = !1, nodeSelectedForEdgeAddition = void 0) : deleteNodeMode ? o.occupied() || deleteNode(o) : (nodeSelectedForEdgeAddition = o, o.firstNodeOfEdge = !0) : "Move" === parameters.mode && (o.active = !0, vverbose || console.log("selectedNode.active = true"));
    else if ("Edit" === parameters.mode) {
      let e = addNode(), o = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace, t = mouseX - o.easycam.viewport[0] - o.easycam.viewport[2] / 2, r = mouseY - o.easycam.viewport[1] - o.easycam.viewport[3] / 2, a = createVector(t, r);
      for (let t = 0;
        t < 10;
        t++) {
          let t = o.screenPosition(e.position), r = p5.Vector.sub(a, t), s = applyToVec3(cameraState.rotation, [r.x, r.y, 0]), i = s[0], n = s[1], h = s[2], p = createVector(i, n, h).setMag(.5 * r.mag());
        e.position.add(p)
      }
    } if (!0 === graph.robotA.active || !0 === graph.robotB.active) {
      let e = !0 === graph.robotA.active ? graph.robotA : graph.robotB, o = e.getAllPossibleEdges();
      for (let t of o) graph.graphLayout.getEdge(t[0], t[1]).candidateForRobot = e.index
    }
  } else "View" === parameters.mode && reheat()
} function ourMouseDragged() {
  if (vverbose && console.log("ourMouseDragged"), "Move" === parameters.mode) {
    reheat();
    let e, o, t = areWeOnTheLeft ? graphicsForGraph : graphicsForConfigurationSpace, r = mouseX - t.easycam.viewport[0] - t.easycam.viewport[2] / 2, a = mouseY - t.easycam.viewport[1] - t.easycam.viewport[3] / 2, s = createVector(r, a);
    if (!0 === graph.robotA.active || !0 === graph.robotB.active) {
      let e = !0 === graph.robotA.active ? graph.robotA : graph.robotB;
      if (e.inANode()) {
        let o, r, a = t.screenPosition(e.getPosition()), i = p5.Vector.sub(s, a), n = e.getCandidates();
        for (let e of n) {
          let s = t.screenPosition(e.position), n = p5.Vector.sub(s, a), h = p5.Vector.dot(n, i) / (i.mag() * n.mag());
          n.dot(i) / pow(n.mag(), 2) > .05 && (void 0 === o || h > r) && (o = e, r = h)
        } void 0 !== o && e.setNodeTo(o)
      } else {
        let o = t.screenPosition(e.getPosition()), r = p5.Vector.sub(s, o).mult(.9), a = t.screenPosition(e.nodeFrom.position), i = t.screenPosition(e.nodeTo.position), n = p5.Vector.sub(i, a), h = n.dot(r) / pow(n.mag(), 2);
        e.setAmount(e.amount + h)
      }
    } else {
      vverbose && console.log("moving node");
      for (let e of graph.graphLayout.nodes) !0 === e.active && (o = e, vverbose && console.log("movingNode = node"), vverbose && console.log(e))
    } if (!0 === configuration_space.graphLayout.configuration.active) {
      e = configuration_space.graphLayout.configuration;
      let o = graphicsForConfigurationSpace.screenPosition(e.position), t = p5.Vector.sub(s, o).mult(.9), r = configuration_space.graphLayout.getNode([e.robotA.nodeFrom.label, e.robotB.nodeFrom.label]).position, a = configuration_space.graphLayout.getNode([e.robotA.nodeTo.label, e.robotB.nodeFrom.label]).position, i = configuration_space.graphLayout.getNode([e.robotA.nodeFrom.label, e.robotB.nodeTo.label]).position, n = configuration_space.graphLayout.getNode([e.robotA.nodeTo.label, e.robotB.nodeTo.label]).position;
      if (keyboardFlags[SHIFT] || keyboardFlags[66]) if (e.robotB.inANode()) {
        let o = pickBestCandidateForB(e, t);
        void 0 !== o && !1 !== o && e.robotB.setNeighbor(o)
      } else {
        let o = p5.Vector.lerp(r, a, e.robotA.amount), s = p5.Vector.lerp(i, n, e.robotA.amount), h = graphicsForConfigurationSpace.screenPosition(o), p = graphicsForConfigurationSpace.screenPosition(s), g = p5.Vector.sub(p, h), d = g.dot(t) / pow(g.mag(), 2);
        e.robotB.setAmount(e.robotB.amount + d)
      } if (keyboardFlags[SHIFT] || keyboardFlags[65]) if (e.robotA.inANode()) {
        let o = pickBestCandidateForA(e, t);
        void 0 !== o && !1 !== o && e.robotA.setNeighbor(o)
      } else {
        let o = p5.Vector.lerp(r, i, e.robotB.amount), s = p5.Vector.lerp(a, n, e.robotB.amount), h = graphicsForConfigurationSpace.screenPosition(o), p = graphicsForConfigurationSpace.screenPosition(s), g = p5.Vector.sub(p, h), d = g.dot(t) / pow(g.mag(), 2);
        e.robotA.setAmount(e.robotA.amount + d)
      }
    } else for (let e of configuration_space.graphLayout.nodes) !0 === e.active && (o = e);
    if (void 0 !== o) {
      vverbose && console.log("moving ordinaryNodeMoving");
      let e = t.screenPosition(o.position), r = p5.Vector.sub(s, e), a = applyToVec3(cameraState.rotation, [r.x, r.y, 0]), i = t.easycam.getPosition(), n = createVector(i[0], i[1], i[2]), h = o.position.dist(n);
      vverbose && print(a);
      let p = a[0], g = a[1], d = a[2], c = createVector(p, g, d).mult(.5 * h / cameraState.distance);
      o.position.add(c)
    }
  } else "View" === parameters.mode && (areWeOnTheLeft ? parameters.syncView && configuration_space.graphLayout.graphics.easycam.setState(graph.graphLayout.graphics.easycam.getState()) : parameters.syncView && graph.graphLayout.graphics.easycam.setState(configuration_space.graphLayout.graphics.easycam.getState()), reheat())
} function mouseReleased() {
  configuration_space.graphLayout.configuration.active = !1;
  for (let e of configuration_space.graphLayout.nodes) e.active = !1;
  graph.robotA.active = !1, graph.robotB.active = !1;
  for (let e of graph.graphLayout.nodes) e.active = !1;
  if ("a" !== key && "b" !== key) for (let e of graph.graphLayout.edges) e.candidateForRobot = void 0
} class Node {
  constructor(e, o, t, r, a, s) { this.graphLayout = e, this.graphics = e.graphics, this.labelText = labelToString(o), this.applyExtraCenterForce = !1, this.label = o, this.mass = s, vverbose && print(o), this.active = !1, e.layout3D ? (this.position = createVector(t, r, a), this.velocity = createVector(0, 0, 0), this.acceleration = createVector(0, 0, 0)) : (this.position = createVector(t, r), this.velocity = createVector(0, 0), this.acceleration = createVector(0, 0)), this.frozen = !1, this.alive = !0, this.neighbors = [], this.neighborsA = [], this.neighborsB = [] } createInnerNode() { this.innerNode = new InnerNode(this, this.graphLayout, 0, this.position.copy()) } connectTo(e) { this.neighbors.push(e) } update(e) {
    let o;
    if (this.acceleration.mult(0), o = octForces ? this.graphLayout.octree.getAllNodesForces(this) : this.getSeparationFromNodes(e), "graph" === this.graphLayout.source.type) {
      let e = this.getSpringForce(this.graphLayout.edgelength, this.graphLayout.graphEdgeForce, this.neighbors);
      if (e.mult(1 * this.graphLayout.cohesionFactor), this.acceleration.add(e), this.acceleration.add(o), this.graphLayout.planarForce > 0) {
        let e = createVector(this.position.x, this.position.y, 0), o = this.getForceTowardsGoal(this.graphLayout.planarForce, e);
        this.acceleration.add(o)
      }
    } else {
      let e = this.getSpringForce(this.graphLayout.secondCoordinateEdgeLength, this.graphLayout.secondCoordinateForce, this.neighbors.filter((e => e.label[0] === this.label[0]))), o = this.getSpringForce(this.graphLayout.firstCoordinateEdgeLength, this.graphLayout.firstCoordinateForce, this.neighbors.filter((e => e.label[1] === this.label[1]))), t = this.getForceTowardsGoal(this.graphLayout.firstCoordinateMirrorForce, graph.graphLayout.getNode(this.label[0]).position), r = this.getForceTowardsGoal(this.graphLayout.secondCoordinateMirrorForce, graph.graphLayout.getNode(this.label[1]).position);
      if (graph.graphLayout.nodes.forEach((e => { e.applyExtraCenterForce && (this.label[0] === e.label && (t = t.add(this.getForceTowardsGoal(this.graphLayout.extraCenterPreference, e.position))), this.label[1] === e.label && (r = r.add(this.getForceTowardsGoal(-this.graphLayout.extraCenterPreference, e.position)))) })), this.graphLayout.squarePlanarForce > 0) for (let e of this.neighbors.filter((e => e.label[0] === this.label[0]))) for (let o of this.neighbors.filter((e => e.label[1] === this.label[1]))) if (o.label[0] !== e.label[1]) {
        let t = getFourthPoint(this.graphLayout.getNode([o.label[0], e.label[1]]).position, e.position, o.position), r = this.getForceTowardsGoal(this.graphLayout.squarePlanarForce, t);
        this.acceleration.add(r)
      } e.mult(1 * this.graphLayout.cohesionFactor), o.mult(1 * this.graphLayout.cohesionFactor), this.acceleration.add(e), this.acceleration.add(o), this.acceleration.add(t), this.acceleration.add(r)
    } let t = this.getForceTowardsGoal(this.graphLayout.centerForce, this.graphLayout.center);
    if (this.acceleration.add(t), this.applyExtraCenterForce) {
      let e = this.getForceTowardsGoal(this.graphLayout.extraCenterForce, this.graphLayout.center);
      this.acceleration.add(e)
    }
  } move() { this.frozen || (this.velocity.add(this.acceleration), limitVector(this.velocity, parameters.maxspeed), this.position.add(this.velocity), this.velocity.mult(.9)) } getCenter(e) {
    let o = new createVector(0, 0, 0);
    const t = e.length;
    for (let r of e) {
      const e = p5.Vector.div(r.position, t);
      o.add(e)
    } return o
  } getSeparationFromNodes(e) {
    let o = new createVector(0, 0, 0);
    for (let t of e) {
      let e = p5.Vector.sub(this.position, t.position), r = e.mag();
      r > 1 && (e.normalize().mult(this.graphLayout.repulsion / (r * r)), o.add(e))
    } return o
  } getSpringForce(e, o, t) {
    let r = new createVector(0, 0, 0);
    for (let a of t) {
      let t = p5.Vector.sub(this.position, a.position), s = t.mag() - e;
      abs(s) > this.graphLayout.cohesionthreshold && (t.normalize().mult(-o * s), r.add(t))
    } return limitVector(r, e), r
  } getForceTowardsGoal(e, o) {
    let t = p5.Vector.sub(o, this.position), r = t.mag();
    return abs(r) > this.graphLayout.cohesionthreshold && t.normalize().mult(e * r), t
  } occupied() {
    let e = !1;
    return this !== graph.robotA.nodeFrom && this !== graph.robotA.nodeTo && this !== graph.robotB.nodeFrom && this !== graph.robotB.nodeTo || (e = !0), e
  } isInner() { return Array.isArray(this.label) && Array.isArray(this.label[0]) } show(e) {
    if (parameters.debugMode && "graph" !== this.graphLayout.source.type && !this.isInner()) {
      e.strokeWeight(parameters.edgeWidthConfigSpace);
      let o = graph.graphLayout.getNode(this.label[0]).position, t = graph.graphLayout.getNode(this.label[1]).position;
      e.stroke(255, 127, 80, 100), e.line(this.position.x, this.position.y, this.position.z, o.x, o.y, o.z), e.stroke(153, 50, 204, 100), e.line(this.position.x, this.position.y, this.position.z, t.x, t.y, t.z);
      for (let o of this.getSquareNeighbors()) {
        let t = o.getCentroid();
        e.strokeWeight(parameters.edgeWidthConfigSpace);
        let r = t;
        e.stroke(50, 50, 255, 50), e.line(this.position.x, this.position.y, this.position.z, r.x, r.y, r.z), e.push(), e.translate(r.x, r.y, r.z), e.fill(120, 255, 255), e.sphere(.25 * parameters.nodeSize, parameters.sphereDetail, parameters.sphereDetail), e.pop()
      }
    } if (this.nodeBorder ? (e.stroke(150), e.strokeWeight(parameters.nodeSize * this.graphLayout.nodeBorderWidth)) : e.noStroke(), this.graphLayout.layout3D) {
      if (e.push(), e.translate(this.position.x, this.position.y, this.position.z), deleteNodeMode && !this.occupied() && e === graphicsForGraph ? e.fill(parameters.deleteNodeColor) : this.applyExtraCenterForce ? e.fill(0, 255, 0) : this.active ? e.fill(parameters.activeDotColor) : this.firstNodeOfEdge ? e.fill(parameters.selectedNodeForEdgeColor) : e.fill(parameters.colorNode), parameters.sphereView) e.sphere(.5 * parameters.nodeSize, parameters.sphereDetail, parameters.sphereDetail);
      else {
        let o = e.easycam.getRotation(), t = QuaternionToEuler(o[0], o[1], o[2], o[3]);
        e.rotateX(-t[0]), e.rotateY(-t[1]), e.rotateZ(-t[2]), e.translate(0, 0, 1), e.stroke(0), e.strokeWeight(1), e.ellipse(0, 0, parameters.nodeSize * (this.isInner() ? .5 : 1), parameters.nodeSize * (this.isInner() ? .5 : 1))
      } if (selectedNodesInGraph.includes(this) || selectedNodesInConfigSpace.includes(this)) {
        let o = e.easycam.getRotation(), t = QuaternionToEuler(o[0], o[1], o[2], o[3]);
        e.rotateX(-t[0]), e.rotateY(-t[1]), e.rotateZ(-t[2]), e.stroke(0, 255, 255), e.noFill(), e.strokeWeight(2), e.ellipse(0, 0, 1.5 * parameters.nodeSize, 1.5 * parameters.nodeSize)
      } e.pop()
    }
  } showText(e) {
    if (parameters.darkMode ? e.fill(255, 255, 255) : e.fill(0, 0, 0), e.textAlign(CENTER, CENTER), e.textFont(font), e.textSize(parameters.fontSize), this.graphLayout.layout3D) {
      const o = e.easycam.getRotation(), t = QuaternionToEuler(o[0], o[1], o[2], o[3]);
      e.push(), e.translate(this.position.x, this.position.y, this.position.z), e.rotateX(-t[0]), e.rotateY(-t[1]), e.rotateZ(-t[2]), e.translate(parameters.labelX, parameters.labelY, max(parameters.nodeSize, parameters.configNodeSize, parameters.robotsNodeSize) + parameters.labelZ), e.text(this.labelText, 0, -textDescent() / 2), e.pop()
    } else e.push(), e.translate(this.position.x, this.position.y, this.position.z), e.text(this.labelText, 0, 0), e.pop()
  } getSquareNeighbors() {
    let e = [];
    for (let o of this.graphLayout.squares) o.label[0].includes(this.label[0]) && o.label[1].includes(this.label[1]) && e.push(o);
    return e
  }
} let MAXLEVEL = 10, BUCKETSIZE = 10, NODEMASS = 1;
const EMPTY = 0, LEAF = 1, DIVIDED = 2, allNodesForce = -.33, gravityPower = 2;
class Octree {
  constructor(e, o, t) { this.graphLayout = e, this.boundary = o, this.level = t, this.state = 0, this.children = void 0, this.centerOfMass = createVector(), this.centerMass = 0 } subdivide() {
    this.state = 2;
    let e = this.boundary.x, o = this.boundary.y, t = this.boundary.z, r = this.boundary.w / 2, a = this.boundary.h / 2, s = this.boundary.d / 2;
    this.URF = new Octree(this.graphLayout, new Cube(e + r, o - a, t + s, r, a, s), this.level + 1), this.ULF = new Octree(this.graphLayout, new Cube(e - r, o - a, t + s, r, a, s), this.level + 1), this.LRF = new Octree(this.graphLayout, new Cube(e + r, o + a, t + s, r, a, s), this.level + 1), this.LLF = new Octree(this.graphLayout, new Cube(e - r, o + a, t + s, r, a, s), this.level + 1), this.URB = new Octree(this.graphLayout, new Cube(e + r, o - a, t - s, r, a, s), this.level + 1), this.ULB = new Octree(this.graphLayout, new Cube(e - r, o - a, t - s, r, a, s), this.level + 1), this.LRB = new Octree(this.graphLayout, new Cube(e + r, o + a, t - s, r, a, s), this.level + 1), this.LLB = new Octree(this.graphLayout, new Cube(e - r, o + a, t - s, r, a, s), this.level + 1)
  } insert(e) {
    if (0 == this.state) null == this.children && (this.children = []), this.children.push(e), this.state = 1;
    else if (1 == this.state) if (this.children.length < BUCKETSIZE || this.level == MAXLEVEL) this.children.push(e);
    else {
      this.subdivide();
      for (let e of this.children) this.insertInOctant(e);
      this.children = [], this.insertInOctant(e)
    } else 2 == this.state ? this.insertInOctant(e) : error("insert: state unknown")
  } insertInOctant(e) { this.ULF.boundary.contains(e) ? this.ULF.insert(e) : this.URF.boundary.contains(e) ? this.URF.insert(e) : this.LLF.boundary.contains(e) ? this.LLF.insert(e) : this.LRF.boundary.contains(e) ? this.LRF.insert(e) : this.ULB.boundary.contains(e) ? this.ULB.insert(e) : this.URB.boundary.contains(e) ? this.URB.insert(e) : this.LLB.boundary.contains(e) ? this.LLB.insert(e) : this.LRB.boundary.contains(e) ? this.LRB.insert(e) : vverbose && console.error("insertInOctant: not in any octant: " + e.position + " " + this.boundary.toString() + "\nthis.ULF.boundary = " + this.ULF.boundary.toString() + "\nthis.URF.boundary = " + this.URF.boundary.toString() + "\nthis.LLF.boundary = " + this.LLF.boundary.toString() + "\nthis.LRF.boundary = " + this.LRF.boundary.toString() + "\nthis.ULB.boundary = " + this.ULB.boundary.toString() + "\nthis.URB.boundary = " + this.URB.boundary.toString() + "\nthis.LLB.boundary = " + this.LLB.boundary.toString() + "\nthis.LRB.boundary = " + this.LRB.boundary.toString() + "\n") } calculateMass() {
    if (vverbose && console.log("calculateMass"), 0 == this.state);
    else if (1 == this.state) {
      this.centerOfMass.set(0, 0, 0), this.centerMass = 0;
      let e = 0;
      for (let o of this.children) this.centerOfMass.add(p5.Vector.mult(o.position, o.mass)), this.centerMass += o.mass, e++;
      this.centerOfMass.div(e)
    } else 2 == this.state ? (this.centerOfMass.set(0, 0, 0), this.centerMass = 0, this.URF.calculateMass(), this.ULF.calculateMass(), this.LRF.calculateMass(), this.LLF.calculateMass(), this.URB.calculateMass(), this.ULB.calculateMass(), this.LRB.calculateMass(), this.LLB.calculateMass(), this.centerOfMass.add(p5.Vector.mult(this.URF.centerOfMass, this.URF.centerMass)), this.centerMass += this.URF.centerMass, this.centerOfMass.add(p5.Vector.mult(this.ULF.centerOfMass, this.ULF.centerMass)), this.centerMass += this.ULF.centerMass, this.centerOfMass.add(p5.Vector.mult(this.LRF.centerOfMass, this.LRF.centerMass)), this.centerMass += this.LRF.centerMass, this.centerOfMass.add(p5.Vector.mult(this.LLF.centerOfMass, this.LLF.centerMass)), this.centerMass += this.LLF.centerMass, this.centerOfMass.add(p5.Vector.mult(this.URB.centerOfMass, this.URB.centerMass)), this.centerMass += this.URB.centerMass, this.centerOfMass.add(p5.Vector.mult(this.ULB.centerOfMass, this.ULB.centerMass)), this.centerMass += this.ULB.centerMass, this.centerOfMass.add(p5.Vector.mult(this.LRB.centerOfMass, this.LRB.centerMass)), this.centerMass += this.LRB.centerMass, this.centerOfMass.add(p5.Vector.mult(this.LLB.centerOfMass, this.LLB.centerMass)), this.centerMass += this.LLB.centerMass, this.centerOfMass.div(this.centerMass)) : (vverbose && console.log("ERROR"), error("calculateMass: state unknown"))
  } getAllNodesForces(e) {
    let o = createVector();
    if (0 == this.state);
    else if (1 == this.state) {
      for (let t of this.children) if (e != t) {
        let r = p5.Vector.sub(e.position, t.position), a = r.mag();
        a > 1 && (r.normalize().mult(this.graphLayout.repulsion / pow(a, 2)), o.add(r))
      }
    } else if (2 == this.state) {
      let t = this.centerOfMass.dist(e.position);
      if (t > parameters.THETA * this.boundary.w) {
        let r = p5.Vector.sub(e.position, this.centerOfMass);
        t > 1 && (r.normalize().mult(this.graphLayout.repulsion * this.centerMass / pow(t, 2)), o.add(r))
      } else o.add(this.ULF.getAllNodesForces(e)), o.add(this.URF.getAllNodesForces(e)), o.add(this.LLF.getAllNodesForces(e)), o.add(this.LRF.getAllNodesForces(e)), o.add(this.ULB.getAllNodesForces(e)), o.add(this.URB.getAllNodesForces(e)), o.add(this.LLB.getAllNodesForces(e)), o.add(this.LRB.getAllNodesForces(e))
    } else vverbose && error("forcesOnNode: state missing");
    return o
  } show(e) {
    if (e.push(), e.translate(this.boundary.x, this.boundary.y, this.boundary.z), e.stroke(0), e.strokeWeight(1), e.noFill(), e.box(2 * this.boundary.w, 2 * this.boundary.h, 2 * this.boundary.d), e.pop(), null != this.children) for (let o of this.children) e.stroke(60, 255, 255, 255), e.strokeWeight(1), e.line(this.centerOfMass.x, this.centerOfMass.y, this.centerOfMass.z, o.position.x, o.position.y, o.position.z), e.push(), e.translate(this.centerOfMass.x, this.centerOfMass.y, this.centerOfMass.z), e.fill(210, 255, 255, 255), e.noStroke(), e.sphere(10), e.pop();
    2 == this.state && (this.URF.show(e), this.ULF.show(e), this.LRF.show(e), this.LLF.show(e), this.URB.show(e), this.ULB.show(e), this.LRB.show(e), this.LLB.show(e))
  }
} class Cube { constructor(e, o, t, r, a, s) { this.x = e, this.y = o, this.z = t, this.w = r, this.h = a, this.d = s } contains(e) { return e.position.x >= this.x - this.w && e.position.x <= this.x + this.w && e.position.y >= this.y - this.h && e.position.y <= this.y + this.h && e.position.z >= this.z - this.d && e.position.z <= this.z + this.d } intersects(e) { return !(e.x - e.w > this.x + this.w || e.x + e.w < this.x - this.w || e.y - e.h > this.y + this.h || e.y + e.h < this.y - this.h || e.z - e.d > this.z + this.d || e.z + e.d < this.z - this.d) } toString() { return "x=" + this.x + " y=" + this.y + " z=" + this.z + " w=" + this.w + " h=" + this.h + " d=" + this.d } } class Robot {
  constructor(e, o, t) { this.graph = e, this.nodeFrom = o, this.nodeTo = o, this.amount = 0, this.index = t, this.visited = [] } occupyingNodes() { return [this.nodeFrom, this.nodeTo] } getCandidates() { return this.nodeFrom.neighbors.filter((e => !this.graph.otherRobot(this).occupyingNodes().includes(e))) } getAllPossibleEdges() {
    let e = this.graph.otherRobot(this).occupyingNodes().map((e => e.label));
    return this.graph.edges.filter((o => !e.includes(o[0]) && !e.includes(o[1])))
  } getRandomNeighbor() {
    let e = this.getCandidates();
    return e.length > 0 && e[floor(random(e.length))]
  } setNodeTo(e) { this.visited.push(e), this.nodeTo = e, this.amount = 1e-4, this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, !1).owner = this } setNeighbor(e) { this.nodeTo = e, this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, !1).owner = this } setRandomNeighborIfPossible() {
    console.log("setRandomNeighborIfPossible");
    let e = this.getCandidates();
    e.length > 0 && (this.nodeTo = e[floor(random(e.length))])
  } setAmount(e) {
    if (this.nodeFrom !== this.nodeTo && (this.amount = constrain(e, 0, 1)), 0 === this.amount && (vverbose && console.log("this.amount === 0.0"), vverbose && console.log(this.nodeFrom.label + " " + this.nodeTo.label), vverbose && console.log(this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, !1)), this.nodeFrom !== this.nodeTo && (this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, !1).owner = void 0, this.nodeTo = this.nodeFrom), parameters.moveDotsRandomly)) {
      let e = this.getRandomNeighbor();
      if (!e) return !1;
      this.setNodeTo(e)
    } 1 === this.amount && (vverbose && console.log("this.amount === 1.0"), vverbose && console.log(this.nodeFrom.label + " " + this.nodeTo.label), vverbose && console.log(this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, !1)), this.nodeFrom !== this.nodeTo && (vverbose && console.log("resetting!"), this.graph.graphLayout.getEdge(this.nodeFrom.label, this.nodeTo.label, !1).owner = void 0, this.amount = 0, this.nodeFrom = this.nodeTo))
  } getPosition() { return p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, this.amount) } inANode() { return this.nodeFrom === this.nodeTo } show(e) {
    let o = this.getPosition();
    if (this.nodeBorder ? (e.stroke(150), e.strokeWeight(parameters.graphRobotSize * this.graphLayout.nodeBorderWidth)) : e.noStroke(), e.fill(0 === this.index ? parameters.colorRobotA : parameters.colorRobotB), this.graph.graphLayout.layout3D) {
      if (e.push(), e.translate(o.x, o.y, o.z), parameters.sphereView) {
        let o = parameters.sphereDetail;
        e.sphere((this.active ? .55 : .5) * parameters.robotsNodeSize, o, o)
      } else {
        let o = e.easycam.getRotation(), t = QuaternionToEuler(o[0], o[1], o[2], o[3]);
        e.rotateX(-t[0]), e.rotateY(-t[1]), e.rotateZ(-t[2]), e.translate(0, 0, 20), e.ellipse(0, 0, (this.active ? 1.1 : 1) * parameters.robotsNodeSize, (this.active ? 1.1 : 1) * parameters.robotsNodeSize)
      } e.pop()
    }
  }
} class Square {
  constructor(e, o, t, r, a, s) { this.graphLayout = e, this.graphics = e.graphics, this.label = o, this.edgeAfrom = t, this.edgeAto = r, this.edgeBfrom = a, this.edgeBto = s, this.innerEdges = [], this.innerSquares = [], vverbose && print("square created!"), vverbose && print(this) } getInnernode(e) { for (let o of this.innerNodes) if (arraysEqual(o.label, e)) return o } createInnerNodes() {
    this.innerNodes = [];
    for (let e = 1;
      e < this.edgeAfrom.granularity;
      e++)for (let o = 1;
        o < this.edgeBfrom.granularity;
        o++) {
          let t = e / this.edgeAfrom.granularity, r = o / this.edgeBfrom.granularity, a = this.getPosition(t, r), s = new InnerNode(this, this.graphLayout, [e, o], a, 1 / this.edgeAfrom.granularity * (1 / this.edgeBfrom.granularity));
        this.innerNodes.push(s)
      } for (let e = 1;
      e < this.edgeAfrom.granularity;
      e++)for (let o = 1;
        o < this.edgeBfrom.granularity;
        o++) {
          let t = this.getInnernode([e, o]), r = this.getInnernode([e, o - 1]), a = this.getInnernode([e, o + 1]), s = this.getInnernode([e - 1, o]), i = this.getInnernode([e + 1, o]);
        void 0 !== r && t.neighborsA.push(r), void 0 !== a && t.neighborsA.push(a), void 0 !== s && t.neighborsB.push(s), void 0 !== i && t.neighborsB.push(i)
      } for (let e = 1;
      e < this.edgeAfrom.granularity;
      e++)this.getInnernode([e, 1]).neighborsA.push(this.edgeAfrom.innerNodes[e]), this.edgeAfrom.innerNodes[e].neighborsA.push(this.getInnernode([e, 1])), this.getInnernode([e, this.edgeAfrom.granularity - 1]).neighborsA.push(this.edgeAto.innerNodes[e]), this.edgeAto.innerNodes[e].neighborsA.push(this.getInnernode([e, this.edgeAfrom.granularity - 1]));
    for (let e = 1;
      e < this.edgeBfrom.granularity;
      e++)this.getInnernode([1, e]).neighborsB.push(this.edgeBfrom.innerNodes[e]), this.edgeBfrom.innerNodes[e].neighborsB.push(this.getInnernode([1, e])), this.getInnernode([this.edgeAfrom.granularity - 1, e]).neighborsB.push(this.edgeBto.innerNodes[e]), this.edgeBto.innerNodes[e].neighborsB.push(this.getInnernode([this.edgeAfrom.granularity - 1, e]))
  } forceInnerNodesToTheirPositions() {
    for (let e of this.innerNodes) {
      let o = e.label[0] / this.edgeAfrom.granularity, t = e.label[1] / this.edgeBfrom.granularity;
      e.position = this.getPosition(o, t)
    }
  } updateRepulsionForce(e) {
    let o = this.getCentroid(), t = new createVector(0, 0, 0);
    for (let r of e) {
      let e = p5.Vector.sub(o, r), a = e.mag();
      a > 1 && (e.normalize().mult(this.graphLayout.centroidRepulsion / (a * a)), t.add(e))
    } this.centroidRepulsionForce = t
  } getPosition(e, o) {
    let t = this.edgeAfrom.amountAlong(e), r = this.edgeAto.amountAlong(e);
    return p5.Vector.lerp(t, r, o)
  } show() {
    if (parameters.gridOn) {
      this.graphics.strokeWeight(parameters.edgeWidthGrid);
      for (let e = 1;
        e < this.edgeAfrom.innerNodes.length;
        e++) {
          let o = this.edgeAfrom.innerNodes[e].position, t = this.edgeAto.innerNodes[e].position;
        this.graphics.stroke(parameters.colorRobotA), this.graphics.line(o.x, o.y, o.z, t.x, t.y, t.z)
      } for (let e = 1;
        e < this.edgeBfrom.innerNodes.length;
        e++) {
          let o = this.edgeBfrom.innerNodes[e].position, t = this.edgeBto.innerNodes[e].position;
        this.graphics.stroke(parameters.colorRobotB), this.graphics.line(o.x, o.y, o.z, t.x, t.y, t.z)
      }
    } parameters.squareOn && (this.graphics.noStroke(), this.graphics.fill(red(parameters.squareColor), green(parameters.squareColor), blue(parameters.squareColor), parameters.squareOpacity), this.graphics.beginShape(), this.graphics.vertex(this.edgeAfrom.nodeFrom.position.x, this.edgeAfrom.nodeFrom.position.y, this.edgeAfrom.nodeFrom.position.z), this.graphics.vertex(this.edgeAfrom.nodeTo.position.x, this.edgeAfrom.nodeTo.position.y, this.edgeAfrom.nodeTo.position.z), this.graphics.vertex(this.edgeAto.nodeTo.position.x, this.edgeAto.nodeTo.position.y, this.edgeAto.nodeTo.position.z), this.graphics.vertex(this.edgeAto.nodeFrom.position.x, this.edgeAto.nodeFrom.position.y, this.edgeAto.nodeFrom.position.z), this.graphics.endShape(CLOSE))
  } getCentroid() {
    let e = createVector();
    return e.add(this.edgeAfrom.nodeFrom.position), e.add(this.edgeAfrom.nodeTo.position), e.add(this.edgeAto.nodeTo.position), e.add(this.edgeAto.nodeFrom.position), e.div(4), e
  }
} function updateURL() {
  if (verbose && console.log("updateURL"), history.pushState) {
    let e = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + ("custom" === parameters.graphType || graphIsCustomized ? "graph=custom&nodes=" + graph.nodes + "&edges=" + edgesToString(graph.edges) : "graph=" + parameters.graphType) + "&view=" + (parameters.dualView ? "dual" : "single") + "&showgraph=" + parameters.showGraph + "&showconfigspace=" + parameters.showConfigurationspace + "&showrobots=" + parameters.showRobots;
    window.history.pushState({ path: e }, "", e), verbose && console.log(e)
  }
} function edgesToString(e) {
  let o = "";
  for (let t of e) o += "[" + t + "],";
  return o = o.substr(0, o.length - 1), o
} function setParametersFromURL() {
  verbose && console.log("setParametersFromURL");
  let e = getURL(), o = split(e, "?");
  if (2 !== o.length) return;
  let t, r, a = o[1], s = {};
  for (let e of split(a, "&")) {
    let o = split(e, "=");
    s[o[0]] = o[1]
  } if (void 0 !== s.file) return void readFromFile(s.file);
  verbose && console.log("setParametersFromURL continues");
  let i = [], n = s.view;
  "single" === n ? parameters.dualView = !1 : "dual" === n && (parameters.dualView = !0);
  let h = s.showgraph;
  parameters.showGraph = "false" !== h;
  let p = s.showconfigspace;
  parameters.showConfigurationspace = "false" !== p;
  let g = s.showrobots;
  parameters.showRobots = "false" !== g;
  let d = s.graph;
  if (void 0 !== d && "custom" !== d) parameters.graphType = d;
  else {
    let e = s.nodes;
    if (void 0 === e) return;
    t = e.split(",").map(Number);
    for (let e of t) if (isNaN(e)) return;
    let o = s.edges;
    vverbose && console.log(o), null !== o && (o = decodeURIComponent(o)), vverbose && console.log(o), void 0 !== o && "[" == o.charAt(0) && "]" == o.charAt(o.length - 1) && (vverbose && console.log("🎉 success []"), o = o.slice(1, -1), i = o.split(/[^\d],[^\d]/).map((e => e.split(",").map(Number)))), r = [];
    for (let e of i) 2 === e.length && t.includes(e[0]) && t.includes(e[1]) && e[0] !== e[1] && !edgesContainEdge(r, e) && r.push(e);
    void 0 !== t && (customGraph = {}, customGraph.nodes = t, customGraph.edges = r, graphIsCustomized = !0, parameters.graphType = "custom")
  }
} function updateInfoString() {
  infoStrings = [], infoStrings.push("Graph = " + parameters.graphType), infoStrings.push("Nodes = " + JSON.stringify(graph.nodes)), infoStrings.push("Edges = " + JSON.stringify(graph.edges));
  let e = [];
  for (let o of graph.graphLayout.nodes) o.applyExtraCenterForce && e.push(o.label);
  infoStrings.push("Graph nodes with extra center force = " + JSON.stringify(e));
  let o = graphicsForConfigurationSpace.easycam.getState();
  infoStrings.push("Camera state = " + JSON.stringify(o));
  let t = {};
  t.mode = parameters.mode, t.showGraph = parameters.showGraph, t.showConfigurationspace = parameters.showConfigurationspace, t.showRobots = parameters.showRobots, t.syncView = parameters.syncView, t.distinguishDots = parameters.distinguishDots, t.gridOn = parameters.gridOn, t.squareOn = parameters.squareOn, t.showHyperplanes = parameters.showHyperplanes, t.granularityFirstCoordinate = parameters.granularityFirstCoordinate, t.granularitySecondCoordinate = parameters.granularitySecondCoordinate, t.showText = parameters.showText, t.sphereView = parameters.sphereView, t.lights = parameters.lights, t.moveDotsRandomly = parameters.moveDotsRandomly, t.robotASpeed = parameters.robotASpeed, t.robotBSpeed = parameters.robotBSpeed, t.amountMultiplier = parameters.amountMultiplier, t.recordHistory = parameters.recordHistory, t.showHistory = parameters.showHistory, t.sphereDetail = parameters.sphereDetail, t.speedUp = parameters.speedUp, t.labelX = parameters.labelX, t.labelY = parameters.labelY, t.labelZ = parameters.labelZ, t.colorRobotA = parameters.colorRobotA, t.colorRobotB = parameters.colorRobotB, t.colorConfig = parameters.colorConfig, t.colorNode = parameters.colorNode, t.colorGraphEdge = parameters.colorGraphEdge, t.squareColor = parameters.squareColor, t.squareOpacity = parameters.squareOpacity, t.activeDotColor = parameters.activeDotColor, t.deleteNodeColor = parameters.deleteNodeColor, t.selectedNodeForEdgeColor = parameters.selectedNodeForEdgeColor, t.nodeSize = parameters.nodeSize, t.robotsNodeSize = parameters.robotsNodeSize, t.configNodeSize = parameters.configNodeSize, t.edgeWidthGraph = parameters.edgeWidthGraph, t.edgeWidthConfigSpace = parameters.edgeWidthConfigSpace, t.edgeWidthGrid = parameters.edgeWidthGrid, t.maxspeed = parameters.maxspeed, infoStrings.push("Parameters = " + JSON.stringify(t));
  let r = {};
  r.edgelength = graph.graphLayout.edgelength, r.cohesionthreshold = graph.graphLayout.cohesionthreshold, r.repulsion = graph.graphLayout.repulsion, r.separationFactor = graph.graphLayout.separationFactor, r.planarForce = graph.graphLayout.planarForce, r.centerForce = graph.graphLayout.centerForce, r.extraCenterForce = graph.graphLayout.extraCenterForce, r.moveToCenter = graph.graphLayout.moveToCenter, infoStrings.push("Graph parameters = " + JSON.stringify(r));
  let a = {};
  a.firstCoordinateEdgeLength = configuration_space.graphLayout.firstCoordinateEdgeLength, a.firstCoordinateForce = configuration_space.graphLayout.firstCoordinateForce, a.secondCoordinateEdgeLength = configuration_space.graphLayout.secondCoordinateEdgeLength, a.secondCoordinateForce = configuration_space.graphLayout.secondCoordinateForce, a.firstCoordinateMirrorForce = configuration_space.graphLayout.firstCoordinateMirrorForce, a.secondCoordinateMirrorForce = configuration_space.graphLayout.secondCoordinateMirrorForce, a.coordinatePreference = configuration_space.graphLayout.coordinatePreference, a.extraCenterPreference = configuration_space.graphLayout.extraCenterPreference, a.cohesionthreshold = configuration_space.graphLayout.cohesionthreshold, a.repulsion = configuration_space.graphLayout.repulsion, a.separationFactor = configuration_space.graphLayout.separationFactor, a.centerForce = configuration_space.graphLayout.centerForce, a.extraCenterForce = configuration_space.graphLayout.extraCenterForce, a.moveToCenter = configuration_space.graphLayout.moveToCenter, infoStrings.push("Configuration space parameters = " + JSON.stringify(a));
  for (let e of graph.nodes) infoStrings.push("Node position (" + e + ") = " + posToString(graph.graphLayout.getNode(e).position));
  for (let e of configuration_space.graphLayout.nodes) infoStrings.push("Configuration position (" + e.label + ") = " + posToString(e.position));
  let s = "";
  s += "<div class='break-all'>";
  for (let e of infoStrings) s += e + "<br>";
  s += "</div>", infoDiv.html(s)
} function updateLayoutStrings() {
  layoutStrings = [];
  let e = {};
  e.edgelength = graph.graphLayout.edgelength, e.cohesionthreshold = graph.graphLayout.cohesionthreshold, e.repulsion = graph.graphLayout.repulsion, e.separationFactor = graph.graphLayout.separationFactor, e.planarForce = graph.graphLayout.planarForce, e.centerForce = graph.graphLayout.centerForce, e.extraCenterForce = graph.graphLayout.extraCenterForce, e.moveToCenter = graph.graphLayout.moveToCenter, layoutStrings.push("Graph parameters = " + JSON.stringify(e));
  let o = {};
  o.firstCoordinateEdgeLength = configuration_space.graphLayout.firstCoordinateEdgeLength, o.firstCoordinateForce = configuration_space.graphLayout.firstCoordinateForce, o.secondCoordinateEdgeLength = configuration_space.graphLayout.secondCoordinateEdgeLength, o.secondCoordinateForce = configuration_space.graphLayout.secondCoordinateForce, o.firstCoordinateMirrorForce = configuration_space.graphLayout.firstCoordinateMirrorForce, o.secondCoordinateMirrorForce = configuration_space.graphLayout.secondCoordinateMirrorForce, o.coordinatePreference = configuration_space.graphLayout.coordinatePreference, o.extraCenterPreference = configuration_space.graphLayout.extraCenterPreference, o.cohesionthreshold = configuration_space.graphLayout.cohesionthreshold, o.repulsion = configuration_space.graphLayout.repulsion, o.separationFactor = configuration_space.graphLayout.separationFactor, o.centerForce = configuration_space.graphLayout.centerForce, o.extraCenterForce = configuration_space.graphLayout.extraCenterForce, o.moveToCenter = configuration_space.graphLayout.moveToCenter, o.squarePlanarForce = configuration_space.graphLayout.squarePlanarForce, layoutStrings.push("Configuration space parameters = " + JSON.stringify(o))
} function readLayoutFromStrings(e) {
  vverbose && console.log("readLayoutFromStrings");
  let o = {};
  for (let t of e) {
    if ("" === t) continue;
    let e = split(t, " = ");
    2 === e.length && (o[e[0]] = e[1])
  } let t = o["Graph parameters"], r = JSON.parse(t);
  graph.graphLayout.edgelength = r.edgelength, graph.graphLayout.cohesionthreshold = r.cohesionthreshold, graph.graphLayout.repulsion = r.repulsion, graph.graphLayout.separationFactor = r.separationFactor, graph.graphLayout.planarForce = r.planarForce, graph.graphLayout.centerForce = r.centerForce, graph.graphLayout.extraCenterForce = r.extraCenterForce, graph.graphLayout.moveToCenter = r.moveToCenter;
  let a = o["Configuration space parameters"], s = JSON.parse(a);
  configuration_space.graphLayout.firstCoordinateEdgeLength = s.firstCoordinateEdgeLength, configuration_space.graphLayout.firstCoordinateForce = s.firstCoordinateForce, configuration_space.graphLayout.secondCoordinateEdgeLength = s.secondCoordinateEdgeLength, configuration_space.graphLayout.secondCoordinateForce = s.secondCoordinateForce, configuration_space.graphLayout.firstCoordinateMirrorForce = s.firstCoordinateMirrorForce, configuration_space.graphLayout.secondCoordinateMirrorForce = s.secondCoordinateMirrorForce, configuration_space.graphLayout.coordinatePreference = s.coordinatePreference, configuration_space.graphLayout.extraCenterPreference = s.extraCenterPreference, configuration_space.graphLayout.cohesionthreshold = s.cohesionthreshold, configuration_space.graphLayout.repulsion = s.repulsion, configuration_space.graphLayout.separationFactor = s.separationFactor, configuration_space.graphLayout.centerForce = s.centerForce, configuration_space.graphLayout.extraCenterForce = s.extraCenterForce, configuration_space.graphLayout.moveToCenter = s.moveToCenter, configuration_space.graphLayout.squarePlanarForce = s.squarePlanarForce
} function writeToFiles() { writeParametersToFile() } function writeParametersToFile() {
  let e = makeFileName("");
  updateInfoString(), saveStrings(infoStrings, e, "txt"), saveCanvas(configuration_space.graphLayout.graphics, e + ".png")
} function writeLayoutToFile() { updateLayoutStrings(), saveStrings(layoutStrings, makeFileName("-layout"), "txt") } function writeChainComplexToFile() {
  let e = getChompString();
  saveStrings([e], makeFileName(""), "chn")
} function writeObjToFile() {
  let e = getObjString();
  saveStrings([e], makeFileName(""), "obj")
} function readHomology() {
  const e = "catalog/" + parameters.graphType + ".gen";
  loadStrings(e, saveLoopsInConfigurationSpace)
} function saveLoopsInConfigurationSpace(e) {
  let o = getLoops(e);
  configuration_space.loops = o, console.log("loops loaded"), console.log(o)
} function getLoops(e) {
  let o = !1, t = [];
  for (let r of e) if (o || "[H_1]" !== r) {
    if (o) {
      if ("" === r) return t;
      {
        let e = r.split(/[+-]/).filter((e => "" !== e)).map(trim).map((e => JSON.parse(e)));
        t.push(e)
      }
    }
  } else o = !0
} function readFromString(e) {
  verbose && console.log("readFromString");
  let o = {};
  for (let t of e) {
    if ("" === t) continue;
    let e = split(t, " = ");
    2 === e.length && (o[e[0]] = e[1])
  } parameters.graphType = o.Graph, "custom" === parameters.graphType && (customGraph = {}, customGraph.nodes = JSON.parse(o.Nodes), customGraph.edges = JSON.parse(o.Edges));
  let t = o.Parameters, r = JSON.parse(t);
  parameters.mode = r.mode, parameters.showGraph = r.showGraph, parameters.showConfigurationspace = r.showConfigurationspace, parameters.showRobots = r.showRobots, parameters.syncView = r.syncView, parameters.distinguishDots = r.distinguishDots, parameters.gridOn = r.gridOn, parameters.squareOn = r.squareOn, parameters.showHyperplanes = r.showHyperplanes, parameters.granularityFirstCoordinate = r.granularityFirstCoordinate, parameters.granularitySecondCoordinate = r.granularitySecondCoordinate, parameters.showText = r.showText, parameters.sphereView = r.sphereView, parameters.lights = r.lights, parameters.moveDotsRandomly = r.moveDotsRandomly, parameters.robotASpeed = r.robotASpeed, parameters.robotBSpeed = r.robotBSpeed, parameters.amountMultiplier = r.amountMultiplier, parameters.recordHistory = r.recordHistory, parameters.showHistory = r.showHistory, parameters.sphereDetail = r.sphereDetail, parameters.speedUp = r.speedUp, parameters.labelX = r.labelX, parameters.labelY = r.labelY, parameters.labelZ = r.labelZ, parameters.colorRobotA = r.colorRobotA, parameters.colorRobotB = r.colorRobotB, parameters.colorConfig = r.colorConfig, parameters.colorNode = r.colorNode, parameters.colorGraphEdge = r.colorGraphEdge, parameters.squareColor = r.squareColor, parameters.squareOpacity = r.squareOpacity, parameters.activeDotColor = r.activeDotColor, parameters.deleteNodeColor = r.deleteNodeColor, parameters.selectedNodeForEdgeColor = r.selectedNodeForEdgeColor, parameters.nodeSize = r.nodeSize, parameters.robotsNodeSize = r.robotsNodeSize, parameters.configNodeSize = r.configNodeSize, parameters.edgeWidthGraph = r.edgeWidthGraph, parameters.edgeWidthConfigSpace = r.edgeWidthConfigSpace, parameters.edgeWidthGrid = r.edgeWidthGrid, parameters.maxspeed = r.maxspeed, verbose && console.log("readFromString: call initView and initGraph"), initView(), initGraph(parameters.graphType);
  let a = JSON.parse(o["Graph nodes with extra center force"]);
  for (let e of a) graph.graphLayout.getNode(e).applyExtraCenterForce = !0;
  let s = o["Graph parameters"], i = JSON.parse(s);
  graph.graphLayout.edgelength = i.edgelength, graph.graphLayout.cohesionthreshold = i.cohesionthreshold, graph.graphLayout.repulsion = i.repulsion, graph.graphLayout.separationFactor = i.separationFactor, graph.graphLayout.planarForce = i.planarForce, graph.graphLayout.centerForce = i.centerForce, graph.graphLayout.extraCenterForce = i.extraCenterForce, graph.graphLayout.moveToCenter = i.moveToCenter;
  let n = o["Configuration space parameters"], h = JSON.parse(n);
  configuration_space.graphLayout.firstCoordinateEdgeLength = h.firstCoordinateEdgeLength, configuration_space.graphLayout.firstCoordinateForce = h.firstCoordinateForce, configuration_space.graphLayout.secondCoordinateEdgeLength = h.secondCoordinateEdgeLength, configuration_space.graphLayout.secondCoordinateForce = h.secondCoordinateForce, configuration_space.graphLayout.firstCoordinateMirrorForce = h.firstCoordinateMirrorForce, configuration_space.graphLayout.secondCoordinateMirrorForce = h.secondCoordinateMirrorForce, configuration_space.graphLayout.coordinatePreference = h.coordinatePreference, configuration_space.graphLayout.extraCenterPreference = h.extraCenterPreference, configuration_space.graphLayout.cohesionthreshold = h.cohesionthreshold, configuration_space.graphLayout.repulsion = h.repulsion, configuration_space.graphLayout.separationFactor = h.separationFactor, configuration_space.graphLayout.centerForce = h.centerForce, configuration_space.graphLayout.extraCenterForce = h.extraCenterForce, configuration_space.graphLayout.moveToCenter = h.moveToCenter, verbose && console.log("readFromString: call initGUI");
  for (let e of graph.nodes) {
    let t = graph.graphLayout.getNode(e), r = o["Node position (" + e + ")"];
    void 0 !== r && "[" == r.charAt(0) && "]" == r.charAt(r.length - 1) && (r = r.slice(1, -1), r = r.split(",").map(Number)), t.position = createVector(r[0], r[1], r[2])
  } for (let e of configuration_space.graphLayout.nodes) {
    let t = o["Configuration position (" + e.label[0] + "," + e.label[1] + ")"];
    void 0 !== t && "[" == t.charAt(0) && "]" == t.charAt(t.length - 1) && (t = t.slice(1, -1), t = t.split(",").map(Number)), verbose && console.log("configuration coordinates = " + t), e.position = createVector(t[0], t[1], t[2])
  } let p = o["Camera state"];
  graphicsForConfigurationSpace.easycam.setState(JSON.parse(p), 0), parameters.mode = "Move", verbose && console.log("readFromString: call updateMode"), easyCamOff()
} function readFromFile(e) { verbose && console.log("readFromFile: " + e), loadStrings(e, readFromString) } function readLayoutFromFile(e) { loadStrings(e, readLayoutFromStrings) } function posToString(e) { return "[" + e.x + "," + e.y + "," + e.z + "]" } function handleFile(e) { readFromString(e.data.split("\n")) } function getChompString() {
  let e = "";
  e += "chain complex\n\n", e += "max dimension = 2\n\n", e += "dimension 0\n";
  for (let o of configuration_space.states) 0 === configuration_space.getDegree(o) && (e += " # " + JSON.stringify(o) + "\n");
  e += "\n\ndimension 1\n";
  for (let o of configuration_space.states) if (1 === configuration_space.getDegree(o)) {
    let t;
    t = Array.isArray(o[0]) ? cartesianProductOf(o[0], [o[1]]) : cartesianProductOf([o[0]], o[1]), e += " # " + JSON.stringify(o) + " = - " + JSON.stringify(t[0]) + " + " + JSON.stringify(t[1]) + "\n"
  } e += "\n\ndimension 2\n";
  for (let o of configuration_space.states) 2 === configuration_space.getDegree(o) && (e += " # " + JSON.stringify(o) + " =", e += " + " + JSON.stringify([o[0], o[1][0]]), e += " + " + JSON.stringify([o[0][1], o[1]]), e += " - " + JSON.stringify([o[0], o[1][1]]), e += " - " + JSON.stringify([o[0][0], o[1]]), e += "\n");
  return e
} function getObjString() {
  let e = "";
  e += "# OBJ\n###########################################\n\n";
  let o = 1;
  for (let t of configuration_space.graphLayout.nodes) t.OBJindex = o, e += "# vertex " + o + " = " + t.label + "\n", e += "v " + t.position.x + " " + t.position.y + " " + t.position.z + "\n", o += 1;
  for (let o of configuration_space.states) 2 === configuration_space.getDegree(o) && (e += "# face " + JSON.stringify(o) + "\n", e += "f", e += " " + str(configuration_space.graphLayout.getNode([o[0][0], o[1][0]]).OBJindex), e += " " + str(configuration_space.graphLayout.getNode([o[0][0], o[1][1]]).OBJindex), e += " " + str(configuration_space.graphLayout.getNode([o[0][1], o[1][1]]).OBJindex), e += " " + str(configuration_space.graphLayout.getNode([o[0][1], o[1][0]]).OBJindex), e += "\n", e += "f", e += " " + str(configuration_space.graphLayout.getNode([o[0][1], o[1][0]]).OBJindex), e += " " + str(configuration_space.graphLayout.getNode([o[0][1], o[1][1]]).OBJindex), e += " " + str(configuration_space.graphLayout.getNode([o[0][0], o[1][1]]).OBJindex), e += " " + str(configuration_space.graphLayout.getNode([o[0][0], o[1][0]]).OBJindex), e += "\n");
  for (let o of configuration_space.states) 1 === configuration_space.getDegree(o) && (e += "# line " + JSON.stringify(o) + "\n", e += "l", Array.isArray(o[0]) ? (e += " " + str(configuration_space.graphLayout.getNode([o[0][0], o[1]]).OBJindex), e += " " + str(configuration_space.graphLayout.getNode([o[0][1], o[1]]).OBJindex)) : (e += " " + str(configuration_space.graphLayout.getNode([o[0], o[1][0]]).OBJindex), e += " " + str(configuration_space.graphLayout.getNode([o[0], o[1][1]]).OBJindex)), e += "\n");
  return e
} function labelToString(e) {
  let o = "";
  if (Array.isArray(e)) {
    for (let t of e) o += t + " ";
    return o = o.slice(0, -1), o
  } return e
} function tick() { temperature *= 1 - coolingRate } function reheat() { temperature = 1 } function arraysEqual(e, o) { return JSON.stringify(e) == JSON.stringify(o) } const flatten = e => [].concat.apply([], e), product = (...e) => e.reduce(((e, o) => flatten(e.map((e => o.map((o => [...e, o])))))), [[]]);