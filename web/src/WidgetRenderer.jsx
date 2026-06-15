function toCssColor(c) {
  const a = (c >>> 24) & 0xff;
  const r = (c >>> 16) & 0xff;
  const g = (c >>> 8) & 0xff;
  const b = c & 0xff;
  const alpha = a === 0 ? 255 : a;
  if (alpha < 255) {
    return `rgba(${r},${g},${b},${(alpha / 255).toFixed(2)})`;
  }
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function alignToFlex(alignH, alignV) {
  const style = {};
  if (alignH === "center") style.justifyContent = "center";
  else if (alignH === "right") style.justifyContent = "flex-end";
  else style.justifyContent = "flex-start";

  if (alignV === "center") style.alignItems = "center";
  else if (alignV === "bottom") style.alignItems = "flex-end";
  else style.alignItems = "flex-start";
  return style;
}

function baseStyle(props) {
  return {
    position: "absolute",
    left: props.x + "px",
    top: props.y + "px",
    width: props.w + "px",
    height: props.h + "px",
    boxSizing: "border-box",
    margin: 0,
    padding: 0,
  };
}

function renderIMG(widget) {
  const p = widget._props;
  return (
    <img
      key={widget._id}
      src={"/images/" + p.src}
      alt=""
      style={{
        ...baseStyle(p),
        objectFit: "contain",
        pointerEvents: widget._events.click ? "auto" : "none",
        userSelect: "none",
      }}
      draggable={false}
      onClick={(e) => {
        if (widget._events.click) {
          widget._events.click.forEach((fn) => fn());
        }
      }}
    />
  );
}

function renderTEXT(widget) {
  const p = widget._props;
  return (
    <div
      key={widget._id}
      style={{
        ...baseStyle(p),
        display: "flex",
        ...alignToFlex(p.align_h, p.align_v),
        color: toCssColor(p.color),
        fontSize: (p.text_size || 16) + "px",
        fontFamily: "sans-serif",
        lineHeight: 1.2,
        textAlign: p.align_h || "left",
        overflow: "hidden",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {p.text}
    </div>
  );
}

function renderFILL_RECT(widget) {
  const p = widget._props;
  return (
    <div
      key={widget._id}
      style={{
        ...baseStyle(p),
        backgroundColor: toCssColor(p.color),
        borderRadius: (p.radius || 0) + "px",
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
}

function renderBUTTON(widget) {
  const p = widget._props;
  return (
    <button
      key={widget._id}
      style={{
        ...baseStyle(p),
        backgroundColor: toCssColor(p.normal_color),
        color: toCssColor(p.color),
        fontSize: (p.text_size || 20) + "px",
        fontFamily: "sans-serif",
        borderRadius: (p.radius || 8) + "px",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        whiteSpace: "pre-line",
        lineHeight: 1.2,
        padding: "4px 8px",
      }}
      onClick={() => {
        if (widget._events.click) {
          widget._events.click.forEach((fn) => fn());
        }
      }}
    >
      {p.text}
    </button>
  );
}

const renderers = {
  IMG: renderIMG,
  TEXT: renderTEXT,
  FILL_RECT: renderFILL_RECT,
  BUTTON: renderBUTTON,
};

export function renderWidget(w) {
  const fn = renderers[w._type];
  if (!fn) return null;
  return fn(w);
}
