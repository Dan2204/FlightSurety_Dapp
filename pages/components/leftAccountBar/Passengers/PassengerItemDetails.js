import { useContext } from 'react';
import ContractContext from '../../store/fsControl-context';
import styles from './PassengerItemDetails.module.css';
import Modal from '../../UI/Modal';
import fAddress from '../../../utils/fAddress';
import STATUSCODES from '../../../utils/FlightCodes';

/* *****************************
 *    COMPONENT MODAL START    *
 ***************************** */
const PassengerItemDetails = (props) => {
  //// VARIABLES ////
  const message = useContext(ContractContext);
  const passenger = props.passenger;
  const flight = props.flight;
  const selectedAccount = props.selectedAccount;

  //// CLICK EVENTS ////

  // Get Flight Status //
  const flightStatusHandler = (e) => {
    // VALIDATION //
    // Code .....
    props.onCheckStatus(flight);
  };

  const collectInsuranceHandler = () => {
    if (passenger.customerAddress === selectedAccount.address) {
      props.onCollectOwed({
        flight: passenger.flightHash,
        id: passenger.id,
        sender: passenger.customerAddress,
        owed: passenger.owed,
      });
    } else {
      message.onSetMessage(`Please select ${fAddress(passenger.customerAddress)}`);
    }
  };

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <Modal onClick={props.onHideModal}>
      <div className={styles.container}>
        <h3>{passenger.flightNumber}</h3>
        <span className={styles.close} onClick={props.onHideModal}>
          X
        </span>
        {flight.isRegistered && (
          <>
            <p className={styles.p}>
              Passenger:{' '}
              <span className={styles.hero}>{fAddress(passenger.customerAddress)}</span>
            </p>
            <p className={styles.p}>
              Airline: <span className={styles.hero}>{fAddress(passenger.airline)}</span>
            </p>
            <p className={styles.p}>
              Flight Time: <span className={styles.hero}>{passenger.timestamp}</span>
            </p>
            <p className={styles.p}>
              Last Updated: <span className={styles.hero}>{flight.latestTimestamp}</span>
            </p>
            <p className={styles.p}>
              Status:{' '}
              <span className={styles.hero}>{STATUSCODES[flight.statusCode]}</span>
            </p>
            <p className={styles.p}>
              Fee: <span className={styles.hero}>{passenger.balance}</span>
            </p>
            {selectedAccount.address === passenger.customerAddress && (
              <button className={styles.button} onClick={flightStatusHandler}>
                Get Flight Status
              </button>
            )}
          </>
        )}
        {!flight.isRegistered && passenger.owed > 0 && (
          <>
            <h4 className={styles.h4}>Flight Closed</h4>
            <p className={styles.p}>
              Flight Status:{' '}
              <span className={styles.hero}>{STATUSCODES[flight.statusCode]}</span>
            </p>
            <p className={styles.p}>
              Owed: <span className={styles.hero}>{passenger.owed}</span>
            </p>
            {passenger.customerAddress === selectedAccount.address ? (
              <button className={styles.button} onClick={collectInsuranceHandler}>
                Collect Insurance
              </button>
            ) : (
              <h5 className={styles.notSelected}>Select account to get funds</h5>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default PassengerItemDetails;
