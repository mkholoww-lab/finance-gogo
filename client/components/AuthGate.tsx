import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, type User } from "firebase/auth";
import { AlertCircle, KeyRound, Loader2, LockKeyhole, LogIn, Mail, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/firebase";

type AuthGateProps = { children: ReactNode };

const authErrorMessage = (code: string) => {
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "Неверный email или пароль";
  if (code.includes("user-not-found")) return "Пользователь с таким email не найден";
  if (code.includes("too-many-requests")) return "Слишком много попыток. Попробуйте позже";
  return "Не удалось выполнить вход. Проверьте данные и попробуйте ещё раз";
};

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setLoading(false);
  }), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (caughtError) {
      setError(authErrorMessage(caughtError instanceof Error ? caughtError.message : ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-brand-mist text-brand-ink"><Loader2 className="h-7 w-7 animate-spin text-brand-teal" /></div>;
  }

  if (user) return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-mist px-4 py-8 sm:px-6">
      <div className="grid w-full max-w-[980px] overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_24px_70px_rgba(23,35,44,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-brand-ink p-10 text-white lg:block">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-teal/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-brand-yellow/10 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-brand-teal/30"><img src="https://cdn.builder.io/api/v1/image/assets%2F8cc0bb9fe0d443f9a8b7366b133cf86b%2F88b7771880134a35ac741b87bf71c183?format=webp&width=800&height=1200" alt="Логотип Fincance GoGo" className="h-full w-full object-contain" /></div><p className="font-display text-lg font-bold">Fincance GoGo</p></div>
            <div className="mt-auto"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-teal text-brand-ink"><ShieldCheck className="h-5 w-5" /></span><h1 className="mt-6 max-w-sm font-display text-4xl font-bold leading-[1.05] tracking-[-0.05em]">Финансы под контролем.</h1><p className="mt-4 max-w-sm text-sm leading-6 text-white/55">Единое рабочее пространство для смен, расходов, партнёров и выплат.</p></div>
          </div>
        </section>
        <section className="p-6 sm:p-10">
          <div className="mb-8 lg:hidden"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-brand-teal/30"><img src="https://cdn.builder.io/api/v1/image/assets%2F8cc0bb9fe0d443f9a8b7366b133cf86b%2F88b7771880134a35ac741b87bf71c183?format=webp&width=800&height=1200" alt="Логотип Fincance GoGo" className="h-full w-full object-contain" /></div><p className="font-display text-lg font-bold">Fincance GoGo</p></div></div>
          <div className="mb-8"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-teal-dark">Защищённый доступ</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-brand-ink">С возвращением</h2><p className="mt-2 text-sm leading-6 text-brand-muted">Войдите, чтобы продолжить работу с финансовыми данными.</p></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Email</span><span className="flex h-12 items-center gap-3 rounded-xl border border-brand-line bg-brand-mist/45 px-3 focus-within:border-brand-teal focus-within:bg-white"><Mail className="h-4 w-4 text-brand-teal-dark" /><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-brand-muted/60" /></span></label>
            <label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Пароль</span><span className="flex h-12 items-center gap-3 rounded-xl border border-brand-line bg-brand-mist/45 px-3 focus-within:border-brand-teal focus-within:bg-white"><LockKeyhole className="h-4 w-4 text-brand-teal-dark" /><input type="password" required minLength={6} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Введите пароль" className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-brand-muted/60" /></span></label>
            {error && <div className="flex items-start gap-2 rounded-xl border border-brand-coral/30 bg-brand-coral/10 px-3 py-2.5 text-xs font-semibold leading-5 text-brand-coral-dark"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
            <button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-ink text-sm font-extrabold text-white transition hover:bg-brand-teal hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Войти в Fincance GoGo</button>
          </form>
          <p className="mt-6 flex items-center gap-2 text-xs font-medium leading-5 text-brand-muted"><KeyRound className="h-4 w-4 shrink-0 text-brand-teal-dark" /> Доступ выдаётся администратором через Firebase Authentication.</p>
        </section>
      </div>
    </main>
  );
}
