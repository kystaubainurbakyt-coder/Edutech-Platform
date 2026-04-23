import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, PlayCircle, User, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getCurrentUser } from "../auth/authStore";
import { getCourses, getEnrolledCourses, getCourseProgress, type CourseProgress } from "../lib/platformStore";
import type { Course } from "../data/mockData";

const FALLBACK_COURSE_IMAGE = "https://images.unsplash.com/photo-1506377872008-664599506ad3?q=80&w=500";

export default function Dashboard() {
  const currentUser = getCurrentUser();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [totalCatalogCourses, setTotalCatalogCourses] = useState(0);
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      if (!currentUser?.id) return;

      try {
        const [catalogCourses, enrolledCourses] = await Promise.all([
          getCourses(),
          getEnrolledCourses(currentUser.id),
        ]);

        const progressEntries = await Promise.all(
          enrolledCourses.map(async (course) => [course.id, await getCourseProgress(currentUser.id!, course.id)] as const),
        );

        if (!active) return;
        setTotalCatalogCourses(catalogCourses.length);
        setMyCourses(enrolledCourses);
        setProgressMap(Object.fromEntries(progressEntries));
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Кабинет деректері жүктелмеді");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card className="border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Жеке кабинет</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{currentUser?.username}, оқу аймағыңыз дайын</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                  Мұнда сіз сатып алған курстар, ашылған сабақтар және өткен тапсырмалар көрсетіледі.
                </p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                <User className="size-9" />
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Жазылған курстар</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{myCourses.length}</p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-50 p-3 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Барлық каталог</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCatalogCourses}</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Менің сабақтарым</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Жазылған курстар</h2>
          </div>

          {myCourses.length === 0 ? (
            <Card className="border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Әзірге курсқа жазылмағансыз</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Бағалар немесе курстар бетінен өзіңізге керек курсты таңдаңыз.</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {myCourses.map((course) => {
                const progress = progressMap[course.id];
                const completedCount = progress?.completedLessonIds.length ?? 0;

                return (
                  <Card key={course.id} className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <img
                      src={course.thumbnail || course.image || FALLBACK_COURSE_IMAGE}
                      alt={course.title}
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_COURSE_IMAGE;
                      }}
                    />
                    <div className="space-y-4 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{course.level}</span>
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{course.category}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Оқытушы: {course.instructor}</p>
                      </div>
                      <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{course.description}</p>
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-950/60">
                        <p className="font-semibold text-slate-900 dark:text-white">Прогресс</p>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">{completedCount} / {course.lessons.length} сабақ аяқталды</p>
                      </div>
                      <Link to={`/learning/${course.id}`}>
                        <Button className="w-full bg-blue-700 text-white hover:bg-blue-800">
                          <PlayCircle className="mr-2 size-4" /> Сабақтарды ашу
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
