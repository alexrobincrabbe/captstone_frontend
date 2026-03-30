import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <NavLink to="/" className="brand" end>
          <span className="brand-mark" aria-hidden />
          <span className="brand-text">Tap &amp; Bot</span>
        </NavLink>
        <nav className="site-nav" aria-label="Main">
          <NavLink to="/" className="nav-link" end>
            Home
          </NavLink>
          <NavLink to="/play" className="nav-link">
            Play
          </NavLink>
          <NavLink to="/memories" className="nav-link">
            Memories
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
