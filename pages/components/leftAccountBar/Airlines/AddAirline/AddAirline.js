import { useState, useContext } from 'react';
import ContractContext from '../../../store/fsControl-context';
import styles from './AddAirline.module.css';
import Modal from '../../../UI/Modal';
import fAddress from '../../../../utils/fAddress';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const AddAirline = (props) => {
  //// VARIABLES ////
  const message = useContext(ContractContext);
  const accounts = props.freeAccounts;
  const airlines = props.airlines;
  const [nameInput, setnameInput] = useState('');
  const [airline, setAirline] = useState('Select an address');

  //// CLICK EVENTS ////

  // Update Current Form Select Selection //
  const handleAddressChange = (e) => {
    setAirline(() => e.target.value);
  };

  // Update change of name input //
  const addressInputHandler = (event) => {
    setnameInput(event.target.value);
  };

  //// FORM SUBMISSION - PROCESS ADD-AIRLINE ////
  const addAirline = (e) => {
    e.preventDefault();
    if (airline.trim() !== 'Select an address' && nameInput.trim() !== '') {
      let duplicate = false;
      for (const airline of airlines) {
        if (airline.name === nameInput.trim()) {
          duplicate = true;
          break;
        }
      }
      if (!duplicate) props.onSubmitAirline({ address: airline, name: nameInput.trim() });
      else message.onSetMessage('That name is already taken');
    } else {
      message.onSetMessage('Please complete all fields.');
    }
  };

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <Modal onClick={props.onHideModal}>
      <div className={styles.container}>
        <h3 className={styles.head}>Add Airline</h3>

        {/* FORM */}
        <form onSubmit={addAirline}>
          <div className={styles.formInput}>
            <div className={styles.nameInput}>
              <label htmlFor="name-Field" className={styles.label}>
                Choose a name:
              </label>
              <input
                className={styles.input}
                id="name-field"
                type="text"
                value={nameInput}
                onChange={addressInputHandler}
                placeholder="Airline..."
              />
            </div>
            <div className={styles.selectInput}>
              <label className={styles.label}>Select an address:</label>
              <select className={styles.select} onChange={handleAddressChange}>
                <option value="Select an address"> Select an address </option>
                {accounts.map((account) => (
                  <option key={account} value={account}>
                    {fAddress(account, 7)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.buttons}>
            <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
              Add Airline
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={props.onHideModal}
            >
              Cancel
            </button>
          </div>
        </form>
        {/* END OF FORM */}
      </div>
    </Modal>
  );
};

export default AddAirline;
