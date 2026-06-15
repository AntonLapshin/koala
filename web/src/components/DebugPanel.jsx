import { useState } from "react";
import styles from "./DebugPanel.module.css";
import { timeAdapter } from "../../../utils/timeAdapter.js";
import { sensorAdapter } from "../../../utils/sensorAdapter.js";
import { getEngine } from "../../../shared/engineRegistry.js";

export default function DebugPanel({ onRender }) {
  const [steps, setSteps] = useState(100);
  const [hours, setHours] = useState(1);
  const [days, setDays] = useState(1);

  function handleAddSteps() {
    sensorAdapter.add(steps);
    const engine = getEngine();
    if (engine) engine.addSteps(steps);
    onRender();
  }

  function handleJumpTime() {
    timeAdapter.addHours(hours);
    const engine = getEngine();
    if (engine) engine.tick(hours);
    onRender();
  }

  function handleJumpDays() {
    const hrs = days * 24;
    timeAdapter.addHours(hrs);
    const engine = getEngine();
    if (engine) engine.tick(hrs);
    onRender();
  }

  function handleReset() {
    sensorAdapter.reset();
    timeAdapter.resetOffset();
    const engine = getEngine();
    if (engine) engine.reset();
    onRender();
  }

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
        <button className={styles.btn} onClick={handleAddSteps}>
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
        <button className={styles.btn} onClick={handleJumpTime}>
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
        <button className={styles.btn} onClick={handleJumpDays}>
          +{days}d
        </button>
      </div>

      <div className={styles.row}>
        <button
          className={`${styles.btn} ${styles.danger}`}
          onClick={handleReset}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
