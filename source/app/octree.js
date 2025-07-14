let MAXLEVEL = 10;
let BUCKETSIZE = 10;
let NODEMASS = 1.0;

const EMPTY = 0;
const LEAF = 1;
const DIVIDED = 2;

const allNodesForce = -1 * 0.33;
const gravityPower = 2.0;

class Octree {
  constructor(graphLayout, boundary, level) {
    this.graphLayout = graphLayout;
    this.boundary = boundary;
    this.level = level;
    this.state = EMPTY;
    this.children = undefined;
    this.centerOfMass = createVector();
    this.centerMass = 0;
  }

  subdivide() {
    this.state = DIVIDED;

    let x = this.boundary.x;
    let y = this.boundary.y;
    let z = this.boundary.z;
    let w = this.boundary.w / 2;
    let h = this.boundary.h / 2;
    let d = this.boundary.d / 2;

    this.URF = new Octree(this.graphLayout, new Cube(x + w, y - h, z + d, w, h, d), this.level + 1);
    this.ULF = new Octree(this.graphLayout, new Cube(x - w, y - h, z + d, w, h, d), this.level + 1);
    this.LRF = new Octree(this.graphLayout, new Cube(x + w, y + h, z + d, w, h, d), this.level + 1);
    this.LLF = new Octree(this.graphLayout, new Cube(x - w, y + h, z + d, w, h, d), this.level + 1);
    this.URB = new Octree(this.graphLayout, new Cube(x + w, y - h, z - d, w, h, d), this.level + 1);
    this.ULB = new Octree(this.graphLayout, new Cube(x - w, y - h, z - d, w, h, d), this.level + 1);
    this.LRB = new Octree(this.graphLayout, new Cube(x + w, y + h, z - d, w, h, d), this.level + 1);
    this.LLB = new Octree(this.graphLayout, new Cube(x - w, y + h, z - d, w, h, d), this.level + 1);
  }

  insert(node) {
    if (this.state == EMPTY) {
      if (this.children == null) {
        // First time; create children
        this.children = [];
      }
      this.children.push(node);
      this.state = LEAF;
    } else if (this.state == LEAF) {
      if (this.children.length < BUCKETSIZE || this.level == MAXLEVEL) {
        // OK to add node to children
        this.children.push(node);
      } else {
        // Bucket is full; divide and use octants
        this.subdivide();
        // Insert previous nodes
        for (let n of this.children) {
          this.insertInOctant(n);
        }
        // Clear children
        this.children = [];
        // Insert new node
        this.insertInOctant(node);
      }
    } else if (this.state == DIVIDED) {
      // if DIVIDED, then recurse
      this.insertInOctant(node);
    } else {
      // should not happen
      error("insert: state unknown");
    }
  }

  insertInOctant(n) {
    if (this.ULF.boundary.contains(n)) this.ULF.insert(n);
    else if (this.URF.boundary.contains(n)) this.URF.insert(n);
    else if (this.LLF.boundary.contains(n)) this.LLF.insert(n);
    else if (this.LRF.boundary.contains(n)) this.LRF.insert(n);
    else if (this.ULB.boundary.contains(n)) this.ULB.insert(n);
    else if (this.URB.boundary.contains(n)) this.URB.insert(n);
    else if (this.LLB.boundary.contains(n)) this.LLB.insert(n);
    else if (this.LRB.boundary.contains(n)) this.LRB.insert(n);
    else {
      // should not happen
      if (vverbose)
        console.error(
          "insertInOctant: not in any octant: " +
            n.position +
            " " +
            this.boundary.toString() +
            "\n" +
            "this.ULF.boundary = " +
            this.ULF.boundary.toString() +
            "\n" + //
            "this.URF.boundary = " +
            this.URF.boundary.toString() +
            "\n" + //
            "this.LLF.boundary = " +
            this.LLF.boundary.toString() +
            "\n" + //
            "this.LRF.boundary = " +
            this.LRF.boundary.toString() +
            "\n" + //
            "this.ULB.boundary = " +
            this.ULB.boundary.toString() +
            "\n" + //
            "this.URB.boundary = " +
            this.URB.boundary.toString() +
            "\n" + //
            "this.LLB.boundary = " +
            this.LLB.boundary.toString() +
            "\n" + //
            "this.LRB.boundary = " +
            this.LRB.boundary.toString() +
            "\n"
        );
    }
  }

  calculateMass() {
    if (vverbose) console.log("calculateMass");
    if (this.state == EMPTY) {
      // Nothing to do
    } else if (this.state == LEAF) {
      // Reset
      this.centerOfMass.set(0, 0, 0);
      this.centerMass = 0;
      let counter = 0;
      // Add from chindren
      for (let node of this.children) {
        this.centerOfMass.add(p5.Vector.mult(node.position, node.mass));
        this.centerMass += node.mass;
        counter++;
      }
      // Find center
      this.centerOfMass.div(counter);
    } else if (this.state == DIVIDED) {
      // Reset
      this.centerOfMass.set(0, 0, 0);
      this.centerMass = 0;
      // Recursively calculate for octants
      this.URF.calculateMass();
      this.ULF.calculateMass();
      this.LRF.calculateMass();
      this.LLF.calculateMass();
      this.URB.calculateMass();
      this.ULB.calculateMass();
      this.LRB.calculateMass();
      this.LLB.calculateMass();
      // Add from octants
      this.centerOfMass.add(p5.Vector.mult(this.URF.centerOfMass, this.URF.centerMass));
      this.centerMass += this.URF.centerMass;
      this.centerOfMass.add(p5.Vector.mult(this.ULF.centerOfMass, this.ULF.centerMass));
      this.centerMass += this.ULF.centerMass;
      this.centerOfMass.add(p5.Vector.mult(this.LRF.centerOfMass, this.LRF.centerMass));
      this.centerMass += this.LRF.centerMass;
      this.centerOfMass.add(p5.Vector.mult(this.LLF.centerOfMass, this.LLF.centerMass));
      this.centerMass += this.LLF.centerMass;
      this.centerOfMass.add(p5.Vector.mult(this.URB.centerOfMass, this.URB.centerMass));
      this.centerMass += this.URB.centerMass;
      this.centerOfMass.add(p5.Vector.mult(this.ULB.centerOfMass, this.ULB.centerMass));
      this.centerMass += this.ULB.centerMass;
      this.centerOfMass.add(p5.Vector.mult(this.LRB.centerOfMass, this.LRB.centerMass));
      this.centerMass += this.LRB.centerMass;
      this.centerOfMass.add(p5.Vector.mult(this.LLB.centerOfMass, this.LLB.centerMass));
      this.centerMass += this.LLB.centerMass;
      // Find center
      this.centerOfMass.div(this.centerMass);
    } else {
      if (vverbose) console.log("ERROR");
      // Should not happen
      error("calculateMass: state unknown");
    }
  }

  getAllNodesForces(target) {
    // Initalize result that we will return
    let result = createVector();

    if (this.state == EMPTY) {
      // Do nothing
    } else if (this.state == LEAF) {
      // Iterate over the nodes in the leaf
      for (let other of this.children) {
        // Initialize the force that we will add to the result
        // let f = createVector();

        // Ignore self
        if (target != other) {
          // Get force vector pointing towards source
          let diff = p5.Vector.sub(target.position, other.position);
          let d = diff.mag();

          // Check if magnitude is zero
          // if (diff.mag() == 0) diff.add(smallRandomValue(), smallRandomValue());

          if (d > 1) {
            // Calculate force
            // f.normalize().mult((1.0 * allNodesForce * NODEMASS) / pow(f.mag(), gravityPower));
            diff.normalize().mult(this.graphLayout.repulsion / pow(d, gravityPower));
            // Add to result
            result.add(diff);
          }
        }
      }
    } else if (this.state == DIVIDED) {
      // Barnes-Hut optimalization
      let d = this.centerOfMass.dist(target.position);

      // If d is high enough, relative to w, stop recursion and use the centerMass.
      if (d > parameters.THETA * this.boundary.w) {
        // Get force force vector pointing towards target
        let diff = p5.Vector.sub(target.position, this.centerOfMass);

        // TODO
        if (d > 1) {
          diff.normalize().mult((this.graphLayout.repulsion * this.centerMass) / pow(d, gravityPower));
          // Add to result
          result.add(diff);
        }
      } else {
        result.add(this.ULF.getAllNodesForces(target));
        result.add(this.URF.getAllNodesForces(target));
        result.add(this.LLF.getAllNodesForces(target));
        result.add(this.LRF.getAllNodesForces(target));
        result.add(this.ULB.getAllNodesForces(target));
        result.add(this.URB.getAllNodesForces(target));
        result.add(this.LLB.getAllNodesForces(target));
        result.add(this.LRB.getAllNodesForces(target));
      }
    } else {
      if (vverbose) error("forcesOnNode: state missing");
    }
    return result;
  }

  show(g) {
    // g.colorMode(HSB);

    g.push();
    g.translate(this.boundary.x, this.boundary.y, this.boundary.z);
    g.stroke(0);
    g.strokeWeight(1.0);
    g.noFill();
    g.box(2 * this.boundary.w, 2 * this.boundary.h, 2 * this.boundary.d);
    g.pop();

    // if (this.state == DIVIDED) {
    //   g.fill(0, 255, 255, 50);
    // } else if (this.children != null) {
    //   g.fill(30, 255, 255, 50);
    // } else {
    //   g.fill(0, 50);
    // }

    // g.noStroke();
    // g.rect(this.boundary.x, this.boundary.y, 2, 2);

    // if (this.centerOfMass.x != 0 && this.centerOfMass.y != 0 && this.centerOfMass.z != 0) {
    //   g.stroke(0, 255, 255, 100);
    //   g.line(this.boundary.x, this.boundary.y, this.boundary.z, this.centerOfMass.x, this.centerOfMass.y, this.centerOfMass.z);
    //   g.noStroke();
    //   g.fill(0, 255, 255, 1);
    //   let d = this.centerMass * 3;
    //   g.ellipse(this.centerOfMass.x, this.centerOfMass.y, d, d);
    // }

    if (this.children != null) {
      for (let node of this.children) {
        g.stroke(60, 255, 255, 255);
        g.strokeWeight(1.0);
        g.line(this.centerOfMass.x, this.centerOfMass.y, this.centerOfMass.z, node.position.x, node.position.y, node.position.z);

        g.push();
        g.translate(this.centerOfMass.x, this.centerOfMass.y, this.centerOfMass.z);
        g.fill(210, 255, 255, 255);
        g.noStroke();
        g.sphere(10);
        g.pop();
      }
    }

    if (this.state == DIVIDED) {
      this.URF.show(g);
      this.ULF.show(g);
      this.LRF.show(g);
      this.LLF.show(g);
      this.URB.show(g);
      this.ULB.show(g);
      this.LRB.show(g);
      this.LLB.show(g);
    }
  }
}

class Cube {
  // CENTER MODE
  constructor(x, y, z, w, h, d) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.h = h;
    this.d = d;
  }

  contains(node) {
    return (
      node.position.x >= this.x - this.w && //
      node.position.x <= this.x + this.w && //
      node.position.y >= this.y - this.h && //
      node.position.y <= this.y + this.h && //
      node.position.z >= this.z - this.d && //
      node.position.z <= this.z + this.d
    );
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w || //
      range.x + range.w < this.x - this.w || //
      range.y - range.h > this.y + this.h || //
      range.y + range.h < this.y - this.h || //
      range.z - range.d > this.z + this.d || //
      range.z + range.d < this.z - this.d
    );
  }

  toString() {
    return "x=" + this.x + " y=" + this.y + " z=" + this.z + " w=" + this.w + " h=" + this.h + " d=" + this.d;
  }
}
