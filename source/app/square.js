class Square {
  constructor(graphLayout, label, edgeAfrom, edgeAto, edgeBfrom, edgeBto) {
    this.graphLayout = graphLayout;
    this.graphics = graphLayout.graphics;
    this.label = label;
    // edgeA refers to the first edge in the graph
    // edgeB refers to the second edge in the graph
    this.edgeAfrom = edgeAfrom;
    this.edgeAto = edgeAto;
    this.edgeBfrom = edgeBfrom;
    this.edgeBto = edgeBto;
    this.innerEdges = [];
    this.innerSquares = [];

    // this.createInnerNodes();

    if (vverbose) print("square created!");
    if (vverbose) print(this);
  }

  getInnernode(label) {
    for (let x of this.innerNodes) {
      if (arraysEqual(x.label, label)) {
        return x;
      }
    }
    return undefined;
  }

  createInnerNodes() {
    // Assumes that we already have innerNodes for edges.
    this.innerNodes = [];
    for (let i = 1; i < this.edgeAfrom.granularity; i++) {
      for (let j = 1; j < this.edgeBfrom.granularity; j++) {
        let amountA = i / this.edgeAfrom.granularity;
        let amountB = j / this.edgeBfrom.granularity;
        let position = this.getPosition(amountA, amountB);
        let innerNode = new InnerNode(this, this.graphLayout, [i, j], position, (1 / this.edgeAfrom.granularity) * (1 / this.edgeBfrom.granularity));
        this.innerNodes.push(innerNode);
      }
    }

    for (let i = 1; i < this.edgeAfrom.granularity; i++) {
      for (let j = 1; j < this.edgeBfrom.granularity; j++) {
        let innerNode = this.getInnernode([i, j]);
        let A = this.getInnernode([i, j - 1]);
        let B = this.getInnernode([i, j + 1]);
        let C = this.getInnernode([i - 1, j]);
        let D = this.getInnernode([i + 1, j]);
        if (A !== undefined) innerNode.neighborsA.push(A);
        if (B !== undefined) innerNode.neighborsA.push(B);
        if (C !== undefined) innerNode.neighborsB.push(C);
        if (D !== undefined) innerNode.neighborsB.push(D);
      }
    }

    for (let i = 1; i < this.edgeAfrom.granularity; i++) {
      this.getInnernode([i, 1]).neighborsA.push(this.edgeAfrom.innerNodes[i]);
      this.edgeAfrom.innerNodes[i].neighborsA.push(this.getInnernode([i, 1]));

      this.getInnernode([i, this.edgeAfrom.granularity - 1]).neighborsA.push(this.edgeAto.innerNodes[i]);
      this.edgeAto.innerNodes[i].neighborsA.push(this.getInnernode([i, this.edgeAfrom.granularity - 1]));
    }
    for (let j = 1; j < this.edgeBfrom.granularity; j++) {
      this.getInnernode([1, j]).neighborsB.push(this.edgeBfrom.innerNodes[j]);
      this.edgeBfrom.innerNodes[j].neighborsB.push(this.getInnernode([1, j]));

      this.getInnernode([this.edgeAfrom.granularity - 1, j]).neighborsB.push(this.edgeBto.innerNodes[j]);
      this.edgeBto.innerNodes[j].neighborsB.push(this.getInnernode([this.edgeAfrom.granularity - 1, j]));
    }
  }

  forceInnerNodesToTheirPositions() {
    for (let innerNode of this.innerNodes) {
      let amountA = innerNode.label[0] / this.edgeAfrom.granularity;
      let amountB = innerNode.label[1] / this.edgeBfrom.granularity;
      innerNode.position = this.getPosition(amountA, amountB);
    }
  }

  updateRepulsionForce(centroids) {
    let centroid = this.getCentroid();
    let sum = new createVector(0, 0, 0);
    for (let other of centroids) {
      let diff = p5.Vector.sub(centroid, other);
      let d = diff.mag();
      if (d > 1.0) {
        diff.normalize().mult(this.graphLayout.centroidRepulsion / (d * d));
        sum.add(diff);
      }
    }
    this.centroidRepulsionForce = sum;
  }

  getPosition(amountA, amountB) {
    // *-->--- edgeAfrom -->---*
    // |                       |
    // |                       |
    // | edgeBfrom             | edgeBto
    // v                       v
    // |                       |
    // |                       |
    // |                       |
    // *--->-- edgeAto   --->--*

    let X = this.edgeAfrom.amountAlong(amountA);
    let Y = this.edgeAto.amountAlong(amountA);
    return p5.Vector.lerp(X, Y, amountB);
  }

  show() {
    // Show the grid.
    if (parameters.gridOn) {
      this.graphics.strokeWeight(parameters.edgeWidthGrid);

      // Draw the grid lines for robot A.
      for (let n = 1; n < this.edgeAfrom.innerNodes.length; n++) {
        let a = this.edgeAfrom.innerNodes[n].position;
        let b = this.edgeAto.innerNodes[n].position;
        this.graphics.stroke(parameters.colorRobotA);
        this.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      // Draw the grid lines for robot B.
      for (let n = 1; n < this.edgeBfrom.innerNodes.length; n++) {
        let a = this.edgeBfrom.innerNodes[n].position;
        let b = this.edgeBto.innerNodes[n].position;
        this.graphics.stroke(parameters.colorRobotB);
        this.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    if (parameters.squareOn) {
      this.graphics.noStroke();
      this.graphics.fill(red(parameters.squareColor), green(parameters.squareColor), blue(parameters.squareColor), parameters.squareOpacity);
      this.graphics.beginShape();
      this.graphics.vertex(this.edgeAfrom.nodeFrom.position.x, this.edgeAfrom.nodeFrom.position.y, this.edgeAfrom.nodeFrom.position.z);
      this.graphics.vertex(this.edgeAfrom.nodeTo.position.x, this.edgeAfrom.nodeTo.position.y, this.edgeAfrom.nodeTo.position.z);
      this.graphics.vertex(this.edgeAto.nodeTo.position.x, this.edgeAto.nodeTo.position.y, this.edgeAto.nodeTo.position.z);
      this.graphics.vertex(this.edgeAto.nodeFrom.position.x, this.edgeAto.nodeFrom.position.y, this.edgeAto.nodeFrom.position.z);
      this.graphics.endShape(CLOSE);
    }
  }

  getCentroid() {
    let result = createVector();
    result.add(this.edgeAfrom.nodeFrom.position);
    result.add(this.edgeAfrom.nodeTo.position);
    result.add(this.edgeAto.nodeTo.position);
    result.add(this.edgeAto.nodeFrom.position);
    result.div(4);
    return result;
  }
}
