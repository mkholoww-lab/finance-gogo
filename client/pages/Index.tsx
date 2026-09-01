import { useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  BatteryCharging,
  Bell,
  Bike,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CircleHelp,
  ClipboardList,
  CreditCard,
  FilePlus2,
  HandCoins,
  History,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Minus,
  Plus,
  Receipt,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

const somoni = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const today = new Date().toISOString().slice(0, 10);

const formatSomoni = (value: number) => somoni.format(Math.round(value * 100) / 100);
const parseAmount = (value: string) => Number(value.replace(/\s/g, "")) || 0;
const dateLabel = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
const weekdayLabel = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("ru-RU", { weekday: "long" });

const toneOptions = [
  "bg-[#e4f7ef] text-[#26745f]",
  "bg-[#fff0d7] text-[#a46b18]",
  "bg-[#eeeaff] text-[#6453aa]",
  "bg-[#ffe5e0] text-[#af5545]",
  "bg-[#e2efff] text-[#4677ac]",
];

const makeInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

type View = "overview" | "shift" | "income" | "expenses" | "partners" | "settings";
type Courier = { id: number; name: string; initials: string; tone: string };
type Partner = { id: number; name: string; rate: number; descriptor: string; tone: string };
type PartnerRow = { id: number; partnerId: number; amount: string };
type Expense = { id: number; date: string; amount: string; recipient: string; comment: string };
type PartnerPayment = { id: number; partnerId: number; date: string; amount: string; method: string; comment: string };

type MetricInputProps = {
  label: string;
  helper: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  iconClassName: string;
};

const defaultCouriers: Courier[] = [
  { id: 1, name: "Бобоев Юсуф", initials: "БЮ", tone: toneOptions[0] },
  { id: 2, name: "Муродов Салон", initials: "МС", tone: toneOptions[1] },
  { id: 3, name: "Каримова Мадина", initials: "КМ", tone: toneOptions[2] },
  { id: 4, name: "Саидов Фаррух", initials: "СФ", tone: toneOptions[3] },
  { id: 5, name: "Назарова Шахло", initials: "НШ", tone: toneOptions[4] },
];

const defaultPartners: Partner[] = [
  { id: 1, name: "Tcell", rate: 2, descriptor: "мобильная связь", tone: "bg-[#e8f5ff] text-[#3882b8]" },
  { id: 2, name: "Alif", rate: 5, descriptor: "финансовые услуги", tone: "bg-[#f3eaff] text-[#7d57ad]" },
  { id: 3, name: "Yandex Eats", rate: 3, descriptor: "доставка еды", tone: "bg-[#fff2d8] text-[#ad721b]" },
  { id: 4, name: "Ориён", rate: 1.5, descriptor: "банк", tone: "bg-[#e6f5ec] text-[#3d8765]" },
];

const paymentMethods = ["Душанбе Сити", "Alif", "Наличные", "Перевод на карту"];

function MetricInput({ label, helper, value, onChange, icon: Icon, iconClassName }: MetricInputProps) {
  return (
    <label className="group block rounded-2xl border border-brand-line bg-brand-mist/45 p-4 transition-colors focus-within:border-brand-teal focus-within:bg-white">
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 text-sm font-semibold text-brand-ink">
          <span className={`grid h-8 w-8 place-items-center rounded-xl ${iconClassName}`}>
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </span>
          {label}
        </span>
        <span className="text-[11px] font-medium text-brand-muted">{helper}</span>
      </span>
      <span className="mt-4 flex items-center gap-2 border-b border-brand-line pb-2">
        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-2xl font-bold tracking-tight text-brand-ink outline-none placeholder:text-brand-muted/50"
          placeholder="0"
        />
        <span className="shrink-0 text-sm font-semibold text-brand-muted">сомони</span>
      </span>
    </label>
  );
}

function SectionLabel({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted">{eyebrow}</p>
        <h2 className="font-display text-xl font-bold tracking-tight text-brand-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-line bg-brand-mist/35 p-8 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-brand-teal/15 text-brand-teal-dark"><Icon className="h-5 w-5" /></span>
      <p className="mt-4 text-sm font-bold text-brand-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-xs font-medium leading-5 text-brand-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function PageHeader({ title, eyebrow, description, dateValue, onDateChange, action }: { title: string; eyebrow: string; description: string; dateValue: string; onDateChange: (value: string) => void; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-teal" />
          {weekdayLabel(dateValue)}, {dateLabel(dateValue)}
          <span className="rounded-full bg-brand-yellow/25 px-2 py-0.5 text-[10px] font-bold text-[#9a681b]">Смена #24</span>
        </div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted">{eyebrow}</p>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.055em] text-brand-ink">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-brand-muted">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex h-11 items-center gap-2 rounded-2xl border border-brand-line bg-white px-3.5 text-sm font-semibold text-brand-ink shadow-sm shadow-brand-ink/5">
          <CalendarDays className="h-4 w-4 text-brand-teal-dark" />
          <span className="hidden text-brand-muted sm:inline">Дата</span>
          <input type="date" value={dateValue} onChange={(event) => onDateChange(event.target.value)} className="w-[118px] bg-transparent text-sm font-bold outline-none" />
        </label>
        {action}
        <button type="button" className="grid h-11 w-11 place-items-center rounded-2xl border border-brand-line bg-white text-brand-muted shadow-sm shadow-brand-ink/5" aria-label="Уведомления">
          <Bell className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}

function SummaryCards({ companyIncome, partnerOutstanding, cashBalance, expenseTotal }: { companyIncome: number; partnerOutstanding: number; cashBalance: number; expenseTotal: number }) {
  return (
    <div className="mb-7 grid gap-4 sm:grid-cols-3">
      <div className="rounded-[22px] border border-brand-line bg-white p-4 shadow-[0_12px_30px_rgba(23,35,44,0.03)] sm:p-5">
        <div className="flex items-start justify-between">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-teal/20 text-brand-teal-dark"><CircleDollarSign className="h-4 w-4" /></span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-brand-green"><ArrowUpRight className="h-3.5 w-3.5" /> компания</span>
        </div>
        <p className="mt-4 text-xs font-semibold text-brand-muted">Доход компании</p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight">{formatSomoni(companyIncome)} <span className="font-sans text-xs font-semibold text-brand-muted">сом.</span></p>
      </div>
      <div className="rounded-[22px] border border-brand-line bg-white p-4 shadow-[0_12px_30px_rgba(23,35,44,0.03)] sm:p-5">
        <div className="flex items-start justify-between">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-yellow/25 text-[#a46b18]"><HandCoins className="h-4 w-4" /></span>
          <span className="text-[11px] font-bold text-brand-muted">после выплат</span>
        </div>
        <p className="mt-4 text-xs font-semibold text-brand-muted">Осталось партнёрам</p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight">{formatSomoni(partnerOutstanding)} <span className="font-sans text-xs font-semibold text-brand-muted">сом.</span></p>
      </div>
      <div className="rounded-[22px] border border-brand-line bg-brand-ink p-4 text-white shadow-[0_12px_30px_rgba(23,35,44,0.12)] sm:p-5">
        <div className="flex items-start justify-between">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-brand-teal"><TrendingUp className="h-4 w-4" /></span>
          <span className="rounded-full bg-brand-teal/15 px-2 py-1 text-[10px] font-bold text-brand-teal">LIVE</span>
        </div>
        <p className="mt-4 text-xs font-semibold text-white/50">Остаток у учёт и расчётыа</p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight">{formatSomoni(cashBalance)} <span className="font-sans text-xs font-semibold text-white/45">сом.</span></p>
        <p className="mt-2 text-[11px] font-medium text-white/40">Расходы сегодня: {formatSomoni(expenseTotal)} сом.</p>
      </div>
    </div>
  );
}

export default function Index() {
  const [activeNav, setActiveNav] = useState<View>("shift");
  const [couriers, setCouriers] = useState<Courier[]>(defaultCouriers);
  const [partners, setPartners] = useState<Partner[]>(defaultPartners);
  const [selectedCourierId, setSelectedCourierId] = useState(defaultCouriers[0].id);
  const [courierSearch, setCourierSearch] = useState("");
  const [isCourierOpen, setIsCourierOpen] = useState(false);
  const [dateValue, setDateValue] = useState(today);
  const [systemOrders, setSystemOrders] = useState("18");
  const [systemAmount, setSystemAmount] = useState("1240");
  const [offlineOrders, setOfflineOrders] = useState("4");
  const [offlineAmount, setOfflineAmount] = useState("480");
  const [deliveryAmount, setDeliveryAmount] = useState("320");
  const [batteryCount, setBatteryCount] = useState("3");
  const [finesAmount, setFinesAmount] = useState("50");
  const [comment, setComment] = useState("");
  const [partnerRows, setPartnerRows] = useState<PartnerRow[]>([
    { id: 1, partnerId: 1, amount: "820" },
    { id: 2, partnerId: 2, amount: "340" },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseDraft, setExpenseDraft] = useState({ date: today, amount: "", recipient: "", comment: "" });
  const [partnerPayments, setPartnerPayments] = useState<PartnerPayment[]>([]);
  const [paymentDraft, setPaymentDraft] = useState({ partnerId: defaultPartners[0].id, date: today, amount: "", method: paymentMethods[0], comment: "" });
  const [settingsSection, setSettingsSection] = useState<"couriers" | "partners">("couriers");
  const [newCourierName, setNewCourierName] = useState("");
  const [newPartner, setNewPartner] = useState({ name: "", descriptor: "", rate: "2" });
  const [isSaved, setIsSaved] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedCourier = couriers.find((courier) => courier.id === selectedCourierId) ?? couriers[0];
  const filteredCouriers = useMemo(() => {
    const query = courierSearch.trim().toLowerCase();
    if (!query) return couriers;
    return couriers.filter((courier) => courier.name.toLowerCase().includes(query));
  }, [courierSearch, couriers]);

  const systemTotal = parseAmount(systemAmount);
  const offlineTotal = parseAmount(offlineAmount);
  const deliveryTotal = parseAmount(deliveryAmount);
  const batteryTotal = parseAmount(batteryCount) * 5;
  const finesTotal = parseAmount(finesAmount);
  const ordersTotal = systemTotal + offlineTotal;
  const courierIncome = ordersTotal + deliveryTotal + batteryTotal + finesTotal;
  const partnerGross = partnerRows.reduce((total, row) => total + parseAmount(row.amount), 0);
  const partnerCommission = partnerRows.reduce((total, row) => {
    const partner = partners.find((item) => item.id === row.partnerId);
    return total + parseAmount(row.amount) * ((partner?.rate ?? 0) / 100);
  }, 0);
  const companyIncome = courierIncome + partnerCommission;
  const cashReceived = courierIncome + partnerGross;
  const currentExpenses = expenses.filter((expense) => expense.date === dateValue);
  const expenseTotal = currentExpenses.reduce((total, expense) => total + parseAmount(expense.amount), 0);

  const partnerBalances = partners.map((partner) => {
    const gross = partnerRows.filter((row) => row.partnerId === partner.id).reduce((total, row) => total + parseAmount(row.amount), 0);
    const commission = gross * (partner.rate / 100);
    const debt = gross - commission;
    const paid = partnerPayments.filter((payment) => payment.partnerId === partner.id).reduce((total, payment) => total + parseAmount(payment.amount), 0);
    return { partner, gross, commission, debt, paid, remaining: Math.max(0, debt - paid) };
  });
  const partnerOutstanding = partnerBalances.reduce((total, item) => total + item.remaining, 0);
  const partnerPaidTotal = partnerPayments.reduce((total, payment) => total + parseAmount(payment.amount), 0);
  const cashBalance = cashReceived - expenseTotal - partnerPaidTotal;
  const currentPaymentBalance = partnerBalances.find((item) => item.partner.id === paymentDraft.partnerId);

  const navItems: { id: View; label: string; icon: LucideIcon; badge?: string }[] = [
    { id: "overview", label: "Обзор", icon: LayoutDashboard },
    { id: "shift", label: "Сдать смену", icon: ClipboardList, badge: "1" },
    { id: "income", label: "Доходы", icon: CircleDollarSign },
    { id: "expenses", label: "Расходы", icon: Receipt },
    { id: "partners", label: "Партнёры", icon: Building2 },
  ];

  const navigate = (view: View) => {
    setActiveNav(view);
    setNotice("");
    setIsCourierOpen(false);
  };

  const updatePartnerRow = (id: number, key: "partnerId" | "amount", value: string) => {
    setPartnerRows((current) => current.map((row) => row.id === id ? { ...row, [key]: key === "partnerId" ? Number(value) : value } : row));
  };

  const addPartnerRow = () => {
    const nextPartner = partners.find((partner) => !partnerRows.some((row) => row.partnerId === partner.id));
    if (!nextPartner) {
      setNotice("Все партнёры уже добавлены в этот отчёт");
      return;
    }
    setPartnerRows((current) => [...current, { id: Date.now(), partnerId: nextPartner.id, amount: "" }]);
  };

  const removePartnerRow = (id: number) => setPartnerRows((current) => current.filter((row) => row.id !== id));

  const handleSave = () => {
    setIsSaved(true);
    setNotice("Отчёт смены сохранён в рабочем журнале");
    window.setTimeout(() => setIsSaved(false), 3200);
  };

  const addExpense = () => {
    if (!expenseDraft.recipient.trim() || parseAmount(expenseDraft.amount) <= 0) {
      setNotice("Укажите сумму расхода и адресата денег");
      return;
    }
    setExpenses((current) => [...current, { id: Date.now(), ...expenseDraft }]);
    setExpenseDraft({ date: dateValue, amount: "", recipient: "", comment: "" });
    setNotice("Расход добавлен в журнал");
  };

  const removeExpense = (id: number) => setExpenses((current) => current.filter((expense) => expense.id !== id));

  const addPayment = () => {
    const amount = parseAmount(paymentDraft.amount);
    if (amount <= 0) {
      setNotice("Введите сумму выплаты партнёру");
      return;
    }
    if (!currentPaymentBalance || currentPaymentBalance.remaining <= 0) {
      setNotice("По этому партнёру сейчас нет открытого долга");
      return;
    }
    if (amount > currentPaymentBalance.remaining) {
      setNotice(`Выплата больше остатка долга: ${formatSomoni(currentPaymentBalance.remaining)} сомони`);
      return;
    }
    setPartnerPayments((current) => [...current, { id: Date.now(), ...paymentDraft }]);
    setPaymentDraft((current) => ({ ...current, amount: "", comment: "" }));
    setNotice("Выплата добавлена в историю взаиморасчётов");
  };

  const addCourier = () => {
    const name = newCourierName.trim();
    if (!name) {
      setNotice("Введите имя курьера");
      return;
    }
    const courier = { id: Date.now(), name, initials: makeInitials(name), tone: toneOptions[couriers.length % toneOptions.length] };
    setCouriers((current) => [...current, courier]);
    setNewCourierName("");
    setNotice("Курьер добавлен в справочник");
  };

  const removeCourier = (id: number) => {
    if (couriers.length === 1) {
      setNotice("В справочнике должен остаться хотя бы один курьер");
      return;
    }
    setCouriers((current) => current.filter((courier) => courier.id !== id));
    if (selectedCourierId === id) setSelectedCourierId(couriers.find((courier) => courier.id !== id)?.id ?? couriers[0].id);
  };

  const addPartner = () => {
    const name = newPartner.name.trim();
    const rate = parseAmount(newPartner.rate);
    if (!name || rate < 0 || rate > 100) {
      setNotice("Укажите название партнёра и процент от 0 до 100");
      return;
    }
    const partner = { id: Date.now(), name, descriptor: newPartner.descriptor.trim() || "партнёр", rate, tone: "bg-[#e8f5ff] text-[#3882b8]" };
    setPartners((current) => [...current, partner]);
    setNewPartner({ name: "", descriptor: "", rate: "2" });
    setNotice("Партнёр добавлен. Процент сохранён в настройках");
  };

  const renderOverview = () => (
    <>
      <PageHeader title="Обзор" eyebrow="Финансовый день" description="Все деньги за выбранную дату: доход компании, транзит партнёров, расходы и выплаты." dateValue={dateValue} onDateChange={setDateValue} action={<button type="button" onClick={() => navigate("shift")} className="hidden h-11 items-center gap-2 rounded-2xl bg-brand-ink px-4 text-sm font-bold text-white transition hover:bg-brand-teal hover:text-brand-ink sm:flex"><FilePlus2 className="h-4 w-4" /> Новая смена</button>} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7">
          <SectionLabel eyebrow="Доходы компании" title="Откуда складывается доход" action={<span className="rounded-full bg-brand-teal/15 px-3 py-1.5 text-[11px] font-bold text-brand-teal-dark">Только наши деньги</span>} />
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-brand-mist/55 px-4 py-3.5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-teal/20 text-brand-teal-dark"><Bike className="h-4 w-4" /></span><div><p className="text-sm font-bold">Заказы и доставка курьера</p><p className="mt-0.5 text-xs font-medium text-brand-muted">По системе, без системы и доставка</p></div></div><span className="text-sm font-bold">{formatSomoni(ordersTotal + deliveryTotal)} сом.</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-brand-mist/55 px-4 py-3.5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-yellow/25 text-[#a46b18]"><BatteryCharging className="h-4 w-4" /></span><p className="text-sm font-bold">Батарейки</p></div><span className="text-sm font-bold">{formatSomoni(batteryTotal)} сом.</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-brand-mist/55 px-4 py-3.5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-coral/20 text-brand-coral-dark"><AlertTriangle className="h-4 w-4" /></span><p className="text-sm font-bold">Штрафы</p></div><span className="text-sm font-bold">{formatSomoni(finesTotal)} сом.</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-brand-teal/10 px-4 py-3.5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand-teal-dark"><HandCoins className="h-4 w-4" /></span><div><p className="text-sm font-bold">Комиссия партнёров</p><p className="mt-0.5 text-xs font-medium text-brand-muted">Доход с чеков по ставке партнёра</p></div></div><span className="text-sm font-bold text-brand-teal-dark">+{formatSomoni(partnerCommission)} сом.</span></div>
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-brand-line pt-5"><div><p className="text-xs font-semibold text-brand-muted">Итого доход компании</p><p className="mt-1 font-display text-3xl font-bold tracking-tight">{formatSomoni(companyIncome)} <span className="font-sans text-sm font-semibold text-brand-muted">сомони</span></p></div><button type="button" onClick={() => navigate("income")} className="text-xs font-bold text-brand-teal-dark hover:underline">Открыть доходы →</button></div>
        </section>

        <section className="rounded-[28px] bg-brand-ink p-6 text-white shadow-[0_20px_50px_rgba(23,35,44,0.16)] sm:p-7">
          <div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Касса дня</p><h2 className="mt-2 font-display text-xl font-bold">Что осталось у учёт и расчётыа</h2></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-teal text-brand-ink"><WalletCards className="h-4 w-4" /></span></div>
          <p className="mt-8 font-display text-[2.8rem] font-bold tracking-[-0.06em]">{formatSomoni(cashBalance)} <span className="font-sans text-sm font-semibold tracking-normal text-white/45">сом.</span></p>
          <p className="mt-2 text-xs font-medium leading-5 text-white/45">Касса после расходов и фактических выплат партнёрам.</p>
          <div className="mt-7 space-y-3 border-t border-white/10 pt-5 text-sm"><div className="flex justify-between"><span className="text-white/50">Получено от курьера</span><span className="font-bold">{formatSomoni(cashReceived)} сом.</span></div><div className="flex justify-between"><span className="text-white/50">Расходы за день</span><span className="font-bold text-brand-coral">−{formatSomoni(expenseTotal)} сом.</span></div><div className="flex justify-between"><span className="text-white/50">Выплачено партнёрам</span><span className="font-bold text-brand-yellow">−{formatSomoni(partnerPaidTotal)} сом.</span></div></div>
        </section>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="Расходы" title={`Расходы за ${dateLabel(dateValue)}`} action={<button type="button" onClick={() => navigate("expenses")} className="text-xs font-bold text-brand-teal-dark">Все расходы →</button>} />{currentExpenses.length > 0 ? <div className="space-y-2.5">{currentExpenses.slice(0, 4).map((expense) => <div key={expense.id} className="flex items-center justify-between rounded-xl bg-brand-mist/55 px-3.5 py-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{expense.recipient}</p><p className="mt-0.5 truncate text-xs font-medium text-brand-muted">{expense.comment || "Без комментария"}</p></div><span className="ml-3 shrink-0 text-sm font-bold">{formatSomoni(parseAmount(expense.amount))} сом.</span></div>)}</div> : <EmptyState icon={Receipt} title="Расходов за этот день пока нет" description="Добавьте первый расход с датой, суммой, адресатом и комментарием." action={<button type="button" onClick={() => navigate("expenses")} className="rounded-xl bg-brand-ink px-3.5 py-2 text-xs font-bold text-white">Добавить расход</button>} />}<div className="mt-5 flex justify-between border-t border-brand-line pt-4 text-sm"><span className="font-semibold text-brand-muted">Общая сумма</span><span className="font-bold">{formatSomoni(expenseTotal)} сом.</span></div></section>
        <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="Взаиморасчёты" title="Открытые долги партнёрам" action={<button type="button" onClick={() => navigate("partners")} className="text-xs font-bold text-brand-teal-dark">Выплаты →</button>} /><div className="space-y-3">{partnerBalances.filter((item) => item.gross > 0).length > 0 ? partnerBalances.filter((item) => item.gross > 0).map(({ partner, debt, remaining, paid }) => <div key={partner.id} className="flex items-center gap-3 rounded-2xl bg-brand-mist/55 px-3.5 py-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[10px] font-bold ${partner.tone}`}>{partner.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{partner.name}</p><p className="mt-0.5 text-xs font-medium text-brand-muted">Комиссия {partner.rate}% · выплачено {formatSomoni(paid)} сом.</p></div><div className="text-right"><p className="text-sm font-bold">{formatSomoni(remaining)} сом.</p><p className="mt-0.5 text-[10px] font-semibold text-brand-muted">из {formatSomoni(debt)}</p></div></div>) : <EmptyState icon={Building2} title="Партнёрских долгов пока нет" description="Они появятся после сдачи смены с суммами чеков." />}</div></section>
      </div>
    </>
  );

  const renderIncome = () => (
    <>
      <PageHeader title="Доходы" eyebrow="Только деньги компании" description="Здесь собраны только собственные доходы Fincance GoGo. Суммы, которые нужно вернуть партнёрам, показаны отдельно и не увеличивают доход." dateValue={dateValue} onDateChange={setDateValue} />
      <section className="mb-6 rounded-[24px] border border-brand-teal/30 bg-brand-teal/12 p-5 sm:p-6"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-teal text-brand-ink"><CircleHelp className="h-4 w-4" /></span><div><p className="text-sm font-bold">Правило расчёта дохода</p><p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-brand-teal-dark/80">Чек партнёра 100 сомони при комиссии 5% даёт компании 5 сомони дохода. Оставшиеся 95 сомони — долг партнёру, а не доход компании.</p></div></div></section>
      <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="Состав дохода" title={`Доход за ${dateLabel(dateValue)}`} action={<span className="rounded-full bg-brand-teal/15 px-3 py-1.5 text-[11px] font-bold text-brand-teal-dark">{formatSomoni(companyIncome)} сомони</span>} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><div className="rounded-2xl bg-brand-mist/55 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-teal/20 text-brand-teal-dark"><Bike className="h-4 w-4" /></span><p className="mt-5 text-xs font-semibold text-brand-muted">Заказы и доставка</p><p className="mt-1 font-display text-2xl font-bold">{formatSomoni(ordersTotal + deliveryTotal)} <span className="font-sans text-xs text-brand-muted">сом.</span></p><p className="mt-2 text-[11px] font-semibold text-brand-muted">{parseAmount(systemOrders) + parseAmount(offlineOrders)} заказов</p></div><div className="rounded-2xl bg-brand-mist/55 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-yellow/25 text-[#a46b18]"><BatteryCharging className="h-4 w-4" /></span><p className="mt-5 text-xs font-semibold text-brand-muted">Батарейки</p><p className="mt-1 font-display text-2xl font-bold">{formatSomoni(batteryTotal)} <span className="font-sans text-xs text-brand-muted">сом.</span></p><p className="mt-2 text-[11px] font-semibold text-brand-muted">{batteryCount || 0} шт. × 5 сомони</p></div><div className="rounded-2xl bg-brand-mist/55 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-coral/20 text-brand-coral-dark"><AlertTriangle className="h-4 w-4" /></span><p className="mt-5 text-xs font-semibold text-brand-muted">Штрафы</p><p className="mt-1 font-display text-2xl font-bold">{formatSomoni(finesTotal)} <span className="font-sans text-xs text-brand-muted">сом.</span></p><p className="mt-2 text-[11px] font-semibold text-brand-muted">Удержано со смены</p></div><div className="rounded-2xl bg-brand-teal/15 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand-teal-dark"><HandCoins className="h-4 w-4" /></span><p className="mt-5 text-xs font-semibold text-brand-teal-dark">Комиссия партнёров</p><p className="mt-1 font-display text-2xl font-bold text-brand-teal-dark">{formatSomoni(partnerCommission)} <span className="font-sans text-xs text-brand-teal-dark/70">сом.</span></p><p className="mt-2 text-[11px] font-semibold text-brand-teal-dark/70">Доход с чеков</p></div></div></section>
      <section className="mt-6 rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="Не доход" title="Транзитные деньги партнёров" action={<span className="text-xs font-semibold text-brand-muted">возвратный долг</span>} /><div className="rounded-2xl border border-brand-yellow/35 bg-brand-yellow/12 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-sm font-bold">Получено чеков партнёров</p><p className="mt-1 text-xs font-medium leading-5 text-[#84601f]">Эти деньги хранятся в кассе до выплаты и не попадают в доход компании.</p></div><p className="font-display text-2xl font-bold text-[#8a641d]">{formatSomoni(partnerGross)} <span className="font-sans text-xs">сом.</span></p></div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted"><tr><th className="pb-3">Партнёр</th><th className="pb-3">Чек</th><th className="pb-3">Ставка</th><th className="pb-3">Ваш доход</th><th className="pb-3 text-right">Долг</th></tr></thead><tbody className="divide-y divide-brand-line">{partnerBalances.filter((item) => item.gross > 0).map(({ partner, gross, commission, debt }) => <tr key={partner.id}><td className="py-3 font-bold">{partner.name}</td><td className="py-3">{formatSomoni(gross)} сом.</td><td className="py-3">{partner.rate}%</td><td className="py-3 font-bold text-brand-teal-dark">+{formatSomoni(commission)} сом.</td><td className="py-3 text-right font-bold">{formatSomoni(debt)} сом.</td></tr>)}</tbody></table></div></section>
    </>
  );

  const renderExpenses = () => (
    <>
      <PageHeader title="Расходы" eyebrow="Журнал расходов" description="Добавляйте столько расходов, сколько было за день. У каждого расхода своя дата, сумма, адресат денег и подробный комментарий." dateValue={dateValue} onDateChange={setDateValue} />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="Новая запись" title="Добавить расход" action={<span className="rounded-full bg-brand-mist px-3 py-1.5 text-[11px] font-bold text-brand-muted">Неограниченно</span>} /><div className="space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Дата расхода</span><span className="flex h-11 items-center gap-2 rounded-xl border border-brand-line bg-brand-mist/45 px-3 focus-within:border-brand-teal"><CalendarDays className="h-4 w-4 text-brand-teal-dark" /><input type="date" value={expenseDraft.date} onChange={(event) => setExpenseDraft((current) => ({ ...current, date: event.target.value }))} className="w-full bg-transparent text-sm font-bold outline-none" /></span></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Сумма расхода</span><span className="flex h-11 items-center gap-2 rounded-xl border border-brand-line bg-brand-mist/45 px-3 focus-within:border-brand-teal"><input type="number" min="0" value={expenseDraft.amount} onChange={(event) => setExpenseDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0" className="w-full bg-transparent text-sm font-bold outline-none" /><span className="text-xs font-bold text-brand-muted">сом.</span></span></label><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Кому адресованы деньги</span><input value={expenseDraft.recipient} onChange={(event) => setExpenseDraft((current) => ({ ...current, recipient: event.target.value }))} placeholder="Например, аренда" className="h-11 w-full rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-semibold outline-none placeholder:text-brand-muted/60 focus:border-brand-teal focus:bg-white" /></label></div><label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-brand-muted"><MessageSquareText className="h-4 w-4 text-brand-teal-dark" /> Комментарий к расходу</span><textarea value={expenseDraft.comment} onChange={(event) => setExpenseDraft((current) => ({ ...current, comment: event.target.value }))} placeholder="Опишите, на что ушли деньги, номер чека или дополнительные детали..." rows={5} className="min-h-[128px] w-full resize-y rounded-xl border border-brand-line bg-brand-mist/45 px-3 py-3 text-sm font-medium leading-6 outline-none placeholder:text-brand-muted/60 focus:border-brand-teal focus:bg-white" /></label><button type="button" onClick={addExpense} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-ink text-sm font-extrabold text-white transition hover:bg-brand-teal hover:text-brand-ink"><Plus className="h-4 w-4" /> Добавить расход</button></div></section>
        <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="История за выбранный день" title={`${currentExpenses.length} ${currentExpenses.length === 1 ? "расход" : "расходов"}`} action={<div className="text-right"><p className="text-[11px] font-semibold text-brand-muted">Общая сумма</p><p className="font-display text-xl font-bold">{formatSomoni(expenseTotal)} сом.</p></div>} />{currentExpenses.length > 0 ? <div className="space-y-3">{currentExpenses.map((expense, index) => <div key={expense.id} className="rounded-2xl border border-brand-line bg-brand-mist/35 p-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-coral/15 text-brand-coral-dark text-xs font-bold">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center"><p className="text-sm font-bold">{expense.recipient}</p><p className="font-display text-lg font-bold">{formatSomoni(parseAmount(expense.amount))} <span className="font-sans text-xs text-brand-muted">сом.</span></p></div><p className="mt-1 text-xs font-semibold text-brand-muted">{dateLabel(expense.date)}</p>{expense.comment && <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs font-medium leading-5 text-brand-muted">{expense.comment}</p>}</div><button type="button" onClick={() => removeExpense(expense.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-brand-muted transition hover:bg-brand-coral/15 hover:text-brand-coral-dark" aria-label="Удалить расход"><Trash2 className="h-4 w-4" /></button></div></div>)}</div> : <EmptyState icon={Receipt} title="Журнал пока пуст" description="Заполните форму слева. После добавления здесь появится каждая отдельная запись расхода." />}</section>
      </div>
    </>
  );

  const renderPartners = () => (
    <>
      <PageHeader title="Партнёры" eyebrow="Долги и выплаты" description="Следите за долгом по каждому партнёру и фиксируйте выплаты частями. Остаток пересчитывается после каждой операции." dateValue={dateValue} onDateChange={setDateValue} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{partnerBalances.map(({ partner, gross, commission, debt, paid, remaining }) => <div key={partner.id} className="rounded-[22px] border border-brand-line bg-white p-4 shadow-[0_12px_30px_rgba(23,35,44,0.03)]"><div className="flex items-start justify-between"><span className={`grid h-9 w-9 place-items-center rounded-xl text-[10px] font-bold ${partner.tone}`}>{partner.name.slice(0, 2).toUpperCase()}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${remaining === 0 && debt > 0 ? "bg-brand-teal/15 text-brand-teal-dark" : "bg-brand-yellow/20 text-[#8b641e]"}`}>{remaining === 0 && debt > 0 ? "Выплачено" : `${partner.rate}% комиссия`}</span></div><p className="mt-5 text-sm font-bold">{partner.name}</p><p className="mt-1 text-xs font-medium text-brand-muted">{partner.descriptor}</p><div className="mt-5 flex items-end justify-between"><div><p className="text-[11px] font-semibold text-brand-muted">Остаток долга</p><p className="mt-1 font-display text-xl font-bold">{formatSomoni(remaining)} <span className="font-sans text-xs text-brand-muted">сом.</span></p></div><p className="text-right text-[11px] font-semibold text-brand-muted">из {formatSomoni(debt)}<br />оплачено {formatSomoni(paid)}</p></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-brand-mist"><div className="h-full rounded-full bg-brand-teal" style={{ width: `${debt ? Math.min(100, (paid / debt) * 100) : 0}%` }} /></div><p className="mt-2 text-[11px] font-semibold text-brand-teal-dark">Доход компании: {formatSomoni(commission)} сом.</p></div>)}</section>
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"><section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="Новая операция" title="Зафиксировать выплату" action={<span className="rounded-full bg-brand-mist px-3 py-1.5 text-[11px] font-bold text-brand-muted">Можно частями</span>} /><div className="space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Партнёр</span><select value={paymentDraft.partnerId} onChange={(event) => setPaymentDraft((current) => ({ ...current, partnerId: Number(event.target.value) }))} className="h-11 w-full appearance-none rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-bold outline-none focus:border-brand-teal">{partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name} · осталось {formatSomoni(partnerBalances.find((item) => item.partner.id === partner.id)?.remaining ?? 0)} сом.</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Дата выплаты</span><input type="date" value={paymentDraft.date} onChange={(event) => setPaymentDraft((current) => ({ ...current, date: event.target.value }))} className="h-11 w-full rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-bold outline-none focus:border-brand-teal" /></label><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Сумма выплаты</span><span className="flex h-11 items-center gap-2 rounded-xl border border-brand-line bg-brand-mist/45 px-3 focus-within:border-brand-teal"><input type="number" min="0" max={currentPaymentBalance?.remaining ?? undefined} value={paymentDraft.amount} onChange={(event) => setPaymentDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0" className="w-full bg-transparent text-sm font-bold outline-none" /><span className="text-xs font-bold text-brand-muted">сом.</span></span></label></div><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Каким образом выплатили</span><select value={paymentDraft.method} onChange={(event) => setPaymentDraft((current) => ({ ...current, method: event.target.value }))} className="h-11 w-full appearance-none rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-bold outline-none focus:border-brand-teal">{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select></label><label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-brand-muted"><MessageSquareText className="h-4 w-4 text-brand-teal-dark" /> Комментарий к взаиморасчёту</span><textarea value={paymentDraft.comment} onChange={(event) => setPaymentDraft((current) => ({ ...current, comment: event.target.value }))} placeholder="Например: отправил 100 сомони через Душанбе Сити" rows={4} className="min-h-[104px] w-full resize-y rounded-xl border border-brand-line bg-brand-mist/45 px-3 py-3 text-sm font-medium leading-6 outline-none placeholder:text-brand-muted/60 focus:border-brand-teal focus:bg-white" /></label><button type="button" onClick={addPayment} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-ink text-sm font-extrabold text-white transition hover:bg-brand-teal hover:text-brand-ink"><CheckCircle2 className="h-4 w-4" /> Записать выплату</button></div></section><section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="История операций" title="Выплаты партнёрам" action={<span className="text-xs font-semibold text-brand-muted">{partnerPayments.length} операций</span>} />{partnerPayments.length > 0 ? <div className="space-y-3">{partnerPayments.map((payment) => { const partner = partners.find((item) => item.id === payment.partnerId); const balance = partnerBalances.find((item) => item.partner.id === payment.partnerId); return <div key={payment.id} className="flex items-start gap-3 rounded-2xl border border-brand-line bg-brand-mist/35 p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-teal/15 text-brand-teal-dark"><CheckCircle2 className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-1 sm:flex-row"><p className="text-sm font-bold">{partner?.name ?? "Партнёр"}</p><p className="font-display text-lg font-bold">{formatSomoni(parseAmount(payment.amount))} <span className="font-sans text-xs text-brand-muted">сом.</span></p></div><p className="mt-1 text-xs font-semibold text-brand-muted">{dateLabel(payment.date)} · {payment.method}</p>{payment.comment && <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs font-medium leading-5 text-brand-muted">{payment.comment}</p>}<p className="mt-3 text-xs font-bold text-brand-teal-dark">После этой выплаты осталось: {formatSomoni(balance?.remaining ?? 0)} сом.</p></div></div>; })}</div> : <EmptyState icon={History} title="Выплат ещё нет" description="После первой частичной выплаты здесь появится подробная история и текущий остаток по партнёру." />}</section></div>
    </>
  );

  const renderSettings = () => (
    <>
      <PageHeader title="Настройки" eyebrow="Справочники" description="Добавляйте курьеров и партнёров только здесь. Процент комиссии хранится в карточке партнёра и автоматически используется в расчётах." dateValue={dateValue} onDateChange={setDateValue} />
      <div className="mb-6 flex max-w-md rounded-2xl border border-brand-line bg-white p-1.5 shadow-sm shadow-brand-ink/5"><button type="button" onClick={() => setSettingsSection("couriers")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${settingsSection === "couriers" ? "bg-brand-ink text-white" : "text-brand-muted hover:text-brand-ink"}`}><Users className="h-4 w-4" /> Курьеры</button><button type="button" onClick={() => setSettingsSection("partners")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${settingsSection === "partners" ? "bg-brand-ink text-white" : "text-brand-muted hover:text-brand-ink"}`}><Building2 className="h-4 w-4" /> Партнёры</button></div>
      {settingsSection === "couriers" ? <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="Справочник курьеров" title="Добавить курьера" /><div className="space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Имя и фамилия</span><input value={newCourierName} onChange={(event) => setNewCourierName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addCourier(); }} placeholder="Например, Бобоев Юсуф" className="h-12 w-full rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-semibold outline-none placeholder:text-brand-muted/60 focus:border-brand-teal focus:bg-white" /></label><button type="button" onClick={addCourier} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-ink text-sm font-extrabold text-white transition hover:bg-brand-teal hover:text-brand-ink"><Plus className="h-4 w-4" /> Добавить в справочник</button></div></section><section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="Активные курьеры" title={`${couriers.length} в справочнике`} action={<span className="text-xs font-semibold text-brand-muted">Используются в сменах</span>} /><div className="space-y-2.5">{couriers.map((courier) => <div key={courier.id} className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-mist/35 px-3.5 py-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${courier.tone}`}>{courier.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{courier.name}</p><p className="mt-0.5 text-xs font-medium text-brand-muted">Готов к сдаче смены</p></div>{selectedCourierId === courier.id && <span className="rounded-full bg-brand-teal/15 px-2 py-1 text-[10px] font-bold text-brand-teal-dark">Выбран</span>}<button type="button" onClick={() => removeCourier(courier.id)} className="grid h-8 w-8 place-items-center rounded-lg text-brand-muted transition hover:bg-brand-coral/15 hover:text-brand-coral-dark" aria-label={`Удалить ${courier.name}`}><Trash2 className="h-4 w-4" /></button></div>)}</div></section></div> : <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="Справочник партнёров" title="Добавить партнёра" /><div className="space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Название партнёра</span><input value={newPartner.name} onChange={(event) => setNewPartner((current) => ({ ...current, name: event.target.value }))} placeholder="Например, Tcell" className="h-11 w-full rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-semibold outline-none placeholder:text-brand-muted/60 focus:border-brand-teal focus:bg-white" /></label><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Описание</span><input value={newPartner.descriptor} onChange={(event) => setNewPartner((current) => ({ ...current, descriptor: event.target.value }))} placeholder="Например, мобильная связь" className="h-11 w-full rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-semibold outline-none placeholder:text-brand-muted/60 focus:border-brand-teal focus:bg-white" /></label><label className="block"><span className="mb-2 block text-xs font-bold text-brand-muted">Процент комиссии</span><span className="flex h-11 items-center gap-2 rounded-xl border border-brand-line bg-brand-mist/45 px-3 focus-within:border-brand-teal"><input type="number" min="0" max="100" step="0.1" value={newPartner.rate} onChange={(event) => setNewPartner((current) => ({ ...current, rate: event.target.value }))} className="w-full bg-transparent text-sm font-bold outline-none" /><span className="text-sm font-bold text-brand-teal-dark">%</span></span></label><button type="button" onClick={addPartner} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-ink text-sm font-extrabold text-white transition hover:bg-brand-teal hover:text-brand-ink"><Plus className="h-4 w-4" /> Добавить партнёра</button></div></section><section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="Ставки и партнёры" title={`${partners.length} в справочнике`} action={<span className="text-xs font-semibold text-brand-muted">Процент задаётся здесь</span>} /><div className="space-y-2.5">{partners.map((partner) => <div key={partner.id} className="flex flex-col gap-3 rounded-2xl border border-brand-line bg-brand-mist/35 p-3 sm:flex-row sm:items-center"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[10px] font-bold ${partner.tone}`}>{partner.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{partner.name}</p><p className="mt-0.5 text-xs font-medium text-brand-muted">{partner.descriptor}</p></div><label className="flex h-10 items-center gap-1.5 rounded-xl border border-brand-line bg-white px-3"><input type="number" min="0" max="100" step="0.1" value={partner.rate} onChange={(event) => setPartners((current) => current.map((item) => item.id === partner.id ? { ...item, rate: parseAmount(event.target.value) } : item))} className="w-14 bg-transparent text-right text-sm font-bold outline-none" /><span className="text-xs font-bold text-brand-teal-dark">%</span></label><span className="text-xs font-semibold text-brand-muted sm:w-28">с каждого чека</span></div>)}</div></section></div>}
    </>
  );

  const renderShift = () => (
    <>
      <PageHeader title="Сдать смену" eyebrow="Новая запись" description="Зафиксируйте отчёт курьера: заказы, деньги партнёров, собственные доходы и дополнительные расчёты." dateValue={dateValue} onDateChange={setDateValue} />
      <div className="space-y-6">
        <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="01 / кто сдаёт" title="Курьер и дата смены" action={<span className="rounded-full bg-brand-mist px-3 py-1.5 text-[11px] font-bold text-brand-muted">Обязательно</span>} /><div className="relative"><button type="button" onClick={() => setIsCourierOpen((open) => !open)} className="flex w-full items-center justify-between rounded-2xl border border-brand-line bg-brand-mist/50 px-4 py-3.5 text-left transition-colors hover:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"><span className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-bold ${selectedCourier?.tone ?? toneOptions[0]}`}>{selectedCourier?.initials ?? "?"}</span><span><span className="block text-[11px] font-semibold text-brand-muted">Выбранный курьер</span><span className="mt-0.5 block text-sm font-bold text-brand-ink">{selectedCourier?.name ?? "Добавьте курьера в настройках"}</span></span></span><ChevronDown className={`h-5 w-5 text-brand-muted transition-transform ${isCourierOpen ? "rotate-180" : ""}`} /></button>{isCourierOpen && <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-brand-line bg-white p-2 shadow-[0_20px_50px_rgba(23,35,44,0.15)]"><div className="relative mb-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" /><input autoFocus value={courierSearch} onChange={(event) => setCourierSearch(event.target.value)} placeholder="Найти курьера..." className="h-10 w-full rounded-xl bg-brand-mist pl-9 pr-3 text-sm font-medium outline-none ring-brand-teal/30 placeholder:text-brand-muted focus:ring-2" /></div>{filteredCouriers.length > 0 ? filteredCouriers.map((courier) => <button type="button" key={courier.id} onClick={() => { setSelectedCourierId(courier.id); setIsCourierOpen(false); setCourierSearch(""); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-brand-mist"><span className={`grid h-8 w-8 place-items-center rounded-lg text-[10px] font-bold ${courier.tone}`}>{courier.initials}</span><span className="flex-1 text-sm font-semibold">{courier.name}</span>{selectedCourierId === courier.id && <Check className="h-4 w-4 text-brand-teal-dark" />}</button>) : <p className="px-3 py-4 text-center text-sm font-medium text-brand-muted">Курьер не найден</p>}</div>}</div></section>
        <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="02 / деньги от курьера" title="Заказы и собственные доходы" action={<span className="text-xs font-semibold text-brand-muted">Доход компании</span>} /><div className="grid gap-4 md:grid-cols-2"><MetricInput label="Заказы по системе" helper={`${systemOrders || 0} шт.`} value={systemAmount} onChange={setSystemAmount} icon={CreditCard} iconClassName="bg-brand-teal/20 text-brand-teal-dark" /><MetricInput label="Заказы без системы" helper={`${offlineOrders || 0} шт.`} value={offlineAmount} onChange={setOfflineAmount} icon={Receipt} iconClassName="bg-brand-coral/20 text-brand-coral-dark" /></div><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="block"><span className="mb-2 flex items-center justify-between text-xs font-bold text-brand-muted"><span>Количество по системе</span><span className="text-brand-teal-dark">шт.</span></span><input type="number" min="0" value={systemOrders} onChange={(event) => setSystemOrders(event.target.value)} className="h-11 w-full rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-bold outline-none transition focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15" /></label><label className="block"><span className="mb-2 flex items-center justify-between text-xs font-bold text-brand-muted"><span>Количество без системы</span><span className="text-brand-coral-dark">шт.</span></span><input type="number" min="0" value={offlineOrders} onChange={(event) => setOfflineOrders(event.target.value)} className="h-11 w-full rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-bold outline-none transition focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15" /></label></div><div className="mt-5 flex flex-col gap-3 border-t border-brand-line pt-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-brand-muted"><Bike className="h-4 w-4 text-brand-teal-dark" /> Сумма доставки курьера</div><label className="flex items-center gap-2 self-start rounded-xl bg-brand-teal/10 px-3 py-2 sm:self-auto"><input type="number" min="0" value={deliveryAmount} onChange={(event) => setDeliveryAmount(event.target.value)} className="w-20 bg-transparent text-right text-sm font-bold text-brand-ink outline-none" /><span className="text-xs font-bold text-brand-teal-dark">сом.</span></label></div><div className="mt-4 rounded-2xl border border-brand-teal/25 bg-brand-teal/10 px-4 py-3 text-xs font-semibold text-brand-teal-dark">Доход с денег курьера: <strong>{formatSomoni(courierIncome)} сомони</strong>. Деньги партнёров ниже считаются транзитом.</div></section>
        <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="03 / транзит" title="Суммы партнёров" action={<button type="button" onClick={addPartnerRow} className="flex items-center gap-1.5 rounded-xl bg-brand-ink px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-teal hover:text-brand-ink"><Plus className="h-3.5 w-3.5" /> Добавить строку</button>} /><p className="mb-5 max-w-2xl text-xs font-medium leading-5 text-brand-muted">Вводите полную сумму чека, которую передал курьер. Комиссия считается доходом компании, остаток автоматически становится долгом партнёру.</p><div className="space-y-3">{partnerRows.map((row) => { const selectedPartner = partners.find((partner) => partner.id === row.partnerId) ?? partners[0]; const gross = parseAmount(row.amount); const commission = gross * ((selectedPartner?.rate ?? 0) / 100); return <div key={row.id} className="relative grid gap-3 rounded-2xl border border-brand-line bg-brand-mist/35 p-3 sm:grid-cols-[minmax(0,1fr)_126px_30px] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"><label className="relative flex min-w-0 items-center gap-3 rounded-xl border border-brand-line bg-white px-3 py-2.5 sm:bg-brand-mist/45"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-bold ${selectedPartner?.tone ?? toneOptions[0]}`}>{selectedPartner?.name.slice(0, 2).toUpperCase() ?? "--"}</span><select value={row.partnerId} onChange={(event) => updatePartnerRow(row.id, "partnerId", event.target.value)} className="min-w-0 flex-1 appearance-none bg-transparent pr-5 text-sm font-bold text-brand-ink outline-none">{partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name} · {partner.rate}%</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-brand-muted" /></label><label className="flex items-center rounded-xl border border-brand-line bg-white px-3 py-2.5 sm:bg-brand-mist/45"><input type="number" min="0" value={row.amount} onChange={(event) => updatePartnerRow(row.id, "amount", event.target.value)} placeholder="0" className="w-full bg-transparent text-sm font-bold outline-none" /><span className="text-xs font-semibold text-brand-muted">сом.</span></label><button type="button" onClick={() => removePartnerRow(row.id)} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-lg text-brand-muted transition hover:bg-brand-coral/15 hover:text-brand-coral-dark sm:static sm:h-8 sm:w-8" aria-label="Удалить строку"><Minus className="h-4 w-4" /></button><div className="flex items-center justify-between px-1 text-[11px] font-semibold text-brand-muted sm:hidden"><span>Комиссия {selectedPartner?.rate ?? 0}% · +{formatSomoni(commission)} доход</span><span className="text-brand-teal-dark">долг {formatSomoni(gross - commission)}</span></div></div>; })}</div><div className="mt-5 grid gap-3 border-t border-brand-line pt-4 text-sm sm:grid-cols-3"><div><p className="text-xs font-semibold text-brand-muted">Получено чеков</p><p className="mt-1 font-display font-bold">{formatSomoni(partnerGross)} <span className="font-sans text-xs text-brand-muted">сом.</span></p></div><div><p className="text-xs font-semibold text-brand-muted">Доход компании</p><p className="mt-1 font-display font-bold text-brand-teal-dark">+{formatSomoni(partnerCommission)} <span className="font-sans text-xs text-brand-muted">сом.</span></p></div><div><p className="text-xs font-semibold text-brand-muted">Долг партнёрам</p><p className="mt-1 font-display font-bold">{formatSomoni(partnerGross - partnerCommission)} <span className="font-sans text-xs text-brand-muted">сом.</span></p></div></div></section>
        <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7"><SectionLabel eyebrow="04 / дополнительно" title="Батарейки и штрафы" action={<span className="text-xs font-semibold text-brand-muted">Батарейка — 5 сомони</span>} /><div className="grid gap-4 md:grid-cols-2"><label className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-mist/45 p-4 focus-within:border-brand-teal"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-yellow/25 text-[#a46b18]"><BatteryCharging className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">Батарейки</span><span className="mt-1 block text-xs font-semibold text-brand-muted">{formatSomoni(batteryTotal)} сомони к оплате</span></span><input type="number" min="0" value={batteryCount} onChange={(event) => setBatteryCount(event.target.value)} className="w-14 rounded-lg bg-white px-2 py-2 text-center text-sm font-bold outline-none ring-1 ring-brand-line focus:ring-brand-teal" /><span className="text-xs font-bold text-brand-muted">шт.</span></label><label className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-mist/45 p-4 focus-within:border-brand-teal"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-coral/20 text-brand-coral-dark"><AlertTriangle className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">Штрафы</span><span className="mt-1 block text-xs font-semibold text-brand-muted">Удержание со смены</span></span><input type="number" min="0" value={finesAmount} onChange={(event) => setFinesAmount(event.target.value)} className="w-[92px] rounded-lg bg-white px-2 py-2 text-right text-sm font-bold outline-none ring-1 ring-brand-line focus:ring-brand-teal" /><span className="text-xs font-bold text-brand-muted">сом.</span></label></div><label className="mt-4 block rounded-2xl border border-brand-line bg-brand-mist/35 p-4 focus-within:border-brand-teal focus-within:bg-white"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-brand-muted"><MessageSquareText className="h-4 w-4 text-brand-teal-dark" /> Комментарий к смене</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Например: возврат заказа, недостача, особые условия..." rows={4} className="min-h-[112px] w-full resize-y bg-transparent text-sm font-medium leading-6 outline-none placeholder:text-brand-muted/60" /></label></section>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-xs font-semibold text-brand-muted"><span className="grid h-5 w-5 place-items-center rounded-full bg-brand-teal/15 text-brand-teal-dark"><Check className="h-3 w-3" /></span> Партнёрские деньги не входят в доход компании</p><button type="button" onClick={handleSave} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-teal px-6 text-sm font-extrabold text-brand-ink shadow-[0_10px_24px_rgba(79,150,221,0.28)] transition hover:-translate-y-0.5 hover:bg-[#a9d5fa] active:translate-y-0">{isSaved ? <><Check className="h-4 w-4" /> Смена сохранена</> : <><Banknote className="h-4 w-4" /> Сохранить отчёт</>}</button></div>
      </div>
    </>
  );

  const viewContent = activeNav === "overview" ? renderOverview() : activeNav === "income" ? renderIncome() : activeNav === "expenses" ? renderExpenses() : activeNav === "partners" ? renderPartners() : activeNav === "settings" ? renderSettings() : renderShift();

  return (
    <div className="min-h-screen bg-brand-mist text-brand-ink lg:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-brand-ink px-4 py-5 text-white lg:flex">
        <div className="flex items-center gap-3 px-3"><div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-white ring-1 ring-brand-teal/30"><img src="https://cdn.builder.io/api/v1/image/assets%2F8cc0bb9fe0d443f9a8b7366b133cf86b%2F88b7771880134a35ac741b87bf71c183?format=webp&width=800&height=1200" alt="Логотип Fincance GoGo" className="h-full w-full object-contain" /></div><div><p className="font-display text-[17px] font-bold leading-none tracking-tight">Fincance GoGo</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">учёт и расчёты</p></div></div>
        <div className="mt-12 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Рабочее меню</div>
        <nav className="mt-3 space-y-1">{navItems.map(({ id, label, icon: Icon, badge }) => { const isActive = activeNav === id; return <button key={id} type="button" onClick={() => navigate(id)} className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold transition-colors ${isActive ? "bg-brand-teal text-brand-ink shadow-[0_8px_22px_rgba(79,150,221,0.14)]" : "text-white/60 hover:bg-white/8 hover:text-white"}`}><span className="flex items-center gap-3"><Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.4 : 1.9} />{label}</span>{badge && <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold ${isActive ? "bg-brand-ink text-white" : "bg-brand-coral text-brand-ink"}`}>{badge}</span>}</button>; })}</nav>
        <div className="mt-2 border-t border-white/10 pt-3"><button type="button" onClick={() => navigate("settings")} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition-colors ${activeNav === "settings" ? "bg-white/10 text-white" : "text-white/45 hover:bg-white/8 hover:text-white"}`}><Settings2 className="h-[18px] w-[18px]" /> Настройки</button></div>
        <div className="mt-auto rounded-[22px] border border-white/10 bg-white/5 p-4"><div className="mb-4 flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-yellow/15 text-brand-yellow"><Sparkles className="h-4 w-4" /></span><span className="rounded-full bg-brand-teal/15 px-2 py-1 text-[10px] font-bold text-brand-teal">PRO</span></div><p className="text-sm font-semibold">Всё под контролем</p><p className="mt-1 text-xs leading-5 text-white/45">Доходы, расходы и долги партнёров в одном месте.</p></div>
        <div className="mt-5 flex items-center gap-3 border-t border-white/10 px-2 pt-5"><div className="grid h-9 w-9 place-items-center rounded-full bg-brand-coral text-xs font-bold text-brand-ink">МК</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Команда Fincance GoGo</p><p className="text-xs text-white/40">Финансовый отдел</p></div><Settings2 className="h-4 w-4 text-white/35" /></div>
      </aside>
      <div className="min-w-0 flex-1 lg:pl-[248px]"><header className="flex items-center justify-between border-b border-brand-line/80 bg-white/75 px-4 py-4 backdrop-blur-sm sm:px-6 lg:hidden"><div className="flex items-center gap-2.5"><div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-brand-teal/30"><img src="https://cdn.builder.io/api/v1/image/assets%2F8cc0bb9fe0d443f9a8b7366b133cf86b%2F88b7771880134a35ac741b87bf71c183?format=webp&width=800&height=1200" alt="Логотип Fincance GoGo" className="h-full w-full object-contain" /></div><div><p className="font-display text-base font-bold leading-none">Fincance GoGo</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-muted">учёт и расчёты</p></div></div><div className="flex items-center gap-2"><button type="button" className="grid h-9 w-9 place-items-center rounded-xl border border-brand-line text-brand-muted" aria-label="Уведомления"><Bell className="h-4 w-4" /></button><button type="button" onClick={() => navigate("settings")} className="grid h-9 w-9 place-items-center rounded-xl bg-brand-ink text-white" aria-label="Настройки"><Menu className="h-4 w-4" /></button></div></header>
        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-7 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">{notice && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-brand-yellow/40 bg-brand-yellow/15 px-4 py-3 text-sm font-semibold text-[#805817]"><CircleHelp className="h-4 w-4 shrink-0" />{notice}</div>}<SummaryCards companyIncome={companyIncome} partnerOutstanding={partnerOutstanding} cashBalance={cashBalance} expenseTotal={expenseTotal} />{viewContent}</main>
        <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border border-brand-line bg-white/95 p-2 shadow-[0_12px_36px_rgba(23,35,44,0.15)] backdrop-blur-md lg:hidden">{navItems.slice(0, 4).map(({ id, label, icon: Icon }) => { const isActive = activeNav === id; return <button key={id} type="button" onClick={() => navigate(id)} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-2.5 py-2 text-[10px] font-bold ${isActive ? "bg-brand-teal/20 text-brand-teal-dark" : "text-brand-muted"}`}><Icon className="h-4 w-4" /><span className="max-w-[66px] truncate">{label}</span></button>; })}<button type="button" onClick={() => navigate("settings")} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-2.5 py-2 text-[10px] font-bold ${activeNav === "settings" ? "bg-brand-teal/20 text-brand-teal-dark" : "text-brand-muted"}`}><Settings2 className="h-4 w-4" /><span>Настройки</span></button></nav>
      </div>
    </div>
  );
}
