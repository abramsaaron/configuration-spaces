class Graph {
  constructor(nodeLabels, edgeLabels) {
    this.type = "graph";
    this.nodes = nodeLabels;
    this.edges = edgeLabels;
  }

  update() {
    this.graphLayout.update();
  }

  show() {
    this.graphLayout.show();
  }

  getRobots() {
    return [this.robotA, this.robotB];
  }

  otherRobot(robot) {
    if (this.robotA === robot) return this.robotB;
    else return this.robotA;
  }

  moveRobots() {
    let addtoA = parameters.amountMultiplier * parameters.robotASpeed;
    let addtoB = parameters.amountMultiplier * parameters.robotBSpeed;
    let nextA = this.robotA.amount + addtoA;
    let nextB = this.robotB.amount + addtoB;

    if (nextA >= 1 && nextB < 1) {
      nextA = 1;
      nextB = this.robotB.amount + (addtoB * (1 - this.robotA.amount)) / addtoA;
    } else if (nextA < 1 && nextB >= 1) {
      nextB = 1;
      nextA = this.robotA.amount + (addtoA * (1 - this.robotB.amount)) / addtoB;
    } else if (nextA >= 1 && nextB >= 1) {
      // --------- amountA ---------- 1.0 --- nextA
      // hits 1.0 at time ca. 2/3 = timeA
      // ---- amountB --------------- 1.0 ------------------------------------------ nextB
      // hits 1.0 at time ca. 1/4 = timeB
      // => B hits 1.0 first, so we need to:
      //    set B to 1.0
      //    set A accordingly
      let timeA = (1 - this.robotA.amount) / (nextA - this.robotA.amount);
      let timeB = (1 - this.robotB.amount) / (nextB - this.robotB.amount);

      if (timeA > timeB) {
        nextB = 1;
        nextA = this.robotA.amount + addtoA * timeB;
      } else {
        nextA = 1;
        nextB = this.robotB.amount + addtoB * timeA;
      }
    }

    if (robotAmoving) {
      this.robotA.setAmount(nextA);
    }
    if (robotBmoving) {
      this.robotB.setAmount(nextB);
    }

    if (parameters.recordHistory) {
      configuration_space.graphLayout.configuration.record(this.robotA.nodeFrom, this.robotA.nodeTo, this.robotA.amount, this.robotB.nodeFrom, this.robotB.nodeTo, this.robotB.amount);
    }
  }

  createGraphLayout(graphics, layout3D) {
    this.graphLayout = new GraphLayout(this, graphics, layout3D);

    for (let nodeLabel of this.nodes) {
      this.graphLayout.addNode(nodeLabel);
    }

    for (let edgeLabel of this.edges) {
      let nodeFrom = this.graphLayout.getNode(edgeLabel[0]);
      let nodeTo = this.graphLayout.getNode(edgeLabel[1]);
      this.graphLayout.addEdge(edgeLabel, nodeFrom, nodeTo);
    }

    this.robotA = new Robot(this, this.graphLayout.nodes[0], 0);
    this.robotB = new Robot(this, this.graphLayout.nodes[1], 1);

    this.graphLayout.initlayout();
  }
}
