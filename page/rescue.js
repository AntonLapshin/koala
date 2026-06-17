import hmUI from "@zos/ui";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../utils/constants.js";

const OVERLAY_COLOR = 0xee1a1a2e;
const PANEL_W = 340;
const PANEL_H = 370;
const PANEL_X = Math.floor((DEVICE_WIDTH - PANEL_W) / 2);
const PANEL_Y = Math.floor((DEVICE_HEIGHT - PANEL_H) / 2);
const PANEL_RADIUS = 20;

export function renderRescueScreen(
  widgets,
  state,
  rescueResult,
  justRescued,
  width,
  height,
  callbacks,
) {
  if (justRescued) {
    renderRescuedView(widgets, state, width, height, callbacks);
    return;
  }

  if (rescueResult && rescueResult.won) {
    renderSceneView(
      widgets,
      state,
      rescueResult,
      width,
      height,
      callbacks,
    );
    return;
  }

  renderNoRescueView(widgets, state, width, height, callbacks);
}

function addDarkPanel(widgets) {
  widgets.push(
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: PANEL_X,
      y: PANEL_Y,
      w: PANEL_W,
      h: PANEL_H,
      radius: PANEL_RADIUS,
      color: OVERLAY_COLOR,
    }),
  );
}

function renderNoRescueView(
  widgets,
  state,
  width,
  height,
  callbacks,
) {
  addDarkPanel(widgets);

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: PANEL_X,
      y: PANEL_Y + 20,
      w: PANEL_W,
      h: 36,
      text: "Koala Rescue",
      text_size: 22,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
    }),
  );

  const rescueCount = state.rescueCount || 0;

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: PANEL_X + 20,
      y: PANEL_Y + 80,
      w: PANEL_W - 40,
      h: 32,
      text: "No koalas to rescue",
      text_size: 19,
      color: 0xdddddd,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    }),
  );

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: PANEL_X + 20,
      y: PANEL_Y + 118,
      w: PANEL_W - 40,
      h: 32,
      text: "right now.",
      text_size: 19,
      color: 0xdddddd,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    }),
  );

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: PANEL_X + 20,
      y: PANEL_Y + 156,
      w: PANEL_W - 40,
      h: 32,
      text: "Try again later!",
      text_size: 19,
      color: 0x999999,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    }),
  );

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: PANEL_X + 20,
      y: PANEL_Y + 220,
      w: PANEL_W - 40,
      h: 32,
      text: `Rescued so far: ${rescueCount}`,
      text_size: 20,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    }),
  );

  addBackButton(widgets, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, callbacks);
}

function renderSceneView(
  widgets,
  state,
  rescueResult,
  width,
  height,
  callbacks,
) {
  widgets.push(
    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      src: `rescue/rscene_${rescueResult.sceneIndex}.png`,
    }),
  );

  widgets.push(
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width,
      h: 52,
      color: 0xaa000000,
    }),
  );

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 0,
      w: width,
      h: 52,
      text: "Koala Rescue!",
      text_size: 22,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    }),
  );

  const bottomBarH = 130;
  const bottomBarY = height - bottomBarH;

  widgets.push(
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: bottomBarY,
      w: width,
      h: bottomBarH,
      color: 0xaa000000,
    }),
  );

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 20,
      y: bottomBarY + 10,
      w: width - 40,
      h: 24,
      text: "A koala needs help!",
      text_size: 19,
      color: 0xffaa44,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    }),
  );

  const btnW = 160;
  const btnH = 42;

  widgets.push(
    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: Math.floor((width - btnW) / 2),
      y: bottomBarY + 48,
      w: btnW,
      h: btnH,
      text: "Rescue",
      radius: 14,
      color: 0xffffff,
      normal_color: 0x4caf50,
      text_size: 20,
      press_color: 0x2e7d32,
      click_func: () => {
        if (callbacks.onRescue) callbacks.onRescue();
      },
    }),
  );
}

function renderRescuedView(
  widgets,
  state,
  width,
  height,
  callbacks,
) {
  addDarkPanel(widgets);

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: PANEL_X,
      y: PANEL_Y + 20,
      w: PANEL_W,
      h: 36,
      text: "Koala Rescue",
      text_size: 22,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
    }),
  );

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: PANEL_X + 20,
      y: PANEL_Y + 90,
      w: PANEL_W - 40,
      h: 36,
      text: "Koala rescued!",
      text_size: 24,
      color: 0x4caf50,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    }),
  );

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: PANEL_X + 20,
      y: PANEL_Y + 140,
      w: PANEL_W - 40,
      h: 36,
      text: "Thank you!",
      text_size: 22,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    }),
  );

  const rescueCount = state.rescueCount || 0;

  widgets.push(
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: PANEL_X + 20,
      y: PANEL_Y + 210,
      w: PANEL_W - 40,
      h: 32,
      text: `Rescued so far: ${rescueCount}`,
      text_size: 20,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    }),
  );

  addBackButton(widgets, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, callbacks);
}

function addBackButton(widgets, panelX, panelY, panelW, panelH, callbacks) {
  const btnW = 160;
  const btnH = 46;

  widgets.push(
    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: Math.floor(panelX + (panelW - btnW) / 2),
      y: panelY + panelH - btnH - 16,
      w: btnW,
      h: btnH,
      text: "Back",
      radius: 20,
      color: 0xffffff,
      normal_color: 0x4caf50,
      text_size: 22,
      press_color: 0x2e7d32,
      click_func: () => {
        if (callbacks.onBack) callbacks.onBack();
      },
    }),
  );
}
