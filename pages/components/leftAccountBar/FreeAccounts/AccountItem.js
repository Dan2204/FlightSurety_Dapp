import { useContext } from 'react';
import ContractContext from '../../store/fsControl-context';
import styles from './AccountItem.module.css';
import tooltip from '../../UI/Tooltip.module.css';
import fAddress from '../../../utils/fAddress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const AccountItem = (props) => {
  //// VARIABLES ////
  const message = useContext(ContractContext);
  const address = props.account;
  const selectedAccount = props.selectedAccount;

  //// SELECT CLICKED ADDRESS ////
  const freeAccountHandler = () => {
    props.onAccount({
      address: address,
      isFreeAccount: true,
      isAirline: false,
      isPassenger: false,
    });
  };

  //// COPY ADDRESS TO CLIPBOARD ////
  const copyHandler = () => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(address)
        .then(() => {
          message.onSetMessage(`${address} Copied to clipboard`);
        })
        .catch((err) => {
          console.log('Could not copy');
          console.log(err);
        });
    }
  };

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <li className={styles.itemBody}>
      {/* ADDRESS */}
      <p
        className={selectedAccount.address === address ? styles.selected : styles.address}
        onClick={freeAccountHandler}
      >
        {fAddress(address, 3)}
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
  );
};

export default AccountItem;
