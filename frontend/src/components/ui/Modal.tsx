import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  small?: boolean;
  // Card previews have no padding and no header text, only the close button
  bare?: boolean;
}

// Bottom sheet on phones, centred dialog on larger screens
const Modal: React.FC<ModalProps> = ({ title, onClose, children, small = false, bare = false }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-bg" onClick={onClose}>
      <div
        className={`modal${small ? " sm" : ""}${bare ? " bare" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        {bare ? (
          <button className="modal-x btn" onClick={onClose} aria-label="Close">
            <X className="s" />
          </button>
        ) : (
          <div className="modal-h">
            <h2>{title}</h2>
            <button className="sheet-x btn" onClick={onClose} aria-label="Close">
              <X className="s" />
            </button>
          </div>
        )}
        <div className="modal-b">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
