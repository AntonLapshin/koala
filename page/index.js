import { createGameEngine } from '../shared/gameEngine.js';
import { storageAdapter } from '../utils/storageAdapter.js';
import { sensorAdapter } from '../utils/sensorAdapter.js';
import { timeAdapter } from '../utils/timeAdapter.js';

let engine = null;

Page({
  build() {
    engine = createGameEngine({
      storage: storageAdapter,
      getTime: timeAdapter.getTime,
      getSteps: sensorAdapter.getSteps,
    });
    engine.init();
    this.render();
  },

  onResume() {
    engine = createGameEngine({
      storage: storageAdapter,
      getTime: timeAdapter.getTime,
      getSteps: sensorAdapter.getSteps,
    });
    engine.init();
    this.render();
  },

  onDestroy() {
    if (engine) engine.save();
  },

  render() {
    const state = engine.getState();
    const { width, height } = hmSetting.getDeviceInfo();
    const isDead = state.health === 'dead';
    const isSick = state.health === 'sick';

    hmUI.clear();

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      src: 'assets/bg.png',
    });

    const imageSrc = state.age === 0
      ? `assets/egg/egg_${state.eggIndex}.png`
      : `assets/koala/koala_${state.age}.png`;

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      src: imageSrc,
    });

    if (isDead) {
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: 0,
        y: Math.floor(height / 2) - 30,
        w: width,
        h: 40,
        text: 'Your koala has passed away',
        text_size: 18,
        color: 0xf44336,
        align_h: hmUI.align.CENTER_H,
      });

      hmUI.createWidget(hmUI.widget.BUTTON, {
        x: Math.floor((width - 160) / 2),
        y: Math.floor(height / 2) + 20,
        w: 160,
        h: 48,
        text: 'Start Again',
        radius: 12,
        color: 0x4caf50,
        text_size: 18,
        press_color: 0x2e7d32,
        click_func: () => {
          engine.reset();
          this.render();
        },
      });
      return;
    }

    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      color: 0x00000000,
      click_func: () => {
        engine.pet();
        this.render();
      },
    });

    const hungerPct = Math.round(state.hunger);
    const joyPct = Math.round(state.joy);

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 8,
      y: 10,
      w: 22,
      h: 22,
      src: 'assets/ui/food.png',
      data_type: 'food_icon',
      data_index: 0,
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 32,
      y: 10,
      w: 50,
      h: 22,
      text: `${hungerPct}%`,
      text_size: 18,
      color: 0xff8c42,
      align_h: hmUI.align.LEFT,
    });

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 8,
      y: 34,
      w: 22,
      h: 22,
      src: 'assets/ui/toy.png',
      data_type: 'joy_icon',
      data_index: 0,
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 32,
      y: 34,
      w: 50,
      h: 22,
      text: `${joyPct}%`,
      text_size: 18,
      color: 0x42a5f5,
      align_h: hmUI.align.LEFT,
    });

    const healthText = isSick ? 'SICK' : 'HEALTHY';
    const healthColor = isSick ? 0xff4444 : 0x4caf50;

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: Math.floor(width / 2) - 60,
      y: 10,
      w: 120,
      h: 28,
      text: healthText,
      text_size: 20,
      color: healthColor,
      align_h: hmUI.align.CENTER_H,
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: width - 80,
      y: 10,
      w: 72,
      h: 28,
      text: `Day ${state.age}`,
      text_size: 20,
      color: 0xffffff,
      align_h: hmUI.align.RIGHT,
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: width - 56,
      y: Math.floor(height / 2) - 12,
      w: 50,
      h: 24,
      text: `${state.coins}`,
      text_size: 16,
      color: 0xffd54f,
      align_h: hmUI.align.CENTER_H,
    });

    const btnH = 48;
    const btnY = height - btnH - 8;
    const showFood = state.hunger < 100;
    const showMedicine = isSick;
    const showToy = state.joy < 100;
    const visible = [showFood, showMedicine, showToy].filter(Boolean).length;
    const btnW = Math.floor((width - (visible + 1) * 8) / Math.max(visible, 1));
    let btnIdx = 0;

    if (showFood) {
      const x = 8 + btnIdx * (btnW + 8);
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x,
        y: btnY,
        w: btnW,
        h: btnH,
        text: `Food 10`,
        radius: 10,
        color: 0x4caf50,
        text_size: 14,
        press_color: 0x2e7d32,
        click_func: () => {
          if (engine.buy('food')) hmUI.vibrate({ type: 'short' });
          this.render();
        },
      });
      btnIdx++;
    }

    if (showMedicine) {
      const x = 8 + btnIdx * (btnW + 8);
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x,
        y: btnY,
        w: btnW,
        h: btnH,
        text: `Med 30`,
        radius: 10,
        color: 0xf44336,
        text_size: 14,
        press_color: 0xc62828,
        click_func: () => {
          if (engine.buy('medicine')) hmUI.vibrate({ type: 'short' });
          this.render();
        },
      });
      btnIdx++;
    }

    if (showToy) {
      const x = 8 + btnIdx * (btnW + 8);
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x,
        y: btnY,
        w: btnW,
        h: btnH,
        text: `Toy 10`,
        radius: 10,
        color: 0x2196f3,
        text_size: 14,
        press_color: 0x1565c0,
        click_func: () => {
          if (engine.buy('toy')) hmUI.vibrate({ type: 'short' });
          this.render();
        },
      });
      btnIdx++;
    }

    const tapGoal = isSick ? 100 : 10;
    if (state.tapCounter > 0 || isSick) {
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: 0,
        y: btnY - 28,
        w: width,
        h: 22,
        text: `${state.tapCounter}/${tapGoal} taps`,
        text_size: 14,
        color: 0xffaa44,
        align_h: hmUI.align.CENTER_H,
      });
    }
  },
});
