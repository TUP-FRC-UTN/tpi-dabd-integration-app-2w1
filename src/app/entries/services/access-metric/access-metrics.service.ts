import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessCount, DayOfWeekMetricEntryDTO, DayOfWeekMetricExitDTO, TopUser } from '../../models/access-metric/metris';
import { API_ENDPOINTS } from '../../entries-environment';


@Injectable({
  providedIn: 'root'
})
export class AccessMetricsService {
  constructor(private http: HttpClient) {}

  getDailyAccessData(): Observable<{ date: string, count: number }[]> {
    return this.http.get<{ date: string, count: number }[]>(API_ENDPOINTS.DAILY_ACCESS);
  }

  getDailyExitData(): Observable<{ date: string, count: number }[]> {
    return this.http.get<{ date: string, count: number }[]>(API_ENDPOINTS.DAILY_EXIT);
  }

  getAccessCountByUserTypeFilter(
    year: number,
    startMonth: number,
    endMonth: number
  ): Observable<AccessCount[]> {
    return this.http.get<AccessCount[]>(
      API_ENDPOINTS.ACCESS_COUNT_USER_TYPE_FILTER,
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
      API_ENDPOINTS.EXIT_COUNT_USER_TYPE_FILTER,
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
      API_ENDPOINTS.TOTAL_ACCESS_AND_EXIT_COUNTS,
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
      API_ENDPOINTS.ACCESS_EXIT_COUNT_BY_DAY_FILTER,
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
    return this.http.get<DayOfWeekMetricEntryDTO>(API_ENDPOINTS.DAY_WITH_MOST_ACCESSES);
  }

  getExitCountByWeekAndDayOfWeek(): Observable<DayOfWeekMetricExitDTO> {
    return this.http.get<DayOfWeekMetricExitDTO>(API_ENDPOINTS.DAY_WITH_MOST_EXITS);
  }

  getThisMonthlyAccessCount(): Observable<number> {
    return this.http.get<number>(API_ENDPOINTS.MONTHLY_ACCESS_COUNT);
  }

  getThisMonthlyExitCount(): Observable<number> {
    return this.http.get<number>(API_ENDPOINTS.MONTHLY_EXIT_COUNT);
  }

  getTotalEntriesForCurrentYear(): Observable<number> {
    return this.http.get<number>(API_ENDPOINTS.TOTAL_ENTRIES_THIS_YEAR);
  }

  getMonthWithMostEntries(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.MONTH_WITH_MOST_ENTRIES);
  }

  getTotalExitsForCurrentYear(): Observable<number> {
    return this.http.get<number>(API_ENDPOINTS.TOTAL_EXITS_CURRENT_YEAR);
  }

  getMonthWithMostExitss(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.MONTH_WITH_MOST_EXITS);
  }

  getTopUsers(startMonth: number, endMonth: number, year: number): Observable<TopUser[]> {
    const params = {
      startMonth: startMonth.toString(),
      endMonth: endMonth.toString(),
      year: year.toString()
    };
    return this.http.get<TopUser[]>(API_ENDPOINTS.TOP_USERS_ENTRIES_EXITS, { params });
  }

  getGuardWithMostExits(
    startYear: number, 
    startMonth: number, 
    endYear: number, 
    endMonth: number
  ): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GUARD_WITH_MOST_EXITS, {
      params: {
        startYear: startYear.toString(),
        startMonth: startMonth.toString(),
        endYear: endYear.toString(),
        endMonth: endMonth.toString()
      }
    });
  }

  getGuardWithMostEntries(
    startYear: number, 
    startMonth: number, 
    endYear: number, 
    endMonth: number
  ): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.GUARD_WITH_MOST_ENTRIES, {
      params: {
        startYear: startYear.toString(),
        startMonth: startMonth.toString(),
        endYear: endYear.toString(),
        endMonth: endMonth.toString()
      }
    });
  }

  getNeighborWithMostAuthorizations(
    startYear: number, 
    startMonth: number, 
    endYear: number, 
    endMonth: number
  ): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.NEIGHBOR_WITH_MOST_INVITATIONS, {
      params: {
        startYear: startYear.toString(),
        startMonth: startMonth.toString(),
        endYear: endYear.toString(),
        endMonth: endMonth.toString()
      }
    });
  }
}