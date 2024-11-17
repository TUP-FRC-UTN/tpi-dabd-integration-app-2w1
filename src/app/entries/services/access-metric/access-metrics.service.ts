import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessCount, AccessMetricsDTO, DayOfWeekMetricEntryDTO, DayOfWeekMetricExitDTO, HourlyMetricDTO, TopUser, UserTypeMetricDTO, UtilizationRateResponse } from '../../models/access-metric/metris';
@Injectable({
  providedIn: 'root'
})
export class AccessMetricsService {

  private baseUrl = 'http://localhost:8090';
  
  constructor(private http: HttpClient) {}

  getDailyAccessData(): Observable<{ date: string, count: number }[]> {
    return this.http.get<{ date: string, count: number }[]>(`${this.baseUrl}/daily-access-count`);
  }

  getDailyExitData(): Observable<{ date: string, count: number }[]> {
    return this.http.get<{ date: string, count: number }[]>(`${this.baseUrl}/daily-exit-count`);
  }

  getAccessCountByUserTypeFilter(
    year: number,
    startMonth: number,
    endMonth: number
  ): Observable<AccessCount[]> {
    return this.http.get<AccessCount[]>(
      `${this.baseUrl}/access-count-by-user-type-filter`,
      {
        params: {
          year: year.toString(),
          startMonth: startMonth.toString(),
          endMonth: endMonth.toString()
        }
      }
    );
  }
  
  getExitCountByUserTypeFilter(
    year: number,
    startMonth: number,
    endMonth: number
  ): Observable<AccessCount[]> {
    return this.http.get<AccessCount[]>(
      `${this.baseUrl}/exit-count-by-user-type-filter`,
      {
        params: {
          year: year.toString(),
          startMonth: startMonth.toString(),
          endMonth: endMonth.toString()
        }
      }
    );
  }
  
getTotalCountsMovementsByFilter(   
  year: number,
  startMonth: number,
  endMonth: number
): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/total-access-and-exit-counts`,
    {
      params: {
        year: year.toString(),
        startMonth: startMonth.toString(),
        endMonth: endMonth.toString()
      }
    }
  );
}

  getMovementCountsFilter(
    year: number, 
    startMonth: number, 
    endMonth: number, 
    filterType: 'ingresos' | 'egresos' | 'total'
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/access-exit-count-by-day-filter`,
      {
        params: {
          year: year.toString(),
          startMonth: startMonth.toString(),
          endMonth: endMonth.toString(),
          filterType: filterType 
        }
      }
    );
  }

  getAccessCountByWeekAndDayOfWeek(): Observable<DayOfWeekMetricEntryDTO> {
    return this.http.get<DayOfWeekMetricEntryDTO>(`${this.baseUrl}/day-with-most-accesses`);
  }


  getExitCountByWeekAndDayOfWeek(): Observable<DayOfWeekMetricExitDTO> {
    return this.http.get<DayOfWeekMetricExitDTO>(`${this.baseUrl}/day-with-most-exits`);
  }

  getThisMonthlyAccessCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/this-monthly-access-count`);
  }

  getThisMonthlyExitCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/this-monthly-exit-count`);
  }


  getTotalEntriesForCurrentYear(): Observable<number> {
    return this.http.get<number>(this.baseUrl +'/total-entries-this-year');
  }

  getMonthWithMostEntries(): Observable<any> {
    return this.http.get<any>(this.baseUrl + "/month-with-most-entries");
  }

  getTotalExitsForCurrentYear(): Observable<number> {
    return this.http.get<number>(this.baseUrl +'/total-exits-current-year');
  }

  getMonthWithMostExitss(): Observable<any> {
    return this.http.get<any>(this.baseUrl + "/month-with-most-exits");
  }

  getTopUsers(startMonth: number, endMonth: number, year: number): Observable<TopUser[]> {
    const params = {
      startMonth: startMonth.toString(),
      endMonth: endMonth.toString(),
      year: year.toString()
    };
    return this.http.get<TopUser[]>(this.baseUrl + '/top-users-entries-exits', { params });
  }

  getGuardWithMostExits(startYear: number, startMonth: number, endYear: number, endMonth: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/guard-with-most-exits', {
      params: {
        startYear: startYear.toString(),
        startMonth: startMonth.toString(),
        endYear: endYear.toString(),
        endMonth: endMonth.toString()
      }
    });
  }

  getGuardWithMostEntries(startYear: number, startMonth: number, endYear: number, endMonth: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/guard-with-most-entries', {
      params: {
        startYear: startYear.toString(),
        startMonth: startMonth.toString(),
        endYear: endYear.toString(),
        endMonth: endMonth.toString()
      }
    });
  }

  getNeighborWithMostAuthorizations(startYear: number, startMonth: number, endYear: number, endMonth: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/neighbor-with-most-invitations', {
      params: {
        startYear: startYear.toString(),
        startMonth: startMonth.toString(),
        endYear: endYear.toString(),
        endMonth: endMonth.toString()
      }
    });
  }
}