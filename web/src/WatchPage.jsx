import React, { useState, useEffect } from "react";
import { _reset, _collect } from "./hmUI.js";
import { renderWidget } from "./WidgetRenderer.jsx";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "./constants.js";

let _pageConfig = null;
let _triggerRender = null;

export function _setPageConfig(config) {
  const originalBuild = config.build;
  const originalRender = config.render;

  config.build = function () {
    originalBuild.call(config);
  };

  config.render = function () {
    _reset();
    originalRender.call(config);
    const widgets = _collect();
    if (_triggerRender) _triggerRender(widgets);
  };

  _pageConfig = config;
}

export function getPageConfig() {
  return _pageConfig;
}

export function triggerRender() {
  if (_pageConfig) _pageConfig.render();
}

export function WatchPage() {
  const [widgets, setWidgets] = useState([]);
  _triggerRender = setWidgets;

  useEffect(() => {
    if (!_pageConfig) return;
    _pageConfig.build();
    return () => {
      _triggerRender = null;
      if (_pageConfig?.onDestroy) _pageConfig.onDestroy();
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: DEVICE_WIDTH,
        height: DEVICE_HEIGHT,
        overflow: "hidden",
        flexShrink: 0,
        borderRadius: 84,
        boxShadow: "0 0 0 4px #333, 0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {widgets.map((w) => renderWidget(w)).filter(Boolean)}
    </div>
  );
}
