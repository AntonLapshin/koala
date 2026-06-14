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

  render() {
    const state = engine.getState();
    const { width, height } = hmSetting.getDeviceInfo();

    hmUI.clear();

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      src: 'assets/bg.png',
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 20,
      w: width,
      h: 40,
      text: 'Store',
      text_size: 24,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
    });

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 60,
      w: width,
      h: 30,
      text: `Leaves: ${state.coins}`,
      text_size: 18,
      color: 0x4caf50,
      align_h: hmUI.align.CENTER_H,
    });

    const itemY = 110;
    const itemH = 80;
    const itemGap = 20;
    const margin = 20;

    const items = [
      {
        label: `Food (+30 Hunger)`,
        cost: '10 Leaves',
        color: 0x4caf50,
        item: 'food',
      },
      {
        label: `Toy (+30 Joy)`,
        cost: '10 Leaves',
        color: 0x2196f3,
        item: 'toy',
      },
      {
        label: 'Medicine (Cures Sickness)',
        cost: '30 Leaves',
        color: 0xf44336,
        item: 'medicine',
      },
    ];

    items.forEach((item, i) => {
      const y = itemY + i * (itemH + itemGap);
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x: margin,
        y,
        w: width - margin * 2,
        h: itemH,
        text: `${item.label}\n${item.cost}`,
        radius: 12,
        color: item.color,
        text_size: 16,
        press_color: 0x222222,
        click_func: () => {
          if (engine.buy(item.item)) {
            hmUI.vibrate({ type: 'short' });
            this.render();
          } else {
            hmUI.vibrate({ type: 'short' });
            hmUI.vibrate({ type: 'short' });
          }
        },
      });
    });

    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: margin,
      y: height - 60,
      w: width - margin * 2,
      h: 44,
      text: 'Back',
      radius: 8,
      color: 0x666666,
      text_size: 16,
      press_color: 0x444444,
      click_func: () => {
        hmApp.gotoPage({ url: 'page/index' });
      },
    });
  },
});
