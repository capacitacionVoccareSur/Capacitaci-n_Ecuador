import React, { useEffect, useState } from 'react';
import { parseExcelData, AccountData, GlobalMetrics } from './utils/excelParser';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, CheckCircle, XCircle, Users, ChevronRight, Briefcase } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<{ accounts: AccountData[], global: GlobalMetrics } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parseExcelData().then(res => {
      setData(res);
      setLoading(res.accounts.length === 0);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const { accounts, global } = data;
  const mainAccounts = accounts.filter(a => !a.isAdministrative);
  const adminAccounts = accounts.filter(a => a.isAdministrative);

  const pieData = [
    { name: 'Concluidos', value: global.totalConcluded, color: '#4caf50' },
    { name: 'Cancelados', value: global.totalCancelled, color: '#f44336' }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="h-10 w-32 bg-white/10 rounded-lg flex items-center justify-center font-bold text-cyan-400 tracking-wider">VOCARE</div>
          <div className="h-6 w-[1px] bg-white/20"></div>
          <div className="h-10 w-32 bg-white/10 rounded-lg flex items-center justify-center font-bold text-white/80 tracking-wider">ADDIUVA</div>
        </div>
        <div className="hidden md:block">
          <span className="text-white/60 text-sm font-medium">Capacitación Ecuador 2026 • Hoja de Ruta</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <section className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent"
          >
            Operación Ecuador
          </motion.h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Análisis de flujo de servicios y gestión de cuentas para el despliegue de capacitación nacional.
          </p>
        </section>

        {/* Global Metrics Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 col-span-1 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-cyan-500/10 rounded-2xl">
                <Activity className="text-cyan-400" size={24} />
              </div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Total Servicios</span>
            </div>
            <div className="text-6xl font-black mb-2">{global.totalServices.toLocaleString()}</div>
            <div className="text-slate-400 text-sm">Servicios gestionados país</div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 col-span-1 md:col-span-2 flex flex-col md:flex-row gap-8"
          >
            <div className="flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <CheckCircle className="text-emerald-400" size={24} />
                </div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Efectividad</span>
              </div>
              <div className="flex items-end gap-4">
                <div className="text-6xl font-black">{Math.round((global.totalConcluded / global.totalServices) * 100)}%</div>
                <div className="text-emerald-400 font-bold mb-2">Concluidos</div>
              </div>
              <div className="mt-4 flex gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {global.totalConcluded} Concluidos</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> {global.totalCancelled} Cancelados</div>
              </div>
            </div>
            <div className="w-full md:w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Roadmap Grid */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Users className="text-cyan-400" /> Hoja de Ruta por Cuenta
            </h2>
            <span className="text-sm text-slate-500">{mainAccounts.length} Cuentas Activas</span>
          </div>
          <div className="bento-grid">
            {mainAccounts.map((account, idx) => (
              <AccountCard key={account.name} account={account} delay={idx * 0.05} />
            ))}
          </div>
        </div>

        {/* Administrative Section */}
        {adminAccounts.length > 0 && (
          <div className="admin-section">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-400">
                <Briefcase /> Gestión Administrativa
              </h2>
              <span className="text-sm text-slate-500">Solo Carga de Servicios</span>
            </div>
            <div className="bento-grid">
              {adminAccounts.map((account, idx) => (
                <AccountCard key={account.name} account={account} delay={idx * 0.05} isGrey />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const AccountCard = ({ account, delay, isGrey = false }: { account: AccountData, delay: number, isGrey?: boolean }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      onClick={() => setExpanded(!expanded)}
      className={`glass-card p-6 cursor-pointer overflow-hidden ${isGrey ? 'bg-slate-800/20' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold leading-tight flex-1 pr-4">{account.name}</h3>
        <ChevronRight size={20} className={`text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Servicios</div>
          <div className="text-2xl font-black text-cyan-400">{account.totalServices}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Éxito</div>
          <div className="text-2xl font-black text-emerald-400">
            {account.totalServices > 0 ? Math.round((account.concluded / account.totalServices) * 100) : 0}%
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-4 border-t border-white/5"
          >
            <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Servicios Ofrecidos:</div>
            <div className="flex flex-wrap gap-2">
              {account.serviceTypes.map(s => (
                <span key={s} className="px-2 py-1 bg-white/5 rounded text-[10px] text-slate-300 whitespace-nowrap">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-bold">
              <span className="text-emerald-500">{account.concluded} OK</span>
              <span className="text-red-500">{account.cancelled} CANCEL</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default App;
