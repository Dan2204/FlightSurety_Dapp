import styles from './OracleAccountBar.module.css';
import OracleItem from './OracleItem';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const OracleAccountBar = (props) => {
  const oracles = props.oracleList;
  let oracleList = null;

  /* ************************************
   *    COMPONENT LIST CONFIGURATION    *
   ************************************ */

  //// ORACLE LIST ////
  if (oracles) {
    oracleList =
      oracles.length < 1
        ? null
        : oracles.map((oracle) => {
            return (
              <OracleItem
                key={oracle.key}
                oracle={oracle}
                activeOracles={props.activeOracles}
              />
            );
          });
  }

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <div className={styles.content}>
      <section className={styles.accountContent}>
        <div className={styles.sectionHead}>
          <h3 className={styles.headText}>
            Oracles ({oracleList ? oracleList.length : '0'})
          </h3>
        </div>
        <div className={styles.oracleList}>
          <ul className={styles.listBody}>
            {oracleList || <li className={styles.noOracles}>Empty</li>}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default OracleAccountBar;
