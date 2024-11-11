import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
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

  putStateReport(data:any){
    return this.http.put(this.reportUrl + '/state', data);
  }

  //Metodo para hacer refresh desde dos modales adentro de una lista
  private refreshSubject2 = new Subject<void>();

  refreshTable$ = this.refreshSubject2.asObservable();

  triggerRefresh() {
    this.refreshSubject2.next();
  }
  
}
