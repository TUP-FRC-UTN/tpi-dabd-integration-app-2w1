import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../common/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  baseUrl: string = environment.services.fileManager; 
  constructor(private http: HttpClient) { }
 
  getFile(fileId: string): Observable<{ blob: Blob; filename: string }> {
    return this.http.get(`${this.baseUrl}/fileManager/getFile/${fileId}`, {
      responseType: 'blob', 
      observe: 'response'
    }).pipe(
      catchError(this.handleError), 
      map(response => {
        console.log(response);
        
        const blob = response.body as Blob; 
        const filename = response.headers.get('filename') || 'downloaded-file.pdf'; 
        
        return { blob, filename };
      })
    );
  }
 
  downloadFile(fileId: string): void {
    this.getFile(fileId).subscribe({
      next: ({ blob, filename }) => {
        const objectURL = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = objectURL;
        link.download = filename; 
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
        
        URL.revokeObjectURL(objectURL);
      },
      error: (error) => {
        console.error('Error al descargar el archivo:', error);
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo descargar el comprobante. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#f44336', 
          background: '#ffffff',
          customClass: {
            title: 'text-xl font-medium text-gray-900',
            htmlContainer: 'text-sm text-gray-600',
            confirmButton: 'px-4 py-2 text-white rounded-lg',
            popup: 'swal2-popup'
          }
        });
      }
    });
  }
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

}
