import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { getCurrentUser, loginUser } from "../auth/authStore";
import { consumePendingEnrollment } from "../lib/platformStore";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    if (current) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const current = await loginUser(formData.identifier, formData.password);
      const enrolledCourse = current.id ? await consumePendingEnrollment(current.id) : null;

      toast.success(
        enrolledCourse
          ? `Сәтті кірдіңіз. "${enrolledCourse.title}" курсына жазылу аяқталды.`
          : "Сәтті кірдіңіз.",
      );
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Кіру кезінде қате кетті");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Пайдаланушы кіруі</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Кіру</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Егер курс таңдап келген болсаңыз, кіргеннен кейін ол бірден кабинетіңізге қосылады.
          </p>
        </div>

        <Card className="border-border p-8 shadow-sm dark:bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="font-medium text-slate-800 dark:text-slate-200">Телефон нөмірі немесе email</Label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="+7 707 123 45 67 немесе email"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                className="border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium text-slate-800 dark:text-slate-200">Құпия сөз</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Құпия сөз"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-border"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary py-5 text-sm font-semibold tracking-wide text-primary-foreground hover:bg-primary/90">
              {loading ? "Кіріп жатыр..." : "Кіру"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Аккаунт жоқ па? <Link to="/register" className="font-semibold text-primary hover:underline">Тіркелу</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
