import { useState, useContext } from 'react';
import ContractContext from '../store/fsControl-context';
import styles from './FlightItem.module.css';
import fAddress from '../../utils/fAddress';
import STATUSCODES from '../../utils/FlightCodes';
import FlightItemModal from './FlightItemModal/FlightItemModal';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const FlightItem = (props) => {
  //// VARIABLES ////
  const message = useContext(ContractContext);
  const selectedAccount = props.selectedAccount;
  const airlines = props.airlines;
  const flight = props.flight;
  const [showFlightModal, setShowFlightModal] = useState(false);

  /* ***************************
   *    COMPONENT FUNCTIONS    *
   *************************** */

  //// CLICK EVENTS ////

  // Show/Hide Airline Details Modal //
  const showModalHandler = () => {
    if (!airlines.find((airline) => airline.airline === selectedAccount.address)) {
      setShowFlightModal(true);
    } else {
      message.onSetMessage('Please select a passenger or available account.');
    }
  };
  const hideModalHandler = () => setShowFlightModal(false);

  // Flight Status Handler //
  const flightStatusHandler = (flightToCheck) => {
    hideModalHandler();
    props.onCheckStatus(flightToCheck);
  };

  // Handle buying insurance //
  const insuranceHandler = (flight) => {
    hideModalHandler();
    props.onBuy(flight);
  };

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <>
      {showFlightModal && (
        <FlightItemModal
          onHideModal={hideModalHandler}
          flight={flight}
          onBuy={insuranceHandler}
          onCheckStatus={flightStatusHandler}
        />
      )}

      {/* FLIGHT CARD */}
      <li className={styles.card} onClick={showModalHandler}>
        <div className={styles.cardContent}>
          <div className={styles.cardHead}>
            <h2 className={styles.h2}>Flight No. {flight.flightNumber}</h2>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.cardItem}>
              Airline:{' '}
              <span className={styles.cardItemHero}>{fAddress(flight.airline, 5)}</span>
            </p>

            <p className={styles.cardItem}>
              FlightTime: <span className={styles.cardItemHero}>{flight.flightTime}</span>
            </p>
            <p className={styles.cardItem}>
              Last Update:{' '}
              <span className={styles.cardItemHero}>{flight.latestTimestamp}</span>
            </p>
            <p className={styles.cardItem}>
              Flight Status:{' '}
              <span className={styles.cardItemHero}>
                {STATUSCODES[+flight.statusCode]}
              </span>
            </p>
            <p className={styles.cardItem}>
              Flight open:{' '}
              <span className={styles.cardItemHero}>
                {flight.isRegistered ? 'Yes' : 'No'}
              </span>
            </p>
          </div>
        </div>
      </li>
    </>
  );
};

export default FlightItem;
