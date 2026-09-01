import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BatteryCharging,
  Bell,
  Bike,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  HandCoins,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Minus,
  Plus,
  Receipt,
  Search,
  Settings2,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

const somoni = new Intl.NumberFormat("ru-RU");

const formatSomoni = (value: number) => somoni.format(value);
const parseAmount = (value: string) => Number(value.replace(/\s/g, "")) || 0;

const couriers = [
  { name: "Бобоев Юсуф", initials: "БЮ", tone: "bg-[#e4f7ef] text-[#26745f]" },
  { name: "Муродов Салон", initials: "МС", tone: "bg-[#fff0d7] text-[#a46b18]" },
  { name: "Каримова Мадина", initials: "КМ", tone: "bg-[#eeeaff] text-[#6453aa]" },
  { name: "Саидов Фаррух", initials: "СФ", tone: "bg-[#ffe5e0] text-[#af5545]" },
  { name: "Назарова Шахло", initials: "НШ", tone: "bg-[#e2efff] text-[#4677ac]" },
];

const partnerCatalog = [
  { name: "Tcell", rate: 2, descriptor: "мобильная связь", tone: "bg-[#e8f5ff] text-[#3882b8]" },
  { name: "Alif", rate: 2, descriptor: "финансовые услуги", tone: "bg-[#f3eaff] text-[#7d57ad]" },
  { name: "Yandex Eats", rate: 3, descriptor: "доставка еды", tone: "bg-[#fff2d8] text-[#ad721b]" },
  { name: "Ориён", rate: 1.5, descriptor: "банк", tone: "bg-[#e6f5ec] text-[#3d8765]" },
];

type PartnerRow = {
  id: number;
  partner: string;
  amount: string;
};

type MetricInputProps = {
  label: string;
  helper: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  iconClassName: string;
};

function MetricInput({
  label,
  helper,
  value,
  onChange,
  icon: Icon,
  iconClassName,
}: MetricInputProps) {
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

function SectionLabel({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted">
          {eyebrow}
        </p>
        <h2 className="font-display text-xl font-bold tracking-tight text-brand-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function Index() {
  const [activeNav, setActiveNav] = useState("Сдать смену");
  const [selectedCourier, setSelectedCourier] = useState(couriers[0]);
  const [courierSearch, setCourierSearch] = useState("");
  const [isCourierOpen, setIsCourierOpen] = useState(false);
  const [dateValue, setDateValue] = useState(new Date().toISOString().slice(0, 10));
  const [systemOrders, setSystemOrders] = useState("18");
  const [systemAmount, setSystemAmount] = useState("1240");
  const [offlineOrders, setOfflineOrders] = useState("4");
  const [offlineAmount, setOfflineAmount] = useState("480");
  const [deliveryAmount, setDeliveryAmount] = useState("320");
  const [batteryCount, setBatteryCount] = useState("3");
  const [finesAmount, setFinesAmount] = useState("50");
  const [comment, setComment] = useState("");
  const [partners, setPartners] = useState<PartnerRow[]>([
    { id: 1, partner: "Tcell", amount: "820" },
    { id: 2, partner: "Alif", amount: "340" },
  ]);
  const [isSaved, setIsSaved] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredCouriers = useMemo(() => {
    const query = courierSearch.trim().toLowerCase();
    if (!query) return couriers;
    return couriers.filter((courier) => courier.name.toLowerCase().includes(query));
  }, [courierSearch]);

  const systemTotal = parseAmount(systemAmount);
  const offlineTotal = parseAmount(offlineAmount);
  const deliveryTotal = parseAmount(deliveryAmount);
  const batteryTotal = parseAmount(batteryCount) * 5;
  const finesTotal = parseAmount(finesAmount);
  const ordersTotal = systemTotal + offlineTotal;
  const totalReceived = ordersTotal + deliveryTotal + batteryTotal + finesTotal;
  const partnerGross = partners.reduce((total, row) => total + parseAmount(row.amount), 0);
  const partnerCommission = partners.reduce((total, row) => {
    const partner = partnerCatalog.find((item) => item.name === row.partner);
    return total + parseAmount(row.amount) * ((partner?.rate ?? 0) / 100);
  }, 0);
  const partnerPayout = partnerGross - partnerCommission;
  const financeBalance = totalReceived - partnerPayout;
  const selectedDateLabel = new Date(`${dateValue}T12:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  const updatePartner = (id: number, key: "partner" | "amount", value: string) => {
    setPartners((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  };

  const addPartner = () => {
    const nextPartner = partnerCatalog.find(
      (partner) => !partners.some((row) => row.partner === partner.name),
    );
    setPartners((current) => [
      ...current,
      { id: Date.now(), partner: nextPartner?.name ?? "Tcell", amount: "" },
    ]);
  };

  const removePartner = (id: number) => {
    setPartners((current) => current.filter((row) => row.id !== id));
  };

  const handleSave = () => {
    setIsSaved(true);
    setNotice("");
    window.setTimeout(() => setIsSaved(false), 3200);
  };

  const navItems: { label: string; icon: LucideIcon; badge?: string }[] = [
    { label: "Обзор", icon: LayoutDashboard },
    { label: "Сдать смену", icon: ClipboardList, badge: "1" },
    { label: "Курьеры", icon: Users },
    { label: "Партнёры", icon: Building2 },
    { label: "Расходы", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-brand-mist text-brand-ink lg:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-brand-ink px-4 py-5 text-white lg:flex">
        <div className="flex items-center gap-3 px-3">
          <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-[14px] bg-brand-teal text-brand-ink">
            <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-brand-yellow/90" />
            <span className="relative font-display text-lg font-extrabold">M</span>
          </div>
          <div>
            <p className="font-display text-[17px] font-bold leading-none tracking-tight">Ma’ruf</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">финансист</p>
          </div>
        </div>

        <div className="mt-12 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Рабочее меню</div>
        <nav className="mt-3 space-y-1">
          {navItems.map(({ label, icon: Icon, badge }) => {
            const isActive = activeNav === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setActiveNav(label);
                  if (label !== "Сдать смену") setNotice(`Раздел «${label}» готовится к подключению`);
                  else setNotice("");
                }}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-teal text-brand-ink shadow-[0_8px_22px_rgba(126,218,192,0.14)]"
                    : "text-white/60 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.4 : 1.9} />
                  {label}
                </span>
                {badge && (
                  <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold ${isActive ? "bg-brand-ink text-white" : "bg-brand-coral text-brand-ink"}`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[22px] border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-yellow/15 text-brand-yellow">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="rounded-full bg-brand-teal/15 px-2 py-1 text-[10px] font-bold text-brand-teal">PRO</span>
          </div>
          <p className="text-sm font-semibold">Всё под контролем</p>
          <p className="mt-1 text-xs leading-5 text-white/45">Сводка за сегодня обновится после сдачи смены.</p>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-white/10 px-2 pt-5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-coral text-xs font-bold text-brand-ink">МК</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Маруф Холоуов</p>
            <p className="text-xs text-white/40">Финансовый отдел</p>
          </div>
          <Settings2 className="h-4 w-4 text-white/35" />
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-[248px]">
        <header className="flex items-center justify-between border-b border-brand-line/80 bg-white/75 px-4 py-4 backdrop-blur-sm sm:px-6 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-teal font-display font-extrabold text-brand-ink">M</div>
            <div>
              <p className="font-display text-base font-bold leading-none">Ma’ruf</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-brand-muted">финансист</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="grid h-9 w-9 place-items-center rounded-xl border border-brand-line text-brand-muted" aria-label="Уведомления">
              <Bell className="h-4 w-4" />
            </button>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-xl bg-brand-ink text-white" aria-label="Меню">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-7 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-brand-muted">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-teal" />
                Вторник, {selectedDateLabel}
                <span className="rounded-full bg-brand-yellow/25 px-2 py-0.5 text-[10px] font-bold text-[#9a681b]">Смена #24</span>
              </div>
              <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.055em] text-brand-ink">Сдать смену</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-brand-muted">Зафиксируйте отчёт курьера — суммы заказов, партнёров и дополнительные расчёты.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex h-11 items-center gap-2 rounded-2xl border border-brand-line bg-white px-3.5 text-sm font-semibold text-brand-ink shadow-sm shadow-brand-ink/5">
                <CalendarDays className="h-4 w-4 text-brand-teal-dark" />
                <span className="hidden text-brand-muted sm:inline">Дата</span>
                <input
                  type="date"
                  value={dateValue}
                  onChange={(event) => setDateValue(event.target.value)}
                  className="w-[118px] bg-transparent text-sm font-bold outline-none"
                />
              </label>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-2xl border border-brand-line bg-white text-brand-muted shadow-sm shadow-brand-ink/5" aria-label="Уведомления">
                <Bell className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          {notice && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-brand-yellow/40 bg-brand-yellow/15 px-4 py-3 text-sm font-semibold text-[#805817]">
              <CircleHelp className="h-4 w-4 shrink-0" />
              {notice}
            </div>
          )}

          <div className="mb-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[22px] border border-brand-line bg-white p-4 shadow-[0_12px_30px_rgba(23,35,44,0.03)] sm:p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-teal/20 text-brand-teal-dark"><WalletCards className="h-4 w-4" /></span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-brand-green"><ArrowUpRight className="h-3.5 w-3.5" /> 8.4%</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-brand-muted">Получено сегодня</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight">{formatSomoni(totalReceived)} <span className="font-sans text-xs font-semibold text-brand-muted">сом.</span></p>
            </div>
            <div className="rounded-[22px] border border-brand-line bg-white p-4 shadow-[0_12px_30px_rgba(23,35,44,0.03)] sm:p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-yellow/25 text-[#a46b18]"><HandCoins className="h-4 w-4" /></span>
                <span className="text-[11px] font-bold text-brand-muted">после комиссии</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-brand-muted">К выплате партнёрам</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight">{formatSomoni(partnerPayout)} <span className="font-sans text-xs font-semibold text-brand-muted">сом.</span></p>
            </div>
            <div className="rounded-[22px] border border-brand-line bg-brand-ink p-4 text-white shadow-[0_12px_30px_rgba(23,35,44,0.12)] sm:p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-brand-teal"><TrendingUp className="h-4 w-4" /></span>
                <span className="rounded-full bg-brand-teal/15 px-2 py-1 text-[10px] font-bold text-brand-teal">LIVE</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-white/50">Остаток у финансиста</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight">{formatSomoni(financeBalance)} <span className="font-sans text-xs font-semibold text-white/45">сом.</span></p>
            </div>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7">
                <SectionLabel eyebrow="01 / кто сдаёт" title="Курьер и дата смены" action={<span className="rounded-full bg-brand-mist px-3 py-1.5 text-[11px] font-bold text-brand-muted">Обязательно</span>} />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCourierOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-2xl border border-brand-line bg-brand-mist/50 px-4 py-3.5 text-left transition-colors hover:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                  >
                    <span className="flex items-center gap-3">
                      <span className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-bold ${selectedCourier.tone}`}>{selectedCourier.initials}</span>
                      <span>
                        <span className="block text-[11px] font-semibold text-brand-muted">Выбранный курьер</span>
                        <span className="mt-0.5 block text-sm font-bold text-brand-ink">{selectedCourier.name}</span>
                      </span>
                    </span>
                    <ChevronDown className={`h-5 w-5 text-brand-muted transition-transform ${isCourierOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isCourierOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-brand-line bg-white p-2 shadow-[0_20px_50px_rgba(23,35,44,0.15)]">
                      <div className="relative mb-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                        <input
                          autoFocus
                          value={courierSearch}
                          onChange={(event) => setCourierSearch(event.target.value)}
                          placeholder="Найти курьера..."
                          className="h-10 w-full rounded-xl bg-brand-mist pl-9 pr-3 text-sm font-medium outline-none ring-brand-teal/30 placeholder:text-brand-muted focus:ring-2"
                        />
                      </div>
                      {filteredCouriers.length > 0 ? filteredCouriers.map((courier) => (
                        <button
                          type="button"
                          key={courier.name}
                          onClick={() => {
                            setSelectedCourier(courier);
                            setIsCourierOpen(false);
                            setCourierSearch("");
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-brand-mist"
                        >
                          <span className={`grid h-8 w-8 place-items-center rounded-lg text-[10px] font-bold ${courier.tone}`}>{courier.initials}</span>
                          <span className="flex-1 text-sm font-semibold">{courier.name}</span>
                          {selectedCourier.name === courier.name && <Check className="h-4 w-4 text-brand-teal-dark" />}
                        </button>
                      )) : <p className="px-3 py-4 text-center text-sm font-medium text-brand-muted">Курьер не найден</p>}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7">
                <SectionLabel eyebrow="02 / заказы" title="Заказы и доставки" action={<span className="text-xs font-semibold text-brand-muted">Все суммы в сомони</span>} />
                <div className="grid gap-4 md:grid-cols-2">
                  <MetricInput label="Заказы по системе" helper={`${systemOrders || 0} шт.`} value={systemAmount} onChange={setSystemAmount} icon={CreditCard} iconClassName="bg-brand-teal/20 text-brand-teal-dark" />
                  <MetricInput label="Заказы без системы" helper={`${offlineOrders || 0} шт.`} value={offlineAmount} onChange={setOfflineAmount} icon={Receipt} iconClassName="bg-brand-coral/20 text-brand-coral-dark" />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 flex items-center justify-between text-xs font-bold text-brand-muted"><span>Количество по системе</span><span className="text-brand-teal-dark">шт.</span></span>
                    <input type="number" min="0" value={systemOrders} onChange={(event) => setSystemOrders(event.target.value)} className="h-11 w-full rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-bold outline-none transition focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15" />
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center justify-between text-xs font-bold text-brand-muted"><span>Количество без системы</span><span className="text-brand-coral-dark">шт.</span></span>
                    <input type="number" min="0" value={offlineOrders} onChange={(event) => setOfflineOrders(event.target.value)} className="h-11 w-full rounded-xl border border-brand-line bg-brand-mist/45 px-3 text-sm font-bold outline-none transition focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15" />
                  </label>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-brand-line pt-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-muted"><Bike className="h-4 w-4 text-brand-teal-dark" /> Сумма доставок</div>
                  <label className="flex items-center gap-2 rounded-xl bg-brand-teal/10 px-3 py-2"><input type="number" min="0" value={deliveryAmount} onChange={(event) => setDeliveryAmount(event.target.value)} className="w-20 bg-transparent text-right text-sm font-bold text-brand-ink outline-none" /><span className="text-xs font-bold text-brand-teal-dark">сом.</span></label>
                </div>
              </section>

              <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7">
                <SectionLabel
                  eyebrow="03 / партнёры"
                  title="Суммы партнёров"
                  action={<button type="button" onClick={addPartner} className="flex items-center gap-1.5 rounded-xl bg-brand-ink px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-teal hover:text-brand-ink"><Plus className="h-3.5 w-3.5" /> Добавить</button>}
                />
                <div className="hidden grid-cols-[minmax(0,1fr)_126px_30px] gap-3 px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted sm:grid"><span>Партнёр</span><span>Сумма</span><span /></div>
                <div className="space-y-3">
                  {partners.map((row) => {
                    const selectedPartner = partnerCatalog.find((partner) => partner.name === row.partner) ?? partnerCatalog[0];
                    return (
                      <div key={row.id} className="relative grid gap-3 rounded-2xl border border-brand-line bg-brand-mist/35 p-3 sm:grid-cols-[minmax(0,1fr)_126px_30px] sm:items-center sm:border-0 sm:bg-transparent sm:p-0">
                        <label className="relative flex min-w-0 items-center gap-3 rounded-xl border border-brand-line bg-white px-3 py-2.5 sm:bg-brand-mist/45">
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-bold ${selectedPartner.tone}`}>{selectedPartner.name.slice(0, 2).toUpperCase()}</span>
                          <select value={row.partner} onChange={(event) => updatePartner(row.id, "partner", event.target.value)} className="min-w-0 flex-1 appearance-none bg-transparent pr-5 text-sm font-bold text-brand-ink outline-none">
                            {partnerCatalog.map((partner) => <option key={partner.name} value={partner.name}>{partner.name} · {partner.rate}%</option>)}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-brand-muted" />
                        </label>
                        <label className="flex items-center rounded-xl border border-brand-line bg-white px-3 py-2.5 sm:bg-brand-mist/45"><input type="number" min="0" value={row.amount} onChange={(event) => updatePartner(row.id, "amount", event.target.value)} placeholder="0" className="w-full bg-transparent text-sm font-bold outline-none" /><span className="text-xs font-semibold text-brand-muted">сом.</span></label>
                        <button type="button" onClick={() => removePartner(row.id)} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-lg text-brand-muted transition hover:bg-brand-coral/15 hover:text-brand-coral-dark sm:static sm:h-8 sm:w-8" aria-label={`Удалить ${row.partner}`}><Minus className="h-4 w-4" /></button>
                        <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-brand-muted sm:hidden"><span>Комиссия {selectedPartner.rate}%</span><span className="text-brand-teal-dark">к выплате {formatSomoni(parseAmount(row.amount) * (1 - selectedPartner.rate / 100))}</span></div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 grid gap-3 border-t border-brand-line pt-4 text-sm sm:grid-cols-3">
                  <div><p className="text-xs font-semibold text-brand-muted">Всего партнёрам</p><p className="mt-1 font-display font-bold">{formatSomoni(partnerGross)} <span className="font-sans text-xs font-semibold text-brand-muted">сом.</span></p></div>
                  <div><p className="text-xs font-semibold text-brand-muted">Ваша комиссия</p><p className="mt-1 font-display font-bold text-brand-teal-dark">+{formatSomoni(partnerCommission)} <span className="font-sans text-xs font-semibold text-brand-muted">сом.</span></p></div>
                  <div><p className="text-xs font-semibold text-brand-muted">К выплате</p><p className="mt-1 font-display font-bold">{formatSomoni(partnerPayout)} <span className="font-sans text-xs font-semibold text-brand-muted">сом.</span></p></div>
                </div>
              </section>

              <section className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_18px_50px_rgba(23,35,44,0.045)] sm:p-7">
                <SectionLabel eyebrow="04 / дополнительно" title="Батарейки и штрафы" action={<span className="text-xs font-semibold text-brand-muted">Батарейка — 5 сомони</span>} />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-mist/45 p-4 focus-within:border-brand-teal">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-yellow/25 text-[#a46b18]"><BatteryCharging className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold">Батарейки</span><span className="mt-1 block text-xs font-semibold text-brand-muted">{formatSomoni(batteryTotal)} сомони к оплате</span></span>
                    <input type="number" min="0" value={batteryCount} onChange={(event) => setBatteryCount(event.target.value)} className="w-14 rounded-lg bg-white px-2 py-2 text-center text-sm font-bold outline-none ring-1 ring-brand-line focus:ring-brand-teal" />
                    <span className="text-xs font-bold text-brand-muted">шт.</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-mist/45 p-4 focus-within:border-brand-teal">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-coral/20 text-brand-coral-dark"><AlertTriangle className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold">Штрафы</span><span className="mt-1 block text-xs font-semibold text-brand-muted">Удержание со смены</span></span>
                    <input type="number" min="0" value={finesAmount} onChange={(event) => setFinesAmount(event.target.value)} className="w-[92px] rounded-lg bg-white px-2 py-2 text-right text-sm font-bold outline-none ring-1 ring-brand-line focus:ring-brand-teal" />
                    <span className="text-xs font-bold text-brand-muted">сом.</span>
                  </label>
                </div>
                <label className="mt-4 block rounded-2xl border border-brand-line bg-brand-mist/35 p-4 focus-within:border-brand-teal focus-within:bg-white">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold text-brand-muted"><MessageSquareText className="h-4 w-4 text-brand-teal-dark" /> Комментарий к смене</span>
                  <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Например: возврат заказа, недостача, особые условия..." rows={3} className="w-full resize-none bg-transparent text-sm font-medium leading-6 outline-none placeholder:text-brand-muted/60" />
                </label>
              </section>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs font-semibold text-brand-muted"><span className="grid h-5 w-5 place-items-center rounded-full bg-brand-teal/15 text-brand-teal-dark"><Check className="h-3 w-3" /></span> Данные сохраняются только после подтверждения</p>
                <button type="button" onClick={handleSave} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-teal px-6 text-sm font-extrabold text-brand-ink shadow-[0_10px_24px_rgba(126,218,192,0.28)] transition hover:-translate-y-0.5 hover:bg-[#a5ead6] active:translate-y-0">
                  {isSaved ? <><Check className="h-4 w-4" /> Смена сохранена</> : <><Banknote className="h-4 w-4" /> Сохранить отчёт</>}
                </button>
              </div>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-7">
              <div className="overflow-hidden rounded-[28px] bg-brand-ink p-6 text-white shadow-[0_20px_50px_rgba(23,35,44,0.18)] sm:p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Итог смены</p>
                    <p className="mt-2 text-sm font-semibold text-white/75">{selectedCourier.name}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-brand-teal">{selectedDateLabel}</span>
                </div>
                <div className="relative mt-8 overflow-hidden rounded-2xl bg-white/5 p-4">
                  <span className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-brand-teal/10 blur-2xl" />
                  <p className="relative text-xs font-semibold text-white/50">К получению от курьера</p>
                  <p className="relative mt-2 font-display text-[2.5rem] font-bold tracking-[-0.06em]">{formatSomoni(totalReceived)} <span className="font-sans text-sm font-semibold tracking-normal text-white/45">сомони</span></p>
                  <div className="relative mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-teal"><ArrowDownRight className="h-3.5 w-3.5" /> включая батарейки и штрафы</div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm"><span className="text-white/55">Заказы и доставки</span><span className="font-bold">{formatSomoni(ordersTotal + deliveryTotal)} сом.</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-white/55">Батарейки</span><span className="font-bold">{formatSomoni(batteryTotal)} сом.</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-white/55">Штрафы</span><span className="font-bold">{formatSomoni(finesTotal)} сом.</span></div>
                  <div className="border-t border-white/10 pt-3"><div className="flex items-center justify-between text-sm"><span className="text-white/55">Партнёрам после комиссии</span><span className="font-bold text-brand-yellow">{formatSomoni(partnerPayout)} сом.</span></div></div>
                </div>
              </div>

              <div className="rounded-[24px] border border-brand-line bg-white p-5 shadow-[0_14px_36px_rgba(23,35,44,0.04)]">
                <div className="flex items-center justify-between"><h3 className="font-display font-bold">Контрольные цифры</h3><Settings2 className="h-4 w-4 text-brand-muted" /></div>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-teal/15 text-brand-teal-dark"><ClipboardList className="h-4 w-4" /></span><span className="text-xs font-semibold text-brand-muted">Всего заказов</span></div><span className="text-sm font-bold">{parseAmount(systemOrders) + parseAmount(offlineOrders)} шт.</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-yellow/20 text-[#a46b18]"><Building2 className="h-4 w-4" /></span><span className="text-xs font-semibold text-brand-muted">Партнёров</span></div><span className="text-sm font-bold">{partners.length}</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-coral/15 text-brand-coral-dark"><HandCoins className="h-4 w-4" /></span><span className="text-xs font-semibold text-brand-muted">Комиссия</span></div><span className="text-sm font-bold text-brand-teal-dark">{formatSomoni(partnerCommission)} сом.</span></div>
                </div>
              </div>

              <div className="rounded-[24px] border border-brand-teal/30 bg-brand-teal/12 p-5">
                <div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-teal text-brand-ink"><CircleHelp className="h-4 w-4" /></span><div><p className="text-sm font-bold">Проверьте перед сохранением</p><p className="mt-1.5 text-xs font-medium leading-5 text-brand-teal-dark/80">Сверьте наличные с итогом и не забудьте добавить комментарий, если была недостача.</p></div></div>
              </div>
            </aside>
          </div>
        </main>

        <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border border-brand-line bg-white/95 p-2 shadow-[0_12px_36px_rgba(23,35,44,0.15)] backdrop-blur-md lg:hidden">
          {navItems.slice(0, 4).map(({ label, icon: Icon }) => {
            const isActive = label === "Сдать смену";
            return <button key={label} type="button" onClick={() => { setActiveNav(label); if (!isActive) setNotice(`Раздел «${label}» готовится к подключению`); else setNotice(""); }} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold ${isActive ? "bg-brand-teal/20 text-brand-teal-dark" : "text-brand-muted"}`}><Icon className="h-4 w-4" /><span className="max-w-[64px] truncate">{label}</span></button>;
          })}
        </nav>
      </div>
    </div>
  );
}
