import { useState, useContext } from 'react';
import ContractContext from '../../store/fsControl-context';

import AirlineItemDetails from './AirlineItemDetails';

import styles from './AirlineItem.module.css';
import tooltip from '../..//UI/Tooltip.module.css';

import fAddress from '../../../utils/fAddress';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faInfo } from '@fortawesome/free-solid-svg-icons';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const AirlineItem = (props) => {
  //// VARIABLES ////
  const message = useContext(ContractContext);
  const selectedAccount = props.selectedAccount;
  const airline = props.airlineAccount;
  const [showItemModal, setShowItemModal] = useState(false);

  /* ***************************
   *    COMPONENT FUNCTIONS    *
   *************************** */

  // Show/Hide Airline Details Modal //
  const showModalHandler = () => setShowItemModal(true);
  const hideModalHandler = () => setShowItemModal(false);

  //// CLICK EVENTS ////

  // Change Selected Account //
  const accountHandler = () => {
    props.onAccount({
      address: airline.airline,
      isAirline: true,
      isPassenger: false,
      isFreeAccount: false,
    });
  };

  // Pay 10 Ether //
  const payHandler = (account) => {
    hideModalHandler();
    props.onSubmitPayment(account);
  };

  //// COPY ADDRESS TO CLIPBOARD ////
  const copyHandler = (e) => {
    const address = airline.airline;
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(address)
        .then(() => {
          // message.onSetMessage(`${fAddress(address)} has been copied to the clipboard`);
          message.onSetMessage(`${address} Copied to clipboard`);
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
        <AirlineItemDetails
          selectedAccount={selectedAccount}
          airline={airline}
          onHideModal={hideModalHandler}
          onSubmitPayment={payHandler}
        />
      )}

      {/* AIRLINE ADDRESS WITH ICONS */}
      <li className={styles.itemBody}>
        {/* INFO ICON */}
        <span
          className={`${styles.iconS} ${airline.canParticipate || styles.requirePay}`}
          onClick={showModalHandler}
        >
          <FontAwesomeIcon icon={faInfo} style={{ fontSize: 17 }} />
        </span>

        {/* ADDRESS */}
        <p
          className={
            selectedAccount.address === airline.airline ? styles.selected : styles.address
          }
          onClick={accountHandler}
        >
          {fAddress(airline.airline)}
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

export default AirlineItem;
