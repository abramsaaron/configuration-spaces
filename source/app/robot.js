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
    g.ambientMaterial(this.index === 0 ? parameters.colorRobotA : parameters.colorRobotB);
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
