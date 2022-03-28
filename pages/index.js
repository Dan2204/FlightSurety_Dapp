//// CORE ////
import { useContext, useState, useEffect } from 'react';
import ContractContext from './components/store/fsControl-context';

import Web3 from 'web3';

//// COMPONENTS ////
import Head from 'next/head';
import NavBar from './components/navBar/Navbar';
import LeftAccountBar from './components/leftAccountBar/LeftAccountBar';
import Content from './components/content/Content';
import CommentsBox from './components/commentsBox/CommentsBox';
import OracleAccountBar from './components/oracleAccountBar/OracleAccountBar';
import Footer from './components/footer/Footer';

//// STYLES ////
import styles from '../styles/Home.module.css';
import 'bootstrap/dist/css/bootstrap.css';

//// HELPER UTILITIES ////
import fAddress from './utils/fAddress';
import { generateFlights, getFlights } from './utils/generateFlights';
import fsContract from './contract/Contract';
import STATUSCODES from './utils/FlightCodes';
const contractData = require('./json_config/config.json');

//// CONSTANT VARIABLES ////
const FLIGHTS_PER_AIRLINE = 3;

/* *********************
 *    START OF DAPP    *
 * ******************* */
export default function Home() {
  /* ***************************
   *    SET STATE VARIABLES    *
   *************************** */
  const message = useContext(ContractContext);
  const [web3, setWeb3] = useState();
  const [maxFlights, setMaxFlights] = useState(0);

  const [accounts, setAccounts] = useState([]);
  const [usedAccounts, setUsedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState({
    address: null,
    isOwner: false,
    isAirline: false,
    isPassenger: false,
    isFreeAccount: false,
  });
  const [fsApp, setFsApp] = useState();
  const [fsAppContract, setFsAppContract] = useState();
  const [fsAppOwner, setFsAppOwner] = useState();
  const [fsData, setFsData] = useState();
  const [fsDataContract, setFsDataContract] = useState();
  const [fsDataOwner, setFsDataOwner] = useState();

  const [dataOpState, setDataOpState] = useState();
  const [airlines, setAirlines] = useState([]);
  const [pendingConsensus, setPendingConsensus] = useState([]);
  const [oracleList, setOracleList] = useState([]);
  const [activeOracles, setActiveOracles] = useState([]);
  const [passengerList, setPassengerList] = useState([]);
  const [flightList, setFlightList] = useState([]);

  /* ********************
   *    ON PAGE LOAD    *
   ******************** */
  useEffect(async () => {
    await init();
  }, []);

  /* ***********************
   *    INITIALIZE DAPP    *
   *********************** */
  const init = async () => {
    ////////////////////////////////////////////
    //// SETUP WEB3, ACCOUNTS AND CONTRACTS ////
    const url = contractData['localhost'].url;
    const web3 = new Web3(new Web3.providers.HttpProvider(url));

    //// SOCKET FOR LISTENING FOR EVENTS ////
    const web3Ws = new Web3(
      new Web3.providers.WebsocketProvider(url.replace('http', 'ws'))
    );

    const wsEvent = fsContract(web3Ws, 'APP', 'localhost');
    const accounts = await web3.eth.getAccounts();
    const fsApp = fsContract(web3, 'APP', 'localhost');
    const appContract = contractData['localhost'].appAddress;
    const appOwner = await fsApp.methods.getAppOwner().call();
    const fsData = fsContract(web3, 'DATA', 'localhost');
    const dataContract = contractData['localhost'].appAddress;
    const dataOwner = await fsData.methods.getContractOwner().call();
    const operational = await fsData.methods.isOperational().call();
    setWeb3(web3);
    setAccounts(accounts);
    setFsApp(fsApp);
    setFsAppContract(appContract);
    setFsAppOwner(appOwner);
    setFsData(fsData);
    setFsDataContract(dataContract);
    setFsDataOwner(dataOwner);
    setDataOpState(operational);

    const appBalance = await fsApp.methods.getContractBalance().call();
    const dataBalance = await fsData.methods.getContractBalance().call();
    console.log('---------------------------------------');
    console.log(`appBalance: ${web3.utils.fromWei(appBalance, 'ether')} Eth`);
    console.log(`dataBalance: ${web3.utils.fromWei(dataBalance, 'ether')} Eth`);
    console.log('---------------------------------------');

    ////////////////////////////////////////////////////////////////
    //// AUTHORIZE APP CONTRACT TO USE DATA CONTRACT (IF NOT AUTHORIZED) ////
    const authorized = await fsData.methods.isContractAuthorized().call();
    if (!authorized) {
      message.onSetMessage('Authorizing fsApp with fsData...');
      await fsApp.methods.authorizeContract(appContract).send({
        from: appOwner,
        gas: 300000,
      });
    }

    //////////////////////////////////////
    //// CHECK FOR REGISTERED ORACLES ////
    const numOracles = parseInt(await fsApp.methods.oracleCount().call());
    const oracles = await getOracles(numOracles, fsApp);
    for (const oracle of oracles) {
      addUsedAccounts([oracle.oracle]);
    }
    // setUsedAccounts(() => [...used]);
    setOracleList(() => [...oracles]);
    //// END OF ORACLES ////

    /////////////////////////////
    //// INITIALIZE AIRLINES ////
    const airlineInit = await initAirlines(fsData);

    ///////////////////////////////////////////////
    //// INITIALIZE FLIGHTS THAT ALREADY EXIST ////
    const numFlights = await fsApp.methods.flightCount().call();
    const flights = await getFlights(numFlights, fsApp, appOwner);
    let setFlights;

    //////////////////////////////////////
    //// GENERATE FLIGHTS IF REQUIRED ////
    if (numFlights < airlineInit.maxFlights) {
      message.onSetMessage('Generating Flights...');
      const newFlights = await generateFlights(fsApp, airlineInit, flights, appOwner);
      setFlights = newFlights;
    } else {
      setFlights = flights;
    }
    message.onSetMessage('Setting Flights...');
    setFlightList((prev) => [...prev, ...setFlights]);
    //// END OF FLIGHTS ////

    ///////////////////////////////
    //// INITIALIZE PASSENGERS ////
    await initPassengers(fsData, fsApp, airlineInit.data);

    //////////////////////////////////////
    //// SET INITIAL SELECTED ACCOUNT ////
    setSelectedAccount((prev) => {
      return { ...prev, address: appOwner, isOwner: true, isAirline: true };
    });
    message.onSetMessage(`${fAddress(appOwner)} is selected.`);

    /* *************************
     *    LISTEN FOR EVENTS    *
     ************************* */

    //////////////////////////////////
    //// ORACLE SENT REPORT EVENT ////
    wsEvent.events.OracleReport(
      {
        fromBlock: 0,
      },
      (error, event) => {
        if (error) {
          console.warn(error);
        } else {
          const oracleAddress = event.returnValues.oracle;
          message.onSetMessage('Insufficient data received to update.');
          setActiveOracles((prev) => [...prev, oracleAddress]);
          setTimeout(() => {
            setActiveOracles(() => []);
          }, 3000);
        }
      }
    );

    /////////////////////////////
    //// CLOSED FLIGHT EVENT ////
    wsEvent.events.FlightClosed(
      {
        fromBlock: 0,
      },
      async (error, event) => {
        if (error) {
          // message.onSetMessage('ERROR: Check console.');
          message.onSetMessage(error.message);
          console.warn(error);
        } else {
          try {
            const status = event.returnValues.statusCode;
            message.onSetFlightMessage(`Flight Closed: ${STATUSCODES[status]}`);
            message.onSetMessage('');

            // GET UPDATED FLIGHTLIST WITHOUT CLOSED FLIGHT //
            const numFlights = await fsApp.methods.flightCount().call();
            const flights = await getFlights(numFlights, fsApp, appOwner);
            setFlightList(() => [...flights]);

            const airlines = await fsData.methods.getRegisteredAirlines().call();
            const airlineData = await getAirlineData(fsData, airlines);
            const participating = airlineData.filter((airline) => airline.canParticipate);
            // const flightAirline = participating.filter((al) => al.airline === airline);
            setAirlines(() => [...airlineData]);
            const maxFlights = participating.length * FLIGHTS_PER_AIRLINE;
            setMaxFlights(() => maxFlights);

            // GET NEW FLIGHT TO REPLACE CLOSED FLIGHT //
            const data = { data: airlineData, maxFlights };
            const newFlights = await generateFlights(fsApp, data, flights, appOwner);
            setFlightList((prev) => [...prev, ...newFlights]);
            message.onSetMessage('New flight generated');

            // RESET PASSENGERS //
            await initPassengers(fsData, fsApp);
          } catch (error) {
            // message.onSetMessage('ERROR: Please check console.');
            message.onSetMessage(error.message);
            console.warn(error.message);
          }
        }
      }
    );

    //////////////////////////////
    //// UPDATED FLIGHT EVENT ////
    wsEvent.events.FlightUpdated(
      {
        fromBlock: 0,
      },
      async (error, event) => {
        if (error) {
          message.onSetMessage('ERROR: Check console.');
          console.warn(error);
        } else {
          try {
            const numFlights = await fsApp.methods.flightCount().call();
            const flights = await getFlights(numFlights, fsApp, appOwner);
            setFlightList(() => [...flights]);
            message.onSetFlightMessage(`Flight Updated`);
            message.onSetMessage('');
          } catch (error) {
            // message.onSetMessage('ERROR: Please check console.');
            message.onSetMessage(error.message);
            console.warn(error.message);
          }
        }
      }
    );
    //// END OF EVENT LISTENERS ////
  };

  /* **********************
   *    DAPP FUNCTIONS    *
   ********************** */

  /////////////////////////////////
  //// CONFIGURE USED ACCOUNTS ////
  const addUsedAccounts = (accountList) => {
    const used = usedAccounts;
    for (const account of accountList) {
      if (!used.includes(account)) {
        used.push(account);
      }
    }
    setUsedAccounts(() => [...used]);
  };

  const removeUsedAccounts = (accountList) => {
    const used = usedAccounts.filter((account) => !accountList.includes(account));
    setUsedAccounts(() => [...used]);
  };

  ////////////////////////////
  //// INITIALIZE ORACLES ////
  const getOracles = async (amount, contract) => {
    message.onSetMessage('Checking for registered Oracles...');
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

  /////////////////////////////
  //// INITIALIZE AIRLINES ////
  const initAirlines = async (fsData) => {
    message.onSetMessage('Initializing Airlines...');
    // GET REGISTERED AIRLINES //
    const fsAirlines = await fsData.methods.getRegisteredAirlines().call();

    addUsedAccounts(fsAirlines);

    // SET AIRLINES AND AIRLINES IN CONSENSUS //
    const data = await getAirlineData(fsData, fsAirlines);
    setAirlines((prev) => [...prev, ...data]);
    getConsensus(fsData);

    // CALCULATE HOW MANY FLIGHTS THERE SHOULD BE //
    const maxFlights =
      data.filter((al) => al.canParticipate).length * FLIGHTS_PER_AIRLINE;
    setMaxFlights(maxFlights);

    // RETURN AIRLINES AND MAXIMUM FLIGHTS TO BE CREATED //
    return { data, maxFlights };
  };

  //////////////////////////
  //// GET AIRLINE DATA ////
  const getAirlineData = async (fsData, airlineList) => {
    const data = [];
    for (let a = 0; a < airlineList.length; a++) {
      const al = await fsData.methods.getAirline(airlineList[a]).call();
      data.push({
        airline: al[0],
        name: al[1],
        isRegistered: al[2],
        canParticipate: al[3],
        numberOfPayouts: al[4],
      });
    }
    return data;
  };

  ///////////////////////////////////
  //// GET AIRLINES IN CONSENSUS ////
  const getConsensus = async (fsData) => {
    try {
      let consensusList = await fsData.methods.getConsensusList().call();
      // CHECK FOR BLANK ENTRIES - AIRLINE REMOVED AS NOW REGISTERED //
      consensusList = consensusList.filter(
        (item) => item !== '0x0000000000000000000000000000000000000000'
      );
      //// GET VOTES ////
      const pendingConsensusList = [];
      for (const address of consensusList) {
        const votes = await fsData.methods.getNumVotes(address).call();
        pendingConsensusList.push([address, votes]);
      }
      setPendingConsensus(() => [...pendingConsensusList]);
    } catch (error) {
      // message.onSetMessage('ERROR: Please check console');
      message.onSetMessage(error.message);
      console.warn(error.message);
    }
  };

  ///////////////////////////////////////
  //// INITIALIZE INSURED PASSENGERS ////
  const initPassengers = async (fsData, fsApp, al = null) => {
    // STATE VARIABLE 'airlines' WONT BE UPDATED IF THIS FUNCTION IS CALLED
    // FROM init(), A COPY OF THE LIST NEEDS TO BE ATTACHED (al)
    const airlineList = al ? al : airlines;
    try {
      // GET FLIGHT HASHES AND INSURED PASSENGERS //
      const insuredFlightHashes = await fsData.methods.getInsuredFlights().call();

      // TEMPORARY ARRAY TO LINK PASSENGERS TO FLIGHTS BETWEEN CONTRACTS //
      const flightCounts = [];

      // GET NUMBER OF INSURED PASSENGERS FOR EACH FLIGHT //
      for (const flightHash of insuredFlightHashes) {
        const count = await fsData.methods.getInsuredCount(flightHash).call();
        flightCounts.push({ flightHash, count });
      }

      const passengers = [];
      for (const flightData of flightCounts) {
        for (let i = 0; i < +flightData.count; i++) {
          // GET PASSENGER FROM DATA CONTRACT //
          const passenger = await fsData.methods
            .getInsuree(flightData.flightHash, i)
            .call();

          // GET FLIGHT FROM APP CONTRACT //
          const flight = await fsApp.methods
            .getFlight(passenger.airline, passenger.flightNumber, passenger.timestamp)
            .call();

          // ONLY ADD PASSENGER IF FLIGHT IS STILL ACTIVE OR
          // FLIGHT IS CLOSED BUT PASSENGER IS STILL OWED
          if (flight.isRegistered || (!flight.isRegistered && +passenger.owed > 0)) {
            passenger.flightHash = flightData.flightHash;
            passenger.id = i.toString();
            if (
              !passengers.find((p) => p.customerAddress === passenger.customerAddress)
            ) {
              passengers.push(passenger);
            }

            // ADD ADDRESS TO usedAccounts IF NOT ALREADY THERE //
            addUsedAccounts([passenger.customerAddress]);

            // REMOVE ADDRESS FROM usedAccounts IF IT DOESN'T NEED TO BE THERE //
          } else {
            // CHECK IF USED ACCOUNTS HAS BEEN UPDATED //
            if (usedAccounts.length > 0) {
              // BEFORE REMOVING, CHECK ADDRESS HASN'T BECOME AN AIRLINE //
              if (!airlineList.find((airline) => airline.airline === passenger.airline)) {
                removeUsedAccounts([passenger.customerAddress]);
              }
            }
          }
        }
      }
      setPassengerList(() => [...passengers]);
    } catch (error) {
      message.onSetMessage('Error initializing passengers, check console.');
      console.error(error.message);
    }
  };

  /* **********************
   *    EVENT HANDLERS    *
   ********************** */

  /////////////////////////////////////////
  //// CHANGE CURRENT SELECTED ADDRESS ////
  const accountHandler = (account) => {
    account.isOwner = account.address === fsAppOwner;
    message.onSetMessage(`${fAddress(account.address)} is selected.`);
    setSelectedAccount((prev) => {
      return { ...prev, ...account };
    });
  };

  //////////////////////////////
  //// GENERATE NEW FLIGHTS ////
  const getNewFlights = async (data, flights = null) => {
    // GENERATE FLIGHTS FOR NEW AIRLINE //
    const tempFlights = flights ? flights : flightList;
    const newFlights = await generateFlights(fsApp, data, tempFlights, fsAppOwner);
    setFlightList((prev) => [...prev, ...newFlights]);
  };

  //////////////////////////////
  //// REGISTER NEW AIRLINE ////
  const addAirlineHandler = async (newAirline) => {
    const isPassenger = passengerList.filter(
      (passenger) => passenger.customerAddress === newAirline.address
    )[0];

    if (!isPassenger) {
      try {
        await fsApp.methods.registerAirline(newAirline.name, newAirline.address).send({
          from: selectedAccount.address,
          gas: 300000,
        });
        const al = await fsData.methods.getAirline(newAirline.address).call();
        const data = {
          airline: al[0],
          name: al[1],
          isRegistered: al[2],
          canParticipate: al[3],
          numberOfPayouts: al[4],
        };
        // CHECK IF AIRLINE HAS BEEN REGISTERED OR IS IN CONSENSUS //
        if (data.isRegistered) {
          message.onSetMessage(`${fAddress(data.airline)} has been registered.`);
          setAirlines((prev) => [...prev, data]);

          const used = usedAccounts;
          if (!used.includes(newAirline.address)) {
            used.push(newAirline.address);
          }
          setUsedAccounts(() => [...used]);

          const newMaxFlights =
            maxFlights > 0 ? maxFlights + FLIGHTS_PER_AIRLINE : FLIGHTS_PER_AIRLINE;
          setMaxFlights(() => newMaxFlights);

          // IF NOT REGISTERED, AIRLINE IS IN CONSENSUS //
        } else {
          message.onSetMessage(`${fAddress(data.airline)} requires votes.`);
        }
        getConsensus(fsData);
      } catch (e) {
        // message.onSetMessage('Error: please check console...');
        message.onSetMessage(e.message);
        console.warn(e);
      }
    } else {
      message.onSetMessage("Can't add while address is a passenger");
    }
  };

  /////////////////////////////////////
  //// PAY 10 ETHER TO PARTICIPATE ////
  const payHandler = async (account) => {
    try {
      await fsData.methods.fund().send({
        from: account.airline,
        value: web3.utils.toWei('10', 'ether'),
        gas: 300000,
      });

      const index = airlines.findIndex((airline) => airline.airline === account.airline);
      if (index !== -1) {
        const newAirlines = [...airlines];
        newAirlines[index].canParticipate = true;
        setAirlines(() => [...newAirlines]);

        // ENSURE ADDRESS IS IN usedAccounts //
        addUsedAccounts([account.airline]);

        // GENERATE FLIGHTS FOR NEW AIRLINE //
        const newMaxFlights =
          newAirlines.filter((al) => al.canParticipate).length * FLIGHTS_PER_AIRLINE;
        setMaxFlights(() => newMaxFlights);
        getNewFlights({ data: newAirlines, maxFlights: newMaxFlights });

        message.onSetMessage(
          `${fAddress(
            newAirlines[index].airline
          )} can now participate in airline registration.`
        );
      }
    } catch (e) {
      // message.onSetMessage('Error: Check console...');
      message.onSetMessage(e.message);
      console.warn(e);
    }
  };

  //////////////////////////////////////
  //// HANDLE PURCHASE OF INSURANCE ////
  const insuranceHandler = async (flight) => {
    if (!airlines.find((airline) => airline.airline === selectedAccount.address)) {
      if (
        !passengerList.find(
          (passenger) => passenger.customerAddress === selectedAccount.address
        )
      ) {
        try {
          await fsData.methods
            .buy(flight[0].flightNumber, flight[0].airline, flight[0].flightTime)
            .send({
              from: selectedAccount.address,
              value: web3.utils.toWei(flight[1], 'ether'),
              gas: 300000,
            });

          message.onSetMessage(
            `Insurance purchased by ${fAddress(selectedAccount.address)}`
          );

          // ADD TO USED ACCOUNTS AND SET SELECTED ACCOUNT STATUS //
          addUsedAccounts([selectedAccount.address]);

          const select = selectedAccount;
          select.isFreeAccount = false;
          select.isPassenger = true;
          setSelectedAccount((prev) => {
            return { ...prev, ...select };
          });

          await initPassengers(fsData, fsApp);
        } catch (error) {
          console.warn(error);
        }
      } else {
        message.onSetMessage(`Can only purchase Insurance for one flight at a time.`);
      }
    } else {
      message.onSetMessage("Select an 'Available' account to buy insurance.");
    }
  };

  ///////////////////////////////
  /// COLLECT OWED INSURANCE ////
  const collectInsuranceHandler = async (data) => {
    const index = accounts.indexOf(data.sender);
    const prePayBalance = await web3.eth.getBalance(accounts[index]);
    try {
      await fsData.methods.pay(data.flight, data.id).send({
        from: selectedAccount.address,
        gas: 300000,
      });

      const postPayBalance = await web3.eth.getBalance(accounts[index]);
      const actual = (postPayBalance - prePayBalance).toString();

      message.onSetMessage(
        `From: ${web3.utils.fromWei(data.owed, 'ether')} ETH, you got paid: ${parseFloat(
          web3.utils.fromWei(actual, 'ether')
        ).toFixed(5)} ETH after blockchain fees.`
      );

      // REMOVE ADDRESS FROM usedAccounts //
      removeUsedAccounts([data.sender]);
      await initPassengers(fsData, fsApp);
    } catch (error) {
      message.onSetMessage('ERROR: Please check console.');
      console.warn(error);
    }
  };

  ///////////////////////////
  //// GET FLIGHT STATUS ////
  const flightStatusHandler = async (flightToCheck) => {
    message.onSetMessage(`Checking Flight ${flightToCheck.flightNumber}...`);
    try {
      await fsApp.methods
        .fetchFlightStatus(
          flightToCheck.airline,
          flightToCheck.flightNumber,
          flightToCheck.flightTime
        )
        .send({
          from: selectedAccount.address,
          gas: 300000,
        });
      message.onSetMessage('Request sent, waiting for response...');
    } catch (error) {
      message.onSetMessage('Error: Please check console.');
      console.warn(error.message);
    }
  };

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.body}>
        {/* NAVBAR */}
        <NavBar selectedAccount={selectedAccount} />

        {/* LEFT SIDE BAR - ACCOUNT NAVIGATION */}
        <div className={styles.accountBox}>
          <LeftAccountBar
            airlines={airlines}
            passengers={passengerList}
            usedAccounts={usedAccounts}
            flightList={flightList}
            accounts={accounts}
            changeAccount={accountHandler}
            selectedAccount={selectedAccount}
            onAddAirline={addAirlineHandler}
            onMakePayment={payHandler}
            onCheckStatus={flightStatusHandler}
            onCollectOwed={collectInsuranceHandler}
          />
        </div>

        {/* ORACLE SIDE BAR */}
        <div className={styles.oracleBox}>
          <OracleAccountBar oracleList={oracleList} activeOracles={activeOracles} />
        </div>

        {/* FLIGHT BOX */}
        <div className={styles.centerContainer}>
          <div className={styles.flightBox}>
            <Content
              flightList={flightList}
              airlines={airlines}
              selectedAccount={selectedAccount}
              onBuy={insuranceHandler}
              onCheckStatus={flightStatusHandler}
            />
          </div>

          {/* INFORMATION / MESSAGE BOX */}
          <div className={styles.commentsBox}>
            <CommentsBox
              pendingConsensus={pendingConsensus}
              votesRequired={Math.floor(
                airlines.filter((airline) => airline.canParticipate).length / 2
              )}
            />
          </div>
        </div>

        {/* FOOTER */}
        <Footer
          fsAppOwner={fsAppOwner}
          fsDataOwner={fsDataOwner}
          dataOpState={dataOpState}
        />
      </div>
    </>
  );
}
