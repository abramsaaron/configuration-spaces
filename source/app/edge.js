class Edge {
  constructor(graphLayout, label, nodeFrom, nodeTo) {
    if (vverbose) console.log("new Edge");
    if (vverbose) console.log("nodeFrom");
    if (vverbose) console.log(nodeFrom);
    if (vverbose) console.log("nodeTo");
    if (vverbose) console.log(nodeTo);
    this.graphLayout = graphLayout;
    this.graphics = graphLayout.graphics;
    this.label = label;
    this.nodeFrom = nodeFrom;
    this.nodeTo = nodeTo;
    this.subPoints = [];

    // Figure out the edge type.
    // TODO: ARE THESE THE RIGHT NAMES?
    if (Array.isArray(this.nodeFrom.label) && Array.isArray(this.nodeTo.label)) {
      if (this.nodeFrom.label[0] === this.nodeTo.label[0]) {
        this.edgeType = "robotBedge";
      } else if (this.nodeFrom.label[1] === this.nodeTo.label[1]) {
        this.edgeType = "robotAedge";
      } else {
        console.log();
        ("ERRRORR");
      }
    } else {
      this.edgeType = "graphEdge";
    }

    this.createInnerNodes();
  }

  createInnerNodes() {
    this.innerNodes = [];
    this.innerEdges = [];
    if (this.edgeType === "graphEdge") {
      this.granularity = parameters.granularityGraph;
    } else if (this.edgeType === "robotBedge") {
      this.granularity = parameters.granularityFirstCoordinate;
    } else if (this.edgeType === "robotAedge") {
      this.granularity = parameters.granularitySecondCoordinate;
    }

    // this.innerNodes[0] = this.nodeFrom.innerNode;
    // this.innerNodes[this.granularity] = this.nodeTo.innerNode;

    for (let n = 0; n <= this.granularity; n++) {
      this.innerNodes[n] = new InnerNode(this, this.graphLayout, n, p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, (1.0 * n) / this.granularity), 1.0 / this.granularity);
    }

    for (let n = 0; n < this.granularity; n++) {
      let nodeFrom = this.innerNodes[n];
      let nodeTo = this.innerNodes[n + 1];
      this.innerEdges[n] = new InnerEdge(this, this.graphLayout, n, nodeFrom, nodeTo);
      if (this.edgeType === "robotBedge") {
        nodeFrom.neighborsB.push(nodeTo);
        nodeTo.neighborsB.push(nodeFrom);
      } else if (this.edgeType === "robotAedge") {
        nodeFrom.neighborsA.push(nodeTo);
        nodeTo.neighborsA.push(nodeFrom);
      }
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

  forceInnerNodesToTheirPositions() {
    for (let n = 0; n <= this.granularity; n++) {
      this.innerNodes[n].position = p5.Vector.lerp(this.nodeFrom.position, this.nodeTo.position, (1.0 * n) / this.granularity);
    }
  }

  show(g, strokeW, strokeC) {
    // Set edge color depending on type
    if (this.owner === undefined) {
      if (this.candidateForRobot === 0) {
        g.stroke(parameters.colorRobotA);
      } else if (this.candidateForRobot === 1) {
        g.stroke(parameters.colorRobotB);
      } else if (this.edgeType === "robotBedge") {
        g.stroke(parameters.colorRobotB);
      } else if (this.edgeType === "robotAedge") {
        g.stroke(parameters.colorRobotA);
      } else if (this.edgeType === "graphEdge") {
        g.stroke(parameters.colorGraphEdge);
      }
    } else {
      if (parameters.showRobots && this.owner.index === 0) {
        g.stroke(parameters.colorRobotA);
      } else if (parameters.showRobots && this.owner.index === 1) {
        g.stroke(parameters.colorRobotB);
      } else {
        g.stroke(parameters.colorGraphEdge);
      }
    }

    // Set edge width. Possible overrides happening via arguments to this function.
    if (this.edgeType === "graphEdge") {
      g.strokeWeight(parameters.edgeWidthGraph * (strokeW === undefined ? 1 : strokeW));
    } else {
      g.strokeWeight(parameters.edgeWidthConfigSpace * (strokeW === undefined ? 1 : strokeW));
    }

    // Set color. Possible overrides happening via arguments to this function.
    if (strokeC !== undefined) {
      g.stroke(strokeC);
    }

    // Draw edge.
    // g.line(this.nodeFrom.position.x, this.nodeFrom.position.y, this.nodeFrom.position.z, this.nodeTo.position.x, this.nodeTo.position.y, this.nodeTo.position.z);

    let diff = p5.Vector.sub(this.nodeTo.position, this.nodeFrom.position).setMag(parameters.nodeSize * 0.5);

    let edgeStart = p5.Vector.add(this.nodeFrom.position, diff);
    let edgeEnd = p5.Vector.sub(this.nodeTo.position, diff);
    g.line(edgeStart.x, edgeStart.y, edgeStart.z, edgeEnd.x, edgeEnd.y, edgeEnd.z);

    let WingStartA = p5.Vector.sub(edgeEnd, diff).add(createVector(0, parameters.nodeSize * 0.4, 0));
    let WingStartB = p5.Vector.sub(edgeEnd, diff).add(createVector(0, -parameters.nodeSize * 0.4, 0));
    g.line(WingStartA.x, WingStartA.y, WingStartA.z, edgeEnd.x, edgeEnd.y, edgeEnd.z);
    g.line(WingStartB.x, WingStartB.y, WingStartB.z, edgeEnd.x, edgeEnd.y, edgeEnd.z);

    // Show inner nodes.
    // for (let n = 1; n < this.granularity; n++) {
    //   this.innerNodes[n].show(g);
    // }

    // Show inner edges.
    // for (let innerEdge of this.innerEdges) {
    //   innerEdge.show(g, strokeW, strokeC);
    // }
  }
}
