import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Car, Heart, Phone, Scale, Layers, Smile } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { parseExcelData } from './utils/excelParser';
import type { GlobalMetrics, FamilyData, AccountData } from './utils/excelParser';

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
  const [data, setData] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parseExcelData().then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#162032]">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2"
          style={{ borderColor: 'rgba(255,255,255,0.08)', borderTopColor: '#22d3ee' }}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#162032] px-4 py-6 md:px-8 md:py-8">

      {/* ── Background orbs ── */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)' }}
      />

      {/* ── Header ── */}
      <header className="relative mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-6">
        <div className="flex items-center gap-3">
          <EcuadorFlag />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-500">
              Voccare · Addiuva · Operación Regional Ecuador
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              CAPACITACIÓN ECUADOR 2026
            </h1>
            <div className="mt-1.5 h-0.5 w-14 rounded-full" style={{ background: 'linear-gradient(90deg, #22d3ee, #34d399)' }} />
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
          Mayo 2026
        </span>
      </header>

      {/* ── KPIs ── */}
      <section className="mb-8">
        <SectionLabel>Resumen Mensual</SectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Total Asistencias" value={data.total}      pct={null}                                  accent="#94a3b8" index={0} />
          <KpiCard label="Concluidas"         value={data.concluded}  pct={(data.concluded / data.total) * 100}  accent="#22c55e" index={1} />
          <KpiCard label="Canceladas"         value={data.cancelled}  pct={(data.cancelled / data.total) * 100}  accent="#f43f5e" index={2} />
          <KpiCard label="En Proceso"         value={data.inProcess}  pct={(data.inProcess / data.total) * 100}  accent="#f59e0b" index={3} />
        </div>
      </section>

      {/* ── Family Distribution ── */}
      <section className="mb-8">
        <SectionLabel>Distribución por Familia de Servicio</SectionLabel>
        <div className="mt-3 rounded-2xl border border-white/5 bg-slate-900/40 p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Concluidas</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />Canceladas</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />En proceso</span>
          </div>
          <FamilyRechartsChart families={data.families} />
        </div>
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

      <footer className="mt-16 border-t border-white/5 pt-6 text-center text-[9px] font-bold uppercase tracking-[0.45em] text-slate-600">
        Voccare + Addiuva · Operación Regional
      </footer>
    </div>
  );
};

// ─── SectionLabel ─────────────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2.5">
    <div
      className="h-4 w-0.5 rounded-full"
      style={{ background: 'linear-gradient(180deg, #22d3ee, #34d399)' }}
    />
    <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
      {children}
    </span>
  </div>
);

// ─── KpiCard ──────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string; value: number; pct: number | null; accent: string; index: number;
}> = ({ label, value, pct, accent, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className="rounded-2xl border border-white/5 bg-slate-900/60 p-4"
    style={{ borderLeft: `2px solid ${accent}` }}
  >
    <p className="mb-2 text-[9px] font-extrabold uppercase tracking-widest text-slate-500">{label}</p>
    <p className="mb-2 text-3xl font-black text-white">{value.toLocaleString()}</p>
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

// ─── FamilyRechartsChart ──────────────────────────────────────────
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-xs shadow-xl">
      <p className="mb-2 font-black uppercase tracking-widest text-slate-400">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="flex items-center gap-2 font-bold text-white">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.fill }} />
          {p.name}: <span style={{ color: p.fill }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const FamilyRechartsChart: React.FC<{ families: FamilyData[] }> = ({ families }) => {
  const chartData = families.map(f => ({
    name: fcfg(f.name).label,
    Concluidas: f.concluded,
    Canceladas: f.cancelled,
    'En proceso': f.inProcess,
  }));

  const rowHeight = 52;
  const height = families.length * rowHeight + 20;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        barSize={14}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="Concluidas" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Canceladas" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
        <Bar dataKey="En proceso" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── FamilyGroup ──────────────────────────────────────────────────
const FamilyGroup: React.FC<{ family: FamilyData; index: number }> = ({ family, index }) => {
  const { label, Icon, color } = fcfg(family.name);
  const efficiency = family.total > 0 ? Math.round((family.concluded / family.total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      {/* Family header */}
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={17} style={{ color }} />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-black uppercase tracking-tight text-white">{label}</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            {family.total} servicios &nbsp;·&nbsp; {family.concluded} concluidos &nbsp;·&nbsp; {family.cancelled} cancelados
            {family.inProcess > 0 && <> &nbsp;·&nbsp; {family.inProcess} en proceso</>}
          </p>
        </div>
        <div
          className="ml-auto shrink-0 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-black"
          style={{ color }}
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
  const efficiency   = account.total > 0 ? Math.round((account.concluded / account.total) * 100) : 0;
  const concludedPct = account.total > 0 ? (account.concluded / account.total) * 100 : 0;
  const cancelledPct = account.total > 0 ? (account.cancelled / account.total) * 100 : 0;

  const effColor =
    efficiency >= 70 ? '#22c55e' :
    efficiency >= 50 ? '#f59e0b' :
                       '#f43f5e';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 transition-colors duration-300 hover:border-white/10"
      style={{
        borderTop: `2px solid ${familyColor}`,
        filter: account.isAdministrative ? 'grayscale(0.75) opacity(0.5)' : undefined,
      }}
    >
      {/* Admin badge */}
      {account.isAdministrative && (
        <div className="mb-3 inline-flex items-center rounded-full border border-slate-700/60 bg-slate-800 px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-500">
          Cuenta administrativa
        </div>
      )}

      <p className="mb-0.5 text-[8px] font-black uppercase tracking-widest text-slate-600">Empresa / Cuenta</p>
      <h3 className="mb-3 line-clamp-2 text-xs font-bold leading-snug text-slate-200">
        {account.name}
      </h3>

      {/* Main metrics */}
      <div className="mb-2 flex items-end justify-between">
        <div>
          <p className="text-[7px] font-bold uppercase tracking-widest text-slate-600">Mensual</p>
          <p className="text-2xl font-black text-white">{account.total}</p>
        </div>
        <div className="text-right">
          <p className="text-[7px] font-bold uppercase tracking-widest text-slate-600">Ef.</p>
          <p className="text-2xl font-black" style={{ color: effColor }}>{efficiency}%</p>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="mb-2 flex h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
        <div className="h-full" style={{ width: `${concludedPct}%`, background: '#22c55e' }} />
        <div className="h-full" style={{ width: `${cancelledPct}%`, background: '#f43f5e' }} />
      </div>

      {/* Counts row */}
      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-600">
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
