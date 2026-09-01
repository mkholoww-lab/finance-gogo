import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-mist px-6">
      <div className="rounded-[28px] border border-brand-line bg-white p-10 text-center shadow-[0_18px_50px_rgba(23,35,44,0.06)]">
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-teal font-display text-xl font-extrabold text-brand-ink">M</div>
        <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-brand-ink">404</h1>
        <p className="mb-5 text-sm font-medium text-brand-muted">Такой страницы пока нет</p>
        <Link to="/" className="text-brand-teal-dark underline underline-offset-4 hover:text-brand-ink">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
