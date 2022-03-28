const generateOracles = async (oracleList, amount, contract, accounts) => {
  let newOracles = [];
  let fee = await contract.methods.REGISTRATION_FEE().call();
  console.log('\tRegistration fee: ' + fee);
  //// USE LAST <amount> OF GANACHE ACCOUNTS FOR ORACLES ////
  let account = accounts.length - amount;
  let count = 0;
  while (count < amount) {
    if (!oracleList.includes(account)) {
      try {
        console.log('\tRegistering account: ' + account);
        await contract.methods.registerOracle().send({
          from: accounts[account],
          value: fee,
          gas: 300000,
          gasPrice: null,
        });
        const indexes = await contract.methods
          .getMyIndexes()
          .call({ from: accounts[account] });

        newOracles.push({
          oracle: accounts[account],
          indexes: indexes,
          key: count, // For React Component //
        });
        count++;
      } catch (error) {
        console.error('\t>>> ' + error.message);
        break;
      }
    } else {
      console.error('>>>> ERROR: Account already in list');
    }
    account++;
  }
  return newOracles;
};

const getOracles = async (amount, contract) => {
  let newOracles = [];
  for (let o = 0; o < amount; o++) {
    try {
      const oracle = await contract.methods.getOracle(o).call();
      const indexes = await contract.methods.getMyIndexes().call({ from: oracle });
      newOracles.push({
        oracle: oracle,
        indexes: indexes,
        key: o,
      });
    } catch (error) {
      console.error(error.message);
    }
  }
  return newOracles;
};

module.exports = { generateOracles, getOracles };
