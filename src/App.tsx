import React, { useEffect, useState, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Car, Heart, Phone, Scale, Layers, Smile,
  Sun, Moon, Search, ChevronDown, ChevronRight,
  AlertTriangle, MapPin, XCircle, Star, TrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as ReTooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { parseExcelData } from './utils/excelParser';
import type { GlobalMetrics, FamilyData, AccountData } from './utils/excelParser';

// ─── Theme ────────────────────────────────────────────────────────
const ThemeCtx = createContext(true);
const useDark = () => useContext(ThemeCtx);

// ─── Family config ────────────────────────────────────────────────
type FamilyCfg = { label: string; Icon: React.ElementType; color: string };

const FAMILY_CFG: Record<string, FamilyCfg> = {
  DENTAL:      { label: 'Dental',      Icon: Smile,  color: '#06b6d4' },
  HOGAR:       { label: 'Hogar',       Icon: Home,   color: '#8b5cf6' },
  VEHICULAR:   { label: 'Vehicular',   Icon: Car,    color: '#f59e0b' },
  'MÉDICA':    { label: 'Médica',      Icon: Heart,  color: '#f43f5e' },
  REFERENCIAS: { label: 'Referencias', Icon: Phone,  color: '#3b82f6' },
  VARIOS:      { label: 'Varios',      Icon: Layers, color: '#64748b' },
  LEGAL:       { label: 'Legal',       Icon: Scale,  color: '#10b981' },
};

const fcfg = (name: string): FamilyCfg =>
  FAMILY_CFG[name] ?? { label: name, Icon: Layers, color: '#64748b' };

// ─── Ecuador flag ─────────────────────────────────────────────────
const EcuadorFlag: React.FC = () => (
  <div className="overflow-hidden rounded-sm shadow-md" style={{ width: 32, height: 21, flexShrink: 0 }}>
    <div style={{ height: '50%', background: '#FFD100' }} />
    <div style={{ height: '25%', background: '#003DA5' }} />
    <div style={{ height: '25%', background: '#C8102E' }} />
  </div>
);

// ─── App ─────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [data, setData]       = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // A1: theme persistence
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    return stored !== null ? stored === 'dark' : true;
  });

  // A2: account search
  const [searchQuery, setSearchQuery] = useState('');

  // A3: sort order
  const [sortOrder, setSortOrder] = useState<'volume' | 'efficiency' | 'name'>('volume');

  // A4: collapsed families
  const [collapsedFamilies, setCollapsedFamilies] = useState<Set<string>>(new Set());

  useEffect(() => {
    parseExcelData().then(d => { setData(d); setLoading(false); });
  }, []);

  // A1: persist theme
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleFamily = (name: string) => {
    setCollapsedFamilies(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const rootBg = isDark ? '#162032' : '#eef2f7';

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: rootBg }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-2"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderTopColor: '#22d3ee' }}
        />
      </div>
    );
  }

  const headerBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const footerBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const titleColor   = isDark ? '#f1f5f9' : '#0f172a';
  const footerColor  = isDark ? '#475569' : '#94a3b8';
  const orb1         = isDark ? 'rgba(6,182,212,0.05)'  : 'rgba(6,182,212,0.08)';
  const orb2         = isDark ? 'rgba(139,92,246,0.04)' : 'rgba(139,92,246,0.06)';

  return (
    <ThemeCtx.Provider value={isDark}>
      <div className="relative min-h-screen px-4 py-6 md:px-8 md:py-8" style={{ background: rootBg }}>

        {/* ── Background orbs ── */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] blur-3xl"
          style={{ background: `radial-gradient(circle, ${orb1} 0%, transparent 70%)` }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] blur-3xl"
          style={{ background: `radial-gradient(circle, ${orb2} 0%, transparent 70%)` }}
        />

        {/* ── Header ── */}
        <header
          className="relative mb-8 flex flex-wrap items-center justify-between gap-3 pb-6"
          style={{ borderBottom: `1px solid ${headerBorder}` }}
        >
          <div className="flex items-center gap-3">
            <EcuadorFlag />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-500">
                Voccare · Addiuva · Operación Regional Ecuador
              </p>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl" style={{ color: titleColor }}>
                CAPACITACIÓN ECUADOR 2026
              </h1>
              <div className="mt-1.5 h-0.5 w-14 rounded-full" style={{ background: 'linear-gradient(90deg, #22d3ee, #34d399)' }} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(d => !d)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                color: isDark ? '#94a3b8' : '#64748b',
              }}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <span className="shrink-0 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-500">
              Mayo 2026
            </span>
          </div>
        </header>

        {/* ── KPIs ── */}
        <section className="mb-8">
          <SectionLabel>Resumen Mensual</SectionLabel>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard label="Total Asistencias" value={data.total}      pct={null}                                  accent="#64748b" index={0} />
            <KpiCard label="Concluidas"         value={data.concluded}  pct={(data.concluded / data.total) * 100}  accent="#22c55e" index={1} />
            <KpiCard label="Canceladas"         value={data.cancelled}  pct={(data.cancelled / data.total) * 100}  accent="#f43f5e" index={2} />
            <KpiCard label="En Proceso"         value={data.inProcess}  pct={(data.inProcess / data.total) * 100}  accent="#f59e0b" index={3} />
          </div>

          {/* B1: PROGRAMADA vs EMERGENCIA */}
          {(data.serviceTypeStats.programada > 0 || data.serviceTypeStats.emergencia > 0) && (
            <ServiceTypeBadges
              programada={data.serviceTypeStats.programada}
              emergencia={data.serviceTypeStats.emergencia}
            />
          )}
        </section>

        {/* ── B2: Daily trend ── */}
        {data.dailyTrend.length > 0 && (
          <section className="mb-8">
            <SectionLabel><span className="flex items-center gap-1.5"><TrendingUp size={11} />Tendencia Diaria del Mes</span></SectionLabel>
            <DailyTrendChart data={data.dailyTrend} />
          </section>
        )}

        {/* ── Family Distribution ── */}
        <section className="mb-8">
          <SectionLabel>Distribución por Familia de Servicio</SectionLabel>
          <FamilyDistributionGrid families={data.families} globalTotal={data.total} />
        </section>

        {/* ── B3 + B4 + B5 side-by-side analytics ── */}
        <section className="mb-8">
          <div className="grid gap-6 md:grid-cols-3">
            {data.provinceStats.length > 0 && (
              <div>
                <SectionLabel><span className="flex items-center gap-1.5"><MapPin size={11} />Por Provincia</span></SectionLabel>
                <ProvinceChart data={data.provinceStats} total={data.total} />
              </div>
            )}
            {data.cancellationReasons.length > 0 && (
              <div>
                <SectionLabel><span className="flex items-center gap-1.5"><XCircle size={11} />Motivos de Cancelación</span></SectionLabel>
                <CancellationChart data={data.cancellationReasons} />
              </div>
            )}
            {data.satisfaction.total > 0 && (
              <div>
                <SectionLabel><span className="flex items-center gap-1.5"><Star size={11} />Satisfacción del Cliente</span></SectionLabel>
                <SatisfactionPanel data={data.satisfaction} />
              </div>
            )}
          </div>
        </section>

        {/* ── Accounts per Family ── */}
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <SectionLabel>Desglose por Cuenta</SectionLabel>
            <div className="flex items-center gap-2">
              {/* A2: Search */}
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
              {/* A3: Sort */}
              <SortSelector value={sortOrder} onChange={setSortOrder} />
            </div>
          </div>
          <div className="flex flex-col gap-8">
            {data.families
              .filter(f => f.accounts.length > 0)
              .map((family, i) => (
                <FamilyGroup
                  key={family.name}
                  family={family}
                  index={i}
                  searchQuery={searchQuery}
                  sortOrder={sortOrder}
                  collapsed={collapsedFamilies.has(family.name)}
                  onToggle={() => toggleFamily(family.name)}
                />
              ))}
          </div>
        </section>

        <footer
          className="mt-16 pt-6 text-center text-[9px] font-bold uppercase tracking-[0.45em]"
          style={{ borderTop: `1px solid ${footerBorder}`, color: footerColor }}
        >
          Voccare + Addiuva · Operación Regional
        </footer>
      </div>
    </ThemeCtx.Provider>
  );
};

// ─── SectionLabel ─────────────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dark = useDark();
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-4 w-0.5 rounded-full" style={{ background: 'linear-gradient(180deg, #22d3ee, #34d399)' }} />
      <span
        className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
        style={{ color: dark ? '#64748b' : '#94a3b8' }}
      >
        {children}
      </span>
    </div>
  );
};

// ─── KpiCard ──────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string; value: number; pct: number | null; accent: string; index: number;
}> = ({ label, value, pct, accent, index }) => {
  const dark = useDark();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl p-4"
      style={{
        background: dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'}`,
        borderLeft: `2px solid ${accent}`,
      }}
    >
      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
        {label}
      </p>
      <p className="mb-3 text-5xl font-black leading-none" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>
        {value.toLocaleString()}
      </p>
      {pct != null && (
        <span
          className="inline-block rounded-full px-3 py-1 text-sm font-black"
          style={{ background: `${accent}1a`, color: accent }}
        >
          {pct.toFixed(1)}%
        </span>
      )}
    </motion.div>
  );
};

// ─── B1: ServiceTypeBadges ────────────────────────────────────────
const ServiceTypeBadges: React.FC<{ programada: number; emergencia: number }> = ({
  programada, emergencia,
}) => {
  const dark = useDark();
  const total = programada + emergencia;
  const pctP = total > 0 ? ((programada / total) * 100).toFixed(0) : '0';
  const pctE = total > 0 ? ((emergencia / total) * 100).toFixed(0) : '0';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mt-3 flex flex-wrap gap-3"
    >
      <div
        className="flex items-center gap-2.5 rounded-xl px-4 py-2.5"
        style={{
          background: dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'}`,
          borderLeft: '2px solid #3b82f6',
        }}
      >
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Programada</p>
          <p className="text-3xl font-black leading-none" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>{programada.toLocaleString()}</p>
        </div>
        <span className="rounded-full px-3 py-1 text-sm font-black" style={{ background: '#3b82f61a', color: '#3b82f6' }}>
          {pctP}%
        </span>
      </div>
      <div
        className="flex items-center gap-2.5 rounded-xl px-4 py-2.5"
        style={{
          background: dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'}`,
          borderLeft: '2px solid #f97316',
        }}
      >
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Emergencia</p>
          <p className="text-3xl font-black leading-none" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>{emergencia.toLocaleString()}</p>
        </div>
        <span className="rounded-full px-3 py-1 text-sm font-black" style={{ background: '#f973161a', color: '#f97316' }}>
          {pctE}%
        </span>
      </div>
    </motion.div>
  );
};

// ─── B2: DailyTrendChart ──────────────────────────────────────────
const DailyTrendChart: React.FC<{ data: { day: number; count: number }[] }> = ({ data }) => {
  const dark = useDark();
  const cardBg    = dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)';
  const cardBdr   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const axisColor = dark ? '#475569' : '#94a3b8';
  const tooltipBg = dark ? '#1e293b' : '#fff';
  const tooltipBdr = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-3 rounded-2xl p-4"
      style={{ background: cardBg, border: `1px solid ${cardBdr}` }}
    >
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: axisColor, fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: axisColor, fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
          />
          <ReTooltip
            contentStyle={{
              background: tooltipBg,
              border: `1px solid ${tooltipBdr}`,
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700,
              color: dark ? '#f1f5f9' : '#0f172a',
            }}
            formatter={(val) => [val, 'Asistencias']}
            labelFormatter={(label) => `Día ${label}`}
            cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '4 2' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#trendGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#22d3ee', stroke: 'none' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// ─── FamilyDistributionGrid ───────────────────────────────────────
const FamilyDistributionGrid: React.FC<{ families: FamilyData[]; globalTotal: number }> = ({
  families, globalTotal,
}) => {
  const dark = useDark();
  const barTrack = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';

  return (
    <div className="mt-3 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
      {families.map((family, i) => {
        const { label, Icon, color } = fcfg(family.name);
        const globalPct    = globalTotal > 0 ? (family.total / globalTotal) * 100 : 0;
        const concludedPct = family.total > 0 ? (family.concluded / family.total) * 100 : 0;
        const cancelledPct = family.total > 0 ? (family.cancelled / family.total) * 100 : 0;
        const processPct   = Math.max(0, 100 - concludedPct - cancelledPct);
        const efficiency   = family.total > 0 ? Math.round(concludedPct) : 0;

        return (
          <motion.div
            key={family.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-4"
            style={{
              background: dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'}`,
              borderTop: `2px solid ${color}`,
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${color}1a`, border: `1px solid ${color}30` }}
              >
                <Icon size={13} style={{ color }} />
              </div>
              <span className="text-xs font-bold" style={{ color: dark ? '#cbd5e1' : '#334155' }}>{label}</span>
            </div>
            <div className="mb-3 flex items-end justify-between gap-2">
              <p className="text-4xl font-black leading-none" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>
                {family.total}
              </p>
              <span
                className="mb-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-black"
                style={{ background: `${color}20`, color }}
              >
                {globalPct.toFixed(1)}% del total
              </span>
            </div>
            <div className="mb-3 flex h-2 overflow-hidden rounded-full" style={{ background: barTrack }}>
              <div className="h-full" style={{ width: `${concludedPct}%`, background: '#10b981' }} />
              <div className="h-full" style={{ width: `${cancelledPct}%`, background: '#f43f5e' }} />
              <div className="h-full" style={{ width: `${processPct}%`, background: '#f59e0b' }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-emerald-600">{family.concluded} ok</span>
              <span className="text-rose-500">{family.cancelled} cancel.</span>
              <span className="rounded-full px-2 py-0.5 font-black" style={{ background: `${color}15`, color }}>
                {efficiency}% ef.
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── B3: ProvinceChart ────────────────────────────────────────────
const ProvinceChart: React.FC<{ data: { name: string; count: number }[]; total: number }> = ({
  data, total,
}) => {
  const dark = useDark();
  const cardBg  = dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)';
  const cardBdr = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const textSub = dark ? '#64748b' : '#94a3b8';
  const textMain = dark ? '#cbd5e1' : '#334155';
  const barBg   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const maxCount = data[0]?.count ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-3 rounded-2xl p-4"
      style={{ background: cardBg, border: `1px solid ${cardBdr}` }}
    >
      <div className="flex flex-col gap-2.5">
        {data.map((item, i) => {
          const barPct  = (item.count / maxCount) * 100;
          const totalPct = total > 0 ? ((item.count / total) * 100).toFixed(0) : '0';
          return (
            <div key={item.name}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold" style={{ color: textMain, maxWidth: '55%' }}>
                  {item.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-black" style={{ color: textMain }}>{item.count}</span>
                  <span className="text-[10px] font-bold" style={{ color: textSub }}>{totalPct}%</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: barBg }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: `hsl(${200 - i * 20}, 80%, 55%)` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── B4: CancellationChart ────────────────────────────────────────
const CancellationChart: React.FC<{ data: { name: string; count: number }[] }> = ({ data }) => {
  const dark = useDark();
  const cardBg   = dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)';
  const cardBdr  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const textMain = dark ? '#cbd5e1' : '#334155';
  const barBg    = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const maxCount = data[0]?.count ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-3 rounded-2xl p-4"
      style={{ background: cardBg, border: `1px solid ${cardBdr}` }}
    >
      <div className="flex flex-col gap-2.5">
        {data.map((item, i) => {
          const barPct = (item.count / maxCount) * 100;
          return (
            <div key={i}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-bold leading-tight"
                  style={{ color: textMain, maxWidth: '70%' }}
                  title={item.name}
                >
                  {item.name.length > 38 ? item.name.slice(0, 38) + '…' : item.name}
                </span>
                <span className="text-sm font-black shrink-0" style={{ color: textMain }}>{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: barBg }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ delay: i * 0.06 + 0.2, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: `hsl(${350 - i * 15}, 75%, 55%)` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── B5: SatisfactionPanel ────────────────────────────────────────
const SatisfactionPanel: React.FC<{ data: { excellent: number; good: number; regular: number; bad: number; total: number } }> = ({
  data,
}) => {
  const dark = useDark();
  const cardBg  = dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)';
  const cardBdr = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';

  const items = [
    { label: 'Excelente', value: data.excellent, color: '#22c55e' },
    { label: 'Bueno',     value: data.good,      color: '#3b82f6' },
    { label: 'Regular',   value: data.regular,   color: '#f59e0b' },
    { label: 'Malo',      value: data.bad,        color: '#f43f5e' },
  ].filter(i => i.value > 0);

  const excelPct = data.total > 0 ? Math.round((data.excellent / data.total) * 100) : 0;

  // Build recharts data for a simple horizontal bar
  const chartData = items.map(i => ({ name: i.label, value: i.value, color: i.color }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-3 rounded-2xl p-4"
      style={{ background: cardBg, border: `1px solid ${cardBdr}` }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
          {data.total} respuestas
        </p>
        <span
          className="rounded-full px-3 py-1 text-sm font-black"
          style={{ background: '#22c55e1a', color: '#22c55e' }}
        >
          {excelPct}% excelente
        </span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={60}
            tick={{ fontSize: 9, fill: dark ? '#64748b' : '#94a3b8', fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
          />
          <ReTooltip
            contentStyle={{
              background: dark ? '#1e293b' : '#fff',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              color: dark ? '#f1f5f9' : '#0f172a',
            }}
            formatter={(val) => [val, 'Resp.']}
            cursor={false}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// ─── A2: SearchInput ──────────────────────────────────────────────
const SearchInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const dark = useDark();
  return (
    <div
      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
      style={{
        background: dark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)'}`,
      }}
    >
      <Search size={11} style={{ color: dark ? '#475569' : '#94a3b8', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar cuenta…"
        className="w-36 bg-transparent text-[11px] font-medium outline-none placeholder:font-normal"
        style={{ color: dark ? '#cbd5e1' : '#334155' }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{ color: dark ? '#475569' : '#94a3b8', lineHeight: 0 }}>
          <XCircle size={11} />
        </button>
      )}
    </div>
  );
};

// ─── A3: SortSelector ────────────────────────────────────────────
const SortSelector: React.FC<{
  value: 'volume' | 'efficiency' | 'name';
  onChange: (v: 'volume' | 'efficiency' | 'name') => void;
}> = ({ value, onChange }) => {
  const dark = useDark();
  const options: { v: typeof value; label: string }[] = [
    { v: 'volume',     label: 'Volumen' },
    { v: 'efficiency', label: 'Eficiencia' },
    { v: 'name',       label: 'Nombre' },
  ];
  return (
    <div
      className="flex items-center overflow-hidden rounded-xl"
      style={{
        background: dark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)'}`,
      }}
    >
      {options.map(opt => (
        <button
          key={opt.v}
          onClick={() => onChange(opt.v)}
          className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors"
          style={{
            color: value === opt.v ? '#22d3ee' : (dark ? '#475569' : '#94a3b8'),
            background: value === opt.v ? (dark ? 'rgba(34,211,238,0.1)' : 'rgba(34,211,238,0.08)') : 'transparent',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

// ─── FamilyGroup ──────────────────────────────────────────────────
const FamilyGroup: React.FC<{
  family: FamilyData;
  index: number;
  searchQuery: string;
  sortOrder: 'volume' | 'efficiency' | 'name';
  collapsed: boolean;
  onToggle: () => void;
}> = ({ family, index, searchQuery, sortOrder, collapsed, onToggle }) => {
  const dark = useDark();
  const { label, Icon, color } = fcfg(family.name);
  const efficiency = family.total > 0 ? Math.round((family.concluded / family.total) * 100) : 0;

  // A2: filter accounts by search
  const query = searchQuery.toLowerCase().trim();
  const filtered = query
    ? family.accounts.filter(a => a.name.toLowerCase().includes(query))
    : family.accounts;

  // A3: sort accounts
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'efficiency') {
      const ea = a.total > 0 ? a.concluded / a.total : 0;
      const eb = b.total > 0 ? b.concluded / b.total : 0;
      return eb - ea;
    }
    if (sortOrder === 'name') return a.name.localeCompare(b.name);
    return b.total - a.total; // volume
  });

  if (sorted.length === 0 && query) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      {/* A4: Collapsible family header */}
      <button
        onClick={onToggle}
        className="mb-4 flex w-full items-center gap-3 text-left"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={17} style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>
            {label}
          </h2>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
            {family.total} servicios &nbsp;·&nbsp; {family.concluded} concluidos &nbsp;·&nbsp; {family.cancelled} cancelados
            {family.inProcess > 0 && <> &nbsp;·&nbsp; {family.inProcess} en proceso</>}
          </p>
        </div>
        <div
          className="shrink-0 rounded-full px-3 py-1 text-sm font-black"
          style={{
            color,
            background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
          }}
        >
          {efficiency}% ef.
        </div>
        <div style={{ color: dark ? '#475569' : '#94a3b8', marginLeft: 4 }}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* A4: Animated expand/collapse */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))' }}>
              {sorted.map((acc, i) => (
                <AccountCard
                  key={acc.name}
                  account={acc}
                  familyColor={color}
                  delay={index * 0.07 + i * 0.03}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── AccountCard ──────────────────────────────────────────────────
const AccountCard: React.FC<{
  account: AccountData; familyColor: string; delay: number;
}> = ({ account, familyColor, delay }) => {
  const dark = useDark();
  const efficiency   = account.total > 0 ? Math.round((account.concluded / account.total) * 100) : 0;
  const concludedPct = account.total > 0 ? (account.concluded / account.total) * 100 : 0;
  const cancelledPct = account.total > 0 ? (account.cancelled / account.total) * 100 : 0;

  // A5: alert badge for efficiency < 50%
  const lowEfficiency = efficiency < 50 && !account.isAdministrative;

  const effColor =
    efficiency >= 70 ? '#22c55e' :
    efficiency >= 50 ? '#f59e0b' :
                       '#f43f5e';

  const barTrack = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.07)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl p-4 transition-all duration-200"
      style={{
        background: dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)',
        border: `1px solid ${lowEfficiency
          ? (dark ? 'rgba(244,63,94,0.3)' : 'rgba(244,63,94,0.25)')
          : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)')}`,
        borderTop: `2px solid ${lowEfficiency ? '#f43f5e' : familyColor}`,
        filter: account.isAdministrative ? 'grayscale(0.6) opacity(0.55)' : undefined,
      }}
    >
      {/* A5: alert badge */}
      {lowEfficiency && (
        <div
          className="mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest"
          style={{ background: '#f43f5e1a', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' }}
        >
          <AlertTriangle size={8} />
          Baja eficiencia
        </div>
      )}

      {/* Admin badge */}
      {account.isAdministrative && (
        <div
          className="mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-widest"
          style={{
            background: dark ? 'rgba(51,65,85,0.8)' : '#f1f5f9',
            border: `1px solid ${dark ? 'rgba(71,85,105,0.5)' : 'rgba(0,0,0,0.08)'}`,
            color: dark ? '#64748b' : '#94a3b8',
          }}
        >
          Cuenta administrativa
        </div>
      )}

      <p className="mb-0.5 text-[9px] font-black uppercase tracking-widest" style={{ color: dark ? '#475569' : '#94a3b8' }}>
        Empresa / Cuenta
      </p>
      <h3 className="mb-3 line-clamp-2 text-sm font-bold leading-snug" style={{ color: dark ? '#cbd5e1' : '#334155' }}>
        {account.name}
      </h3>

      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: dark ? '#475569' : '#94a3b8' }}>Mensual</p>
          <p className="text-3xl font-black leading-none" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>{account.total}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: dark ? '#475569' : '#94a3b8' }}>Ef.</p>
          <p className="text-3xl font-black leading-none" style={{ color: effColor }}>{efficiency}%</p>
        </div>
      </div>

      <div className="mb-2 flex h-2 overflow-hidden rounded-full" style={{ background: barTrack }}>
        <div className="h-full" style={{ width: `${concludedPct}%`, background: '#22c55e' }} />
        <div className="h-full" style={{ width: `${cancelledPct}%`, background: '#f43f5e' }} />
      </div>

      <div
        className="flex justify-between text-[10px] font-black uppercase tracking-widest"
        style={{ color: dark ? '#475569' : '#94a3b8' }}
      >
        <span>{account.concluded} ok</span>
        {account.inProcess > 0 && <span style={{ color: '#b45309' }}>{account.inProcess} proc.</span>}
        <span>{account.cancelled} cancel.</span>
      </div>
    </motion.div>
  );
};

export default App;
