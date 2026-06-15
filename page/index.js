import hmUI from "@zos/ui";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../utils/constants.js";
import { createGameEngine } from "../shared/gameEngine.js";
import { TICK_INTERVAL_MS } from "../shared/constants.js";
import { storageAdapter } from "../utils/storageAdapter.js";
import { sensorAdapter } from "../utils/sensorAdapter.js";
import { timeAdapter } from "../utils/timeAdapter.js";
import { Vibrator } from "@zos/sensor";
import { setEngine } from "../shared/engineRegistry.js";

let engine = null;
let _vib = null;
let _widgets = [];
let _tickTimer = null;

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

function getHeartSrc(state) {
  if (state.health === "dead") return "ui/heart_dead.png";
  if (state.health === "sick") return "ui/heart_sick.png";
  return "ui/heart_health.png";
}

Page({
  build() {
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

    _widgets.forEach((w) => hmUI.deleteWidget(w));
    _widgets = [];

    _widgets.push(
      hmUI.createWidget(hmUI.widget.IMG, {
        x: 0,
        y: 0,
        w: width,
        h: height,
        src: "bg.png",
      }),
    );

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
      _widgets.push(
        hmUI.createWidget(hmUI.widget.TEXT, {
          x: 0,
          y: Math.floor(height / 2) - 50,
          w: width,
          h: 40,
          text: "Your koala has passed away",
          text_size: 24,
          color: 0xf44336,
          align_h: hmUI.align.CENTER_H,
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
            this.render();
          },
        }),
      );
      return;
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
    _widgets.push(
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: 86,
        y: 30,
        w: 62,
        h: 58,
        text: `${hungerPct}%`,
        text_size: 24,
        color: 0xffffff,
        align_h: hmUI.align.LEFT,
        align_v: hmUI.align.CENTER_V,
      }),
    );

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
    _widgets.push(
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: 86,
        y: 94,
        w: 62,
        h: 58,
        text: `${joyPct}%`,
        text_size: 24,
        color: 0xffffff,
        align_h: hmUI.align.LEFT,
        align_v: hmUI.align.CENTER_V,
      }),
    );

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

    _widgets.push(
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: width - 114,
        y: 28,
        w: 82,
        h: 68,
        radius: 14,
        color: OVERLAY_COLOR,
      }),
    );
    _widgets.push(
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: width - 114,
        y: 30,
        w: 82,
        h: 28,
        text: "Age",
        text_size: 18,
        color: 0xaaaaaa,
        align_h: hmUI.align.CENTER_H,
      }),
    );
    _widgets.push(
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: width - 114,
        y: 56,
        w: 82,
        h: 36,
        text: `${state.age}`,
        text_size: 28,
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
    );

    _widgets.push(
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: width - 94,
        y: Math.floor(height / 2) - 32,
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

    const tapGoal = isSick ? 100 : 10;
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
      _widgets.push(
        hmUI.createWidget(hmUI.widget.BUTTON, {
          x,
          y: btnY,
          w: btnW,
          h: btnH,
          text: `Food 10`,
          radius: 14,
          color: 0xffffff,
          normal_color: 0x4caf50,
          text_size: 22,
          press_color: 0x2e7d32,
          click_func: () => {
            if (engine.buy("food")) vibrate();
            this.render();
          },
        }),
      );
      btnIdx++;
    }

    if (showMedicine) {
      const x = 8 + btnIdx * (btnW + 8);
      _widgets.push(
        hmUI.createWidget(hmUI.widget.BUTTON, {
          x,
          y: btnY,
          w: btnW,
          h: btnH,
          text: `Med 30`,
          radius: 14,
          color: 0xffffff,
          normal_color: 0xf44336,
          text_size: 22,
          press_color: 0xc62828,
          click_func: () => {
            if (engine.buy("medicine")) vibrate();
            this.render();
          },
        }),
      );
      btnIdx++;
    }

    if (showToy) {
      const x = 8 + btnIdx * (btnW + 8);
      _widgets.push(
        hmUI.createWidget(hmUI.widget.BUTTON, {
          x,
          y: btnY,
          w: btnW,
          h: btnH,
          text: `Toy 10`,
          radius: 14,
          color: 0xffffff,
          normal_color: 0x2196f3,
          text_size: 22,
          press_color: 0x1565c0,
          click_func: () => {
            if (engine.buy("toy")) vibrate();
            this.render();
          },
        }),
      );
      btnIdx++;
    }
  },
});
