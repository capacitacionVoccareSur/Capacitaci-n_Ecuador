import React, { useEffect, useState, useContext, createContext } from 'react';
import { motion } from 'framer-motion';
import { Home, Car, Heart, Phone, Scale, Layers, Smile, Sun, Moon } from 'lucide-react';
import { parseExcelData } from './utils/excelParser';
import type { GlobalMetrics, FamilyData, AccountData } from './utils/excelParser';

// ─── Theme ────────────────────────────────────────────────────────
const ThemeCtx = createContext(true); // true = dark
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
  const [data, setData]     = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark]  = useState(true);

  useEffect(() => {
    parseExcelData().then(d => { setData(d); setLoading(false); });
  }, []);

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

  const headerBorder  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const footerBorder  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const titleColor    = isDark ? '#f1f5f9' : '#0f172a';
  const footerColor   = isDark ? '#475569' : '#94a3b8';
  const orb1          = isDark ? 'rgba(6,182,212,0.05)'   : 'rgba(6,182,212,0.08)';
  const orb2          = isDark ? 'rgba(139,92,246,0.04)'  : 'rgba(139,92,246,0.06)';

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
            {/* Theme toggle */}
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
            <KpiCard label="Total Asistencias" value={data.total}     pct={null}                                  accent="#64748b" index={0} />
            <KpiCard label="Concluidas"         value={data.concluded} pct={(data.concluded / data.total) * 100}  accent="#22c55e" index={1} />
            <KpiCard label="Canceladas"         value={data.cancelled} pct={(data.cancelled / data.total) * 100}  accent="#f43f5e" index={2} />
            <KpiCard label="En Proceso"         value={data.inProcess} pct={(data.inProcess / data.total) * 100}  accent="#f59e0b" index={3} />
          </div>
        </section>

        {/* ── Family Distribution ── */}
        <section className="mb-8">
          <SectionLabel>Distribución por Familia de Servicio</SectionLabel>
          <FamilyDistributionGrid families={data.families} globalTotal={data.total} />
        </section>

        {/* ── Accounts per Family ── */}
        <section>
          <SectionLabel>Desglose por Cuenta</SectionLabel>
          <div className="mt-3 flex flex-col gap-8">
            {data.families
              .filter(f => f.accounts.length > 0)
              .map((family, i) => (
                <FamilyGroup key={family.name} family={family} index={i} />
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
      <p
        className="mb-2 text-[9px] font-extrabold uppercase tracking-widest"
        style={{ color: dark ? '#64748b' : '#94a3b8' }}
      >
        {label}
      </p>
      <p
        className="mb-2 text-3xl font-black"
        style={{ color: dark ? '#f1f5f9' : '#0f172a' }}
      >
        {value.toLocaleString()}
      </p>
      {pct != null && (
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-black"
          style={{ background: `${accent}1a`, color: accent }}
        >
          {pct.toFixed(1)}%
        </span>
      )}
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
            {/* Icon + name */}
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${color}1a`, border: `1px solid ${color}30` }}
              >
                <Icon size={13} style={{ color }} />
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: dark ? '#cbd5e1' : '#334155' }}
              >
                {label}
              </span>
            </div>

            {/* Total + % of global */}
            <div className="mb-3 flex items-end justify-between gap-2">
              <p
                className="text-3xl font-black leading-none"
                style={{ color: dark ? '#f1f5f9' : '#0f172a' }}
              >
                {family.total}
              </p>
              <span
                className="mb-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black"
                style={{ background: `${color}20`, color }}
              >
                {globalPct.toFixed(1)}% del total
              </span>
            </div>

            {/* Stacked bar */}
            <div
              className="mb-2 flex h-1.5 overflow-hidden rounded-full"
              style={{ background: barTrack }}
            >
              <div className="h-full" style={{ width: `${concludedPct}%`, background: '#10b981' }} />
              <div className="h-full" style={{ width: `${cancelledPct}%`, background: '#f43f5e' }} />
              <div className="h-full" style={{ width: `${processPct}%`, background: '#f59e0b' }} />
            </div>

            {/* Stat row */}
            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest">
              <span className="text-emerald-600">{family.concluded} ok</span>
              <span className="text-rose-500">{family.cancelled} cancel.</span>
              <span
                className="rounded-full px-1.5 py-0.5 font-black"
                style={{ background: `${color}15`, color }}
              >
                {efficiency}% ef.
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── FamilyGroup ──────────────────────────────────────────────────
const FamilyGroup: React.FC<{ family: FamilyData; index: number }> = ({ family, index }) => {
  const dark = useDark();
  const { label, Icon, color } = fcfg(family.name);
  const efficiency = family.total > 0 ? Math.round((family.concluded / family.total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      {/* Family header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={17} style={{ color }} />
        </div>
        <div className="min-w-0">
          <h2
            className="text-xl font-black uppercase tracking-tight"
            style={{ color: dark ? '#f1f5f9' : '#0f172a' }}
          >
            {label}
          </h2>
          <p
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: dark ? '#64748b' : '#94a3b8' }}
          >
            {family.total} servicios &nbsp;·&nbsp; {family.concluded} concluidos &nbsp;·&nbsp; {family.cancelled} cancelados
            {family.inProcess > 0 && <> &nbsp;·&nbsp; {family.inProcess} en proceso</>}
          </p>
        </div>
        <div
          className="ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-black"
          style={{
            color,
            background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
          }}
        >
          {efficiency}% ef.
        </div>
      </div>

      {/* Account cards grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))' }}>
        {family.accounts.map((acc, i) => (
          <AccountCard
            key={acc.name}
            account={acc}
            familyColor={color}
            delay={index * 0.07 + i * 0.03}
          />
        ))}
      </div>
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
        border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'}`,
        borderTop: `2px solid ${familyColor}`,
        filter: account.isAdministrative ? 'grayscale(0.6) opacity(0.55)' : undefined,
      }}
    >
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

      <p
        className="mb-0.5 text-[8px] font-black uppercase tracking-widest"
        style={{ color: dark ? '#475569' : '#94a3b8' }}
      >
        Empresa / Cuenta
      </p>
      <h3
        className="mb-3 line-clamp-2 text-xs font-bold leading-snug"
        style={{ color: dark ? '#cbd5e1' : '#334155' }}
      >
        {account.name}
      </h3>

      {/* Main metrics */}
      <div className="mb-2 flex items-end justify-between">
        <div>
          <p
            className="text-[7px] font-bold uppercase tracking-widest"
            style={{ color: dark ? '#475569' : '#94a3b8' }}
          >
            Mensual
          </p>
          <p
            className="text-2xl font-black"
            style={{ color: dark ? '#f1f5f9' : '#0f172a' }}
          >
            {account.total}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-[7px] font-bold uppercase tracking-widest"
            style={{ color: dark ? '#475569' : '#94a3b8' }}
          >
            Ef.
          </p>
          <p className="text-2xl font-black" style={{ color: effColor }}>{efficiency}%</p>
        </div>
      </div>

      {/* Stacked bar */}
      <div
        className="mb-2 flex h-1.5 overflow-hidden rounded-full"
        style={{ background: barTrack }}
      >
        <div className="h-full" style={{ width: `${concludedPct}%`, background: '#22c55e' }} />
        <div className="h-full" style={{ width: `${cancelledPct}%`, background: '#f43f5e' }} />
      </div>

      {/* Counts row */}
      <div
        className="flex justify-between text-[8px] font-black uppercase tracking-widest"
        style={{ color: dark ? '#475569' : '#94a3b8' }}
      >
        <span>{account.concluded} ok</span>
        {account.inProcess > 0 && (
          <span style={{ color: '#b45309' }}>{account.inProcess} proc.</span>
        )}
        <span>{account.cancelled} cancel.</span>
      </div>
    </motion.div>
  );
};

export default App;
