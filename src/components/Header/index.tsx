import { CSSProperties } from 'react';
import styles from './header.module.scss';

interface Props {
  style?: CSSProperties;
}

export default function Header({ style }: Props) {
  return (
    <header className={styles.headerContainer} style={style}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="spacetraveling" />
      </div>
    </header>
  );
}
