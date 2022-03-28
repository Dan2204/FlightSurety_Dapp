import styles from './OracleItem.module.css';
import fAddress from '../../utils/fAddress';

/* ***********************
 *    COMPONENT START    *
 *********************** */
const OracleItem = (props) => {
  const address = props.oracle.oracle;
  const indexes = props.oracle.indexes;
  const activeOracles = props.activeOracles;

  /* *********************
   *    SCREEN RENDER    *
   ********************* */
  return (
    <li className={styles.itemBody}>
      <p
        className={`${styles.address} ${
          activeOracles.includes(address) && styles.active
        }`}
      >
        {fAddress(address, 6)}
        <span className={styles.tooltiptext}>
          [ {indexes[0]}, {indexes[1]}, {indexes[2]} ]
        </span>
      </p>
    </li>
  );
};

export default OracleItem;
