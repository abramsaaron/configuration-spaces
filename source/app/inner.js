// Main classes

class InnerNode {
  constructor(parent, graphLayout, label, position) {
    this.parent = parent;
    this.label = label;
    this.graphLayout = graphLayout;
    this.graphics = graphLayout.graphics;
    if (graphLayout.layout3D) {
      this.position = position;
      this.velocity = createVector(0, 0, 0);
      this.acceleration = createVector(0, 0, 0);
    } else {
      this.position = position;
      this.velocity = createVector(0, 0);
      this.acceleration = createVector(0, 0);
    }
    // this.graphLayout.innerNodes.push(this);
    this.neighborsA = [];
    this.neighborsB = [];
  }

  update(nodes) {
    this.acceleration.mult(0);

    let sep;
    if (octForces) {
      sep = this.graphLayout.octree.getAllNodesForces(this); // .mult(this.graphLayout.separationFactor);
      // console.log(sep);
    } else {
      sep = this.getSeparationFromNodes(nodes);
    }

    // let targetEdgeLength = this.graphLayout.edgelength;
    // xzxxxxxxx
    //   getDegree
    // this.parent.granularity

    let cohA = this.getSpringForce(
      this.graphLayout.firstCoordinateEdgeLength / parameters.granularityFirstCoordinate, //
      this.graphLayout.firstCoordinateForce * 10, //
      this.neighborsA
    );
    let cohB = this.getSpringForce(
      this.graphLayout.secondCoordinateEdgeLength / parameters.granularitySecondCoordinate, //
      this.graphLayout.secondCoordinateForce * 10, //
      this.neighborsB
    );

    this.acceleration.add(sep);
    this.acceleration.add(cohA);
    this.acceleration.add(cohB);
  }

  move() {
    this.velocity.add(this.acceleration);
    limitVector(this.velocity, parameters.maxspeed);
    this.position.add(this.velocity);
    this.velocity.mult(0.9);
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

  // TODO: This is copied from Node. Remove unnecessary stuff.
  show(g) {
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

      g.fill(parameters.colorNode);

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
      g.ellipse(0, 0, parameters.nodeSize * 0.25, parameters.nodeSize * 0.25);

      g.pop();
    }

    // Draw line to neighbors
    for (let n of this.neighborsA) {
      g.stroke(0, 255, 0);
      g.strokeWeight(1.0);
      g.line(this.position.x, this.position.y, this.position.z, n.position.x, n.position.y, n.position.z);
    }

    for (let n of this.neighborsB) {
      g.stroke(0, 0, 255);
      g.strokeWeight(1.0);
      g.line(this.position.x, this.position.y, this.position.z, n.position.x, n.position.y, n.position.z);
    }
  }

  showText(g) {
    // Draw text
    g.fill(0, 0, 0);
    g.textAlign(CENTER, CENTER);
    g.textFont(font);
    g.textSize(parameters.fontSize);
    if (this.graphLayout.layout3D) {
      // 3D layout
      let rotation = g.easycam.getRotation();
      let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
      g.push();
      g.translate(this.position.x, this.position.y, this.position.z);
      g.rotateX(-rotXYZ[0]);
      g.rotateY(-rotXYZ[1]);
      g.rotateZ(-rotXYZ[2]);
      let maxRadius = max(parameters.nodeSize, parameters.configNodeSize, parameters.robotsNodeSize);
      g.translate(parameters.labelX, parameters.labelY, maxRadius + parameters.labelZ);
      g.text(this.labelText, 0, 0);
      g.pop();
    } else {
      // 2D layout
      g.push();
      g.translate(this.position.x, this.position.y, this.position.z);
      g.text(this.labelText, 0, 0);
      g.pop();
    }
  }
}

class InnerEdge {
  constructor(parent, graphLayout, label, nodeFrom, nodeTo) {
    this.graphLayout = graphLayout;
    this.graphics = graphLayout.graphics;
    this.label = label;
    this.nodeFrom = nodeFrom;
    this.nodeTo = nodeTo;
    this.edgeType = parent.edgeType;
  }

  // TODO: This is copied from Edge. Remove unnecessary stuff.
  show(g, strokeW, strokeC) {
    // Set stroke weight. Possible overrides happening via arguments to this function.
    g.strokeWeight(parameters.edgeWidthConfigSpace * 2 * (strokeW === undefined ? 1 : strokeW));

    // Set color. Possible overrides happening via arguments to this function.
    g.stroke(255, 0, 0);
    if (strokeC !== undefined) {
      g.stroke(strokeC);
    }

    // Draw edge.
    g.line(this.nodeFrom.position.x, this.nodeFrom.position.y, this.nodeFrom.position.z, this.nodeTo.position.x, this.nodeTo.position.y, this.nodeTo.position.z);
  }
}
