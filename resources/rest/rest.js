function updateIcons() {
  if (parameters.showGraph) {
    graphToggleButton.classList.add("text-green-500");
    graphToggleButton.classList.remove("text-white");
  } else {
    graphToggleButton.classList.add("text-white");
    graphToggleButton.classList.remove("text-green-500");
  }

  if (parameters.showConfigurationspace) {
    configSpaceToggleButton.classList.add("text-green-500");
    configSpaceToggleButton.classList.remove("text-white");
  } else {
    configSpaceToggleButton.classList.add("text-white");
    configSpaceToggleButton.classList.remove("text-green-500");
  }

  if (parameters.showRobots) {
    robotsToggleButton.classList.add("text-green-500");
    robotsToggleButton.classList.remove("text-white");
  } else {
    robotsToggleButton.classList.add("text-white");
    robotsToggleButton.classList.remove("text-green-500");
  }

  if (parameters.showText) {
    textToggleButton.classList.add("text-green-500");
    textToggleButton.classList.remove("text-white");
  } else {
    textToggleButton.classList.add("text-white");
    textToggleButton.classList.remove("text-green-500");
  }

  if (parameters.mode == "Move") {
    moveToggleButton.classList.add("text-green-500");
    moveToggleButton.classList.remove("text-white");
  } else {
    moveToggleButton.classList.add("text-white");
    moveToggleButton.classList.remove("text-green-500");
  }

  if (parameters.running) {
    physicsToggleButton.classList.add("text-green-500");
    physicsToggleButton.classList.remove("text-white");
  } else {
    physicsToggleButton.classList.add("text-white");
    physicsToggleButton.classList.remove("text-green-500");
  }
}

graphToggleButton = document.getElementById("graphtoggle");
graphToggleButton.onclick = (e) => {
  parameters.showGraph = !parameters.showGraph;
  updateURL();
  updateIcons();
};

configSpaceToggleButton = document.getElementById("configspacetoggle");
configSpaceToggleButton.onclick = (e) => {
  parameters.showConfigurationspace = !parameters.showConfigurationspace;
  updateURL();
  updateIcons();
};

robotsToggleButton = document.getElementById("robotstoggle");
robotsToggleButton.onclick = (e) => {
  parameters.showRobots = !parameters.showRobots;
  updateURL();
  updateIcons();
};

textToggleButton = document.getElementById("texttoggle");
textToggleButton.onclick = (e) => {
  parameters.showText = !parameters.showText;
  updateIcons();
};

moveToggleButton = document.getElementById("movetoggle");
moveToggleButton.onclick = (e) => {
  if (parameters.mode == "View") {
    parameters.mode = "Move";
  } else {
    parameters.mode = "View";
  }
  updateMode();
  updateIcons();
};

physicsToggleButton = document.getElementById("physicstoggle");
physicsToggleButton.onclick = (e) => {
  parameters.running = !parameters.running;
  updateIcons();
};

updateIcons();
