import * as XLSX from 'xlsx';

export interface AccountData {
  name: string;
  total: number;
  concluded: number;
  cancelled: number;
  inProcess: number;
  isAdministrative: boolean;
}

export interface FamilyData {
  name: string;
  total: number;
  concluded: number;
  cancelled: number;
  inProcess: number;
  accounts: AccountData[];
}

export interface DailyCount { day: number; count: number; }
export interface NamedCount { name: string; count: number; }
export interface SatisfactionData {
  excellent: number;
  good: number;
  regular: number;
  bad: number;
  total: number;
}

export interface GlobalMetrics {
  total: number;
  concluded: number;
  cancelled: number;
  inProcess: number;
  families: FamilyData[];
  serviceTypeStats: { programada: number; emergencia: number };
  dailyTrend: DailyCount[];
  provinceStats: NamedCount[];
  cancellationReasons: NamedCount[];
  satisfaction: SatisfactionData;
}

const FAMILY_ORDER = ['DENTAL', 'HOGAR', 'VEHICULAR', 'MÉDICA', 'REFERENCIAS', 'VARIOS', 'LEGAL'];

const normalizeFamily = (raw: string): string => {
  const up = (raw || '').toUpperCase().trim();
  if (up === 'MEDICA') return 'MÉDICA';
  if (up === 'FAMILIA GENERAL') return 'VARIOS';
  return up || 'VARIOS';
};

const parseSatisfaction = (text: string): 'excellent' | 'good' | 'regular' | 'bad' | null => {
  const up = (text || '').toUpperCase();
  if (up.includes('EXCELENTE')) return 'excellent';
  if (up.includes('BUENO') || up.includes('BUENA')) return 'good';
  if (up.includes('REGULAR')) return 'regular';
  if (up.includes('MALO') || up.includes('MALA')) return 'bad';
  return null;
};

export const parseExcelData = async (): Promise<GlobalMetrics> => {
  try {
    const res = await fetch('./data/transference.xlsx');
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf);
    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(wb.Sheets['Sheet1']);

    const accountStats = new Map<string, AccountData>();
    const familyStats = new Map<string, { total: number; concluded: number; cancelled: number; inProcess: number }>();
    const accountFamilyCount = new Map<string, Map<string, number>>();

    // New analytics accumulators
    let programada = 0;
    let emergencia = 0;
    const dailyCounts = new Map<number, number>();
    const provinceCounts = new Map<string, number>();
    const cancelReasonCounts = new Map<string, number>();
    const satisfaction: SatisfactionData = { excellent: 0, good: 0, regular: 0, bad: 0, total: 0 };

    for (const row of rows) {
      const account = (row['Nombre_Cuenta'] as unknown as string) || '';
      if (!account) continue;
      const upper = account.toUpperCase();
      if (upper.includes('GENERAL MOTORS') || upper.includes('IKATECH')) continue;

      const estado = (row['Estado_de_Asistencia'] as unknown as string) || '';
      const family = normalizeFamily((row['Familia_Servicio'] as unknown as string) || '');

      // ── Account stats ──
      if (!accountStats.has(account)) {
        accountStats.set(account, {
          name: account,
          total: 0, concluded: 0, cancelled: 0, inProcess: 0,
          isAdministrative: account.toUpperCase().includes('VIDANOVA'),
        });
      }
      const acc = accountStats.get(account)!;
      acc.total++;
      if (estado === 'CONCLUIDA') acc.concluded++;
      else if (estado.startsWith('CANCELADO')) acc.cancelled++;
      else acc.inProcess++;

      // ── Family stats ──
      if (!familyStats.has(family)) {
        familyStats.set(family, { total: 0, concluded: 0, cancelled: 0, inProcess: 0 });
      }
      const fam = familyStats.get(family)!;
      fam.total++;
      if (estado === 'CONCLUIDA') fam.concluded++;
      else if (estado.startsWith('CANCELADO')) fam.cancelled++;
      else fam.inProcess++;

      // ── Dominant-family tracking ──
      if (!accountFamilyCount.has(account)) accountFamilyCount.set(account, new Map());
      const afc = accountFamilyCount.get(account)!;
      afc.set(family, (afc.get(family) || 0) + 1);

      // ── B1: Service type (PROGRAMADA / EMERGENCIA) ──
      const tipoServicio = (row['Tipo_de_Servicio'] as unknown as string) || '';
      if (tipoServicio.toUpperCase().includes('PROGRAMADA')) programada++;
      else if (tipoServicio.toUpperCase().includes('EMERGENCIA')) emergencia++;

      // ── B2: Daily trend ──
      const fechaRaw = (row['Fecha_creacion_Asistencia'] as unknown as string) || '';
      if (fechaRaw) {
        // Format: "DD-MM-YYYY" or similar — extract leading number as day
        const dayMatch = fechaRaw.match(/^(\d{1,2})/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1], 10);
          if (day >= 1 && day <= 31) {
            dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
          }
        }
      }

      // ── B3: Province ──
      const province = (row['Entidad1_Asistencia'] as unknown as string) || '';
      if (province.trim()) {
        const p = province.trim();
        provinceCounts.set(p, (provinceCounts.get(p) || 0) + 1);
      }

      // ── B4: Cancellation reasons ──
      if (estado.startsWith('CANCELADO')) {
        const r1 = (row['Justificacion_cancelado_al_momento'] as unknown as string) || '';
        const r2 = (row['Justificacion_cancelado_posterior'] as unknown as string) || '';
        const reason = (r1.trim() || r2.trim());
        if (reason) {
          cancelReasonCounts.set(reason, (cancelReasonCounts.get(reason) || 0) + 1);
        }
      }

      // ── B5: Satisfaction ──
      const satisfactionText = (row['Preguntas_Etapa_10'] as unknown as string) || '';
      if (satisfactionText.trim()) {
        const rating = parseSatisfaction(satisfactionText);
        if (rating) {
          satisfaction[rating]++;
          satisfaction.total++;
        }
      }
    }

    // Assign each account to its dominant family
    const accountToFamily = new Map<string, string>();
    accountFamilyCount.forEach((famCounts, account) => {
      let dominant = 'VARIOS';
      let max = 0;
      famCounts.forEach((count, fam) => { if (count > max) { max = count; dominant = fam; } });
      accountToFamily.set(account, dominant);
    });

    // Build FamilyData objects
    const familyObjects = new Map<string, FamilyData>();
    familyStats.forEach((stats, name) => {
      familyObjects.set(name, { name, ...stats, accounts: [] });
    });

    // Place accounts into families, sorted by total descending
    Array.from(accountStats.values())
      .sort((a, b) => b.total - a.total)
      .forEach(acc => {
        const fam = accountToFamily.get(acc.name) || 'VARIOS';
        if (!familyObjects.has(fam)) {
          familyObjects.set(fam, { name: fam, total: 0, concluded: 0, cancelled: 0, inProcess: 0, accounts: [] });
        }
        familyObjects.get(fam)!.accounts.push(acc);
      });

    // Sort families by predefined order, then by total
    const families = Array.from(familyObjects.values())
      .filter(f => f.total > 0)
      .sort((a, b) => {
        const ai = FAMILY_ORDER.indexOf(a.name);
        const bi = FAMILY_ORDER.indexOf(b.name);
        if (ai >= 0 && bi >= 0) return ai - bi;
        if (ai >= 0) return -1;
        if (bi >= 0) return 1;
        return b.total - a.total;
      });

    const totals = families.reduce(
      (acc, f) => ({
        total: acc.total + f.total,
        concluded: acc.concluded + f.concluded,
        cancelled: acc.cancelled + f.cancelled,
        inProcess: acc.inProcess + f.inProcess,
      }),
      { total: 0, concluded: 0, cancelled: 0, inProcess: 0 }
    );

    // Build sorted analytics arrays
    const dailyTrend: DailyCount[] = Array.from(dailyCounts.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day - b.day);

    const provinceStats: NamedCount[] = Array.from(provinceCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const cancellationReasons: NamedCount[] = Array.from(cancelReasonCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      ...totals,
      families,
      serviceTypeStats: { programada, emergencia },
      dailyTrend,
      provinceStats,
      cancellationReasons,
      satisfaction,
    };
  } catch (err) {
    console.error('Error parsing data:', err);
    return {
      total: 0, concluded: 0, cancelled: 0, inProcess: 0, families: [],
      serviceTypeStats: { programada: 0, emergencia: 0 },
      dailyTrend: [],
      provinceStats: [],
      cancellationReasons: [],
      satisfaction: { excellent: 0, good: 0, regular: 0, bad: 0, total: 0 },
    };
  }
};
