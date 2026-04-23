import { Card } from "../components/ui/card";
import { Target, Award, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Платформа туралы</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Français KZ жайлы</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Біз француз тілін үйренуді түсінікті, әдемі және шынайы оқу материалдарымен байытылған форматқа айналдырғымыз келеді.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <Card className="rounded-3xl p-6 text-center dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Target className="size-6 text-primary" />
            </div>
            <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">Біздің миссиямыз</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Француз тілін кез келген адамға қолжетімді, жүйелі және қызықты түрде үйрету.</p>
          </Card>

          <Card className="rounded-3xl p-6 text-center dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Award className="size-6 text-primary" />
            </div>
            <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">Біздің көзқарасымыз</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Қазақстандағы француз тіліне арналған ең ыңғайлы цифрлық оқу алаңын қалыптастыру.</p>
          </Card>

          <Card className="rounded-3xl p-6 text-center dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Users className="size-6 text-primary" />
            </div>
            <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">Біздің командамыз</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Оқытушы, дизайнер және өнімдік ойлау арқылы біріккен шағын бірақ мықты команда.</p>
          </Card>
        </div>

        <Card className="rounded-3xl p-8 dark:bg-slate-900">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Неге бұл платформа басқаша?</h2>
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <p>
              Français KZ бастапқыда қарапайым каталог ретінде жасалған еді, бірақ қазір біз оны шынайы оқу тәжірибесіне айналдырдық:
              курсқа жазылған соң тек карточка емес, сабақтардың өзі ашылады, видеолар жүреді, ал әр сабақтан кейін тапсырма беріледі.
            </p>
            <p>
              Біз үшін интерфейс те маңызды. Сол себепті мәтіндерді таза қазақшаға келтіріп, қаріпті қазақ әріптерін дұрыс көрсететін етіп,
              күндізгі және түнгі режимді көзге жайлы форматта реттедік.
            </p>
            <p>
              Пайдаланушы үшін нәтиже қарапайым: курс таңдайсыз, жазыласыз, кабинеттен ашасыз, видеоны қарайсыз, тапсырма орындайсыз және
              прогресті жоғалтпай жалғастырасыз.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
