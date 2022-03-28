import React from 'react';

import fAddress from '../../utils/fAddress';
import styles from './Footer.module.css';

const Footer = (props) => {
  return (
    <footer className={styles.footer}>
      <span className={styles.tooltip}>
        <p>
          App Contract Owner:{' '}
          <span className={styles.address}>{fAddress(props.fsAppOwner, 5)}</span>
        </p>
        <span className={styles.ttBottom}>
          <p>{props.fsAppOwner}</p>
        </span>
      </span>
      <span className={styles.tooltip}>
        <p>
          Data Contract Owner:{' '}
          <span className={styles.address}>{fAddress(props.fsDataOwner, 5)}</span>
        </p>
        <span className={styles.ttBottom}>
          <p>{props.fsDataOwner}</p>
        </span>
      </span>
      <p>
        Contract Operational Status:{' '}
        <span className={styles.address}>
          {props.dataOpState ? 'Operational' : 'Paused'}
        </span>
      </p>
    </footer>
  );
};

export default Footer;
