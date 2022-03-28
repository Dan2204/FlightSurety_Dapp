import fAddress from '../../utils/fAddress';

import 'bootstrap/dist/css/bootstrap.css';
import styles from './NavBar.module.css';
// import tooltip from '../UI/Tooltip.module.css';

const NavBar = (props) => {
  const selected = props.selectedAccount;
  const types = [];
  for (const element in selected) {
    if (element !== 'address') {
      if (selected[element]) types.push(element.substring(2));
    }
  }

  return (
    <nav className={`navbar navbar-dark fixed-top ${styles.navBarBg}`}>
      <div className={`container-fluid ${styles.customContainer}`}>
        {/* BRAND */}
        <a className={`navbar-brand ${styles.brand}`} href="#">
          FlightSurety <span className={styles.contract}></span>
        </a>

        {/* INFO_SECTION */}
        <div className={`${styles.info}`}>
          <div className={styles.address}>
            {/* CURRENT SELECTED ADDRESS */}
            <p className={styles.navInfo}>Selected Address: </p>

            {/* ADDRESS WITH TOOLTIP START */}
            <span className={styles.tooltip}>
              <span className={styles.infoText}>
                {fAddress(props.selectedAccount.address, 6)}
              </span>
              <span className={styles.ttBottom}>
                <p>{props.selectedAccount.address}</p>
              </span>
            </span>
            {/* TOOLTIP END */}
          </div>
          {/* TYPE OF CURRENT SELECTED ADDRESS */}
          <p className={styles.navInfo}>
            Type: <span className={styles.infoText}>{types.join(', ')}</span>
          </p>
        </div>
        {/* -- END OF INFO SECTION -- */}
      </div>
    </nav>
  );
};

export default NavBar;
