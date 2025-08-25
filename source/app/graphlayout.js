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
      for (let i = 0; i < 100; i++) {
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
    this.graphics.push();
    this.graphics.reset();

    if (parameters.darkMode) {
      this.graphics.clear();
    } else {
      this.graphics.clear(255, 255, 255, 255);
    }

    // Set up lights.
    // this.graphics.lights();
    this.graphics.ambientLight(128, 128, 128);
    // Rotate such that ellipse faces front
    let position = this.graphics.easycam.getPosition();
    let tX = -position[0];
    let tY = -position[1];
    let tZ = -position[2];

    this.graphics.directionalLight(255, 255, 255, tX, tY, tZ);
    //
    //     let gl = graphicsForConfigurationSpace.canvas.getContext("webgl");
    //     gl.enable(gl.DEPTH_TEST);
    // this.graphics.stroke(100);
    // this.graphics.strokeWeight(1.0);
    // this.graphics.fill(100);
    // this.graphics.sphere(100);
    // this.graphics.pop();
    // return;

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
            // colorMode(HSB);
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

    // End drawing.
    this.graphics.pop();
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

    // Update inner nodes.
    for (let edge of this.edges) {
      edge.forceInnerNodesToTheirPositions();
    }

    // // Update inner nodes.
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
    if (typeof label !== "number" && this.source.type === "configuration_space" && !this.source.ordered) {
      label.sort();
    }

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
