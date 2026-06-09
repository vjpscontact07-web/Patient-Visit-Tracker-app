import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TOOLTIP_OFFSET = 6;
const VIEWPORT_PADDING = 8;

const actionBtnBase = "inline-flex rounded-md p-1.5 transition";

const actionBtn = {
  edit: `${actionBtnBase} bg-sky-50 text-sky-600 hover:bg-sky-100`,
  reschedule: `${actionBtnBase} bg-violet-50 text-violet-600 hover:bg-violet-100`,
  cancel: `${actionBtnBase} bg-amber-50 text-amber-600 hover:bg-amber-100`,
  complete: `${actionBtnBase} bg-emerald-50 text-emerald-600 hover:bg-emerald-100`,
  delete: `${actionBtnBase} bg-red-50 text-red-600 hover:bg-red-100`,
};

function resolvePlacement(rect, placement) {
  if (placement !== "auto") return placement;

  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  return spaceBelow >= spaceAbove ? "bottom" : "top";
}

export default function ActionIconButton({
  label,
  variant = "edit",
  onClick,
  children,
  placement = "auto",
  className = "",
}) {
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState(null);

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const side = resolvePlacement(rect, placement);
    const tooltipWidth = tooltipRef.current?.offsetWidth ?? 0;
    const halfWidth = tooltipWidth / 2 || 60;

    let left = rect.left + rect.width / 2;
    left = Math.max(
      VIEWPORT_PADDING + halfWidth,
      Math.min(left, window.innerWidth - VIEWPORT_PADDING - halfWidth),
    );

    if (side === "top") {
      setStyle({
        left,
        top: rect.top - TOOLTIP_OFFSET,
        transform: "translate(-50%, -100%)",
      });
      return;
    }

    setStyle({
      left,
      top: rect.bottom + TOOLTIP_OFFSET,
      transform: "translate(-50%, 0)",
    });
  }, [placement]);

  useLayoutEffect(() => {
    if (!visible) return undefined;

    updatePosition();
    const frame = requestAnimationFrame(updatePosition);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible, updatePosition, label]);

  function hideTooltip() {
    setVisible(false);
    setStyle(null);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        aria-label={label}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={hideTooltip}
        onFocus={() => setVisible(true)}
        onBlur={hideTooltip}
        className={`${actionBtn[variant]} ${className}`.trim()}
      >
        {children}
      </button>
      {visible &&
        style &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: "fixed",
              zIndex: 9999,
              ...style,
            }}
            className="pointer-events-none whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white shadow-md"
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  );
}
