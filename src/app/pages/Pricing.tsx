import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getCurrentUser } from "../auth/authStore";
import { enrollUserInCourse, getCourses, getEnrolledCourseIds, setPendingEnrollment } from "../lib/platformStore";
import type { Course } from "../data/mockData";

export default function Pricing() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const loadedCourses = await getCourses();
        const currentUser = getCurrentUser();
        const courseIds = currentUser?.id ? await getEnrolledCourseIds(currentUser.id) : [];

        if (!active) return;
        setCourses([...loadedCourses].sort((a, b) => a.price - b.price));
        setEnrolledIds(courseIds);
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Бағалар жүктелмеді");
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const handleSubscribe = async (course: Course) => {
    const currentUser = getCurrentUser();

    if (!currentUser?.id) {
      setPendingEnrollment(course.id);
      toast.info("Курс таңдалды. Жазылуды аяқтау үшін жүйеге кіріңіз.");
      navigate("/login");
      return;
    }

    try {
      const enrolled = await enrollUserInCourse(currentUser.id, course.id);
      if (!enrolled) {
        toast.info("Бұл курс сіздің профиліңізде бұрыннан бар.");
        navigate(`/learning/${course.id}`);
        return;
      }

      setEnrolledIds(await getEnrolledCourseIds(currentUser.id));
      toast.success(`"${course.title}" курсы профиліңізге қосылды.`);
      navigate(`/learning/${course.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Жазылу орындалмады");
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Бағалар тізімі</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Курсқа тікелей жазылу</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Бұл беттен батырманы басқанда тіркелу формасына емес, нақты курсқа жазылу немесе сол курсты ашу жүреді.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const isEnrolled = enrolledIds.includes(course.id);
            return (
              <Card key={course.id} className="relative flex h-full flex-col rounded-3xl border border-border p-8 dark:bg-slate-900">
                <div className="mb-6 text-center">
                  <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{course.instructor}</p>
                  <div className="mt-4 flex items-baseline justify-center gap-1 text-slate-800 dark:text-white">
                    {course.price === 0 ? (
                      <span className="text-2xl font-semibold text-primary">Тегін</span>
                    ) : (
                      <>
                        <span className="text-2xl font-semibold text-primary">{course.price.toLocaleString("ru-RU")}</span>
                        <span className="text-xs text-slate-500">тг</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="mb-8 space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Check className="mt-0.5 size-4 flex-shrink-0 text-emerald-600" />
                    <span>{course.category}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Check className="mt-0.5 size-4 flex-shrink-0 text-emerald-600" />
                    <span>Деңгейі: {course.level}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Check className="mt-0.5 size-4 flex-shrink-0 text-emerald-600" />
                    <span>Курс ішінде {course.lessons.length} сабақ және тапсырмалар бар</span>
                  </li>
                </ul>

                <Button
                  className={`mt-auto w-full ${isEnrolled ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                  onClick={() => handleSubscribe(course)}
                >
                  {isEnrolled ? "Сабақтарды ашу" : "Жазылуды бастау"}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
