import { useGameLoop } from "./hooks/useGameLoop.js";
import DebugPanel from "./components/DebugPanel.jsx";
import styles from "./App.module.css";

const TAPS_TO_CURE = 100;
const TAPS_FOR_BONUS = 10;

function getHeart(state) {
  if (state.health === "dead")
    return { src: "/images/ui/heart_dead.png", cls: styles.heartBlack };
  if (state.health === "sick")
    return { src: "/images/ui/heart_sick.png", cls: styles.heartYellow };
  return { src: "/images/ui/heart_health.png", cls: styles.heartRed };
}

export default function App() {
  const { state, pet, buy, addSteps, reset, jumpTime, jumpDays } =
    useGameLoop();
  if (!state) return null;

  const isDead = state.health === "dead";
  const isSick = state.health === "sick";
  const heart = getHeart(state);

  const showFood = !isDead && state.hunger < 100;
  const showMedicine = isSick;
  const showToy = !isDead && state.joy < 100;
  const showBottomBar = showFood || showMedicine || showToy;

  const tapGoal = isSick ? TAPS_TO_CURE : TAPS_FOR_BONUS;
  const showTapInfo = !isDead && (state.tapCounter > 0 || isSick);

  const imageSrc = state.age === 0
    ? `/images/egg/egg_${state.eggIndex}.png`
    : `/images/koala/koala_${state.age}.png`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.watch}>
        <img className={styles.bg} src="/images/bg.png" alt="" />
        <img
          className={`${styles.koala} ${isDead ? styles.dead : ""} ${isSick ? styles.sick : ""}`}
          src={imageSrc}
          alt=""
          onClick={() => {
            if (!isDead) pet();
          }}
        />

        <div className={styles.topLeft}>
          <div className={styles.stat}>
            <img className={styles.statIcon} src="/images/ui/food.png" alt="" />
            <span className={styles.statVal}>{Math.round(state.hunger)}%</span>
          </div>
          <div className={styles.stat}>
            <img className={styles.statIcon} src="/images/ui/toy.png" alt="" />
            <span className={styles.statVal}>{Math.round(state.joy)}%</span>
          </div>
        </div>

        {isDead ? (
          <div className={styles.deadCenter}>
            <div className={styles.deadLabel}>Your koala has passed away</div>
            <button className={styles.restartBtn} onClick={reset}>
              Start Again
            </button>
          </div>
        ) : (
          <div
            className={styles.topCenter}
            onClick={() => buy("medicine")}
            title="Buy medicine"
          >
            <img
              className={`${styles.heartIcon} ${heart.cls === styles.heartYellow ? styles.heartbeat : ""}`}
              src={heart.src}
              alt=""
            />
          </div>
        )}

        <div className={styles.topRight}>
          <div className={styles.ageLabel}>Day</div>
          <div className={styles.ageValue}>{state.age}</div>
        </div>

        <div className={styles.coins}>
          <img className={styles.coinIcon} src="/images/ui/coin.png" alt="" />
          {state.coins}
        </div>

        {showTapInfo && (
          <div className={styles.tapOverlay}>
            {state.tapCounter}/{tapGoal} taps
          </div>
        )}

        {showBottomBar && (
          <div className={styles.bottomBar}>
            {showFood && (
              <button
                className={styles.bottomBtn}
                onClick={() => buy("food")}
                disabled={state.coins < 10}
              >
                <img
                  className={styles.btnIcon}
                  src="/images/ui/food.png"
                  alt="Food"
                />
                <span className={styles.btnCost}>10</span>
              </button>
            )}
            {showMedicine && (
              <button
                className={styles.bottomBtn}
                onClick={() => buy("medicine")}
                disabled={state.coins < 30}
              >
                <img
                  className={styles.btnIcon}
                  src="/images/ui/medicine.png"
                  alt="Medicine"
                />
                <span className={styles.btnCost}>30</span>
              </button>
            )}
            {showToy && (
              <button
                className={styles.bottomBtn}
                onClick={() => buy("toy")}
                disabled={state.coins < 10}
              >
                <img
                  className={styles.btnIcon}
                  src="/images/ui/toy.png"
                  alt="Toy"
                />
                <span className={styles.btnCost}>10</span>
              </button>
            )}
          </div>
        )}
      </div>

      <DebugPanel
        onAddSteps={addSteps}
        onJumpTime={jumpTime}
        onJumpDays={jumpDays}
        onReset={reset}
      />
    </div>
  );
}
