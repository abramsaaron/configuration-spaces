// STRINGS AND URL

function updateURL() {
  if (verbose) console.log("updateURL");
  if (history.pushState) {
    let newurl =
      window.location.protocol + //
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      (parameters.graphType === "custom" || graphIsCustomized ? "graph=custom" + "&" + "nodes=" + graph.nodes + "&" + "edges=" + edgesToString(graph.edges) : "graph=" + parameters.graphType) +
      "&" +
      "view=" +
      (parameters.dualView ? "dual" : "single") +
      "&" +
      "showgraph=" +
      parameters.showGraph +
      "&" +
      "showconfigspace=" +
      parameters.showConfigurationspace +
      "&" +
      "showrobots=" +
      parameters.showRobots;
    window.history.pushState(
      {
        path: newurl,
      },
      "",
      newurl
    );
    if (verbose) console.log(newurl);
  }
}

function edgesToString(edges) {
  let result = "";
  for (let edge of edges) {
    result += "[" + edge + "],";
  }
  result = result.substr(0, result.length - 1);
  return result;
}

function setParametersFromURL() {
  if (verbose) console.log("setParametersFromURL");
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
    // takeScreenshotConfigSpace = true;
    return;
  }

  // Start
  if (verbose) console.log("setParametersFromURL continues");
  let nodes, edges, graph;
  let edgesFromUrl = [];

  let viewStr = urlParameters["view"];
  if (viewStr === "single") {
    parameters.dualView = false;
  } else if (viewStr === "dual") {
    parameters.dualView = true;
  }

  let showGraphStr = urlParameters["showgraph"];
  // Default is true
  parameters.showGraph = showGraphStr !== "false";

  let showConfigStr = urlParameters["showconfigspace"];
  // Default is true
  parameters.showConfigurationspace = showConfigStr !== "false";

  let showRobotsStr = urlParameters["showrobots"];
  // Default is true
  parameters.showRobots = showRobotsStr !== "false";

  let graphStr = urlParameters["graph"];
  if (graphStr !== undefined && graphStr !== "custom") {
    parameters.graphType = graphStr;
  } else {
    let nodesStr = urlParameters["nodes"];
    if (nodesStr === undefined) return;
    nodes = nodesStr.split(",").map(Number);

    for (let n of nodes) {
      if (isNaN(n)) return;
    }

    let edgesStr = urlParameters["edges"];
    if (vverbose) console.log(edgesStr);
    if (edgesStr !== null) edgesStr = decodeURIComponent(edgesStr);
    if (vverbose) console.log(edgesStr);

    if (edgesStr !== undefined && edgesStr.charAt(0) == "[" && edgesStr.charAt(edgesStr.length - 1) == "]") {
      if (vverbose) console.log("🎉 success []");
      edgesStr = edgesStr.slice(1, -1);
      edgesFromUrl = edgesStr.split(/[^\d],[^\d]/).map((s) => s.split(",").map(Number));
    }

    edges = [];

    for (let edge of edgesFromUrl) {
      if (
        edge.length === 2 &&
        nodes.includes(edge[0]) && //
        nodes.includes(edge[1]) &&
        edge[0] !== edge[1] &&
        !edgesContainEdge(edges, edge)
      ) {
        edges.push(edge);
      }
    }

    if (nodes !== undefined) {
      customGraph = {};
      customGraph.nodes = nodes;
      customGraph.edges = edges;
      graphIsCustomized = true;
      parameters.graphType = "custom";
    }
  }
}

function updateInfoString() {
  infoStrings = [];
  // infoStrings.push(getObjString());
  // infoStrings.push(getChompString());
  infoStrings.push("Graph = " + parameters.graphType);
  infoStrings.push("Nodes = " + JSON.stringify(graph.nodes));
  infoStrings.push("Edges = " + JSON.stringify(graph.edges));

  let nodesWithExtraCenterForce = [];
  for (let node of graph.graphLayout.nodes) {
    if (node.applyExtraCenterForce) {
      nodesWithExtraCenterForce.push(node.label);
    }
  }
  infoStrings.push("Graph nodes with extra center force = " + JSON.stringify(nodesWithExtraCenterForce));

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

  for (let n of graph.nodes) {
    infoStrings.push("Node position (" + n + ") = " + posToString(graph.graphLayout.getNode(n).position));
  }
  for (let n of configuration_space.graphLayout.nodes) {
    infoStrings.push("Configuration position (" + n.label + ") = " + posToString(n.position));
  }

  let infoHTML = "";
  infoHTML += "<div class='break-all'>";
  for (let string of infoStrings) {
    infoHTML += string + "<br>";
  }
  infoHTML += "</div>";
  infoDiv.html(infoHTML);
}

function updateLayoutStrings() {
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
  layoutStrings.push("Configuration space parameters = " + JSON.stringify(configSpaceParameters));
}

function readLayoutFromStrings(strings) {
  if (vverbose) console.log("readLayoutFromStrings");
  let parametersFromFile = {};
  for (let s of strings) {
    if (s === "") continue;
    let parts = split(s, " = ");
    if (parts.length !== 2) continue;
    parametersFromFile[parts[0]] = parts[1];
  }

  let graphParametersString = parametersFromFile["Graph parameters"];
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
  configuration_space.graphLayout.squarePlanarForce = configSpaceParameters["squarePlanarForce"];

  // initGUI();
}

function writeToFiles() {
  writeParametersToFile();
  // writeLayoutToFile();
  // writeChainComplexToFile();
  // writeObjToFile();
}

function writeParametersToFile() {
  let filename = makeFileName("");
  updateInfoString();
  saveStrings(infoStrings, filename, "txt");
  saveCanvas(configuration_space.graphLayout.graphics, filename + ".png");
}

function writeLayoutToFile() {
  updateLayoutStrings();
  saveStrings(layoutStrings, makeFileName("-layout"), "txt");
}

function writeChainComplexToFile() {
  let str = getChompString();
  saveStrings([str], makeFileName(""), "chn");
}

function writeObjToFile() {
  let str = getObjString();
  saveStrings([str], makeFileName(""), "obj");
}

function readHomology() {
  const filename = "catalog/" + parameters.graphType + ".gen";
  loadStrings(filename, saveLoopsInConfigurationSpace);
}

function saveLoopsInConfigurationSpace(strings) {
  let loops = getLoops(strings);
  configuration_space.loops = loops;
  console.log("loops loaded");
  console.log(loops);
}

function getLoops(strings) {
  let readingLoops = false;
  let loops = [];
  for (let s of strings) {
    if (!readingLoops && s === "[H_1]") {
      readingLoops = true;
      continue;
    }
    if (readingLoops) {
      if (s === "") {
        return loops;
      } else {
        let loop = s
          .split(/[+-]/)
          .filter((x) => x !== "")
          .map(trim)
          .map((x) => JSON.parse(x));
        loops.push(loop);
      }
    }
  }
}

function readFromString(strings) {
  if (verbose) console.log("readFromString");
  let parametersFromFile = {};
  for (let s of strings) {
    if (s === "") continue;
    let parts = split(s, " = ");
    if (parts.length !== 2) continue;
    parametersFromFile[parts[0]] = parts[1];
  }

  parameters.graphType = parametersFromFile["Graph"];

  if (parameters.graphType === "custom") {
    customGraph = {};
    customGraph.nodes = JSON.parse(parametersFromFile["Nodes"]);
    customGraph.edges = JSON.parse(parametersFromFile["Edges"]);
  }

  let globalParametersString = parametersFromFile["Parameters"];
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
  for (let node of graphNodesWithExtraCenterForce) {
    graph.graphLayout.getNode(node).applyExtraCenterForce = true;
  }

  let graphParametersString = parametersFromFile["Graph parameters"];
  let graphParameters = JSON.parse(graphParametersString);
  graph.graphLayout.edgelength = graphParameters["edgelength"];
  graph.graphLayout.cohesionthreshold = graphParameters["cohesionthreshold"];
  graph.graphLayout.repulsion = graphParameters["repulsion"];
  graph.graphLayout.separationFactor = graphParameters["separationFactor"];
  graph.graphLayout.planarForce = graphParameters["planarForce"];
  graph.graphLayout.centerForce = graphParameters["centerForce"];
  graph.graphLayout.extraCenterForce = graphParameters["extraCenterForce"];
  graph.graphLayout.moveToCenter = graphParameters["moveToCenter"];
  // infoStrings.push("Graph parameters = " + JSON.stringify(graphParameters));

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
  // infoStrings.push("Configuration space parameters = " + JSON.stringify(configSpaceParameters));

  if (verbose) console.log("readFromString: call initGUI");
  // initGUI();

  for (let n of graph.nodes) {
    let node = graph.graphLayout.getNode(n);
    let coordinates = parametersFromFile["Node position (" + n + ")"];

    if (coordinates !== undefined && coordinates.charAt(0) == "[" && coordinates.charAt(coordinates.length - 1) == "]") {
      coordinates = coordinates.slice(1, -1);
      coordinates = coordinates.split(",").map(Number);
    }

    // if (verbose) console.log("node coordinates = " + coordinates);
    node.position = createVector(coordinates[0], coordinates[1], coordinates[2]);
  }

  for (let node of configuration_space.graphLayout.nodes) {
    let coordinates = parametersFromFile["Configuration position (" + node.label[0] + "," + node.label[1] + ")"];

    if (coordinates !== undefined && coordinates.charAt(0) == "[" && coordinates.charAt(coordinates.length - 1) == "]") {
      coordinates = coordinates.slice(1, -1);
      coordinates = coordinates.split(",").map(Number);
    }
    if (verbose) console.log("configuration coordinates = " + coordinates);
    node.position = createVector(coordinates[0], coordinates[1], coordinates[2]);
  }

  let cameraStateString = parametersFromFile["Camera state"];
  graphicsForConfigurationSpace.easycam.setState(JSON.parse(cameraStateString), 0);

  parameters.mode = "Move";
  if (verbose) console.log("readFromString: call updateMode");
  // updateMode();

  easyCamOff();
}

function readFromFile(fileName) {
  if (verbose) console.log("readFromFile: " + fileName);
  loadStrings(fileName, readFromString);
}

function readLayoutFromFile(fileName) {
  loadStrings(fileName, readLayoutFromStrings);
}

function posToString(pos) {
  return "[" + pos.x + "," + pos.y + "," + pos.z + "]";
}

function handleFile(file) {
  let str = file.data;
  let strings = str.split("\n");
  readFromString(strings);
}

function getChompString() {
  let result = "";
  result += "chain complex\n\n";
  result += "max dimension = 2\n\n";
  result += "dimension 0\n";
  for (let state of configuration_space.states) {
    if (configuration_space.getDegree(state) === 0) {
      result += " # " + JSON.stringify(state) + "\n";
    }
  }
  result += "\n\ndimension 1\n";
  for (let state of configuration_space.states) {
    if (configuration_space.getDegree(state) === 1) {
      // state = [0, [1,2]]
      let product;
      if (Array.isArray(state[0])) {
        product = cartesianProductOf(state[0], [state[1]]);
      } else {
        product = cartesianProductOf([state[0]], state[1]);
      }
      result += " # " + JSON.stringify(state) + " = - " + JSON.stringify(product[0]) + " + " + JSON.stringify(product[1]) + "\n";
    }
  }
  result += "\n\ndimension 2\n";
  for (let state of configuration_space.states) {
    // state = [[0,1], [3,4]]
    if (configuration_space.getDegree(state) === 2) {
      result += " # " + JSON.stringify(state) + " =";
      result += " + " + JSON.stringify([state[0], state[1][0]]);
      result += " + " + JSON.stringify([state[0][1], state[1]]);
      result += " - " + JSON.stringify([state[0], state[1][1]]);
      result += " - " + JSON.stringify([state[0][0], state[1]]);
      result += "\n";
    }
  }
  return result;
}

function getObjString() {
  let result = "";
  result += "# OBJ\n###########################################\n\n";
  let objCounter = 1;
  for (let n of configuration_space.graphLayout.nodes) {
    n.OBJindex = objCounter;
    result += "# vertex " + objCounter + " = " + n.label + "\n";
    result += "v " + n.position.x + " " + n.position.y + " " + n.position.z + "\n";
    objCounter = objCounter + 1;
  }
  for (let state of configuration_space.states) {
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
      result += "\n";
    }
  }
  for (let state of configuration_space.states) {
    if (configuration_space.getDegree(state) === 1) {
      result += "# line " + JSON.stringify(state) + "\n";
      result += "l";
      if (Array.isArray(state[0])) {
        result += " " + str(configuration_space.graphLayout.getNode([state[0][0], state[1]]).OBJindex);
        result += " " + str(configuration_space.graphLayout.getNode([state[0][1], state[1]]).OBJindex);
      } else {
        result += " " + str(configuration_space.graphLayout.getNode([state[0], state[1][0]]).OBJindex);
        result += " " + str(configuration_space.graphLayout.getNode([state[0], state[1][1]]).OBJindex);
      }
      result += "\n";
    }
  }
  return result;
}
