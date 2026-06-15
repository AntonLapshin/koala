import hmUI from '@zos/ui';
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '../utils/constants.js';
import { createGameEngine } from '../shared/gameEngine.js';
import { storageAdapter } from '../utils/storageAdapter.js';
import { sensorAdapter } from '../utils/sensorAdapter.js';
import { timeAdapter } from '../utils/timeAdapter.js';
import { Vibrator } from '@zos/sensor';

let engine = null;
let _vib = null;
let _widgets = [];
function vibrate() {
  if (!_vib) {
    try { _vib = new Vibrator(); } catch (e) { _vib = { start() {} }; }
  }
  try { _vib.start(); } catch (e) {}
}

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
    const { width, height } = { width: DEVICE_WIDTH, height: DEVICE_HEIGHT };

    _widgets.forEach(w => hmUI.deleteWidget(w));
    _widgets = [];

    _widgets.push(hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      src: 'bg.png',
    }));

    _widgets.push(hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 20,
      w: width,
      h: 44,
      text: 'Store',
      text_size: 30,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
    }));

    _widgets.push(hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 68,
      w: width,
      h: 32,
      text: `Leaves: ${state.coins}`,
      text_size: 24,
      color: 0x4caf50,
      align_h: hmUI.align.CENTER_H,
    }));

    const itemY = 120;
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
      _widgets.push(hmUI.createWidget(hmUI.widget.BUTTON, {
        x: margin,
        y,
        w: width - margin * 2,
        h: itemH,
        text: `${item.label}\n${item.cost}`,
        radius: 12,
        color: 0xffffff,
        normal_color: item.color,
        text_size: 20,
        press_color: 0x222222,
        click_func: () => {
          if (engine.buy(item.item)) {
            vibrate();
            this.render();
          } else {
            vibrate();
            vibrate();
          }
        },
      }));
    });

    _widgets.push(hmUI.createWidget(hmUI.widget.BUTTON, {
      x: margin,
      y: height - 60,
      w: width - margin * 2,
      h: 44,
      text: 'Back',
      radius: 8,
      color: 0xffffff,
      normal_color: 0x666666,
      text_size: 22,
      press_color: 0x444444,
      click_func: () => {
        try { hmApp.gotoPage({ url: 'page/index' }); } catch (e) {}
      },
    }));
  },
});
