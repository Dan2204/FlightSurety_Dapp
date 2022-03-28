const Web3 = require('web3');
const express = require('express');
const contractData = require('../json_config/config.json');
const FlightSuretyApp_ABI = require('../json_config/fsApp_ABI.json');
const { generateOracles, getOracles } = require('../utils/generateOracles');

const FLIGHT_CODES = [10, 20, 30, 40, 50];
const MAX_ORACLES = 30;
let oracleList = [];
let config;
let web3;
let accounts;
let fsApp;
let numOracles;

const getRandomCode = () => {
  return Math.floor(Math.random() * FLIGHT_CODES.length);
};

// const generateOracles = async (amount) => {
//   let newOracles = [];
//   let fee = await fsApp.methods.REGISTRATION_FEE().call();
//   console.log(`\tRegistration fee:  ${web3.utils.fromWei(fee, 'ether')} eth`);
//   let account = accounts.length - (numOracles + amount);
//   let count = 0;
//   while (count < amount) {
//     if (!oracleList.includes(account)) {
//       try {
//         console.log('\tRegistering account: ' + account);
//         const oracleCount = await fsApp.methods.registerOracle().send({
//           from: accounts[account],
//           value: fee,
//           gas: 300000,
//           gasPrice: null,
//         });
//         count++;
//       } catch (error) {
//         console.error('\t>>> Error: ' + error.message);
//         // console.error(error);
//         break;
//       }
//     } else {
//       console.error('>>>> ERROR: Account already in list');
//     }
//     account++;
//   }
//   return newOracles;
// };

// const getOracles = async (amount) => {
//   let newOracles = [];
//   for (let o = 0; o < amount; o++) {
//     try {
//       const oracle = await fsApp.methods.getOracle(o).call();
//       const indexes = await fsApp.methods.getMyIndexes().call({ from: oracle });
//       newOracles.push({
//         oracle: oracle,
//         indexes: indexes,
//         key: o,
//       });
//     } catch (error) {
//       console.error(error.message);
//     }
//   }
//   return newOracles;
// };

const init = async () => {
  //// WEB3 AND CONTRACT INITIALIZATION ////
  config = contractData['localhost'];
  web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
  fsApp = new web3.eth.Contract(FlightSuretyApp_ABI, config.appAddress);
  accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];
  console.log('\n/* ********************************************** */\n');
  console.log('Initialization...\n');
  console.log('\tFound ' + accounts.length + ' accounts');

  //// GENERATE ORACLES IF THERE ARE NONE (FIRST MIGRATE) ////
  let oracles = [];
  try {
    numOracles = parseInt(await fsApp.methods.oracleCount().call());
    console.log('\tRegistered Oracles: ' + numOracles);

    if (numOracles < MAX_ORACLES) {
      console.log(`\tGenerating ${MAX_ORACLES - numOracles} Oracles...`);
      try {
        await generateOracles(oracles, MAX_ORACLES - numOracles, fsApp, accounts);
        // await generateOracles(MAX_ORACLES - numOracles);
      } catch (error) {
        console.log('ERROR: Failed in generateOracles()');
      }
    }

    console.log('Retreiving Oracles...');
    numOracles = parseInt(await fsApp.methods.oracleCount().call());
    try {
      oracles = await getOracles(numOracles, fsApp);
    } catch (error) {
      console.log('ERROR: Failed in getOracles()');
    }

    oracleList = [...oracles];

    console.log('\t' + oracleList.length + ' Oracles generated.');
    console.log('\n/* ********************************************** */\n');
    console.log('Listening for event requests...');
  } catch (error) {
    console.warn(error);
  }
  //// END OF ORACLE GENERATION ////

  //// LISTEN FOR FLIGHT STATUS REQUEST ////
  fsApp.events.OracleRequest(
    {
      fromBlock: 0,
    },
    async (error, event) => {
      if (error) {
        console.error(error);
      } else {
        console.log('>>> New request detected <<<<');
        const data = event.returnValues;
        for (const oracle of oracleList) {
          if (oracle.indexes.includes(data.index)) {
            const flightCode = FLIGHT_CODES[getRandomCode()];
            try {
              await fsApp.methods
                .submitOracleResponse(
                  data.index,
                  data.airline,
                  data.flight,
                  data.timestamp,
                  flightCode
                )
                .send({ from: oracle.oracle, gas: 900000 });
              console.log(`>>> Oracle ${oracle.oracle} submitted code: ${flightCode}`);
            } catch (error) {
              console.warn(error.message);
            }
          }
        }
        console.log('>>>> END OF REQUEST <<<<');
      }
    }
  );
};

const app = express();
app.get('/api', (req, res) => {
  res.send('Server waiting for events...');
});

init();

module.exports = app;
