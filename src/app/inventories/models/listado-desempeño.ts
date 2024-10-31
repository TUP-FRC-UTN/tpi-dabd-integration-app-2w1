export interface WakeUpCall {
  employeeId: number;
  performanceType: string;
  startDate: Date;
  endDate: Date;
  observationsCount?: number;
}

// src/app/interfaces/performance.interface.ts
export interface Performance {
employeeId: number;
performanceType: string;
month: number;
year: number;
totalWakeUpCalls: number;
levesCount: number;
moderadasCount: number;
criticasCount: number;
}

// src/app/interfaces/employee.interface.ts
export interface Employee {
id: number;
fullName: string;
document: string;
position: string;
salary: number;
}

// src/app/interfaces/employee-performance.interface.ts
export interface EmployeePerformance {
id: number;
fullName: string;
year: number;
month: number;
totalObservations: number;
performanceType: string;
}

export interface WakeUpCallDetail {
  id: number;
  employeeId: number;
  observation: string;
  dateReal: number[];
  wackeUpTypeEnum: string;
  createdDate: number[];
  createdUser: number;
  lastUpdateDate: number[];
  lastUpdateUser: number;
}
  