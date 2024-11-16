import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = 'http://localhost:8084/fileManager';  // Cambia esto por tu URL base

  constructor(private http: HttpClient) { }

  // Método para obtener el archivo como Blob y los encabezados
  getFile(fileId: string): Observable<{ blob: Blob; filename: string }> {
    return this.http.get(`${this.baseUrl}/getFile/${fileId}`, {
      responseType: 'blob', // Esperamos un Blob
      observe: 'response' // Observamos toda la respuesta para acceder a los encabezados
    }).pipe(
      catchError(this.handleError),  // Manejo de errores
      map(response => {
        console.log(response);
        
        const blob = response.body as Blob; // Obtenemos el Blob
        const filename = response.headers.get('filename') || 'downloaded-file.pdf'; // Obtenemos el nombre del archivo desde los encabezados
        return { blob, filename };
      })
    );
  }

  // Método para descargar el archivo
  downloadFile(fileId: string): void {
    this.getFile(fileId).subscribe(({ blob, filename }) => {
      const objectURL = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectURL;
      link.download = filename; // Usamos el nombre de archivo obtenido desde el header

      // Simular el clic en el enlace para iniciar la descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Limpiamos el enlace

      // Liberar la memoria del objeto URL
      URL.revokeObjectURL(objectURL);
    }, error => {
      console.error('Error al descargar el archivo:', error);
    });
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}