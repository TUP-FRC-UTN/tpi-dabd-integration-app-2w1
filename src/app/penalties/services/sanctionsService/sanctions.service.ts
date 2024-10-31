import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ReportDTO } from '../../models/reportDTO';
import { Observable } from 'rxjs/internal/Observable';
import { SanctionsDTO } from '../../models/SanctionsDTO';
import { PutReportDTO } from '../../models/PutReportDTO';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PenaltiesSanctionsServicesService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = 'http://localhost:8042/api/';

  constructor() { }

  //report/all
  getAllReports() {
    return this.http.get<ReportDTO[]>(this.url + "report/all")//cambiar el nopmbre edel metodo
  }

  //sanction/all
  getAllSactions() {
    return this.http.get<SanctionsDTO[]>(this.url + "sanction/all")
  }

  ///report/states
  getState(): Observable<any> {
    return this.http.get(this.url + "report/states")
  }

  //esto es unicamente para mostrar fechas 
  formatDate(date: any): string {
    if (Array.isArray(date)) {
      const [year, month, day] = date;
      const createdDate = new Date(year, month - 1, day);
      return createdDate.toLocaleDateString('es-ES');
    }
    return new Date(date).toLocaleDateString('es-ES');
  }

  getById(id: number) {
    return this.http.get<any>(this.url + "report/" + id)
  }

  postFine(fineData: any): Observable<any> {
    return this.http.post(this.url + 'sanction/fine', fineData);
  }

  postWarning(warningData: any): Observable<any> {
    return this.http.post(this.url + 'sanction/warning', warningData);
  }

  //Este metodo no tiene endpoint por ahora
  //Si es necesario a quien le toque este metodo puede refactorizarlo
  getFineById(id: number) {
    return this.http.get<any>(this.url + "sanction/fine/" + id)
  }

  //Este metodo no tiene endpoint por ahora
  addDisclaimer(disclaimerData: any) {

    return this.http.post<any>(this.url + "disclaimer/", disclaimerData)
  }

  updateReport(reportDTO: PutReportDTO): Observable<any> {
    return this.http.put(this.url + 'report', reportDTO);
  }

  putStateFine(data:any){
    return this.http.put(this.url + 'sanction/changeStateFine', data);
  }

  //Metodo para hacer refresh desde dos modales adentro de una lista
  private refreshSubject = new Subject<void>();

  refreshTable$ = this.refreshSubject.asObservable();

  triggerRefresh() {
    this.refreshSubject.next();
  }

}
