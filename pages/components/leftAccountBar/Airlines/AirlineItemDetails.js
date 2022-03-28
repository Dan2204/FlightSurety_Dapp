import { useContext } from 'react';
import ContractContext from '../../store/fsControl-context';

import styles from './AirlineItemDetails.module.css';
import Modal from '../../UI/Modal';
import fAddress from '../../../utils/fAddress';

/* *****************************
 *    COMPONENT MODAL START    *
 ***************************** */
const AirlineItemDetails = (props) => {
  //// VARIABLES ////
  const message = useContext(ContractContext);
  const airline = props.airline;
  const selectedAccount = props.selectedAccount;

  //// CLICK EVENTS ////

  // Pay 10 Ether //
  const payHandler = () => {
    if (airline.airline === props.selectedAccount.address) {
      props.onSubmitPayment(airline);
    } else {
      message.onSetMessage('Please select your account');
      // console.log(airline.airline, props.selectedAccount.address);
      console.warn('Please select your account.');
    }
  };

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <Modal onClick={props.onHideModal}>
      <div className={styles.container}>
        <h3 className={styles.h3}>{airline.name}</h3>
        <span className={styles.close} onClick={props.onHideModal}>
          X
        </span>
        <p>
          Airline: <span className={styles.hero}>{fAddress(airline.airline, 8)}</span>
        </p>
        <p className={airline.canParticipate ? styles.relative : styles.relative2}>
          {airline.canParticipate || (
            <span className={airline.canParticipate || styles.requirePay}></span>
          )}
          Participating:{' '}
          <span className={`${styles.hero} ${airline.canParticipate || styles.heroPay}`}>
            {airline.canParticipate ? 'Yes' : 'No'}
          </span>
          {!airline.canParticipate && airline.airline !== selectedAccount.address ? (
            <span className={styles.payNotSelected}>Select your account...</span>
          ) : (
            !airline.canParticipate && (
              <span className={styles.pay} onClick={payHandler}>
                Click here to pay funding
              </span>
            )
          )}
        </p>
        <p>
          Registered:{' '}
          <span className={styles.hero}>{airline.isRegistered ? 'Yes' : 'No'}</span>
        </p>
        <p>
          Individual Payouts:{' '}
          <span className={styles.hero}>{airline.numberOfPayouts}</span>
        </p>
      </div>
    </Modal>
  );
};

export default AirlineItemDetails;
