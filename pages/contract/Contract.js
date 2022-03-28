const FlightSuretyApp_ABI = require('../json_config/fsApp_ABI.json');
const FlightSuretyDATA_ABI = require('../json_config/fsData_ABI.json');
const contractData = require('../json_config/config.json');

const fsContract = (web3, contract, network) => {
  if (contract === 'APP') {
    return new web3.eth.Contract(
      FlightSuretyApp_ABI,
      contractData[network]['appAddress']
    );
  } else if (contract === 'DATA') {
    return new web3.eth.Contract(
      FlightSuretyDATA_ABI,
      contractData[network]['dataAddress']
    );
  }
};

export default fsContract;
