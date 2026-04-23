import { Card } from "./ui/card";
import { Button } from "./ui/button";

export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  videoUrl: string;
  thumbnail?: string;
  level?: string;
}

interface CourseCardProps {
  course: Course;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function CourseCard({ course, buttonText = "Сабақты көру", onButtonClick }: CourseCardProps) {
  const imageSrc =
    course.thumbnail ||
    course.image ||
    "https://images.unsplash.com/photo-1506377872008-664599506ad3?q=80&w=500";

  return (
    <Card className="overflow-hidden border border-gray-200 transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-slate-800">
        <img
          src={imageSrc}
          alt={course.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1506377872008-664599506ad3?q=80&w=500";
          }}
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
          {course.price > 0 ? `${course.price.toLocaleString("ru-RU")} тг` : "Тегін"}
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-h-[3rem] line-clamp-2 font-semibold text-gray-900 dark:text-white">{course.title}</h3>
          {course.level ? (
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {course.level}
            </span>
          ) : null}
        </div>

        <p className="text-sm text-gray-600 dark:text-slate-300">
          Оқытушы: <span className="text-blue-700 dark:text-blue-300">{course.instructor}</span>
        </p>

        <p className="line-clamp-2 text-sm text-gray-500 dark:text-slate-400">{course.description}</p>

        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{course.category}</p>

        <Button onClick={onButtonClick} className="w-full bg-blue-700 text-white hover:bg-blue-800">
          {buttonText}
        </Button>
      </div>
    </Card>
  );
}
