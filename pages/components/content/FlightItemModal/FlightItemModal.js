import { useState, useContext } from 'react';
import ContractContext from '../../store/fsControl-context';

import styles from './FlightItemModal.module.css';
import fAddress from '../../../utils/fAddress';
import Modal from '../../UI/Modal';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const FlightItemModal = (props) => {
  //// VARIABLES ////
  const message = useContext(ContractContext);
  const flight = props.flight;
  const [numberInput, setNumberInput] = useState('');
  // const [isValidNumber, setIsValidNumber] = useState(false);

  const numberInputHandler = (e) => {
    setNumberInput(() => e.target.value);
  };

  //// CLICK EVENTS ////

  // Flight Status Handler //
  const flightStatusHandler = () => {
    props.onCheckStatus(flight);
  };

  // Handle Insurance //
  const handleInsurance = (e) => {
    e.preventDefault();
    if (numberInput <= 1 && numberInput > 0) {
      props.onBuy([flight, numberInput]);
    } else {
      message.onSetMessage('Must be a decimal number between 0 and 1.');
      console.log('Must be a decimal number between 0 and 1.');
    }
  };

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <Modal onClick={props.onHideModal}>
      <div className={styles.container}>
        <h3 className={styles.h3Flight}>{flight.flightNumber}</h3>
        <span className={styles.close} onClick={props.onHideModal}>
          X
        </span>
        <button className={styles.buttonStatus} onClick={flightStatusHandler}>
          Update Flight Status
        </button>
        <div className={styles.iContainer}>
          <h3 className={styles.h3Insurance}>Buy Insurance</h3>
          <p className={styles.info}>
            Purchase insurance for this flight (upto 1 ether). If the flight is delayed
            due to the Airline, you will get paid 1.5 times your fee.
          </p>
          <form onSubmit={handleInsurance}>
            <input
              className={styles.input}
              type="number"
              value={numberInput}
              onChange={numberInputHandler}
              placeholder="eth.. 0.1234"
            />
            <button className={styles.buttonSubmit}>Buy</button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default FlightItemModal;
