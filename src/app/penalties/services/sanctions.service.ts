import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ReportDTO } from '../models/reportDTO';
import { Observable } from 'rxjs/internal/Observable';
import { SanctionsDTO } from '../models/SanctionsDTO';
import { PutReportDTO } from '../models/PutReportDTO';
import { Subject } from 'rxjs';
import { Fine } from '../models/Dashboard-models';
import { ReportReasonDto } from '../models/ReportReasonDTO';
import { AuthService } from '../../users/users-servicies/auth.service';
import { environment } from '../../common/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SanctionService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly url = environment.services.sanctions + '/api';
  private readonly reportReasonUrl = this.url + 'report-reason';

  // Comunicacion con Notificaciones
  private readonly notificationsUrl = environment.services.notifications+'/fines';


  constructor() { }

  //report/all
  getAllReports() {
    return this.http.get<ReportDTO[]>(this.url + "/report/all")//cambiar el nopmbre edel metodo
  }

  //sanction/all
  getAllSactions(plotId?: number) {
    return this.http.get<SanctionsDTO[]>(this.url + "/sanction/all" + (plotId ? `?plotId=${plotId}` : ''))
  }

  ///report/states
  getState(): Observable<any> {
    return this.http.get(this.url + "/report/states")
  }

   ///report/states
   getStateFines(): Observable<any> {
    return this.http.get(this.url + "/sanction/allFinesState")
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
    return this.http.get<any>(this.url + "/report/" + id)
  }

  postFine(fineData: any): Observable<any> {
    fineData.createdUser = this.authService.getUser().id;
    return this.http.post(this.url + '/sanction/fine', fineData);
  }

  postWarning(warningData: any): Observable<any> {
    warningData.createdUser = this.authService.getUser().id;
    return this.http.post(this.url + '/sanction/warning', warningData);
  }

  //Este metodo no tiene endpoint por ahora
  //Si es necesario a quien le toque este metodo puede refactorizarlo
  getFineById(id: number) {
    return this.http.get<any>(this.url + "/sanction/fine/" + id)
  }

  //Este metodo no tiene endpoint por ahora
  addDisclaimer(disclaimerData: any) {
    disclaimerData.userId = this.authService.getUser().id;
    return this.http.post<any>(this.url + "/disclaimer", disclaimerData)
  }

  updateReport(reportDTO: PutReportDTO): Observable<any> {
    reportDTO.userId = this.authService.getUser().id;
    return this.http.put(this.url + '/report', reportDTO);
  }

  putStateFine(data:any){
    data.userId = this.authService.getUser().id;
    return this.http.put(this.url + '/sanction/changeStateFine', data);
  }

  updateFine(fineData: any): Observable<any> {
    fineData.userId = this.authService.getUser().id;
    return this.http.put(this.url + '/sanction/updateFine', fineData);
  }

  //Metodo para hacer refresh desde dos modales adentro de una lista
  private refreshSubject = new Subject<void>();

  refreshTable$ = this.refreshSubject.asObservable();

  triggerRefresh() {
    this.refreshSubject.next();
  }

  getAllFines():Observable<Fine[]>{
    return this.http.get<Fine[]>(this.url + "/sanction/allFines")
  } 

    // Obtiene todos los tipos de razones
    getAllReportReasons(): Observable<any> {
      return this.http.get<ReportReasonDto[]>(this.reportReasonUrl + "/all");
    }

  getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 6); // Cambiar a 6 meses atrás
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // Comunicacion con Notificaciones
  notifyNewDisclaimer(message: string) {
    return this.http.post<any>(`${this.notificationsUrl}/newAppealWarn`, { message });
  }

  notifyDischargeResolved(appealUpdate: any) {
    return this.http.post<any>(`${this.notificationsUrl}/appealUpdate`, appealUpdate);
  }

  notifyNewFineOrWarning(fineOrWarning: any) {
    return this.http.post<any>(`${this.notificationsUrl}/newFineOrWarning`, fineOrWarning);
  }

}
