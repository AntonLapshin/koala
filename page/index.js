import hmUI from "@zos/ui";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../utils/constants.js";
import { createGameEngine } from "../shared/gameEngine.js";
import {
  TICK_INTERVAL_MS,
  CRITICAL_HUNGER_THRESHOLD,
  CRITICAL_JOY_THRESHOLD,
  NOTIFY_COOLDOWN_MS,
  STORE_FOOD_COST,
  STORE_TOY_COST,
  STORE_MEDICINE_COST,
} from "../shared/constants.js";
import { storageAdapter } from "../utils/storageAdapter.js";
import { sensorAdapter } from "../utils/sensorAdapter.js";
import { timeAdapter } from "../utils/timeAdapter.js";
import { Vibrator } from "@zos/sensor";
import { setEngine } from "../shared/engineRegistry.js";
import { formatDate } from "../utils/formatDate.js";
import { getTimeOfDay } from "../utils/getTimeOfDay.js";
import { getWeather } from "../utils/getWeather.js";
import { getHeartSrc } from "../utils/getHeartSrc.js";
import { getBgSrc } from "../utils/getBgSrc.js";
import { isCriticalStatus } from "../utils/isCriticalStatus.js";
import { getNotificationMessage } from "../utils/getNotificationMessage.js";
import { renderRescueScreen } from "./rescue.js";

let engine = null;
let _vib = null;
let _widgets = [];
let _tickTimer = null;
let _lastNotifyTime = 0;
let _showNotify = false;
let _notifyMessage = "";
let _showStats = false;
let _showRescue = false;
let _justRescued = false;
let _page = null;

function startTickTimer(page) {
  if (_tickTimer) return;
  _tickTimer = setInterval(() => {
    if (!engine) return;
    engine.resume();
    page.render();
  }, TICK_INTERVAL_MS);
}

function stopTickTimer() {
  if (_tickTimer) {
    clearInterval(_tickTimer);
    _tickTimer = null;
  }
}

function vibrate() {
  if (!_vib) {
    try {
      _vib = new Vibrator();
    } catch (e) {
      _vib = { start() {} };
    }
  }
  try {
    _vib.start();
  } catch (e) {}
}

const KOALA_W = 224;
const KOALA_H = 300;
const OVERLAY_COLOR = 0x8c222222;

function addRectWrapper(x, y, w, h, clickHandler) {
  const rect = hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x,
    y,
    w,
    h,
    radius: 14,
    color: OVERLAY_COLOR,
  });
  if (clickHandler) {
    rect.addEventListener(hmUI.event.CLICK_DOWN, clickHandler);
  }
  _widgets.push(rect);
  return rect;
}

function addStoreItem(x, y, w, h, iconSrc, price, clickHandler) {
  addRectWrapper(x, y, w, h, clickHandler);

  const iconSize = 28;
  const coinSize = 14;
  const textW = 30;
  const gap = 8;
  const totalW = iconSize + gap + textW + gap + coinSize;
  const startX = x + Math.floor((w - totalW) / 2);
  const rowY = y + Math.floor((h - iconSize) / 2);
  const coinY = rowY + Math.floor((iconSize - coinSize) / 2);

  _widgets.push(
    hmUI.createWidget(hmUI.widget.IMG, {
      x: startX,
      y: rowY,
      w: iconSize,
      h: iconSize,
      src: iconSrc,
    }),
  );

  _widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: startX + iconSize + gap,
      y: rowY,
      w: textW,
      h: iconSize,
      text: String(price),
      text_size: 20,
      color: 0xffffff,
      align_v: hmUI.align.CENTER_V,
    }),
  );

  _widgets.push(
    hmUI.createWidget(hmUI.widget.IMG, {
      x: startX + iconSize + gap + textW,
      y: coinY,
      w: coinSize,
      h: coinSize,
      src: "ui/coin.png",
    }),
  );
}

function addProgressBar(x, y, value) {
  const pct = Math.max(0, Math.min(100, value));
  const fillW = Math.round((pct / 100) * 62);
  let color;
  if (pct > 70) {
    color = 0x00ff00;
  } else if (pct > 40) {
    color = 0xc25a2b;
  } else {
    color = 0xff0000;
  }
  _widgets.push(
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x,
      y,
      w: 62,
      h: 22,
      color: 0xffffff,
      radius: 4,
    }),
  );
  _widgets.push(
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: x + 3,
      y: y + 2,
      w: 56,
      h: 18,
      color: 0xdddddd,
      radius: 3,
    }),
  );
  _widgets.push(
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: x + 3,
      y: y + 2,
      w: Math.max(0, fillW - 6),
      h: 18,
      color,
      radius: 3,
    }),
  );
}

function checkCriticalNotification(state, nowMs) {
  if (state.health === "dead") {
    _showNotify = false;
    return;
  }

  if (
    !isCriticalStatus(state, CRITICAL_HUNGER_THRESHOLD, CRITICAL_JOY_THRESHOLD)
  ) {
    _showNotify = false;
    return;
  }

  if (nowMs - _lastNotifyTime < NOTIFY_COOLDOWN_MS) return;

  _lastNotifyTime = nowMs;
  _showNotify = true;
  _notifyMessage = getNotificationMessage(
    state,
    CRITICAL_HUNGER_THRESHOLD,
    CRITICAL_JOY_THRESHOLD,
  );

  vibrate();
}

function renderStatsScreen(state, width, height) {
  const panelX = 25;
  const panelY = 50;
  const panelW = 340;
  const panelH = 350;
  const radius = 20;

  _widgets.push(
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: panelX,
      y: panelY,
      w: panelW,
      h: panelH,
      radius,
      color: 0xee1a1a2e,
    }),
  );

  _widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: panelX,
      y: panelY + 14,
      w: panelW,
      h: 36,
      text: "Koala Stats",
      text_size: 22,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
    }),
  );

  const coinsEarned = state.coins + state.coinsSpent;
  const lines = [
    `Days Alive:      ${state.age}`,
    `Coins Earned:  ${coinsEarned}`,
    `Coins Spent:    ${state.coinsSpent}`,
    `Food Given:     ${state.totalFoodBought || 0}`,
    `Toys Played:    ${state.totalToysBought || 0}`,
    `Cured:            ${state.totalMedicineBought || 0}`,
    `Sick Days:      ${state.sickDayCount}`,
    `Steps:          ${state.totalLifetimeSteps + state.todayStepCount}`,
  ];

  const lineH = 28;
  const startY = panelY + 66;

  lines.forEach((line, i) => {
    _widgets.push(
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: panelX + 20,
        y: startY + i * lineH,
        w: panelW - 40,
        h: lineH,
        text: line,
        text_size: 19,
        color: 0xdddddd,
        align_h: hmUI.align.LEFT,
        align_v: hmUI.align.CENTER_V,
      }),
    );
  });

  const btnW = 160;
  const btnH = 46;

  _widgets.push(
    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: Math.floor((width - btnW) / 2),
      y: panelY + panelH - btnH - 12,
      w: btnW,
      h: btnH,
      text: "Back",
      radius: 20,
      color: 0xffffff,
      normal_color: 0x4caf50,
      text_size: 22,
      press_color: 0x2e7d32,
      click_func: () => {
        _showStats = false;
        _page && _page.render();
      },
    }),
  );
}

Page({
  build() {
    _page = this;
    engine = createGameEngine({
      storage: storageAdapter,
      getTime: timeAdapter.getTime,
      getSteps: sensorAdapter.getSteps,
    });
    setEngine(engine);
    engine.init();
    startTickTimer(this);
    this.render();
  },

  onResume() {
    if (engine) {
      engine.resume();
    }
    startTickTimer(this);
    this.render();
  },

  onPause() {
    stopTickTimer();
    if (engine) engine.save();
  },

  onDestroy() {
    stopTickTimer();
    if (engine) engine.save();
  },

  render() {
    const state = engine.getState();
    const { width, height } = { width: DEVICE_WIDTH, height: DEVICE_HEIGHT };
    const isDead = state.health === "dead";
    const isSick = state.health === "sick";
    const nowMs = timeAdapter.getTime();
    const hour = new Date(nowMs).getHours();
    const todayDate = formatDate(new Date(nowMs));
    const timeOfDay = getTimeOfDay(hour);
    const weather = getWeather(todayDate);

    _widgets.forEach((w) => hmUI.deleteWidget(w));
    _widgets = [];

    if (_showStats && !isDead) {
      renderStatsScreen(state, width, height);
      return;
    }

    if (_showRescue) {
      const rescueResult = engine.checkRescue(nowMs);
      renderRescueScreen(
        _widgets,
        state,
        rescueResult,
        _justRescued,
        width,
        height,
        {
          onBack: () => {
            _showRescue = false;
            _justRescued = false;
            this.render();
          },
          onRescue: () => {
            engine.recordRescue();
            engine.save();
            _justRescued = true;
            this.render();
          },
        },
      );
      return;
    }

    _widgets.push(
      hmUI.createWidget(hmUI.widget.IMG, {
        x: 0,
        y: 0,
        w: width,
        h: height,
        src: getBgSrc(timeOfDay),
      }),
    );

    if (weather === "rain") {
      _widgets.push(
        hmUI.createWidget(hmUI.widget.IMG, {
          x: 0,
          y: 0,
          w: width,
          h: height,
          src: "bg_rain.png",
        }),
      );
    }

    checkCriticalNotification(state, nowMs);

    const imageSrc =
      state.age === 0
        ? `egg/egg_${state.eggIndex}.png`
        : `koala/koala_${state.age}.png`;

    const koalaX = Math.floor((width - KOALA_W) / 2);
    const koalaY = 170;

    const koalaImg = hmUI.createWidget(hmUI.widget.IMG, {
      x: koalaX,
      y: koalaY,
      w: KOALA_W,
      h: KOALA_H,
      src: imageSrc,
    });
    _widgets.push(koalaImg);

    if (!isDead) {
      koalaImg.addEventListener(hmUI.event.CLICK_DOWN, () => {
        engine.pet();
        this.render();
      });
    }

    if (isDead) {
      const deathMsgW = 300;
      const deathMsgH = 50;
      const deathMsgX = Math.floor((width - deathMsgW) / 2);
      const deathMsgY = Math.floor(height / 2) - 50;

      _widgets.push(
        hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: deathMsgX,
          y: deathMsgY,
          w: deathMsgW,
          h: deathMsgH,
          radius: 14,
          color: OVERLAY_COLOR,
        }),
      );

      _widgets.push(
        hmUI.createWidget(hmUI.widget.TEXT, {
          x: deathMsgX,
          y: deathMsgY,
          w: deathMsgW,
          h: deathMsgH,
          text: "Your koala has passed away",
          text_size: 22,
          color: 0xffffff,
          align_h: hmUI.align.CENTER_H,
          align_v: hmUI.align.CENTER_V,
        }),
      );

      _widgets.push(
        hmUI.createWidget(hmUI.widget.BUTTON, {
          x: Math.floor((width - 160) / 2),
          y: Math.floor(height / 2) + 10,
          w: 160,
          h: 48,
          text: "Start Again",
          radius: 20,
          color: 0xffffff,
          normal_color: 0x4caf50,
          text_size: 22,
          press_color: 0x2e7d32,
          click_func: () => {
            engine.reset();
            _showStats = false;
            _showRescue = false;
            _justRescued = false;
            _showNotify = false;
            _lastNotifyTime = 0;
            this.render();
          },
        }),
      );
      return;
    }

    if (_showNotify) {
      const notifyW = width - 40;
      const notifyH = 34;
      const notifyX = 20;
      const notifyY = 68;

      _widgets.push(
        hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: notifyX,
          y: notifyY,
          w: notifyW,
          h: notifyH,
          radius: 10,
          color: 0xccb71c1c,
        }),
      );

      _widgets.push(
        hmUI.createWidget(hmUI.widget.TEXT, {
          x: notifyX,
          y: notifyY,
          w: notifyW,
          h: notifyH,
          text: `! ${_notifyMessage}`,
          text_size: 18,
          color: 0xffdddd,
          align_h: hmUI.align.CENTER_H,
          align_v: hmUI.align.CENTER_V,
        }),
      );
    }

    const hungerPct = Math.round(state.hunger);
    const joyPct = Math.round(state.joy);

    _widgets.push(
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: 24,
        y: 30,
        w: 130,
        h: 58,
        radius: 14,
        color: OVERLAY_COLOR,
      }),
    );
    _widgets.push(
      hmUI.createWidget(hmUI.widget.IMG, {
        x: 34,
        y: 35,
        w: 48,
        h: 48,
        src: "ui/food.png",
      }),
    );
    addProgressBar(86, 48, hungerPct);

    _widgets.push(
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: 24,
        y: 94,
        w: 130,
        h: 58,
        radius: 14,
        color: OVERLAY_COLOR,
      }),
    );
    _widgets.push(
      hmUI.createWidget(hmUI.widget.IMG, {
        x: 34,
        y: 99,
        w: 48,
        h: 48,
        src: "ui/toy.png",
      }),
    );

    addProgressBar(86, 112, joyPct);

    const heartX = Math.floor((width - 52) / 2);
    const heartImg = hmUI.createWidget(hmUI.widget.IMG, {
      x: heartX,
      y: 10,
      w: 52,
      h: 48,
      src: getHeartSrc(state),
    });
    _widgets.push(heartImg);

    heartImg.addEventListener(hmUI.event.CLICK_DOWN, () => {
      if (engine.buy("medicine")) {
        vibrate();
        this.render();
      }
    });

    const ageBtnW = 82;
    const ageBtnH = 68;
    const ageBtnX = width - 114;
    const ageBtnY = 28;

    const ageBtn = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: ageBtnX,
      y: ageBtnY,
      w: ageBtnW,
      h: ageBtnH,
      text: `Age ${state.age}`,
      radius: 14,
      color: 0xffffff,
      normal_color: OVERLAY_COLOR,
      text_size: 24,
      press_color: 0xaa444444,
      click_func: () => {
        _showStats = true;
        this.render();
      },
    });
    _widgets.push(ageBtn);

    const rescueBgX = 8;
    const rescueY = Math.floor(height / 2) - 32;
    const rescueBgW = 86;
    const rescueBgH = 90;

    const rescueBg = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: rescueBgX,
      y: rescueY,
      w: rescueBgW,
      h: rescueBgH,
      radius: 14,
      color: OVERLAY_COLOR,
    });
    rescueBg.addEventListener(hmUI.event.CLICK_DOWN, () => {
      _showRescue = true;
      _justRescued = false;
      this.render();
    });
    _widgets.push(rescueBg);

    const rescueIcon = hmUI.createWidget(hmUI.widget.IMG, {
      x: rescueBgX + 19,
      y: rescueY + 6,
      w: 48,
      h: 48,
      src: "ui/rescue.png",
    });
    rescueIcon.addEventListener(hmUI.event.CLICK_DOWN, () => {
      _showRescue = true;
      _justRescued = false;
      this.render();
    });
    _widgets.push(rescueIcon);

    _widgets.push(
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: rescueBgX,
        y: Math.floor(height / 2) + 24,
        w: rescueBgW,
        h: 28,
        text: `${state.rescueCount || 0}`,
        text_size: 24,
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
      }),
    );

    _widgets.push(
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: width - 94,
        y: rescueY,
        w: 82,
        h: 86,
        radius: 14,
        color: OVERLAY_COLOR,
      }),
    );
    _widgets.push(
      hmUI.createWidget(hmUI.widget.IMG, {
        x: width - 77,
        y: Math.floor(height / 2) - 28,
        w: 48,
        h: 48,
        src: "ui/coin.png",
      }),
    );
    _widgets.push(
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: width - 94,
        y: Math.floor(height / 2) + 24,
        w: 82,
        h: 28,
        text: `${state.coins}`,
        text_size: 24,
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
      }),
    );

    const tapGoal = isSick ? 100 : 30;
    if (state.tapCounter > 0 || isSick) {
      _widgets.push(
        hmUI.createWidget(hmUI.widget.TEXT, {
          x: 0,
          y: height - 78,
          w: width,
          h: 24,
          text: `${state.tapCounter}/${tapGoal} taps`,
          text_size: 18,
          color: 0xffaa44,
          align_h: hmUI.align.CENTER_H,
        }),
      );
    }

    const showFood = Math.round(state.hunger) < 100;
    const showMedicine = isSick;
    const showToy = Math.round(state.joy) < 100;
    const visible = [showFood, showMedicine, showToy].filter(Boolean).length;
    const btnW = Math.floor((width - (visible + 1) * 8) / Math.max(visible, 1));
    const btnH = 56;
    const btnY = height - btnH - 8;
    let btnIdx = 0;

    if (showFood) {
      const x = 8 + btnIdx * (btnW + 8);
      addStoreItem(x, btnY, btnW, btnH, "ui/food.png", STORE_FOOD_COST, () => {
        if (engine.buy("food")) vibrate();
        this.render();
      });
      btnIdx++;
    }

    if (showMedicine) {
      const x = 8 + btnIdx * (btnW + 8);
      addStoreItem(
        x,
        btnY,
        btnW,
        btnH,
        "ui/medicine.png",
        STORE_MEDICINE_COST,
        () => {
          if (engine.buy("medicine")) vibrate();
          this.render();
        },
      );
      btnIdx++;
    }

    if (showToy) {
      const x = 8 + btnIdx * (btnW + 8);
      addStoreItem(x, btnY, btnW, btnH, "ui/toy.png", STORE_TOY_COST, () => {
        if (engine.buy("toy")) vibrate();
        this.render();
      });
      btnIdx++;
    }
  },
});
