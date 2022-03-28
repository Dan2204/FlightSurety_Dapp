import { useState, useContext } from 'react';
import styles from './LeftAccountBar.module.css';

import AirlineItem from './Airlines/AirlineItem';
import AccountItem from './FreeAccounts/AccountItem';
import PassengerItem from './Passengers/PassengerItem';
import AddAirline from './Airlines/AddAirline/AddAirline';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import ContractContext from '../store/fsControl-context';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const LeftAccountBar = (props) => {
  //// VARIABLES ////
  const message = useContext(ContractContext);
  const accounts = props.accounts;
  const selectedAccount = props.selectedAccount;
  const used = props.usedAccounts;
  const airlines = props.airlines;
  const passengers = props.passengers;
  const flightList = props.flightList;

  const [showItemModal, setShowItemModal] = useState(false);
  const freeAccounts = accounts.filter((account) => used.indexOf(account) === -1);
  let freeAccountList = null;
  let airlineList = null;
  let passengerList = null;

  /* ***************************
   *    COMPONENT FUNCTIONS    *
   *************************** */

  // Hide Add Airline Modal //
  const hideModalHandler = () => setShowItemModal(false);

  // Add Airline (Page add Button clicked) //
  const addAirlineHandler = () => {
    const selected = airlines.filter(
      (airline) => airline.airline === selectedAccount.address
    )[0];
    const participatingCount = airlines.filter(
      (airline) => airline.canParticipate
    ).length;
    if (selectedAccount.isAirline && selected.canParticipate) {
      if (participatingCount >= 4 || selectedAccount.isOwner) {
        setShowItemModal(true);
      } else {
        message.onSetMessage('4 participating airlines required');
      }
    } else {
      message.onSetMessage('Not Authorized');
    }
  };

  //// CLICK EVENTS ////

  // Flight Status Handler //
  const flightStatusHandler = (flightToCheck) => {
    props.onCheckStatus(flightToCheck);
  };

  // Change Selected Account //
  const accountHandler = (account) => {
    props.changeAccount(account);
  };

  // Pay 10 Ether //
  const payHandler = (account) => {
    props.onMakePayment(account);
  };

  // Collect Owed Insurance //
  const collectInsuranceHandler = (data) => {
    props.onCollectOwed(data);
  };

  // Add Airline //
  const addAirline = (newAirline) => {
    hideModalHandler();
    props.onAddAirline(newAirline);
  };

  /* ************************************
   *    COMPONENT LIST CONFIGURATION    *
   ************************************ */

  //// AIRLINE LIST ////
  if (airlines) {
    airlineList =
      airlines.length < 1
        ? null
        : airlines.map((airline) => {
            return (
              <AirlineItem
                key={airline.airline}
                airlineAccount={airline}
                selectedAccount={selectedAccount}
                onAccount={accountHandler}
                onSubmitPayment={payHandler}
              />
            );
          });
  }

  //// PASSENGER LIST ////
  if (passengers) {
    passengerList =
      passengers.length < 1
        ? null
        : passengers.map((_, i, passengers) => {
            const passenger = passengers[passengers.length - 1 - i];
            return (
              <PassengerItem
                key={passenger.flightHash + passenger.customerAddress}
                flight={
                  flightList.filter(
                    (flight) => flight.flightNumber === passenger.flightNumber
                  )[0]
                }
                passengerAccount={passenger}
                selectedAccount={selectedAccount}
                onAccount={accountHandler}
                onCheckStatus={flightStatusHandler}
                onCollectOwed={collectInsuranceHandler}
              />
            );
          });
  }

  //// FREE ACCOUNT LIST ////
  if (freeAccounts) {
    freeAccountList =
      freeAccounts.length < 1
        ? null
        : freeAccounts.map((account) => {
            return (
              <AccountItem
                key={account}
                account={account}
                selectedAccount={selectedAccount}
                onAccount={accountHandler}
              />
            );
          });
  }

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <>
      {/* ADD AIRLINE MODAL */}
      {showItemModal && (
        <AddAirline
          freeAccounts={freeAccounts}
          airlines={airlines}
          onHideModal={hideModalHandler}
          onSubmitAirline={addAirline}
        />
      )}

      <div className={styles.content}>
        {/* AIRLINE LIST SECTION */}
        <section className={styles.accountContent}>
          <div className={styles.sectionHead}>
            <h3 className={styles.headText}>
              Airlines ({airlineList ? airlineList.length : '0'})
              {/* ADD NEW AIRLINE ICON */}
              <span className={styles.iconS} onClick={addAirlineHandler}>
                <FontAwesomeIcon icon={faPlusCircle} style={{ fontSize: 22 }} />
              </span>
            </h3>
          </div>
          <div className={styles.accountList}>
            <ul className={styles.listBody}>
              {airlineList || <li className={styles.empty}>Loading Accounts</li>}
            </ul>
          </div>
        </section>

        {/* PASSENGER LIST SECTION */}
        <section className={styles.accountContent}>
          <div className={styles.sectionHead}>
            <h3 className={styles.headText}>
              Passengers ({passengerList ? passengerList.length : '0'})
            </h3>
          </div>
          <div className={styles.accountList}>
            <ul className={styles.listBody}>
              {passengerList || <li className={styles.empty}>Empty</li>}
            </ul>
          </div>
        </section>

        {/* FREE ACCOUNTS SECTION */}
        <section className={`${styles.accountContent} ${styles.last}`}>
          <div className={styles.sectionHead}>
            <h3 className={styles.headText}>
              Available ({freeAccountList ? freeAccountList.length : '0'})
            </h3>
          </div>
          <div className={styles.accountList}>
            <ul className={styles.listBody}>
              {freeAccountList || <li className={styles.empty}>Loading Accounts</li>}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
};

export default LeftAccountBar;
