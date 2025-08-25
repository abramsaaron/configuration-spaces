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

      sep.mult(this.graphLayout.separationFactor);
      this.acceleration.add(sep);

      // Add centroid forces
      // for (let square of this.getSquareNeighbors()) {
      //   sep.add(square.centroidRepulsionForce);
      // }

      let cohA, cohB;
      if (this.graphLayout.source.ordered) {
        cohA = this.getSpringForce(
          this.graphLayout.secondCoordinateEdgeLength,
          this.graphLayout.secondCoordinateForce,
          this.neighbors.filter((neighbor) => neighbor.label[0] === this.label[0])
        );

        cohB = this.getSpringForce(
          this.graphLayout.firstCoordinateEdgeLength,
          this.graphLayout.firstCoordinateForce,
          this.neighbors.filter((neighbor) => neighbor.label[1] === this.label[1])
        );
      } else {
        cohA = createVector();
        cohA = this.getSpringForce(
          this.graphLayout.secondCoordinateEdgeLength,
          this.graphLayout.secondCoordinateForce,
          this.neighbors.filter((neighbor) => neighbor.label[0] === this.label[0] || neighbor.label[0] === this.label[1] || neighbor.label[1] === this.label[0] || neighbor.label[1] === this.label[1])
        );

        cohB = createVector();
      }

      let cohAgraph, cohBgraph;
      if (this.graphLayout.source.ordered) {
        cohAgraph = this.getForceTowardsGoal(this.graphLayout.firstCoordinateMirrorForce, graph.graphLayout.getNode(this.label[0]).position);
        cohBgraph = this.getForceTowardsGoal(this.graphLayout.secondCoordinateMirrorForce, graph.graphLayout.getNode(this.label[1]).position);
      } else {
        cohAgraph = this.getForceTowardsGoal(this.graphLayout.firstCoordinateMirrorForce, graph.graphLayout.getNode(this.label[0]).position);
        cohBgraph = this.getForceTowardsGoal(this.graphLayout.firstCoordinateMirrorForce, graph.graphLayout.getNode(this.label[1]).position);
      }

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

      // g.colorMode(HSB, 255);
      g.stroke(255, 127, 80, 100);
      g.line(this.position.x, this.position.y, this.position.z, p0.x, p0.y, p0.z);
      g.stroke(153, 50, 204, 100);
      g.line(this.position.x, this.position.y, this.position.z, p1.x, p1.y, p1.z);

      for (let square of this.getSquareNeighbors()) {
        let centroid = square.getCentroid();
        g.strokeWeight(parameters.edgeWidthConfigSpace);
        let p0 = centroid;

        // g.colorMode(HSB, 255);
        g.stroke(50, 50, 255, 50);
        g.line(this.position.x, this.position.y, this.position.z, p0.x, p0.y, p0.z);

        g.push();
        g.translate(p0.x, p0.y, p0.z);
        g.fill(120, 255, 255);
        g.ambientMaterial(120, 255, 255);
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
        g.ambientMaterial(parameters.deleteNodeColor);
      } else {
        if (this.applyExtraCenterForce) {
          g.fill(0, 255, 0);
          g.ambientMaterial(0, 255, 0);
        } else if (this.active) {
          g.fill(parameters.activeDotColor);
          g.ambientMaterial(parameters.activeDotColor);
        } else if (this.firstNodeOfEdge) {
          g.fill(parameters.selectedNodeForEdgeColor);
          g.ambientMaterial(parameters.selectedNodeForEdgeColor);
        } else {
          g.fill(parameters.colorNode);
          g.ambientMaterial(parameters.colorNode);
        }
        g.specularMaterial(128);
        g.shininess(64);
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
        // g.colorMode(HSB, 255);
        g.stroke(128);
        g.noFill();
        g.strokeWeight(2.0);
        g.ellipse(0, 0, parameters.nodeSize * 1.5, parameters.nodeSize * 1.5);
      }
      g.pop();
    }
  }

  showText(g) {
    // Draw text
    if (parameters.darkMode) {
      g.fill(255, 255, 255);
      g.ambientMaterial(255, 255, 255);
    } else {
      g.fill(0, 0, 0);
      g.ambientMaterial(0, 0, 0);
    }
    g.textAlign(CENTER, CENTER);
    g.textFont(font);
    g.textSize(parameters.fontSize);
    if (this.graphLayout.layout3D) {
      // 3D layout
      const rotation = g.easycam.getRotation();
      const rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
      g.push();
      g.translate(this.position.x, this.position.y, this.position.z);
      g.rotateX(-rotXYZ[0]);
      g.rotateY(-rotXYZ[1]);
      g.rotateZ(-rotXYZ[2]);
      g.translate(parameters.labelX, parameters.labelY, max(parameters.nodeSize, parameters.configNodeSize, parameters.robotsNodeSize) + parameters.labelZ);
      g.text(this.labelText, 0, -textDescent() / 2);
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
