import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { Complaint, ComplaintDto, PutStateComplaintDto } from '../models/complaint';
import { ReportReasonDto } from '../models/ReportReasonDTO';
import { AuthService } from '../../users/users-servicies/auth.service';
import { environment } from '../../common/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly url = environment.services.complaints + '/api/complaint';
  private readonly reportReasonUrl = environment.services.sanctions + '/api/report-reason';



  //Envia una nueva denuncia
  add(complaintData: any): Observable<any> {
    const complaint = new FormData();

    let userId = this.authService.getUser().id.toString();
  
    complaint.append('userId', userId);
    complaint.append('complaintReason', complaintData.complaintReason);
    complaint.append('anotherReason', complaintData.anotherReason)
    complaint.append('description', complaintData.description);
  
    if (complaintData.pictures && complaintData.pictures.length > 0) {
      complaintData.pictures.forEach((file: File, index: number) => {
        complaint.append('pictures', file, file.name);
      });
    }
  
    return this.http.post(this.url, complaint);
  }

  // Obtiene todos los tipos de razones
  getAllReportReasons(): Observable<any> {
    return this.http.get<ReportReasonDto[]>(this.reportReasonUrl + "/all");
  }


  //Obtiene todo el listado reducido de denuncias
  getAllComplaints(){
    return this.http.get<ComplaintDto[]>(this.url + `/all`)
  }


  //Obtiene una denuncia por id
  getById(id :number):Observable<any>{
    return this.http.get(this.url + `/${id}`)
  }



  //Gets the images by their id.
  getFilesById(id: number): Observable<Map<string, string>> {
    return this.http.get<Map<string, string>>(this.url + `/getFiles/${id}`);
  }


  //Actualiza el estado de una denuncia
  putStateComplaint(idcomplaint: number, updatedData: PutStateComplaintDto): Observable<any> {
    updatedData.userId = this.authService.getUser().id;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put(this.url + `/${idcomplaint}`, updatedData, { headers });
  }


  //Devuelve el listado completo de estados
  getState(): Observable<any> {
    return this.http.get(this.url + `/states`)
  }


  //esto es unicamente para mostrar fechas en formato local
  formatDate(date: any): string {
    if (Array.isArray(date)) {
      const [year, month, day] = date;
      const createdDate = new Date(year, month - 1, day);
      return createdDate.toLocaleDateString('es-ES');
    }
    return new Date(date).toLocaleDateString('es-ES');
  }

  getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  getDefaultFromDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
