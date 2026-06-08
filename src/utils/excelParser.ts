import * as XLSX from 'xlsx';

export interface AccountData {
  name: string;
  totalServices: number;
  concluded: number;
  cancelled: number;
  serviceTypes: string[];
  isAdministrative: boolean;
}

export interface GlobalMetrics {
  totalServices: number;
  totalConcluded: number;
  totalCancelled: number;
  topAccounts: AccountData[];
}

export const parseExcelData = async (): Promise<{ accounts: AccountData[], global: GlobalMetrics }> => {
  try {
    const [transRes, gestRes] = await Promise.all([
      fetch('/data/transference.xlsx'),
      fetch('/data/gestion.xlsx')
    ]);

    const transBuf = await transRes.arrayBuffer();
    const gestBuf = await gestRes.arrayBuffer();

    const transWb = XLSX.read(transBuf);
    const gestWb = XLSX.read(gestBuf);

    const transData: any[] = XLSX.utils.sheet_to_json(transWb.Sheets[transWb.SheetNames[1] || transWb.SheetNames[0]]);
    const gestData: any[] = XLSX.utils.sheet_to_json(gestWb.Sheets[gestWb.SheetNames[0]]);

    const accountMap = new Map<string, AccountData>();

    const getStatus = (row: any) => {
        const val = (row['Estado'] || row['Status'] || row['Estatus'] || '').toString().toUpperCase();
        if (val.includes('CONCLUIDO')) return 'concluded';
        if (val.includes('CANCELADO')) return 'cancelled';
        return 'other';
    };

    const getServiceType = (row: any) => {
        return row['Nombre_Servicio'] || row['Servicio'] || row['Tipo'] || 'General';
    };

    gestData.forEach(row => {
      const name = row['Nombre_Cuenta'] || row['Cuenta'] || 'Unknown';
      const status = getStatus(row);
      const service = getServiceType(row);

      if (!accountMap.has(name)) {
        accountMap.set(name, {
          name,
          totalServices: 0,
          concluded: 0,
          cancelled: 0,
          serviceTypes: [],
          isAdministrative: name.toUpperCase().includes('VIDANOVA') || name.toUpperCase().includes('GENERAL MOTORS')
        });
      }

      const acc = accountMap.get(name)!;
      acc.totalServices++;
      if (status === 'concluded') acc.concluded++;
      if (status === 'cancelled') acc.cancelled++;
      if (!acc.serviceTypes.includes(service)) {
        acc.serviceTypes.push(service);
      }
    });

    const accounts = Array.from(accountMap.values()).sort((a, b) => b.totalServices - a.totalServices);

    const global: GlobalMetrics = {
      totalServices: accounts.reduce((sum, acc) => sum + acc.totalServices, 0),
      totalConcluded: accounts.reduce((sum, acc) => sum + acc.concluded, 0),
      totalCancelled: accounts.reduce((sum, acc) => sum + acc.cancelled, 0),
      topAccounts: accounts.filter(a => !a.isAdministrative).slice(0, 5)
    };

    return { accounts, global };
  } catch (error) {
    console.error('Error parsing excel files:', error);
    return { accounts: [], global: { totalServices: 0, totalConcluded: 0, totalCancelled: 0, topAccounts: [] } };
  }
};
