import { useEffect } from "react";

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const useFocusTrap = (ref, isActive) => {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const el = ref.current;
    const focusable = Array.from(el.querySelectorAll(FOCUSABLE));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Focus first element when modal opens
    first?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // Let the modal handle its own close via Escape
        el.dispatchEvent(new CustomEvent("modal-escape", { bubbles: true }));
      }
      if (e.key !== "Tab") return;

      if (focusable.length === 0) { e.preventDefault(); return; }

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [isActive, ref]);
};

export default useFocusTrap;
