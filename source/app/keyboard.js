let keyboardFlags = {};

function downKey(c) {
  return keyboardFlags[c.charCodeAt(0)];
}

function keyPressed() {
  if (verbose) print("keyPressed: keyCode = " + keyCode + " / key = " + key + " / key.charCodeAt(0) = " + key.charCodeAt(0));
  keyboardFlags[keyCode] = true;
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
  else if (key === "Escape") {
    if (parameters.showInfo) {
      parameters.showInfo = false;
      infoDiv.hide();
    }
  } else if (key === "d") deleteSelectedNodesOrEdges();
  else if (key === " ") parameters.running = !parameters.running;
  else if (key === "o") {
    octForces = !octForces;
    console.log("octForces = " + octForces);
  } else if (key === "f") forcesActive = !forcesActive;
  else if (key === "q") parameters.debugMode = !parameters.debugMode;
  else if (key === "t") {
    parameters.showText = !parameters.showText;
    // updateIcons();
  } else if (key === "u") {
    parameters.ordered = !parameters.ordered;
    init();
  } else if (key === "n") addNode();
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
  else if (key === "d") parameters.darkMode = !parameters.darkMode;
  else if (key === "C") parameters.showConfigurationspace = !parameters.showConfigurationspace;
  else if (key === "s") takeScreenshotGraph = !takeScreenshotGraph;
  else if (key === "S") takeScreenshotConfigSpace = !takeScreenshotConfigSpace;
  else if (key === "g") {
    let allClosed = GUIS.every((gui) => gui._closed);
    if (allClosed) {
      for (let gui of GUIS) {
        gui.open();
      }
    } else {
      for (let gui of GUIS) {
        gui.close();
      }
    }
  } else if (key === "r") parameters.showRobots = !parameters.showRobots;
  else if (key === "w") writeToFiles();
  // else if (key === "L") writeLayoutToFile();
  // else if (key === "W") writeChainComplexToFile();
  // else if (key === "l") readLayoutFromFile("layout.txt");
  // else if (key === "r") readFromFile("parameters.txt");
  // else if (key === "+") readHomology();
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
  keyboardFlags[keyCode] = false;
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
