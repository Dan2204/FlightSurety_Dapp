import fAddress from './fAddress';

//// GENERATE FLIGHTS ////
const generateFlights = async (contract, data, flights, appOwner) => {
  const newFlights = [];
  const airlines = data.data.filter((airline) => airline.canParticipate);
  const activeFlights = flights.filter((flight) => flight.isRegistered);
  const maxFlights = data.maxFlights / airlines.length;
  const airlineCount = {};
  for (const airline of airlines) {
    airlineCount[airline.airline] = 0;
  }
  for (const flight of activeFlights) {
    if (airlineCount[flight.airline] !== undefined) {
      airlineCount[flight.airline] += 1;
    }
  }
  for (const airline in airlineCount) {
    while (airlineCount[airline] < maxFlights) {
      const timeNow = new Date().getTime();
      // const randTime = Math.floor(Math.random() * (172800000 - 86400000) + 86400000);
      const randTime = Math.floor(Math.random() * (172800 - 86400) + 86400);
      const timestamp = Math.floor((timeNow + randTime) / 1000);
      const name = airlines.filter((_airline, index) => _airline.airline === airline)[0]
        .name;
      const flightNumber = _getFlightNumber(name);
      try {
        await contract.methods.registerFlight(airline, flightNumber, timestamp).send({
          from: appOwner,
          gas: 300000,
        });
        const newFlight = await contract.methods
          .getFlight(airline, flightNumber, timestamp)
          .call();
        if (newFlight.isRegistered) {
          const tempflight = {
            airline: newFlight.airline,
            flightNumber: newFlight.flightNumber,
            flightTime: newFlight.flightTime,
            latestTimestamp: newFlight.latestTimeStamp,
            statusCode: newFlight.statusCode,
            isRegistered: newFlight.isRegistered,
          };
          newFlights.push(tempflight);
          airlineCount[airline]++;
        } else {
          console.error(
            `Error processing flight: ${flightNumber}, ${fAddress(
              airline,
              5
            )}, ${timestamp}`
          );
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }
  return newFlights;
};

//// (INTERNAL) GENERATE A RANDOM FLIGHT NUMBER BASED ON THE AIRLINE NAME ////
const _getFlightNumber = (airlineName) => {
  const firstLetter = airlineName.slice(0, 1).toUpperCase();
  const number = Math.floor(Math.random() * (900 - 100) + 100);
  const lastDigit = airlineName.length > 1 ? Math.random() * (3 - 1) + 1 : 1;
  const lastLetter = airlineName.at(-lastDigit).toLowerCase();
  return `${firstLetter}${number}${lastLetter}`;
};

const getFlights = async (amount, contract, appOwner) => {
  let newFlights = [];
  for (let f = 0; f < amount; f++) {
    try {
      const flight = await contract.methods.getFlight(f).call({ from: appOwner });
      newFlights.push({
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        flightTime: flight.flightTime,
        latestTimestamp: flight.latestTimestamp,
        statusCode: flight.statusCode,
        isRegistered: flight.isRegistered,
      });
    } catch (error) {
      console.error(error.message);
    }
  }
  return newFlights;
};

export { generateFlights, getFlights };
