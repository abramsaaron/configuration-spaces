class Configuration_space {
  constructor(graph, dimension, ordered = false) {
    this.type = "configuration_space";
    this.ordered = ordered;
    this.dimension = dimension;
    // todo: generalize and use dimension
    let positions = graph.nodes.concat(graph.edges);
    let possible_states = cartesianProductOf(positions, positions);
    console.log(possible_states.map(labelToString));
    this.states = possible_states.filter(this.ordered ? is_state_ordered : is_state_unordered);
    console.log(this.states);
    // this.states = this.states.filter((s) => {
    //   return min(s.flat()) == min(s[0]);
    // });
    // 0-1 = 1-0
    // 1-[0,2] = [0,2]-1
    // [0,2] =
    if (vverbose) console.log(this.states);
    if (vverbose) print("States:");
    if (vverbose) print(this.states);
    this.createGraphLayout(graphicsForConfigurationSpace, true);
    // this.graphLayout.createInnerNodes(); // NEW!

    // if (verbose) console.log("Configuration_space: createInnerNodes");
    // for (let node of this.graphLayout.nodes) {
    //   node.createInnerNode();
    // }
    // for (let edge of this.graphLayout.edges) {
    //   edge.createInnerNodes();
    // }
    // for (let square of this.graphLayout.squares) {
    //   square.createInnerNodes();
    // }
  }

  update() {
    this.graphLayout.update();
  }

  show() {
    this.graphLayout.show();
  }

  getRobots() {
    return [];
  }

  // getStates(degree) {
  //   let result = [];
  //   for (let state of this.states) {
  //     if (getDegree(state) === degree) {
  //       result.push(state);
  //     }
  //   }
  //   return result;
  // }

  getDegree(state) {
    return flatten(state).length - this.dimension;
  }

  addStates(label) {
    let positions = graph.nodes.concat(graph.edges);
    let newPossibleStates = cartesianProductOf([label], positions).concat(cartesianProductOf(positions, [label]));
    if (vverbose) console.log("newPossibleStates");
    if (vverbose) console.log(newPossibleStates);
    let newStates = newPossibleStates.filter(this.ordered ? is_state_ordered : is_state_unordered);
    for (let state of newStates) {
      this.addStateToGraphLayout(state);
      this.states.push(state);
    }
  }

  removeStates(label) {
    if (verbose) console.log("removeStates: " + label);
    let survivingStates = [];
    let statesToDelete = [];

    if (Array.isArray(label)) {
      // label is an edge, for example [0, [1, 2]]
      for (let state of this.states) {
        if (arraysEqual(label, state[0]) || arraysEqual(label, state[1])) {
          statesToDelete.push(state);
        } else {
          survivingStates.push(state);
        }
      }
    } else {
      // label is a node, for example 0
      for (let state of this.states) {
        if (flatten(state).includes(label)) {
          statesToDelete.push(state);
        } else {
          survivingStates.push(state);
        }
      }
    }

    if (verbose) console.log("survivingStates");
    if (verbose) console.log(survivingStates);
    if (verbose) console.log("statesToDelete");
    if (verbose) console.log(statesToDelete);

    for (let state of statesToDelete) {
      switch (this.getDegree(state)) {
        case 0:
          console.log("deleteNode ");
          console.log(state);
          this.graphLayout.deleteNode(state);
          break;
        case 1:
          console.log("deleteEdge ");
          console.log(state);
          this.graphLayout.deleteEdge(state);
          break;
        case 2:
          console.log("deleteSquare ");
          console.log(state);
          this.graphLayout.deleteSquare(state);
          break;
      }

      this.states = survivingStates;
    }
  }

  addStateToGraphLayout(state) {
    switch (this.getDegree(state)) {
      case 0:
        // Create node
        if (vverbose) print("state_1:");
        if (vverbose) print(state);
        this.graphLayout.addNode(state);
        break;
      case 1:
        // Create edges
        if (vverbose) print("state_1:");
        if (vverbose) print(state);
        if (Array.isArray(state[0])) {
          // [[1,2], 0] gives [1,0] and [2,0]
          let nodeFrom = this.graphLayout.getNode([state[0][0], state[1]]);
          let nodeTo = this.graphLayout.getNode([state[0][1], state[1]]);
          // if (nodeFrom & nodeTo)
          this.graphLayout.addEdge(state, nodeFrom, nodeTo);
        } else if (Array.isArray(state[1])) {
          // [0, [1,2]] gives [0,1] and [0,2]
          let nodeFrom = this.graphLayout.getNode([state[0], state[1][0]]);
          let nodeTo = this.graphLayout.getNode([state[0], state[1][1]]);
          if (vverbose) print("nodeFrom:");
          if (vverbose) print(nodeFrom);
          // if (nodeFrom & nodeTo)
          this.graphLayout.addEdge(state, nodeFrom, nodeTo);
        } else {
          if (vverbose) print("error");
        }
        break;
      case 2:
        // Create square
        if (vverbose) print("state_2:");
        if (vverbose) print(state);
        // state = [[ 0 , 3 ][ 1 , 2 ]] OR [[ 1 , 2][ 0 , 3 ]]
        let edgeAfrom = this.graphLayout.getEdge(state[0][0], state[1], true); // 0 [ 1, 2 ]  OR  1 [ 0 , 3]
        let edgeAto = this.graphLayout.getEdge(state[0][1], state[1], true); //   3 [ 1, 2 ]  OR  2 [ 0 , 3]
        let edgeBfrom = this.graphLayout.getEdge(state[0], state[1][0], true); // [ 0, 3 ] 1
        let edgeBto = this.graphLayout.getEdge(state[0], state[1][1], true); //   [ 0, 3 ] 2

        if (vverbose) print(edgeAfrom);
        if (vverbose) print(edgeAto);

        // if (edgeAfrom & edgeAto & edgeBfrom & edgeBto)
        this.graphLayout.addSquare(state, edgeAfrom, edgeAto, edgeBfrom, edgeBto);
        break;
    }

    // let states_0 = this.getStates(0);
    // let states_1 = this.getStates(1);
    // let states_2 = this.getStates(2);

    // // Create nodes
    // for (let state of states_0) {
    //   if (vverbose) print("state_1:");
    //   if (vverbose) print(state);
    //   this.graphLayout.addNode(state);
    // }

    // // Create edges
    // for (let state of states_1) {
    //   if (vverbose) print("state_1:");
    //   if (vverbose) print(state);
    //   if (Array.isArray(state[0])) {
    //     // [[1,2], 0] gives [1,0] and [2,0]
    //     let nodeFrom = this.graphLayout.getNode([state[0][0], state[1]]);
    //     let nodeTo = this.graphLayout.getNode([state[0][1], state[1]]);
    //     this.graphLayout.addEdge(state, nodeFrom, nodeTo);
    //   } else if (Array.isArray(state[1])) {
    //     // [0, [1,2]] gives [0,1] and [0,2]
    //     let labelA = [state[0], state[1][0]];
    //     let nodeFrom = this.graphLayout.getNode(labelA);
    //     if (vverbose) print("nodeFrom:");
    //     if (vverbose) print(nodeFrom);
    //     let nodeTo = this.graphLayout.getNode([state[0], state[1][1]]);
    //     this.graphLayout.addEdge(state, nodeFrom, nodeTo);
    //   } else {
    //     if (vverbose) print("error");
    //   }
    // }

    // // Create squares
    // for (let state of states_2) {
    //   if (vverbose) print("state_2:");
    //   if (vverbose) print(state);
    //   let edgeAfrom = this.graphLayout.getEdge(state[0][0], state[1]);
    //   let edgeAto = this.graphLayout.getEdge(state[0][1], state[1]);
    //   let edgeBfrom = this.graphLayout.getEdge(state[0], state[1][0]);
    //   let edgeBto = this.graphLayout.getEdge(state[0], state[1][1]);
    //   this.graphLayout.addSquare(state, edgeAfrom, edgeAto, edgeBfrom, edgeBto);
    // }
  }

  createGraphLayout(graphics, layout3D) {
    if (verbose) console.log("createGraphLayout");
    this.graphLayout = new GraphLayout(this, graphics, layout3D);
    this.graphLayout.showConfiguration = true;

    for (let state of this.states) {
      this.addStateToGraphLayout(state);
    }

    // This requires graph.createGraphLayout to have been called.
    this.graphLayout.configuration = new Configuration(this.graphLayout, graph.robotA, graph.robotB);

    this.graphLayout.initlayout();
  }
}
