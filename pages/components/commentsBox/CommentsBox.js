import { useContext } from 'react';
import styles from './CommentsBox.module.css';
import fAddress from '../../utils/fAddress';
import ContractContext from '../store/fsControl-context';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const CommentsBox = (props) => {
  const message = useContext(ContractContext);
  const pending = props.pendingConsensus;
  const votesRequired = props.votesRequired;

  /* ***************************
   *    COMPONENT FUNCTIONS    *
   *************************** */

  /* ************************************
   *    COMPONENT LIST CONFIGURATION    *
   ************************************ */
  let pendingList = null;
  if (pending) {
    pendingList =
      pending.length < 1
        ? null
        : pending.map((arrayList) => {
            return (
              <li className={styles.li} key={arrayList[0]}>
                <p className={styles.p}>Airline: {fAddress(arrayList[0])}</p>
                <p className={styles.p}>
                  votes: {arrayList[1]} / {votesRequired}
                </p>
              </li>
            );
          });
  }

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <main className={`container ${styles.contentContainer} mt-5`}>
      <div className={styles.content}>
        {/* MESSAGES */}
        <div className={styles.messages}>
          <h4
            className={`${styles.currentMessage} ${
              message.currentMessage !== '' && styles.activeMessage
            }`}
          >
            {' '}
            {message.currentMessage}{' '}
          </h4>
        </div>

        <div className={styles.splitSection}>
          {/* PENDING AIRLINES */}
          <div className={styles.consensus}>
            <h3 className={styles.h3}>
              Pending Airlines ({pendingList ? pendingList.length : '0'})
            </h3>
            <div className={styles.consensusList}>
              <ul className={styles.ul}>
                {pendingList || (
                  <li className={styles.noPending}>No Pending Airlines Yet.</li>
                )}
              </ul>
            </div>
          </div>

          {/* INFORMATION */}
          <div className={styles.helpBoard}>
            <h3 className={styles.h3I}>Information</h3>
            <ul className={styles.helpList}>
              <li className={styles.helpP}>
                Select an address from the bar on the left.
              </li>
              <li className={styles.helpP}>Only airlines can add airlines.</li>
              <li className={styles.helpP}>
                An airline must Pay 10 eth before participating in registration.
              </li>
              <li className={styles.helpP}>
                Only contract owner can register airlines until there are 4 registered
                airlines.
              </li>
              <li className={styles.helpP}>
                Only passengers or available addresses can check flights.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CommentsBox;
