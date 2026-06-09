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

export interface GlobalMetrics {
  total: number;
  concluded: number;
  cancelled: number;
  inProcess: number;
  families: FamilyData[];
}

const FAMILY_ORDER = ['DENTAL', 'HOGAR', 'VEHICULAR', 'MÉDICA', 'REFERENCIAS', 'VARIOS', 'LEGAL'];

const normalizeFamily = (raw: string): string => {
  const up = (raw || '').toUpperCase().trim();
  if (up === 'MEDICA') return 'MÉDICA';
  if (up === 'FAMILIA GENERAL') return 'VARIOS';
  return up || 'VARIOS';
};

export const parseExcelData = async (): Promise<GlobalMetrics> => {
  try {
    const res = await fetch('./data/transference.xlsx');
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf);
    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(wb.Sheets['Sheet1']);

    const accountStats = new Map<string, AccountData>();
    const familyStats = new Map<string, { total: number; concluded: number; cancelled: number; inProcess: number }>();
    // Track how many services each account has in each family (for dominant-family assignment)
    const accountFamilyCount = new Map<string, Map<string, number>>();

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
    }

    // Assign each account to its dominant family
    const accountToFamily = new Map<string, string>();
    accountFamilyCount.forEach((famCounts, account) => {
      let dominant = 'VARIOS';
      let max = 0;
      famCounts.forEach((count, fam) => { if (count > max) { max = count; dominant = fam; } });
      accountToFamily.set(account, dominant);
    });

    // Build FamilyData objects (seeded from real family stats)
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

    return { ...totals, families };
  } catch (err) {
    console.error('Error parsing data:', err);
    return { total: 0, concluded: 0, cancelled: 0, inProcess: 0, families: [] };
  }
};
