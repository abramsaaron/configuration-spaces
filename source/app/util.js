function arraysEqual(a1, a2) {
  /* WARNING: arrays must not contain {objects} or behavior may be undefined */
  return JSON.stringify(a1) == JSON.stringify(a2);
}

const flatten = (arr) => [].concat.apply([], arr);

const product = (...sets) => sets.reduce((acc, set) => flatten(acc.map((x) => set.map((y) => [...x, y]))), [[]]);
