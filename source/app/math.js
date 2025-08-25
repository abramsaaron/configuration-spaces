// Math

function applyToVec3(rot, vec) {
  let dst;
  var [x, y, z] = vec;
  var [q0, q1, q2, q3] = rot;

  var s = q1 * x + q2 * y + q3 * z;
  dst = [0, 0, 0];
  dst[0] = 2 * (q0 * (x * q0 - (q2 * z - q3 * y)) + s * q1) - x;
  dst[1] = 2 * (q0 * (y * q0 - (q3 * x - q1 * z)) + s * q2) - y;
  dst[2] = 2 * (q0 * (z * q0 - (q1 * y - q2 * x)) + s * q3) - z;
  return dst;
}

function limitVector(p, value) {
  if (p.mag() > value) {
    p.normalize().mult(value);
  }
}

function EulerToQuaternion(x, y, z) {
  // Abbreviations for the various angular functions
  var cy = cos(z * 0.5);
  var sy = sin(z * 0.5);
  var cp = cos(y * 0.5);
  var sp = sin(y * 0.5);
  var cr = cos(x * 0.5);
  var sr = sin(x * 0.5);

  // convert to Quaternion
  var qw = cy * cp * cr + sy * sp * sr;
  var qx = cy * cp * sr - sy * sp * cr;
  var qy = sy * cp * sr + cy * sp * cr;
  var qz = sy * cp * cr - cy * sp * sr;

  //console.log('converted from Euler',x,y,z,'To Quaternion',qw,qx,qy,qz);
  return [qw, qx, qy, qz];
}

function QuaternionToEuler(q0, q1, q2, q3) {
  //qw, qx, qy, qz
  // Convert Rotation from Quaternion To XYZ (from wikipedia)
  // roll (x-axis rotation)
  var sinr_cosp = +2.0 * (q0 * q1 + q2 * q3);
  var cosr_cosp = +1.0 - 2.0 * (q1 * q1 + q2 * q2);
  var x = atan2(sinr_cosp, cosr_cosp);

  // pitch (y-axis rotation)
  var sinp = +2.0 * (q0 * q2 - q3 * q1);
  var y;
  if (abs(sinp) >= 1) y = copysign(M_PI / 2, sinp);
  // use 90 degrees if out of range
  else y = asin(sinp);

  // yaw (z-axis rotation)
  var siny_cosp = +2.0 * (q0 * q3 + q1 * q2);
  var cosy_cosp = +1.0 - 2.0 * (q2 * q2 + q3 * q3);
  var z = atan2(siny_cosp, cosy_cosp);

  return [x, y, z];
}

function cartesianProductOf() {
  return Array.prototype.reduce.call(
    arguments,
    function (a, b) {
      var ret = [];
      a.forEach(function (a) {
        b.forEach(function (b) {
          ret.push(a.concat([b]));
        });
      });
      return ret;
    },
    [[]]
  );
}

function getFourthPoint(A, B, C) {
  // A --- B
  // |     |
  // C --- D
  // A + ((B - A) + (C - A)) = B + C - A
  return p5.Vector.add(B, C).sub(A);
}

// Graph constructors

function completeGraph(m) {
  let nodes = [...Array(m).keys()];
  let edges = [];
  for (let F of nodes) {
    for (let T of nodes) {
      if (F !== T && F < T) {
        edges.push([F, T]);
      }
    }
  }
  return new Graph(nodes, edges);
}

function chainGraph(m) {
  let nodes = [...Array(m).keys()];
  let edges = [];
  for (let F of nodes) {
    edges.push([F, (F + 1) % m].sort());
    if (vverbose) print(F);
  }
  return new Graph(nodes, edges);
}

function wheelGraph(m) {
  let nodes = [...Array(m + 1).keys()];
  let edges = [];
  for (let F of nodes) {
    if (F !== m) {
      edges.push([F, m]);
    }
    edges.push([F, (F + 1) % m]);

    if (vverbose) print(F);
  }
  return new Graph(nodes, edges);
}

function randomGraph() {
  let nodes = [...Array(30).keys()];
  let edges = [];
  return new Graph(nodes, edges);
}

function completeBipartiteGraph(m, n) {
  if (vverbose) print("completeBipartiteGraph: " + m + " " + n);
  let nodesFrom = [...Array(m).keys()];
  let nodesTo = [...Array(n).keys()].map((x) => x + m);
  let nodes = [...Array(m + n).keys()];
  let edges = [];
  for (let F of nodesFrom) {
    for (let T of nodesTo) {
      edges.push([F, T]);
    }
  }
  return new Graph(nodes, edges);
}
