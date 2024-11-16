

export interface Fine{
    id: number;
    fineState: string;
    stateReason: string;
    report: Report;
    disclaimer: string | null;
    dischargeDate: number[]; // [año, mes, día]
    amount: number;
    createdDate: string;
    createdUser: number;
    lastUpdatedDate: number; 
    lastUpdatedUser: number;
}
export interface Report {
    id: number;
    reportState: string;
    stateReason: string;
    reportReason: ReportReason;
    plotId: number;
    description: string;
    createdDate: number[]; // [año, mes, día, hora, minuto]
    createdUser: number;
    lastUpdatedDate: number[]; // [año, mes, día, hora, minuto]
    lastUpdatedUser: number;
}
export interface ReportReason {
    id: number;
    reportReason: string;
    baseAmount: number | null;
    createdDate: number[]; // [año, mes, día, hora, minuto]
    createdUser: number;
    lastUpdatedDate: number[]; // [año, mes, día, hora, minuto]
    lastUpdatedUser: number;
}

// Interfaces para los KPIs
export interface ColumnChartKPIs {
    totalPeriod: number;
    monthlyAverage: number;
    bestMonth: {
      month: string;
      value: number;
    };
  }
  
export interface PieChartKPIs {
    topMethod: {
      name: string;
      percentage: number;
    };
    totalTransactions: number;
    averagePerMethod: {
      [key: string]: number;
    };
  }
  
export interface TopExpenseKPIs {
    highestAmount: number;
    averageTop5: number;
    totalTop5: number;
  }