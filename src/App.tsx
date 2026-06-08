import React, { useEffect, useState } from 'react';
import { parseExcelData } from './utils/excelParser';
import type { GlobalMetrics, FamilyData, AccountData } from './utils/excelParser';
import { motion } from 'framer-motion';
import { Database, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parseExcelData().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      {/* Header Summary */}
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                CAPACITACIÓN ECUADOR 2026
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Roadmap Operativo por Familia de Servicios</p>
        </div>
        
        <div className="flex gap-4">
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
                <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Mensual</div>
                <div className="text-3xl font-black text-white">{data.totalServices.toLocaleString()}</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl backdrop-blur-xl">
                <div className="text-[10px] font-black text-emerald-500 uppercase mb-1">Concluidos</div>
                <div className="text-3xl font-black text-emerald-400">{data.totalConcluded.toLocaleString()}</div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl backdrop-blur-xl">
                <div className="text-[10px] font-black text-rose-500 uppercase mb-1">Cancelados</div>
                <div className="text-3xl font-black text-rose-400">{data.totalCancelled.toLocaleString()}</div>
            </div>
        </div>
      </header>

      {/* Main Roadmap - Horizontal Rows */}
      <div className="flex flex-col gap-12">
        {data.families.map((family, idx) => (
          <FamilyRow key={family.name} family={family} index={idx} />
        ))}
      </div>

      <footer className="mt-24 pt-12 border-t border-white/5 text-center text-slate-600 text-[10px] font-black tracking-[0.5em] uppercase">
        Voccare + Addiuva • Operación Regional
      </footer>
    </div>
  );
};

const FamilyRow = ({ family, index }: { family: FamilyData, index: number }) => {
    return (
        <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Database className="text-cyan-400" size={20} />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-white uppercase">{family.name}</h2>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-500" /> {family.concluded} Concluidos</span>
                        <span className="flex items-center gap-1"><XCircle size={10} className="text-rose-500" /> {family.cancelled} Cancelados</span>
                    </div>
                </div>
                <div className="ml-auto flex items-baseline gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <span className="text-[10px] font-black text-slate-500">TOTAL</span>
                    <span className="text-lg font-black text-cyan-400">{family.totalServices}</span>
                </div>
            </div>

            {/* Horizontal Scroll Area for Accounts */}
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {family.accounts.map((acc, aIdx) => (
                    <AccountCard key={acc.name} account={acc} delay={index * 0.1 + aIdx * 0.05} />
                ))}
            </div>
        </motion.section>
    );
};

const AccountCard = ({ account, delay }: { account: AccountData, delay: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            whileHover={{ y: -5, borderColor: 'rgba(34, 211, 238, 0.4)' }}
            className={`min-w-[320px] bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-300 ${account.isAdministrative ? 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100' : ''}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Empresa / Cuenta</span>
                    <h3 className="text-lg font-bold leading-tight line-clamp-2 text-white group-hover:text-cyan-400 transition-colors">{account.name}</h3>
                </div>
                <BarChart3 className="text-slate-700 group-hover:text-cyan-500/50 transition-colors" size={20} />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Mensual</span>
                        <div className="text-2xl font-black text-white">{account.totalServices}</div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Eficiencia</span>
                        <div className="text-2xl font-black text-emerald-400">
                            {account.totalServices > 0 ? Math.round((account.concluded / account.totalServices) * 100) : 0}%
                        </div>
                    </div>
                </div>

                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(account.concluded / account.totalServices) * 100}%` }}></div>
                </div>

                <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                    <span>{account.concluded} OK</span>
                    <span>{account.cancelled} CANCEL</span>
                </div>
            </div>

            <div className="absolute -right-4 -bottom-4 text-white/5 font-black text-7xl pointer-events-none group-hover:text-cyan-500/10 transition-all select-none">
                {account.totalServices}
            </div>
        </motion.div>
    );
};

export default App;
