import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { initials } from "../utils/format";
import Icon from "./Icon";
import "./AppLayout.css";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/clubs", label: "Clubs", icon: "clubs" },
  { to: "/events", label: "Events", icon: "calendar" },
  { to: "/profile", label: "My Profile", icon: "user" },
];

export default function AppLayout() {
  const { user, logout, isAdmin, accountType } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const accountLinks = accountType === "club" ? NAV.map((link) => link.to === "/dashboard" ? { ...link, label: "Club overview" } : link.to === "/clubs" ? { ...link, label: "My clubs" } : link) : NAV;
  const links = isAdmin ? [...accountLinks, { to: "/admin", label: "Administration", icon: "shield" }] : accountLinks;

  return (
    <div className="app-shell">
      <aside id="primary-navigation" className={`sidebar ${menuOpen ? "open" : ""}`} aria-label="Primary navigation">
        <div className="sidebar-brand">
          <div className="brand-name">UCM</div>
          <div className="brand-title">
            UNIVERSITY CLUB
            <br />
            MANAGEMENT SYSTEM
          </div>
          <div className="brand-line"></div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{initials(user?.name)}</div>
          <div className="sidebar-user-info">
            <strong>{user?.name}</strong>
            <span>{accountType === "club" ? "Club manager" : user?.role === "admin" ? "Administrator" : "Student"}</span>
          </div>
          <button className="icon-button" onClick={handleLogout} title="Log out" aria-label="Log out">
            <Icon name="logout" />
          </button>
        </div>
      </aside>

      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)}></div>}

      <div className="app-main">
        <header className="mobile-bar">
          <button className="icon-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="primary-navigation">
            <Icon name={menuOpen ? "x" : "menu"} />
          </button>
          <span className="mobile-brand">UCM</span>
          <div className="avatar small">{initials(user?.name)}</div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
