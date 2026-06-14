import { useState } from 'react';
import styles from './DebugPanel.module.css';

export default function DebugPanel({ onAddSteps, onJumpTime, onJumpDays, onReset }) {
  const [steps, setSteps] = useState(100);
  const [hours, setHours] = useState(1);
  const [days, setDays] = useState(1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>Debug Panel</div>

      <div className={styles.row}>
        <label>Steps:</label>
        <input
          type="number"
          min="1"
          value={steps}
          onChange={(e) => setSteps(Number(e.target.value))}
          className={styles.input}
        />
        <button
          className={styles.btn}
          onClick={() => onAddSteps(steps)}
        >
          Add
        </button>
      </div>

      <div className={styles.row}>
        <label>Jump:</label>
        <input
          type="number"
          min="1"
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className={styles.input}
        />
        <button
          className={styles.btn}
          onClick={() => onJumpTime(hours)}
        >
          +{hours}h
        </button>
      </div>

      <div className={styles.row}>
        <label>Fast:</label>
        <input
          type="number"
          min="1"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className={styles.input}
        />
        <button
          className={styles.btn}
          onClick={() => onJumpDays(days)}
        >
          +{days}d
        </button>
      </div>

      <div className={styles.row}>
        <button className={`${styles.btn} ${styles.danger}`} onClick={onReset}>
          Reset Game
        </button>
      </div>
    </div>
  );
}
