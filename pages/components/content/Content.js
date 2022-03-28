import { useContext } from 'react';
import ContractContext from '../store/fsControl-context';
import styles from './Content.module.css';
import FlightItem from './FlightItem';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const Content = (props) => {
  //// VARIABLES ////
  const message = useContext(ContractContext);
  const flights = props.flightList;
  const activeFlights = flights.filter((flight) => flight.isRegistered);
  let flightList = null;

  /* ***************************
   *    COMPONENT FUNCTIONS    *
   *************************** */

  //// CLICK EVENTS ////

  // Flight Status Handler //
  const flightStatusHandler = (flightToCheck) => {
    props.onCheckStatus(flightToCheck);
  };

  // Handle buying insurance //
  const insuranceHandler = (flight) => {
    props.onBuy(flight);
  };

  /* ************************************
   *    COMPONENT LIST CONFIGURATION    *
   ************************************ */

  //// FLIGHT LIST ////
  if (activeFlights) {
    flightList =
      activeFlights.length < 1
        ? null
        : activeFlights.map((flight) => {
            return (
              <FlightItem
                key={flight.flightNumber}
                flight={flight}
                airlines={props.airlines}
                selectedAccount={props.selectedAccount}
                onBuy={insuranceHandler}
                onCheckStatus={flightStatusHandler}
              />
            );
          });
  }

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <main className={styles.contentContainer}>
      <div className={styles.content}>
        <div className={styles.flightHead}>
          <h4 className={styles.h4}>Available Flights ({activeFlights.length})</h4>
          <h4
            className={`${styles.flightMessage} ${
              message.flightMessage !== '' && styles.activeMessage
            }`}
          >
            {message.flightMessage}
          </h4>
        </div>
        <div className={styles.flightContainer}>
          <ui className={styles.flightContent}>
            {flightList || (
              <li className={styles.noFlights}>
                Pay participation fee to generate flights.
              </li>
            )}
          </ui>
        </div>
      </div>
    </main>
  );
};

export default Content;
