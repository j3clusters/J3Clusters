"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

type EditModalProps = {
  title: string;
  subtitle?: string;
  formId: string;
  triggerLabel?: ReactNode;
  triggerClassName?: string;
  size?: "md" | "lg";
  saveLabel?: string;
  cancelLabel?: string;
  children: ReactNode;
};

export function EditModal({
  title,
  subtitle,
  formId,
  triggerLabel = "Edit",
  triggerClassName = "edit-modal-trigger",
  size = "md",
  saveLabel = "Save changes",
  cancelLabel = "Cancel",
  children,
}: EditModalProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const bodyRef = useRef<HTMLDivElement>(null);

  function onTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setOpen(true);
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

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const node = bodyRef.current;
    if (!node) return;

    function onSubmit() {
      window.setTimeout(close, 0);
    }

    node.addEventListener("submit", onSubmit, true);
    return () => node.removeEventListener("submit", onSubmit, true);
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={onTriggerClick}
      >
        <span aria-hidden="true" className="edit-modal-trigger-icon">
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </span>
        {triggerLabel}
      </button>
      {open ? (
        <div
          className="edit-modal-backdrop"
          role="presentation"
          onClick={close}
        >
          <div
            className={`edit-modal edit-modal-${size}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="edit-modal-header">
              <div className="edit-modal-heading">
                <h2 id="edit-modal-title" className="edit-modal-title">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="edit-modal-subtitle">{subtitle}</p>
                ) : null}
              </div>
            </div>
            <div className="edit-modal-body" ref={bodyRef}>
              {children}
            </div>
            <div className="edit-modal-footer">
              <button
                type="button"
                className="edit-modal-cancel"
                onClick={close}
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                form={formId}
                className="edit-modal-save"
              >
                {saveLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
