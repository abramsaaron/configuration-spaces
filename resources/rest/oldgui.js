function initGUIOld() {
  if (verbose) console.log("initGUI");
  // if (tweakpane === undefined) {
  document.getElementById("tweakpane").innerHTML = "";
  tweakpane = new Tweakpane({
    container: document.getElementById("tweakpane"),
  });

  const paneGeneralSettings = tweakpane.addFolder({
    title: "General settings",
    expanded: true,
  });
  paneGeneralSettings
    .addInput(parameters, "graphType", {
      label: "Choose graph",
      options: {
        custom: "custom",
        "K(1,1)": "K(1,1)",
        "K(1,2)": "K(1,2)",
        "K(1,3)": "K(1,3)",
        "K(1,4)": "K(1,4)",
        "K(1,5)": "K(1,5)",
        "K(1,6)": "K(1,6)",
        "K(1,7)": "K(1,7)",
        "K(1,8)": "K(1,8)",
        "K(1,9)": "K(1,9)",
        "K(1,10)": "K(1,10)",
        "K(2,2)": "K(2,2)",
        "K(2,3)": "K(2,3)",
        "K(2,4)": "K(2,4)",
        "K(2,5)": "K(2,5)",
        "K(2,6)": "K(2,6)",
        "K(3,3)": "K(3,3)",
        "K(3,4)": "K(3,4)",
        "K(4,4)": "K(4,4)",
        "K(2)": "K(2)",
        "K(3)": "K(3)",
        "K(4)": "K(4)",
        "K(5)": "K(5)",
        "K(6)": "K(6)",
        "K(7)": "K(7)",
        "K(8)": "K(8)",
        "C(2)": "C(2)",
        "C(3)": "C(3)",
        "C(4)": "C(4)",
        "C(5)": "C(5)",
        "C(6)": "C(6)",
        "C(7)": "C(7)",
        "W(4)": "W(4)",
        "W(5)": "W(5)",
        "W(6)": "W(6)",
        "W(7)": "W(7)",
        "W(8)": "W(8)",
        "W(9)": "W(9)",
        "W(10)": "W(10)",
      },
    })
    .on("change", (e) => {
      parameters.mode = "View";
      // updateMode();
      graphIsCustomized = false;
      init();
    });
  paneGeneralSettings
    .addInput(parameters, "mode", {
      label: "Choose mode",
      options: {
        View: "View",
        Move: "Move",
      },
    })
    .on("change", (e) => {
      if (verbose) console.log("mode: on change event");
      updateMode();
    });
  paneGeneralSettings.addInput(parameters, "running", {
    label: "Running",
  });

  paneGeneralSettings
    .addInput(parameters, "showRobots", {
      label: "Show robots",
    })
    .on("change", (e) => {
      updateURL();
    });
  paneGeneralSettings
    .addInput(parameters, "showGraph", {
      label: "Show graph in configuration space",
    })
    .on("change", (e) => {
      updateURL();
    });
  paneGeneralSettings
    .addInput(parameters, "showConfigurationspace", {
      label: "Show configuration space",
    })
    .on("change", (e) => {
      updateURL();
    });
  paneGeneralSettings
    .addInput(parameters, "showInfo", {
      label: "Show info",
    })
    .on("change", (e) => {
      if (e.value) {
        infoDiv.show();
      } else {
        infoDiv.hide();
      }
    });
  paneGeneralSettings.addInput(parameters, "gridOn", {
    label: "Show square grids",
  });
  paneGeneralSettings.addInput(parameters, "squareOn", {
    label: "Show square surfaces",
  });
  paneGeneralSettings.addInput(parameters, "showLoops", {
    label: "Show loops",
  });
  paneGeneralSettings.addInput(parameters, "showHyperplanes", {
    label: "Show hyperplanes",
  });
  paneGeneralSettings.addInput(parameters, "showText", {
    label: "Show text (t)",
  });
  paneGeneralSettings
    .addInput(parameters, "dualView", {
      label: "Dual view",
    })
    .on("change", (e) => {
      console.log("change in panel");
      console.log("parameters.dualView = " + parameters.dualView);
      setDualView(parameters.dualView);
    });
  syncViewToggle = paneGeneralSettings.addInput(parameters, "syncView", {
    label: "Sync cameras",
  });
  if (!parameters.dualView) {
    syncViewToggle.hidden = true;
  }

  const paneVisualSettings = tweakpane.addFolder({
    title: "Visual settings",
    expanded: !true,
  });
  paneVisualSettings.addInput(parameters, "nodeSize", {
    label: "Node size",
    min: 0,
    max: 40,
  });
  paneVisualSettings.addInput(parameters, "robotsNodeSize", {
    label: "Robot size",
    min: 0,
    max: 40,
  });
  paneVisualSettings.addInput(parameters, "configNodeSize", {
    label: "Configuration node size",
    min: 0,
    max: 40,
  });
  paneVisualSettings.addInput(parameters, "sphereDetail", {
    label: "Sphere detail",
    step: 1,
    min: 2,
    max: 40,
  });
  paneVisualSettings.addInput(parameters, "edgeWidthGraph", {
    label: "Graph edge width",
    min: 0,
    max: 10,
  });
  paneVisualSettings.addInput(parameters, "edgeWidthConfigSpace", {
    label: "Configuration edge width",
    min: 0,
    max: 10,
  });
  paneVisualSettings.addInput(parameters, "edgeWidthGrid", {
    label: "Grid edge width",
    min: 0,
    max: 10,
  });
  paneVisualSettings.addInput(parameters, "granularityGraph", {
    label: "Edge granularity for graph",
    step: 1,
    min: 0,
    max: 80,
  });
  paneVisualSettings.addInput(parameters, "granularityFirstCoordinate", {
    label: "Edge granularity for first coordinate",
    step: 1,
    min: 0,
    max: 80,
  });
  // .on("change", (e) => {
  //   configuration_space.graphLayout.createInnerNodes();
  // })
  paneVisualSettings.addInput(parameters, "granularitySecondCoordinate", {
    label: "Edge granularity for second coordinate",
    step: 1,
    min: 0,
    max: 80,
  });
  // .on("change", (e) => {
  //   configuration_space.graphLayout.createInnerNodes();
  // })
  paneVisualSettings.addInput(parameters, "colorNode", {
    label: "Node color",
    view: "color",
  });
  paneVisualSettings.addInput(parameters, "colorRobotA", {
    label: "Color of Robot A node",
    view: "color",
  });
  paneVisualSettings.addInput(parameters, "colorRobotB", {
    label: "Color of Robot B node",
    view: "color",
  });
  paneVisualSettings.addInput(parameters, "colorConfig", {
    label: "Color of Configuration node",
    view: "color",
  });
  paneVisualSettings.addInput(parameters, "colorGraphEdge", {
    label: "Color of Edges in Graph",
    view: "color",
  });
  paneVisualSettings.addInput(parameters, "squareColor", {
    label: "Color of squares",
    view: "color",
  });
  paneVisualSettings.addInput(parameters, "squareOpacity", {
    label: "Opacity of squares",
    min: 0,
    max: 255,
  });
  paneVisualSettings.addInput(parameters, "activeDotColor", {
    label: "Color of selected node",
    view: "color",
  });
  paneVisualSettings.addInput(parameters, "deleteNodeColor", {
    label: "Color for deletion of node",
    view: "color",
  });
  paneVisualSettings.addInput(parameters, "selectedNodeForEdgeColor", {
    label: "Color for selected Node for Edge",
    view: "color",
  });
  paneVisualSettings.addInput(parameters, "fontSize", {
    label: "Font size",
    min: 10,
    max: 100,
  });
  paneVisualSettings.addInput(parameters, "labelZ", {
    label: "Text distance from nodes",
    min: 0,
    max: 100,
  });

  const paneMotionSettings = tweakpane.addFolder({
    title: "Motion settings",
    expanded: !true,
  });
  paneMotionSettings.addInput(parameters, "moveDotsRandomly", {
    label: "Move robots",
  });
  paneMotionSettings.addInput(parameters, "amountMultiplier", {
    label: "amountMultiplier",
    min: 0,
    max: 1,
  });
  paneMotionSettings.addInput(parameters, "robotASpeed", {
    label: "robotASpeed",
    min: 0,
    max: 1,
  });
  paneMotionSettings.addInput(parameters, "robotBSpeed", {
    label: "robotBSpeed",
    min: 0,
    max: 1,
  });
  paneMotionSettings.addInput(parameters, "speedUp", {
    label: "speedUp",
    min: 0,
    max: 1,
  });
  paneMotionSettings.addInput(parameters, "recordHistory", {
    label: "recordHistory",
  });
  paneMotionSettings.addInput(parameters, "showHistory", {
    label: "showHistory",
  });
  paneMotionSettings
    .addButton({
      label: "resetHistory",
      title: "reset",
    })
    .on("click", () => {
      configuration_space.graphLayout.configuration.resetHistory();
    });

  const paneGraphLayout = tweakpane.addFolder({
    title: "Graph layout settings",
    expanded: true,
  });
  paneGraphLayout.addInput(graph.graphLayout, "edgelength", {
    label: "Target edge length",
    min: 1,
    max: 400,
  });
  paneGraphLayout.addInput(graph.graphLayout, "graphEdgeForce", {
    label: "Edge force",
    min: 0,
    max: 0.1,
  });
  paneGraphLayout.addInput(parameters, "maxspeed", {
    label: "Max node speed",
    min: 0,
    max: 30,
  });
  paneGraphLayout.addInput(graph.graphLayout, "cohesionthreshold", {
    label: "Neighbor attraction threshold",
    min: 0,
    max: 2,
  });
  paneGraphLayout.addInput(graph.graphLayout, "repulsion", {
    label: "Repulsion",
    min: 0,
    max: 100000,
  });
  paneGraphLayout.addInput(graph.graphLayout, "separationFactor", {
    label: "Separation factor",
    min: 0,
    max: 1300,
  });
  paneGraphLayout.addInput(graph.graphLayout, "planarForce", {
    label: "Planar force",
    min: 0,
    max: 0.15,
  });
  paneGraphLayout.addInput(graph.graphLayout, "centerForce", {
    label: "Center force",
    min: 0,
    max: 0.15,
  });
  paneGraphLayout.addInput(graph.graphLayout, "extraCenterForce", {
    label: "Extra center force",
    min: 0,
    max: 0.15,
  });
  paneGraphLayout.addInput(graph.graphLayout, "moveToCenter", {
    label: "Adjust to center",
  });

  const paneConfigspaceLayout = tweakpane.addFolder({
    title: "Configuration space layout settings",
    expanded: true,
  });

  // here
  paneConfigspaceLayout
    .addInput(parameters, "layoutPreset", {
      label: "Layout presets",
      options: {
        "Layout 00": "layout-00.txt",
        "Layout 01": "layout-01.txt",
        "Layout 02": "layout-02.txt",
      },
    })
    .on("change", (e) => {
      readLayoutFromFile(parameters.layoutPreset);
    });

  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "firstCoordinateEdgeLength", {
    label: "First coordinate target edge length",
    min: 1,
    max: 1000,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "firstCoordinateForce", {
    label: "Force for first coordinate edge",
    min: 0,
    max: 0.1,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "secondCoordinateEdgeLength", {
    label: "Second coordinate target edge length",
    min: 1,
    max: 1000,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "secondCoordinateForce", {
    label: "Force for second coordinate edge",
    min: 0,
    max: 0.1,
  });
  // paneConfigspaceLayout.addInput(configuration_space.graphLayout, "innerEdgeForce", {
  //   label: "Force for inner edge",
  //   min: 0,
  //   max: 0.1,
  // });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "firstCoordinateMirrorForce", {
    label: "First projection bias",
    min: -0.2,
    max: 0.2,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "secondCoordinateMirrorForce", {
    label: "Second projection bias",
    min: -0.2,
    max: 0.2,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "coordinatePreference", {
    label: "Coordinate preference",
    min: -0.1,
    max: 0.1,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "extraCenterPreference", {
    label: "Extra center preference",
    min: 0,
    max: 0.1,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "cohesionthreshold", {
    label: "Neighbor attraction threshold",
    min: 0,
    max: 2,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "repulsion", {
    label: "Repulsion",
    min: 0,
    max: 500000,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "centroidRepulsion", {
    label: "Centroid Repulsion",
    min: 0,
    max: 500000,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "separationFactor", {
    label: "Separation factor",
    min: 0,
    max: 1300,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "centerForce", {
    label: "Center Force",
    min: 0,
    max: 0.15,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "extraCenterForce", {
    label: "Extra center force",
    min: 0,
    max: 0.15,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "moveToCenter", {
    label: "Adjust to center",
  });
  paneConfigspaceLayout.addInput(parameters, "THETA", {
    label: "THETA",
    min: 0,
    max: 10,
  });
  paneConfigspaceLayout.addInput(configuration_space.graphLayout, "squarePlanarForce", {
    label: "Square Planar Force",
    min: 0,
    max: 0.2,
  });
  // }
}
