import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessMonthlyVisitorCount } from '../../models/access-visitors-count/access-monthly-visitor-count';
@Injectable({
  providedIn: 'root'
})
export class AccessMetricsService {
  private apiUrl = 'http://localhost:8090';
  
  constructor(private http:HttpClient) { }

  getMonthlyVisitorCounts(): Observable<AccessMonthlyVisitorCount[]> {
    return this.http.get<AccessMonthlyVisitorCount[]>(this.apiUrl + "/monthly_counts");
  }

  getMonthlyVisitorCountsByType(): Observable<AccessMonthlyVisitorCount[]> {
    return this.http.get<AccessMonthlyVisitorCount[]>(this.apiUrl + "/monthly-visitors-by-type");
  }

}