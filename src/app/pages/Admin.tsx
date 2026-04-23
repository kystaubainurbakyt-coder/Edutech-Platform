import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FileDown, Pencil, Plus, Trash2, UserPlus, BookPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { categories, createDefaultLessons, type Course } from "../data/mockData";
import { isAdminAuthed, readAllUsers } from "../auth/authStore";
import { apiRequest } from "../lib/api";
import {
  createCourse,
  deleteCourse,
  enrollUserInCourse,
  getCourses,
  getEnrolledCourseIds,
  removeEnrollment,
  updateCourse,
} from "../lib/platformStore";

type AdminTab = "users" | "courses" | "enrollments";

type EditableUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

const initialCourseForm = {
  title: "",
  instructor: "",
  category: categories[1] ?? "Бастауыш деңгей",
  level: "A1",
  price: "0",
  description: "",
  videoUrl: "",
  thumbnail: "",
};

const initialUserForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string[]>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const syncState = async () => {
    const loadedUsers = (await readAllUsers()).map((user) => ({
      id: String(user.id ?? ""),
      username: user.username ?? user.name ?? "",
      name: user.name ?? user.username ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      createdAt: user.createdAt ?? new Date().toISOString().slice(0, 10),
    }));
    const loadedCourses = await getCourses();
    const enrollmentEntries = await Promise.all(
      loadedUsers.map(async (user) => [user.id, await getEnrolledCourseIds(user.id)] as const),
    );

    setUsers(loadedUsers);
    setCourses(loadedCourses);
    setEnrollmentMap(Object.fromEntries(enrollmentEntries));
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      if (!isAdminAuthed()) {
        navigate("/admin/login", { replace: true });
        return;
      }

      try {
        await syncState();
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Admin деректері жүктелмеді");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [navigate]);

  const userEnrollments = useMemo(() => {
    return users.map((user) => ({
      ...user,
      courses: (enrollmentMap[user.id] ?? [])
        .map((courseId) => courses.find((course) => course.id === courseId))
        .filter(Boolean) as Course[],
    }));
  }, [users, courses, enrollmentMap]);

  const resetUserForm = () => {
    setUserForm(initialUserForm);
    setEditingUserId(null);
  };

  const resetCourseForm = () => {
    setCourseForm(initialCourseForm);
    setEditingCourseId(null);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userForm.name || !userForm.phone || (!editingUserId && !userForm.password)) {
      toast.error("Пайдаланушы үшін аты, телефон және пароль міндетті");
      return;
    }

    try {
      const payload = {
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
        phone: userForm.phone.trim(),
        password: userForm.password,
      };

      if (editingUserId) {
        await apiRequest(`/users/${editingUserId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await syncState();
      toast.success(editingUserId ? "Пайдаланушы жаңартылды" : "Пайдаланушы қосылды");
      resetUserForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Пайдаланушы сақталмады");
    }
  };

  const handleUserEdit = (user: EditableUser) => {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
    });
    setActiveTab("users");
  };

  const handleUserDelete = async (userId: string) => {
    try {
      await apiRequest(`/users/${userId}`, { method: "DELETE" });
      await syncState();
      toast.success("Пайдаланушы өшірілді");
      if (editingUserId === userId) resetUserForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Пайдаланушы өшірілмеді");
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.title || !courseForm.instructor || !courseForm.videoUrl || !courseForm.description) {
      toast.error("Курс үшін атау, оқытушы, видео және сипаттама міндетті");
      return;
    }

    const lessons = createDefaultLessons(courseForm.title.trim(), courseForm.level.trim());
    const payload = {
      title: courseForm.title.trim(),
      instructor: courseForm.instructor.trim(),
      category: courseForm.category,
      level: courseForm.level.trim(),
      price: Number(courseForm.price || 0),
      description: courseForm.description.trim(),
      videoUrl: courseForm.videoUrl.trim(),
      thumbnail:
        courseForm.thumbnail.trim() ||
        "https://images.unsplash.com/photo-1506377872008-664599506ad3?q=80&w=500",
      image:
        courseForm.thumbnail.trim() ||
        "https://images.unsplash.com/photo-1506377872008-664599506ad3?q=80&w=500",
      accentColor: "blue",
      lessons,
    };

    try {
      if (editingCourseId) {
        await updateCourse(editingCourseId, payload);
        toast.success("Курс жаңартылды");
      } else {
        await createCourse(payload);
        toast.success("Курс қосылды");
      }

      await syncState();
      resetCourseForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Курс сақталмады");
    }
  };

  const handleCourseEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title,
      instructor: course.instructor,
      category: course.category,
      level: course.level,
      price: String(course.price),
      description: course.description,
      videoUrl: course.videoUrl,
      thumbnail: course.thumbnail || course.image || "",
    });
    setActiveTab("courses");
  };

  const handleCourseDelete = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      await syncState();
      toast.success("Курс өшірілді");
      if (editingCourseId === courseId) resetCourseForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Курс өшірілмеді");
    }
  };

  const handleAssignEnrollment = async () => {
    if (!selectedUserId || !selectedCourseId) {
      toast.error("Пайдаланушы мен курсты таңдаңыз");
      return;
    }

    try {
      const added = await enrollUserInCourse(selectedUserId, selectedCourseId);
      if (!added) {
        toast.info("Бұл курс пайдаланушыға бұрыннан тағайындалған");
        return;
      }

      await syncState();
      toast.success("Курс пайдаланушыға тағайындалды");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Жазылу тағайындалмады");
    }
  };

  const handleRemoveEnrollment = async (userId: string, courseId: string) => {
    try {
      await removeEnrollment(userId, courseId);
      await syncState();
      toast.success("Курс пайдаланушы профилінен алынды");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Жазылу өшірілмеді");
    }
  };

  const handleExportToExcel = () => {
    if (users.length === 0) {
      toast.error("Экспорттайтын пайдаланушылар жоқ");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      users.map((user) => ({
        Name: user.name,
        Email: user.email,
        Phone: user.phone,
        CreatedAt: user.createdAt,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "Users.xlsx");
    toast.success("Excel файлы жүктелді");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Admin panel</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Платформаны толық басқару</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant={activeTab === "users" ? "default" : "outline"} onClick={() => setActiveTab("users")}>Пайдаланушылар</Button>
            <Button variant={activeTab === "courses" ? "default" : "outline"} onClick={() => setActiveTab("courses")}>Курстар</Button>
            <Button variant={activeTab === "enrollments" ? "default" : "outline"} onClick={() => setActiveTab("enrollments")}>Жазылулар</Button>
          </div>
        </div>

        {activeTab === "users" ? (
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3">
                <UserPlus className="size-5 text-primary" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingUserId ? "Пайдаланушыны өңдеу" : "Пайдаланушы қосу"}</h2>
              </div>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Аты-жөні</Label><Input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Телефон</Label><Input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>{editingUserId ? "Жаңа пароль (міндетті емес)" : "Пароль"}</Label>
                  <Input value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">{editingUserId ? <Pencil className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}{editingUserId ? "Жаңарту" : "Қосу"}</Button>
                  {editingUserId ? <Button type="button" variant="outline" onClick={resetUserForm}>Бас тарту</Button> : null}
                </div>
              </form>
            </Card>

            <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Пайдаланушылар ({users.length})</h2>
                <Button onClick={handleExportToExcel} className="bg-green-600 hover:bg-green-700"><FileDown className="mr-2 size-4" /> Excel экспорт</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Аты</TableHead><TableHead>Email</TableHead><TableHead>Телефон</TableHead><TableHead className="text-right">Әрекет</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleUserEdit(user)}><Pencil className="size-4" /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleUserDelete(user.id)}><Trash2 className="size-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        ) : null}

        {activeTab === "courses" ? (
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3">
                <BookPlus className="size-5 text-primary" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingCourseId ? "Курсты өңдеу" : "Курс қосу"}</h2>
              </div>
              <form onSubmit={handleCourseSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Курс атауы</Label><Input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Оқытушы</Label><Input value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} /></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Санат</Label>
                    <Select value={courseForm.category} onValueChange={(value) => setCourseForm({ ...courseForm, category: value })}>
                      <SelectTrigger><SelectValue placeholder="Санатты таңдаңыз" /></SelectTrigger>
                      <SelectContent>{categories.slice(1).map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Деңгей</Label><Input value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Бағасы</Label><Input type="number" min="0" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} /></div>
                <div className="space-y-2"><Label>Басты видео URL</Label><Input value={courseForm.videoUrl} onChange={(e) => setCourseForm({ ...courseForm, videoUrl: e.target.value })} /></div>
                <div className="space-y-2"><Label>Сурет URL</Label><Input value={courseForm.thumbnail} onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })} /></div>
                <div className="space-y-2"><Label>Сипаттама</Label><Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} /></div>
                <p className="text-xs text-slate-500">Ескерту: курс сақталған кезде жүйе автоматты түрде 3 сабақ пен тапсырма бекітеді.</p>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">{editingCourseId ? <Pencil className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}{editingCourseId ? "Жаңарту" : "Қосу"}</Button>
                  {editingCourseId ? <Button type="button" variant="outline" onClick={resetCourseForm}>Бас тарту</Button> : null}
                </div>
              </form>
            </Card>

            <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Курстар ({courses.length})</h2>
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{course.title}</p>
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{course.level}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{course.instructor} • {course.category}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{course.description}</p>
                      <p className="mt-2 text-xs text-slate-500">Сабақ саны: {course.lessons.length}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="mr-2 text-sm font-semibold text-primary">{course.price.toLocaleString("ru-RU")} тг</div>
                      <Button variant="outline" size="sm" onClick={() => handleCourseEdit(course)}><Pencil className="size-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleCourseDelete(course.id)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {activeTab === "enrollments" ? (
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Жазылу тағайындау</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Пайдаланушы</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger><SelectValue placeholder="Пайдаланушыны таңдаңыз" /></SelectTrigger>
                    <SelectContent>{users.map((user) => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Курс</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger><SelectValue placeholder="Курсты таңдаңыз" /></SelectTrigger>
                    <SelectContent>{courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleAssignEnrollment}>Тағайындау</Button>
              </div>
            </Card>

            <Card className="p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Пайдаланушылардың курстары</h2>
              <div className="space-y-4">
                {userEnrollments.map((user) => (
                  <div key={user.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email || user.phone}</p>
                      </div>
                      <span className="text-sm font-medium text-primary">{user.courses.length} курс</span>
                    </div>
                    {user.courses.length === 0 ? (
                      <p className="text-sm text-slate-500">Әлі курс тағайындалмаған.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.courses.map((course) => (
                          <div key={course.id} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                            <span>{course.title}</span>
                            <button type="button" onClick={() => handleRemoveEnrollment(user.id, course.id)}><Trash2 className="size-3.5 text-red-500" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
