import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, ArrowUpDown, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";

import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { CourseCard } from "../components/CourseCard";
import { categories, type Course } from "../data/mockData";
import { getCurrentUser } from "../auth/authStore";
import { enrollUserInCourse, getCourses, getEnrolledCourseIds, setPendingEnrollment } from "../lib/platformStore";

export default function Courses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Барлығы");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem("favorites") || "[]"));
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
        setCourses(loadedCourses);
        setEnrolledIds(courseIds);
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Курстар жүктелмеді");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return [...courses]
      .filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(query) || course.instructor.toLowerCase().includes(query);
        const matchesCategory = selectedCategory === "Барлығы" || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => (sortOrder === "asc" ? a.price - b.price : b.price - a.price));
  }, [courses, searchQuery, selectedCategory, sortOrder]);

  const toggleFavorite = (courseId: string) => {
    const isFavorite = favorites.includes(courseId);
    const nextFavorites = isFavorite ? favorites.filter((id) => id !== courseId) : [...favorites, courseId];
    setFavorites(nextFavorites);
    localStorage.setItem("favorites", JSON.stringify(nextFavorites));
    toast.info(isFavorite ? "Курс таңдаулылардан алынды" : "Курс таңдаулыларға қосылды");
  };

  const handleEnroll = async () => {
    if (!selectedCourse) return;

    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      setPendingEnrollment(selectedCourse.id);
      toast.info("Курс сақталды. Жазылуды аяқтау үшін алдымен жүйеге кіріңіз.");
      navigate("/login");
      return;
    }

    try {
      const enrolled = await enrollUserInCourse(currentUser.id, selectedCourse.id);
      if (!enrolled) {
        toast.info("Бұл курс сіздің кабинетіңізде бұрыннан бар.");
        navigate(`/learning/${selectedCourse.id}`);
        return;
      }

      setEnrolledIds(await getEnrolledCourseIds(currentUser.id));
      toast.success(`"${selectedCourse.title}" курсына сәтті жазылдыңыз.`);
      setIsDialogOpen(false);
      navigate(`/learning/${selectedCourse.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Жазылу орындалмады");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Курстар тізімі</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Француз тілі курстары</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Әр курс ішінде енді шынайы видеосабақтар мен тапсырмалар бар.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="flex gap-2">
            <ArrowUpDown className="size-4" />
            Баға: {sortOrder === "asc" ? "Арзаннан" : "Қымбаттан"}
          </Button>
        </div>

        <div className="mb-8 rounded-3xl border border-border bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Курс немесе оқытушы іздеу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Санат бойынша сүзу" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Барлығы <span className="font-semibold text-primary">{filteredCourses.length}</span> курс табылды
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div key={course.id} className="relative">
              <CourseCard
                course={course}
                buttonText={enrolledIds.includes(course.id) ? "Сабақтарды ашу" : "Жазылу"}
                onButtonClick={() => {
                  setSelectedCourse(course);
                  setIsDialogOpen(true);
                }}
              />
              <button
                onClick={() => toggleFavorite(course.id)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-sm dark:bg-slate-800/90"
                type="button"
              >
                <Heart className={`size-4 ${favorites.includes(course.id) ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
              </button>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Сұрауыңызға сай курс табылмады.</p>
          </div>
        ) : null}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900 dark:text-white">{selectedCourse?.title}</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Оқытушы: {selectedCourse?.instructor} | Деңгейі: {selectedCourse?.level}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="leading-relaxed text-gray-700 dark:text-slate-300">{selectedCourse?.description}</p>
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
              {selectedCourse?.lessons.slice(0, 3).map((lesson) => (
                <div key={lesson.id} className="rounded-2xl border border-border bg-white p-4 dark:bg-slate-900">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{lesson.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{lesson.summary}</p>
                </div>
              ))}
            </div>
            <Button onClick={handleEnroll} className="w-full bg-blue-700 py-6 text-lg font-medium text-white hover:bg-blue-800">
              {selectedCourse && enrolledIds.includes(selectedCourse.id)
                ? "Сатып алынған курсқа кіру"
                : `Жазылу • ${selectedCourse?.price ? `${selectedCourse.price.toLocaleString("ru-RU")} тг` : "Тегін"}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
