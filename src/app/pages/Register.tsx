import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { registerUser } from "../auth/authStore";
import { consumePendingEnrollment } from "../lib/platformStore";

interface Errors {
  username?: string;
  phone?: string;
  email?: string;
  password?: string;
}

const initialFormData = {
  username: "",
  phone: "",
  email: "",
  password: "",
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateStep = (currentStep: 1 | 2) => {
    const nextErrors: Errors = {};

    if (currentStep === 1) {
      if (!formData.username.trim()) nextErrors.username = "Аты-жөніңізді енгізіңіз";

      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (!phoneDigits) nextErrors.phone = "Телефон нөмірін енгізіңіз";
      else if (phoneDigits.length !== 11) nextErrors.phone = "Телефон нөмірі 11 цифрдан тұруы керек";
    }

    if (currentStep === 2) {
      const email = formData.email.trim().toLowerCase();
      if (!email) nextErrors.email = "Email енгізіңіз";
      else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Email форматы дұрыс емес";

      if (!formData.password) nextErrors.password = "Құпия сөзді енгізіңіз";
      else if (formData.password.length < 6) nextErrors.password = "Құпия сөз кемінде 6 таңбадан тұруы керек";
      else if (!/\d/.test(formData.password)) nextErrors.password = "Құпия сөзде кемінде 1 сан болуы керек";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setLoading(true);

    try {
      const currentUser = await registerUser({
        username: formData.username,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });

      const enrolledCourse = currentUser.id ? await consumePendingEnrollment(currentUser.id) : null;
      toast.success(
        enrolledCourse
          ? `Тіркелу аяқталды. "${enrolledCourse.title}" курсы кабинетіңізге қосылды.`
          : "Тіркелу сәтті аяқталды.",
      );

      setFormData(initialFormData);
      setErrors({});
      setStep(1);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Тіркелу кезінде қате кетті");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-primary text-primary-foreground shadow-lg dark:border-slate-800">
            <UserPlus className="size-7" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Жаңа аккаунт ашу</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Тіркелу</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Аккаунт ашқаннан кейін таңдаған курсыңыз автоматты түрде кабинетке өтеді.
          </p>
        </div>

        <Card className="border-border bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 text-center">
            <div className="mb-2 flex justify-center gap-2">
              <div className={`h-1.5 w-10 rounded-full transition-all ${step >= 1 ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"}`} />
              <div className={`h-1.5 w-10 rounded-full transition-all ${step >= 2 ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"}`} />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Қадам {step} / 2</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username" className="font-semibold text-slate-800 dark:text-slate-200">Аты-жөні</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Толық аты-жөніңіз"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`dark:border-slate-800 dark:bg-slate-950 dark:text-white ${errors.username ? "border-red-500" : "border-border"}`}
                  />
                  {errors.username ? <p className="text-xs text-red-600 dark:text-red-400">{errors.username}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold text-slate-800 dark:text-slate-200">Телефон нөмірі</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="77071234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`dark:border-slate-800 dark:bg-slate-950 dark:text-white ${errors.phone ? "border-red-500" : "border-border"}`}
                  />
                  {errors.phone ? <p className="text-xs text-red-600 dark:text-red-400">{errors.phone}</p> : null}
                </div>

                <Button type="button" onClick={() => validateStep(1) && setStep(2)} className="w-full bg-primary py-5 text-sm font-semibold tracking-wide text-primary-foreground hover:bg-primary/90">
                  Келесі қадам
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-slate-800 dark:text-slate-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`dark:border-slate-800 dark:bg-slate-950 dark:text-white ${errors.email ? "border-red-500" : "border-border"}`}
                  />
                  {errors.email ? <p className="text-xs text-red-600 dark:text-red-400">{errors.email}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-semibold text-slate-800 dark:text-slate-200">Құпия сөз</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Кемінде 6 таңба және 1 сан"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`pr-11 dark:border-slate-800 dark:bg-slate-950 dark:text-white ${errors.password ? "border-red-500" : "border-border"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-primary dark:text-slate-400"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password ? <p className="text-xs text-red-600 dark:text-red-400">{errors.password}</p> : null}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setErrors({}); setStep(1); }} className="flex-1 border-border text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
                    Артқа
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                    {loading ? "Тіркелуде..." : "Тіркелу"}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Аккаунтыңыз бар ма? <Link to="/login" className="font-bold text-primary hover:underline dark:text-blue-400">Кіру</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
