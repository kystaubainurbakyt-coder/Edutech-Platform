import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { isAdminAuthed, loginAdmin } from "../auth/authStore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) navigate("/admin", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginAdmin(password);
      toast.success("Әкімші ретінде сәтті кірдіңіз");
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Әкімші логині орындалмады");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Әкімші кіруі</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Платформаны толық басқару үшін әкімші паролін енгізіңіз.</p>
        </div>

        <Card className="border-border p-8 shadow-sm dark:bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="font-medium text-slate-800 dark:text-slate-200">Әкімші паролі</Label>
              <Input
                id="adminPassword"
                type="password"
                autoComplete="current-password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary py-5 text-sm font-semibold tracking-wide text-primary-foreground hover:bg-primary/90">
              {loading ? "Тексерілуде..." : "Кіру"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Қарапайым пайдаланушы ретінде кіргіңіз келе ме?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">Пайдаланушы кіруі</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
