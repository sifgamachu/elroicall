import { Home, Play, BookOpen, Phone, CircleUserRound } from "lucide-react";
import { Link, useLocation } from "react-router";

const tabs = [
  { href: "/app/", title: "Home", icon: Home },
  { href: "/app/watch/", title: "Watch", icon: Play },
  { href: "/app/study/", title: "Study", icon: BookOpen },
  { href: "/app/calls/", title: "Calls", icon: Phone },
  { href: "/app/you/", title: "You", icon: CircleUserRound },
];
export default function AppDock() {
  const { pathname } = useLocation();
  return (
    <nav className="erc-dock" aria-label="App navigation">
      {tabs.map(({ href, title, icon: Icon }) => {
        const active =
          href === "/app/"
            ? pathname === "/app/" || pathname === "/app"
            : pathname.startsWith(href) ||
              (title === "Watch" &&
                (pathname.startsWith("/app/cinema") ||
                  pathname.startsWith("/app/video"))) ||
              (title === "Calls" &&
                (pathname.startsWith("/schedule") ||
                  pathname.startsWith("/begin"))) ||
              (title === "You" &&
                (pathname.startsWith("/account") ||
                  pathname.startsWith("/app/walk") ||
                  pathname.startsWith("/app/membership") ||
                  pathname.startsWith("/app/studio")));
        return (
          <Link to={href} key={href} aria-current={active ? "page" : undefined}>
            <Icon size={21} />
            <span>{title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
