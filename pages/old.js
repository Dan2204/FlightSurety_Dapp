<nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
  <a className="navbar-brand" href="#">
    FlightSurety
  </a>
  <button
    className="navbar-toggler"
    type="button"
    data-toggle="collapse"
    data-target="#navbarsExampleDefault"
    aria-controls="navbarsExampleDefault"
    aria-expanded="false"
    aria-label="Toggle navigation"
  >
    <span className="navbar-toggler-icon"></span>
  </button>
</nav>;

//// UPDATE CONSENSUS MANUALY, BUGGY AS HELL, SET TO GRAB FROM CONTRACT ////
console.log(`pendingConsnesus length: ${pendingConsensus.length}`);
if (pendingConsensus.length > 0) {
  const alList = [...pendingConsensus];
  console.log('>>>> alList:');
  console.log(alList);
  for (let i = 0; i < alList.length; i++) {
    console.log(`i[0] = ` + i[0]);
    console.log(`alList[i][0] = ${alList[i][0]}`);
    // if (i[0].airline === newAirline.address) {
    if (alList[i][0] === newAirline.address) {
      console.log(alList[i][0]);
      console.log(alList[i][1]);
      const votes = parseInt(alList[i][1].votes);
      alList[i][1].votes = String(votes++);
      break;
    }
  }
  setPendingConsensus(() => alList);
  //// NOTHING IN PENDING CONSENSUS SO SET FIRST ////
} else {
  // const consensus = [data[0], { votes: 1 }];
  const consensus = [data, { votes: '1' }];
  console.log(consensus);
  setPendingConsensus(() => consensus);
}

//// UPDATING FLIGHT CODE FROM EVENT ////
// const newFlightList = flightList.filter((flight) => {
//   return (
//     flight.airline !== tempFlight.airline &&
//     flight.flight !== tempFlight.flightNumber &&
//     flight.flightTime !== tempFlight.flightTime
//   );
// });
// newFlightList.push(tempFlight);
// console.log(tempFlight);
// console.log('===================');
// setFlightList(() => [...newFlightList]);
