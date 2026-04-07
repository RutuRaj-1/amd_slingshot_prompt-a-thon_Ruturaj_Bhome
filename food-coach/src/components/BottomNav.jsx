import { NavLink, useLocation } from "react-router-dom";
import { Home, QrCode, Target, BarChart2, User } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/scan", label: "Scan", Icon: QrCode },
  { to: "/missions", label: "Missions", Icon: Target },
  { to: "/dashboard", label: "Dashboard", Icon: BarChart2 },
  { to: "/profile", label: "Profile", Icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, label, Icon }) => {
        const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
        return (
          <NavLink key={to} to={to} className={`nav-item ${isActive ? "active" : ""}`}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}
