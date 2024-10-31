import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportReasonDto } from '../models/ReportReasonDTO';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly reportUrl = 'http://localhost:8042/api/report';
  private readonly reportReasonUrl = 'http://localhost:8042/api/report-reason';

  constructor(){};

  postReport(postReportDto: any): Observable<any> {
    return this.http.post(this.reportUrl, postReportDto);
  }

  getAllReportReasons() : Observable<any>{
    return this.http.get<ReportReasonDto[]>(this.reportReasonUrl + "/all");
  }
  
}
