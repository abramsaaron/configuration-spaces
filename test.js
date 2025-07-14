// function setup() {
//   noCanvas();
//   createCanvas(windowWidth, windowHeight, WEBGL);
//   colorMode(HSB, 255);
//   pixelDensity(2);


//   let easycam = createEasyCam(this, {
//     distance: 2000,
//   });
// }

// function draw() {
//   ambientLight(0, 0, 128);
//   directionalLight(0, 0, 255, -1, 0, 0);
//   colorMode(HSB, 255);
//   background(255);
//   fill(255);
//   noStroke();
//   sphere(50);
//   fill(0, 255, 255, 200);
//   beginShape();
//   vertex(-200, -200, 0);
//   vertex(200, -200, 0);
//   vertex(200, 200, 0);
//   vertex(-200, 200, 0);
//   endShape(CLOSE);
// }

function setup() {
  noCanvas();
  graphicsGraph = createGraphics(windowWidth, windowHeight, WEBGL);
  graphicsGraph.parent("test");
  graphicsGraph.colorMode(HSB, 255);
  graphicsGraph.pixelDensity(2);
  graphicsGraph.show();
  graphicsGraph.ambientLight(0, 0, 128);
  graphicsGraph.directionalLight(0, 0, 255, 0, 0, -1);
  graphicsGraph.colorMode(HSB, 255);


  let easycam = createEasyCam(graphicsGraph._renderer, {
    distance: 2000,
  });
}

function draw() {

  graphicsGraph.background(255);
  graphicsGraph.fill(255);
  graphicsGraph.noStroke();
  graphicsGraph.sphere(50);
  graphicsGraph.fill(0, 255, 255, 100);
  graphicsGraph.beginShape();
  graphicsGraph.vertex(-200, -200, 0);
  graphicsGraph.vertex(200, -200, 0);
  graphicsGraph.vertex(200, 200, 0);
  graphicsGraph.vertex(-200, 200, 0);
  graphicsGraph.endShape(CLOSE);
}