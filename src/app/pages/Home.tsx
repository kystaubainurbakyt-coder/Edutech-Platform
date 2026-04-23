import React from "react";
import { Link } from "react-router";
import { ArrowRight, BookOpen, ShieldCheck, Users, PlayCircle, CheckCircle2 } from "lucide-react";

import { Button } from "../components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_left,_rgba(17,64,132,0.16),_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#eef4ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(141,193,255,0.18),_transparent_35%),linear-gradient(180deg,_#07111f_0%,_#0a1626_100%)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Француз тілін жүйелі үйренуге арналған платформа
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-slate-900 dark:text-white md:text-5xl">
              Француз тілін нақты сабақтармен, тапсырмалармен және прогреспен үйренетін заманауи платформа
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Français KZ ішінде курсқа жазылғаннан кейін шынайы YouTube сабақтары ашылады, әр сабақтан соң тапсырма беріледі,
              ал жеке кабинетте оқу прогресі, ашылған курстар және ыңғайлы күндізгі немесе түнгі режим сақталады.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/courses">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Курстарды көру
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="border-border text-primary hover:bg-white/70 dark:hover:bg-slate-900/70">
                  Бағаларды көру
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: BookOpen,
                title: "Нақты курс құрылымы",
                text: "Әр курс ішінде кемінде 3 сабақ, видео және тапсырмалар бар.",
              },
              {
                icon: PlayCircle,
                title: "Шынайы видеолар",
                text: "Жалған iframe емес, ашылатын YouTube француз тілі сабақтары бекітілді.",
              },
              {
                icon: CheckCircle2,
                title: "Прогресс бақылауы",
                text: "Сабақ қаралған және тапсырма өткен күйі сақталады.",
              },
              {
                icon: Users,
                title: "Жеке кабинет",
                text: "Сатып алған курстарыңыз бен ашылған сабақтарыңыз бір жерде тұрады.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-primary dark:bg-blue-950/40 dark:text-blue-300">
                  <item.icon className="size-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Не өзгереді?</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Оқу барысы енді түсінікті әрі тірі форматта</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-white p-6 dark:bg-slate-900">
              <BookOpen className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">1. Курсты таңдау</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Бағалар немесе курстар бетінен өзіңізге керек курсты таңдап, бірден жазыласыз.</p>
            </div>
            <div className="rounded-3xl border border-border bg-white p-6 dark:bg-slate-900">
              <Users className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">2. Профильде ашылу</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Курс сатып алынғаннан кейін сабақтар жеке кабинетте автоматты түрде қолжетімді болады.</p>
            </div>
            <div className="rounded-3xl border border-border bg-white p-6 dark:bg-slate-900">
              <ShieldCheck className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">3. Әкімші бақылауы</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Админ панельден курс, пайдаланушы және жазылулар толық басқарылады.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
