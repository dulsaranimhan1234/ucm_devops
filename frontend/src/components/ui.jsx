import { useEffect, useState } from "react";
import Icon from "./Icon";
import { colorFor, initials } from "../utils/format";

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function Loader({ label = "Loading..." }) {
  return (
    <div className="loader">
      <span className="spinner dark"></span>
      {label}
    </div>
  );
}

export function Alert({ type = "error", children, onClose }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role={type === "error" ? "alert" : "status"}>
      <span>{children}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Dismiss">
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = "inbox", title, children, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} size={26} />
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function RetryState({ message, onRetry }) {
  return (
    <EmptyState
      icon="inbox"
      title="We couldn't load this page"
      action={<button className="btn btn-primary" onClick={onRetry}>Try again</button>}
    >
      {message}
    </EmptyState>
  );
}

export function ClubAvatar({ name, logoUrl, size = 52 }) {
  const [failedLogoUrl, setFailedLogoUrl] = useState(null);
  const style = { width: size, height: size, fontSize: size * 0.36 };
  if (logoUrl && failedLogoUrl !== logoUrl) {
    return <img className="club-avatar" src={logoUrl} alt="" style={style} onError={() => setFailedLogoUrl(logoUrl)} />;
  }
  return (
    <div className="club-avatar" style={{ ...style, background: colorFor(name) }}>
      {initials(name)}
    </div>
  );
}

export function StatusBadge({ status, role }) {
  if (status === "pending") return <span className="badge badge-warning">Pending</span>;
  if (role === "president") return <span className="badge badge-accent">President</span>;
  if (role === "officer") return <span className="badge badge-info">Officer</span>;
  if (status === "approved") return <span className="badge badge-success">Member</span>;
  return null;
}

export function Modal({ title, onClose, children, width = 560 }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function SubmitButton({ loading, children, className = "btn btn-primary" }) {
  return (
    <button type="submit" className={className} disabled={loading}>
      {loading && <span className="spinner"></span>}
      {children}
    </button>
  );
}
