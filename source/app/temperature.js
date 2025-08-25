// Temperature

function tick() {
  temperature = temperature * (1 - coolingRate);
}

function reheat() {
  temperature = 1.0;
}
