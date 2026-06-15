let _widgets = [];
let _nextId = 0;

export const widget = {
  IMG: "IMG",
  TEXT: "TEXT",
  FILL_RECT: "FILL_RECT",
  BUTTON: "BUTTON",
};

export const align = {
  CENTER_H: "center",
  LEFT: "left",
  RIGHT: "right",
  CENTER_V: "center",
  TOP: "top",
  BOTTOM: "bottom",
};

export const event = {
  CLICK_DOWN: "click",
};

function makeWidget(type, props) {
  const id = ++_nextId;
  const events = {};

  if (props.click_func) {
    events.click = [props.click_func];
  }

  return {
    _type: type,
    _id: id,
    _props: props,
    _events: events,
    addEventListener(evt, fn) {
      if (!events[evt]) events[evt] = [];
      events[evt].push(fn);
    },
  };
}

export function createWidget(type, props) {
  const w = makeWidget(type, props);
  _widgets.push(w);
  return w;
}

export function deleteWidget(w) {
  // React handles unmounting via reconciliation
}

export function _reset() {
  _widgets = [];
}

export function _collect() {
  const w = _widgets;
  _widgets = [];
  return w;
}

export default {
  widget,
  align,
  event,
  createWidget,
  deleteWidget,
  _reset,
  _collect,
};
