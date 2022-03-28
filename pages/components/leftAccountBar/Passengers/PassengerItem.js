import { useState, useContext } from 'react';
import ContractContext from '../../store/fsControl-context';
import PassengerItemDetails from './PassengerItemDetails';
import styles from './PassengerItem.module.css';
import tooltip from '../../UI/Tooltip.module.css';
import fAddress from '../../../utils/fAddress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faInfo } from '@fortawesome/free-solid-svg-icons';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const PassengerItem = (props) => {
  //// VARIABLES ////
  const message = useContext(ContractContext);
  const selectedAccount = props.selectedAccount;
  const passenger = props.passengerAccount;
  const [showItemModal, setShowItemModal] = useState(false);

  /* ***************************
   *    COMPONENT FUNCTIONS    *
   *************************** */

  // Show/Hide Airline Details Modal //
  const showModalHandler = () => setShowItemModal(true);
  const hideModalHandler = () => setShowItemModal(false);

  //// CLICK EVENTS ////

  // Flight Status Handler //
  const flightStatusHandler = (flightToCheck) => {
    hideModalHandler();
    props.onCheckStatus(flightToCheck);
  };

  // Change Selected Account //
  const accountHandler = () => {
    props.onAccount({
      address: passenger.customerAddress,
      isPassenger: true,
      isFreeAccount: false,
      isAirline: false,
    });
  };

  // Collect Owed Insurance //
  const collectInsuranceHandler = (data) => {
    hideModalHandler();
    props.onCollectOwed(data);
  };

  //// COPY ADDRESS TO CLIPBOARD ////
  const copyHandler = (e) => {
    const address = passenger.customerAddress;
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(address)
        .then(() => {
          message.onSetMessage(`${address} - Copied to clipboard`);
          console.log(`${address} has been copied to the clipboard`);
        })
        .catch((err) => {
          message.onSetMessage("Couln't copy, check console...");
          console.error(err);
        });
    }
  };

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <>
      {/* SHOW AIRLINE DETAILS MODAL */}
      {showItemModal && (
        <PassengerItemDetails
          selectedAccount={selectedAccount}
          passenger={passenger}
          flight={props.flight}
          onCollectOwed={collectInsuranceHandler}
          onHideModal={hideModalHandler}
          onCheckStatus={flightStatusHandler}
        />
      )}

      {/* PASSENGER ADDRESS WITH ICONS */}
      <li className={styles.itemBody}>
        {/* INFO ICON */}
        <span
          className={`${styles.iconS} ${+passenger.owed > 0 && styles.isOwed}`}
          onClick={showModalHandler}
        >
          <FontAwesomeIcon icon={faInfo} style={{ fontSize: 17 }} />
        </span>

        {/* ADDRESS */}
        <p
          className={
            selectedAccount.address === passenger.customerAddress
              ? styles.selected
              : styles.address
          }
          onClick={accountHandler}
        >
          {fAddress(passenger.customerAddress)}
        </p>

        {/* COPY ICON */}
        <span className={tooltip.tooltip}>
          <span className={styles.icon} onClick={copyHandler}>
            <FontAwesomeIcon icon={faCopy} style={{ fontSize: 15 }} />
          </span>
          <span className={tooltip.bottom}>
            <p>copy</p>
          </span>
        </span>
      </li>
    </>
  );
};

export default PassengerItem;
