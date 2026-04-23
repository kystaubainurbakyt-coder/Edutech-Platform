import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { CheckCircle2, Lock, PlayCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getCurrentUser } from "../auth/authStore";
import { getCourseById, getCourseProgress, getEnrolledCourseIds, markLessonCompleted, markLessonWatched, type CourseProgress } from "../lib/platformStore";
import type { Course } from "../data/mockData";

export default function LearningCourse() {
  const { courseId = "" } = useParams();
  const currentUser = getCurrentUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress>({ watchedLessonIds: [], completedLessonIds: [] });
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      if (!currentUser?.id) return;

      try {
        const [loadedCourse, courseIds] = await Promise.all([
          getCourseById(courseId),
          getEnrolledCourseIds(currentUser.id),
        ]);

        if (!loadedCourse) {
          if (active) setCourse(null);
          return;
        }

        const loadedProgress = await getCourseProgress(currentUser.id, loadedCourse.id);
        if (!active) return;

        setCourse(loadedCourse);
        setEnrolledIds(courseIds);
        setProgress(loadedProgress);
        setSelectedLessonId((prev) => prev || loadedCourse.lessons[0]?.id || "");
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Сабақ деректері жүктелмеді");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [courseId, currentUser?.id]);

  const selectedLesson = useMemo(
    () => course?.lessons.find((lesson) => lesson.id === selectedLessonId) ?? course?.lessons[0] ?? null,
    [course, selectedLessonId],
  );

  if (!currentUser?.id) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return <Navigate to="/dashboard" replace />;
  if (!enrolledIds.includes(course.id)) return <Navigate to="/dashboard" replace />;
  if (!selectedLesson) return <Navigate to="/dashboard" replace />;

  const lessons = course.lessons;
  const isUnlocked = (index: number) => index === 0 || progress.completedLessonIds.includes(lessons[index - 1].id);

  const refreshProgress = async () => {
    if (!currentUser?.id) return;
    setProgress(await getCourseProgress(currentUser.id, course.id));
  };

  const handleMarkWatched = async () => {
    try {
      await markLessonWatched(currentUser.id!, course.id, selectedLesson.id);
      await refreshProgress();
      toast.success("Сабақ қаралған деп белгіленді");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Прогресс жаңартылмады");
    }
  };

  const handleSubmitTask = async () => {
    const userAnswer = answers[selectedLesson.id];
    if (!userAnswer) {
      toast.error("Алдымен бір жауап таңдаңыз");
      return;
    }

    if (userAnswer !== selectedLesson.task.correctAnswer) {
      toast.error("Жауап қате. Видеоны қайта қарап, тағы байқап көріңіз.");
      return;
    }

    try {
      await markLessonCompleted(currentUser.id!, course.id, selectedLesson.id);
      await refreshProgress();
      toast.success("Дұрыс! Келесі сабақ ашылды.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Тапсырма сақталмады");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="size-4" /> Кабинетке қайту
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Оқытушы: {course.instructor} • {course.level} • {course.lessons.length} сабақ</p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm dark:bg-slate-900">
            <p className="text-sm text-slate-500">Жалпы прогресс</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{progress.completedLessonIds.length} / {course.lessons.length}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="h-fit rounded-3xl p-5 dark:bg-slate-900">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Сабақтар</p>
            <div className="space-y-3">
              {lessons.map((lesson, index) => {
                const unlocked = isUnlocked(index);
                const completed = progress.completedLessonIds.includes(lesson.id);
                const watched = progress.watchedLessonIds.includes(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedLesson.id === lesson.id
                        ? "border-primary bg-blue-50 dark:bg-blue-950/20"
                        : "border-border bg-white dark:bg-slate-950"
                    } ${!unlocked ? "cursor-not-allowed opacity-60" : "hover:border-primary/50"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{lesson.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{lesson.duration}</p>
                      </div>
                      {completed ? (
                        <CheckCircle2 className="size-5 text-emerald-600" />
                      ) : unlocked ? (
                        <PlayCircle className="size-5 text-primary" />
                      ) : (
                        <Lock className="size-5 text-slate-400" />
                      )}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {completed ? "Тапсырма өтті" : watched ? "Видео қаралды" : unlocked ? "Ашық" : "Алдыңғы сабақтан кейін ашылады"}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl p-6 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Қазіргі сабақ</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{selectedLesson.title}</h2>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  {selectedLesson.duration}
                </span>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{selectedLesson.summary}</p>

              <div className="aspect-video overflow-hidden rounded-3xl border border-border bg-slate-100 dark:bg-slate-950">
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedLesson.videoUrl}
                  title={selectedLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="border-0"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={handleMarkWatched}>Видеоны қарадым</Button>
                {progress.completedLessonIds.includes(selectedLesson.id) ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    Бұл сабақ аяқталған
                  </span>
                ) : null}
              </div>
            </Card>

            <Card className="rounded-3xl p-6 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Тапсырма</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{selectedLesson.task.question}</h3>

              <div className="mt-5 grid gap-3">
                {selectedLesson.task.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [selectedLesson.id]: option }))}
                    className={`rounded-2xl border p-4 text-left text-sm transition ${
                      answers[selectedLesson.id] === option
                        ? "border-primary bg-blue-50 text-slate-900 dark:bg-blue-950/20 dark:text-white"
                        : "border-border bg-white hover:border-primary/40 dark:bg-slate-950"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={handleSubmitTask}>Жауапты тексеру</Button>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">
                  <span className="font-semibold">Қосымша тапсырма:</span> {selectedLesson.task.challenge}
                </div>
              </div>

              {progress.completedLessonIds.includes(selectedLesson.id) ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                  {selectedLesson.task.explanation}
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
