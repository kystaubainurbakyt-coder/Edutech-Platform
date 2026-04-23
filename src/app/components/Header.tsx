import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { GraduationCap, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "./ui/button";
import { getCurrentUser, isAdminAuthed, logoutAdmin, logoutUser } from "../auth/authStore";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const adminAuthed = isAdminAuthed();
  const currentUser = getCurrentUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const homeHref = adminAuthed ? "/admin" : "/";
  const adminHref = adminAuthed ? "/admin" : "/admin/login";
  const isDark = mounted && theme === "dark";

  const isActive = (path: string) => location.pathname === path;

  const handleUserLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/92 backdrop-blur transition-colors duration-300 dark:bg-slate-950/92">
      <div className="hidden border-b border-border bg-slate-50 dark:bg-slate-900/40 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Қазақстанға арналған француз тілін үйрену платформасы</span>
          <span className="uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Français KZ · Online</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={homeHref} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="size-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-extrabold tracking-wide text-slate-900 dark:text-white">Français KZ</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Француз тілін үйрену
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {[
            { to: homeHref, label: "Басты бет" },
            { to: "/courses", label: "Курстар" },
            { to: "/pricing", label: "Бағалар" },
            { to: "/about", label: "Біз туралы" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                isActive(item.to)
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="mr-2 rounded-full text-slate-500 transition-all duration-300 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Тақырыпты ауыстыру"
          >
            {isDark ? <Sun className="size-5 text-amber-400" /> : <Moon className="size-5 text-slate-700" />}
          </Button>

          {adminAuthed ? (
            <>
              <Link to="/admin">
                <Button variant="outline" className="px-4 py-1.5 text-sm text-primary">
                  Әкімші панелі
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleAdminLogout} className="px-3 py-1.5 text-[11px] uppercase tracking-[0.16em]">
                Шығу
              </Button>
            </>
          ) : currentUser ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" className="px-4 py-1.5 text-sm text-primary">
                  Кабинет
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleUserLogout} className="px-3 py-1.5 text-[11px] uppercase tracking-[0.16em]">
                Шығу
              </Button>
              <Link to={adminHref} className="hidden lg:block">
                <Button variant="ghost" className="px-3 py-1.5 text-[11px] uppercase tracking-[0.16em]">
                  Админ
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="px-4 py-1.5 text-sm text-primary">
                  Кіру
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="ghost" className="px-3 py-1.5 text-[11px] uppercase tracking-[0.16em]">
                  Тіркелу
                </Button>
              </Link>
              <Link to={adminHref} className="hidden lg:block">
                <Button variant="ghost" className="px-3 py-1.5 text-[11px] uppercase tracking-[0.16em]">
                  Админ
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
