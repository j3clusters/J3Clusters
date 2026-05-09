"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

type ConfirmSubmitButtonProps = {
  confirmMessage: string;
  className?: string;
  children: ReactNode;
  name?: string;
  value?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  title?: string;
  requireTypedValue?: string;
  typedValueLabel?: string;
};

export function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
  name,
  value,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "danger",
  title,
  requireTypedValue,
  typedValueLabel,
}: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const [typedValue, setTypedValue] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const typedInputRef = useRef<HTMLInputElement>(null);

  const trimmedRequiredValue = requireTypedValue?.trim() ?? "";
  const requiresTyping = trimmedRequiredValue.length > 0;
  const typedMatches =
    !requiresTyping ||
    typedValue.trim().toLowerCase() === trimmedRequiredValue.toLowerCase();

  const resolvedTitle =
    title ?? (variant === "danger" ? "Confirm action" : "Please confirm");
  const resolvedConfirmLabel =
    confirmLabel ?? (variant === "danger" ? "Yes, delete" : "Confirm");

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setTypedValue("");
    setOpen(true);
  }

  const close = useCallback(() => {
    setOpen(false);
    setTypedValue("");
  }, []);

  function handleConfirm() {
    if (requiresTyping && !typedMatches) {
      typedInputRef.current?.focus();
      return;
    }
    setOpen(false);
    setTypedValue("");
    const button = buttonRef.current;
    if (!button) return;
    const form = button.form;
    if (!form) return;
    if (typeof form.requestSubmit === "function") {
      form.requestSubmit(button);
    } else {
      form.submit();
    }
  }

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      if (requiresTyping) {
        typedInputRef.current?.focus();
      } else if (variant === "danger") {
        cancelRef.current?.focus();
      } else {
        confirmRef.current?.focus();
      }
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open, close, variant, requiresTyping]);

  return (
    <>
      <button
        ref={buttonRef}
        type="submit"
        className={className}
        onClick={onClick}
        name={name}
        value={value}
      >
        {children}
      </button>
      {open ? (
        <div
          className="confirm-backdrop"
          role="presentation"
          onClick={close}
        >
          <div
            className={`confirm-modal confirm-modal-${variant}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`confirm-modal-icon confirm-modal-icon-${variant}`}
              aria-hidden="true"
            >
              {variant === "danger" ? (
                <svg
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              )}
            </div>

            <h2 id="confirm-modal-title" className="confirm-modal-title">
              {resolvedTitle}
            </h2>
            <p id="confirm-modal-desc" className="confirm-modal-message">
              {confirmMessage}
            </p>
            {requiresTyping ? (
              <label className="confirm-modal-typed">
                <span>
                  {typedValueLabel ??
                    `Type "${trimmedRequiredValue}" to confirm`}
                </span>
                <input
                  ref={typedInputRef}
                  type="text"
                  value={typedValue}
                  onChange={(event) => setTypedValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && typedMatches) {
                      event.preventDefault();
                      handleConfirm();
                    }
                  }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
            ) : null}
            <div className="confirm-modal-actions">
              <button
                ref={cancelRef}
                type="button"
                className="confirm-modal-cancel"
                onClick={close}
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                type="button"
                className={`confirm-modal-confirm confirm-modal-confirm-${variant}`}
                onClick={handleConfirm}
                disabled={requiresTyping && !typedMatches}
                aria-disabled={requiresTyping && !typedMatches}
              >
                {resolvedConfirmLabel}
              </button>
            </div>
            <p className="confirm-modal-hint" aria-hidden="true">
              Press <kbd>Esc</kbd> to cancel
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
