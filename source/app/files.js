function makeFileName(postString) {
  let time = str(year()) + ("0" + str(month())).slice(-2) + ("0" + str(day())).slice(-2) + "_" + ("0" + str(hour())).slice(-2) + ("0" + str(minute())).slice(-2) + ("0" + str(second())).slice(-2);
  return parameters.graphType + postString + "_" + time;
}
