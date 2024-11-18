export interface AccessMetricsDTO {
    totalAccesses: number;
    averageProcessingTime: number;
    hourlyMetrics: HourlyMetricDTO[];
    userTypeMetrics: UserTypeMetricDTO[];
    dailyMetrics: DailyMetricDTO[];
  }
  
  export interface HourlyMetricDTO {
    hour: number;
    count: number;
  }
  
  export interface UserTypeMetricDTO {
    userType: string;
    count: number;
  }
  
  export interface DailyMetricDTO {
    date: string;
    count: number;
  }

  export interface DayOfWeekMetricEntryDTO {
    accessCount: number;  
    dayOfWeek: string;      
  }

  export interface DayOfWeekMetricExitDTO {
    dayOfWeek: string;
    exitsCountPeak: number;
  }
  
  export interface TopUser {
    fullName: string;
    userType: string;
    entryCount: number;
    exitCount: number;
  }

  export interface UtilizationRate {
    userType: string;
    count: number;
    percentage?: number; 
  }
  
  export interface UtilizationRateResponse {
    data: UtilizationRate[];
    filters: {
      startMonth: number;
      endMonth: number;
      year: number;
    };
    timestamp: number[];
  }

  export interface AccessCount {
    month: number;       
    userType: string;    
    count: number;      
  }
  


  

  export interface MetricUser {
    name: string | null;
    id: number | null;
    count: number;
  }

  export interface RedirectKpis {
    neighborAuthorizations: MetricUser;
    guardEntries: MetricUser;
    guardExits: MetricUser;
  }

  export interface RedirectInfo {
    data: MetricUser | null;
    type: string | null;
    startMonth: number | null;
    startYear: number | null;
    endMonth: number | null; 
    endYear: number | null;
  }