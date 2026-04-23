import { createDefaultLessons, mockCourses, type Course } from "../data/mockData";
import { apiRequest } from "./api";

export type AppCourse = Course;
export type CourseProgress = {
  watchedLessonIds: string[];
  completedLessonIds: string[];
};

const PENDING_ENROLLMENT_KEY = "pending_enrollment";

export async function getCourses(): Promise<AppCourse[]> {
  const response = await apiRequest<{ courses: AppCourse[] }>("/courses");
  return response.courses.length > 0 ? response.courses : mockCourses;
}

export async function getCourseById(courseId: string): Promise<AppCourse | null> {
  try {
    const response = await apiRequest<{ course: AppCourse }>(`/courses/${courseId}`);
    return response.course;
  } catch {
    return null;
  }
}

export async function createCourse(course: Omit<AppCourse, "id">): Promise<AppCourse> {
  const response = await apiRequest<{ course: AppCourse }>("/courses", {
    method: "POST",
    body: JSON.stringify({
      ...course,
      lessons: course.lessons?.length ? course.lessons : createDefaultLessons(course.title, course.level),
    }),
  });
  return response.course;
}

export async function updateCourse(courseId: string, updates: Omit<AppCourse, "id">): Promise<AppCourse | null> {
  const response = await apiRequest<{ course: AppCourse }>(`/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify({
      ...updates,
      lessons: updates.lessons?.length ? updates.lessons : createDefaultLessons(updates.title, updates.level),
    }),
  });
  return response.course;
}

export async function deleteCourse(courseId: string): Promise<void> {
  await apiRequest<{ ok: boolean }>(`/courses/${courseId}`, {
    method: "DELETE",
  });
}

export async function getEnrolledCourseIds(userId?: string | number | null): Promise<string[]> {
  if (!userId) return [];
  const response = await apiRequest<{ courseIds: string[] }>(`/enrollments?userId=${userId}`);
  return response.courseIds;
}

export async function getEnrolledCourses(userId?: string | number | null): Promise<AppCourse[]> {
  if (!userId) return [];
  const response = await apiRequest<{ courses: AppCourse[] }>(`/enrollments?userId=${userId}`);
  return response.courses;
}

export async function enrollUserInCourse(userId: string | number, courseId: string): Promise<boolean> {
  const response = await apiRequest<{ added: boolean }>("/enrollments", {
    method: "POST",
    body: JSON.stringify({ userId, courseId }),
  });
  return response.added;
}

export async function removeEnrollment(userId: string | number, courseId: string): Promise<void> {
  await apiRequest<{ ok: boolean }>(`/enrollments?userId=${userId}&courseId=${courseId}`, {
    method: "DELETE",
  });
}

export function setPendingEnrollment(courseId: string): void {
  localStorage.setItem(PENDING_ENROLLMENT_KEY, courseId);
}

export function getPendingEnrollment(): string | null {
  return localStorage.getItem(PENDING_ENROLLMENT_KEY);
}

export function clearPendingEnrollment(): void {
  localStorage.removeItem(PENDING_ENROLLMENT_KEY);
}

export async function consumePendingEnrollment(userId: string | number): Promise<AppCourse | null> {
  const pendingCourseId = getPendingEnrollment();
  if (!pendingCourseId) return null;

  clearPendingEnrollment();
  await enrollUserInCourse(userId, pendingCourseId);
  return getCourseById(pendingCourseId);
}

export async function getCourseProgress(userId: string | number, courseId: string): Promise<CourseProgress> {
  const response = await apiRequest<{ progress: CourseProgress }>(`/progress?userId=${userId}&courseId=${courseId}`);
  return response.progress ?? { watchedLessonIds: [], completedLessonIds: [] };
}

export async function markLessonWatched(userId: string | number, courseId: string, lessonId: string): Promise<void> {
  await apiRequest<{ ok: boolean }>("/progress/watched", {
    method: "POST",
    body: JSON.stringify({ userId, courseId, lessonId }),
  });
}

export async function markLessonCompleted(userId: string | number, courseId: string, lessonId: string): Promise<void> {
  await apiRequest<{ ok: boolean }>("/progress/completed", {
    method: "POST",
    body: JSON.stringify({ userId, courseId, lessonId }),
  });
}
