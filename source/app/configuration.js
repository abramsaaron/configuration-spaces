class Configuration {
  constructor(graphLayout, robotA, robotB) {
    // print(graphLayout);
    this.graphLayout = graphLayout;
    this.robotA = robotA;
    this.robotB = robotB;
    this.history = [];
    this.updatePosition(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount);
  }

  updatePosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
    this.position = this.getPosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB);
  }

  getPosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
    let position;

    if (amountA === 0 && amountB === 0) {
      let stateLabel = [robotAfrom.label, robotBfrom.label];
      let state = this.graphLayout.getNode(stateLabel);
      position = state.position;
    } else if (amountA > 0 && amountB === 0) {
      let stateFromLabel = [robotAfrom.label, robotBfrom.label];
      let stateToLabel = [robotAto.label, robotBfrom.label];
      let stateFrom = this.graphLayout.getNode(stateFromLabel);
      let stateTo = this.graphLayout.getNode(stateToLabel);
      position = p5.Vector.lerp(stateFrom.position, stateTo.position, amountA);
    } else if (amountA === 0 && amountB > 0) {
      let stateFromLabel = [robotAfrom.label, robotBfrom.label];
      let stateToLabel = [robotAfrom.label, robotBto.label];
      let stateFrom = this.graphLayout.getNode(stateFromLabel);
      let stateTo = this.graphLayout.getNode(stateToLabel);
      position = p5.Vector.lerp(stateFrom.position, stateTo.position, amountB);
    } else {
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

      let topLeft = this.graphLayout.getNode([robotAfrom.label, robotBfrom.label]).position;
      let topRight = this.graphLayout.getNode([robotAto.label, robotBfrom.label]).position;
      let botLeft = this.graphLayout.getNode([robotAfrom.label, robotBto.label]).position;
      let botRight = this.graphLayout.getNode([robotAto.label, robotBto.label]).position;
      let topX = p5.Vector.lerp(topLeft, topRight, amountA);
      let botX = p5.Vector.lerp(botLeft, botRight, amountA);
      position = p5.Vector.lerp(topX, botX, amountB);
    }
    return position;
  }

  getCrosshair(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
    // This works even when one or both the amounts are zero.
    // (robotA.nodeFrom, robotB.nodeFrom)      edgeAfrom          (robotA.nodeTo, robotB.nodeFrom)
    //
    //                             *-->---X------------>---*
    //                             |      |                |
    //                             Y------P----------------Y
    //       edgeBfrom             |      |                |       edgeBto
    //                             v      |                v
    //                             |      |                |
    //                             |      |                |
    //                             |      |                |
    //                             *--->--X------------->--*
    //
    // (robotA.nodeFrom, robotB.nodeTo)         edgeAto         (robotA.nodeTo, robotB.nodeTo)

    let topLeft = this.graphLayout.getNode([robotAfrom.label, robotBfrom.label]).position;
    let topRight = this.graphLayout.getNode([robotAto.label, robotBfrom.label]).position;
    let botLeft = this.graphLayout.getNode([robotAfrom.label, robotBto.label]).position;
    let botRight = this.graphLayout.getNode([robotAto.label, robotBto.label]).position;

    let topX = p5.Vector.lerp(topLeft, topRight, amountA);
    let botX = p5.Vector.lerp(botLeft, botRight, amountA);

    let leftY = p5.Vector.lerp(topLeft, botLeft, amountB);
    let rightY = p5.Vector.lerp(topRight, botRight, amountB);

    return [topX, botX, leftY, rightY];
  }

  getHyperplaneLine(robotFrom, robotTo, amount, possibleEdge, flip) {
    // This works even when one or both the amounts are zero.
    // (robotFrom, possibleEdge.nodeFrom)      edgeFrom          (robotTo, possibleEdge.nodeFrom)
    //
    //                             *-->---X------------>---*
    //                             |      |                |
    //                             |      |                |
    //       possibleEdgeFrom      |      |                |       possibleEdgeTo
    //                             v      |                v
    //                             |      |                |
    //                             |      |                |
    //                             |      |                |
    //                             *--->--X------------->--*
    //
    // (robotFrom, possibleEdge.nodeTo)         edgeTo         (robotTo, possibleEdge.nodeTo)

    if (flip) {
      let topLeft = this.graphLayout.getNode([robotFrom.label, possibleEdge[0]]).position;
      let topRight = this.graphLayout.getNode([robotTo.label, possibleEdge[0]]).position;
      let botLeft = this.graphLayout.getNode([robotFrom.label, possibleEdge[1]]).position;
      let botRight = this.graphLayout.getNode([robotTo.label, possibleEdge[1]]).position;
      let topX = p5.Vector.lerp(topLeft, topRight, amount);
      let botX = p5.Vector.lerp(botLeft, botRight, amount);
      return [topX, botX];
    } else {
      let topLeft = this.graphLayout.getNode([possibleEdge[0], robotFrom.label]).position;
      let topRight = this.graphLayout.getNode([possibleEdge[0], robotTo.label]).position;
      let botLeft = this.graphLayout.getNode([possibleEdge[1], robotFrom.label]).position;
      let botRight = this.graphLayout.getNode([possibleEdge[1], robotTo.label]).position;
      let topX = p5.Vector.lerp(topLeft, topRight, amount);
      let botX = p5.Vector.lerp(botLeft, botRight, amount);
      return [topX, botX];
    }
  }

  record(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
    this.history.push([robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB]);
  }

  resetHistory() {
    this.history = [];
  }

  show() {
    if (parameters.showHistory) {
      for (let i = 0; i < this.history.length - 1; i++) {
        let A = this.history[i];
        let B = this.history[i + 1];
        let from = this.getPosition(A[0], A[1], A[2], A[3], A[4], A[5]);
        let to = this.getPosition(B[0], B[1], B[2], B[3], B[4], B[5]);

        this.graphLayout.graphics.stroke(0);
        this.graphLayout.graphics.strokeWeight(1.0);
        this.graphLayout.graphics.line(from.x, from.y, from.z, to.x, to.y, to.z);
      }
    }

    this.showAt(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount);
  }

  showAt(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB) {
    this.updatePosition(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB);

    // robot A is somewhere. find all possible edges that B could occupy
    let robotApossibilites = this.robotA.getAllPossibleEdges();
    let robotBpossibilites = this.robotB.getAllPossibleEdges();

    // Show hyperplane.
    if (parameters.showHyperplanes) {
      for (let possibleEdge of robotApossibilites) {
        let c = this.getHyperplaneLine(robotBfrom, robotBto, amountB, possibleEdge, false);
        let a = c[0];
        let b = c[1];
        this.graphLayout.graphics.stroke(parameters.colorRobotA);
        this.graphLayout.graphics.strokeWeight(8.0);
        this.graphLayout.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      for (let possibleEdge of robotBpossibilites) {
        let c = this.getHyperplaneLine(robotAfrom, robotAto, amountA, possibleEdge, true);
        let a = c[0];
        let b = c[1];
        this.graphLayout.graphics.stroke(parameters.colorRobotB);
        this.graphLayout.graphics.strokeWeight(8.0);
        this.graphLayout.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    } else {
      if (this.active) {
        // Show crosshairs.
        let crosshairs = this.getCrosshair(robotAfrom, robotAto, amountA, robotBfrom, robotBto, amountB);
        this.graphLayout.graphics.strokeWeight(8.0);
        if (crosshairs.length === 4) {
          let a = crosshairs[0];
          let b = crosshairs[1];
          this.graphLayout.graphics.stroke(parameters.colorRobotB);
          this.graphLayout.graphics.line(a.x, a.y, a.z, b.x, b.y, b.z);
          let c = crosshairs[2];
          let d = crosshairs[3];
          this.graphLayout.graphics.stroke(parameters.colorRobotA);
          this.graphLayout.graphics.line(c.x, c.y, c.z, d.x, d.y, d.z);
        }
      }
    }

    this.graphLayout.graphics.push();
    this.graphLayout.graphics.translate(this.position.x, this.position.y, this.position.z);
    this.graphLayout.graphics.noStroke();

    if (this.active) {
      this.graphLayout.graphics.fill(parameters.activeDotColor);
      this.graphLayout.graphics.ambientMaterial(parameters.activeDotColor);
    } else {
      this.graphLayout.graphics.fill(parameters.colorConfig);
      this.graphLayout.graphics.ambientMaterial(parameters.colorConfig);
    }

    if (parameters.sphereView) {
      let d = parameters.sphereDetail;
      this.graphLayout.graphics.sphere(0.5 * parameters.configNodeSize, d, d);
    } else {
      let rotation = this.graphLayout.graphics.easycam.getRotation();
      let rotXYZ = QuaternionToEuler(rotation[0], rotation[1], rotation[2], rotation[3]);
      this.graphLayout.graphics.rotateX(-rotXYZ[0]);
      this.graphLayout.graphics.rotateY(-rotXYZ[1]);
      this.graphLayout.graphics.rotateZ(-rotXYZ[2]);
      this.graphLayout.graphics.translate(0, 0, 20);
      this.graphLayout.graphics.ellipse(0, 0, parameters.configNodeSize, parameters.configNodeSize);
    }
    this.graphLayout.graphics.pop();
  }
}
