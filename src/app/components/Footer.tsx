import { Link } from "react-router";
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Байланыс</h3>
            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-slate-500" />
                <span>support@francaiskz.kz</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-slate-500" />
                <span>+7 (727) 123-45-67</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Жылдам сілтемелер</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li><Link to="/courses" className="transition-colors hover:text-primary">Курстар каталогы</Link></li>
              <li><Link to="/pricing" className="transition-colors hover:text-primary">Бағалар</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-primary">Біз туралы</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Әлеуметтік желілер</h3>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded border border-border text-slate-500 transition-colors hover:border-primary hover:text-primary"
                  aria-label="Social link"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Français KZ. Барлық құқықтар қорғалған.</p>
          <p className="mt-1">Бұл жоба француз тілін қолжетімді әрі түсінікті форматта үйретуге арналған оқу платформасы.</p>
        </div>
      </div>
    </footer>
  );
}
