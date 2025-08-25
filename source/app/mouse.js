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

        if (keyboardFlags[SHIFT] || keyboardFlags[66]) {
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
        if (keyboardFlags[SHIFT] || keyboardFlags[65]) {
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
