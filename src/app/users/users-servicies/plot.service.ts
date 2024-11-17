import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlotTypeModel } from '../users-models/plot/PlotType';
import { PlotStateModel } from '../users-models/plot/PlotState';
import { PlotModel } from '../users-models/plot/Plot';
import { GetPlotModel } from '../users-models/plot/GetPlot';
import { PutPlot } from '../users-models/plot/PutPlot';

@Injectable({
  providedIn: 'root'
})
export class PlotService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = 'http://localhost:9062';

  constructor() { }

  postPlot(plot: PlotModel): Observable<PlotModel> {
    const formData: FormData = new FormData();
  
    // Agregamos los campos del plot al FormData
    formData.append('plot_number', plot.plot_number.toString());
    formData.append('block_number', plot.block_number.toString());
    formData.append('total_area_in_m2', plot.total_area_in_m2.toString());
    formData.append('built_area_in_m2', plot.built_area_in_m2.toString());
    formData.append('plot_state_id', plot.plot_state_id.toString());
    formData.append('plot_type_id', plot.plot_type_id.toString());
    formData.append('userCreateId', plot.userCreateId.toString());
  
    // Agregamos los archivos al FormData
    plot.files.forEach((file, index) => {
      formData.append('files', file);  // 'files' debe coincidir con el nombre del campo en tu backend
    });
  
    // Realizamos la solicitud POST
    return this.http.post<PlotModel>(this.url + "/plots", formData, {
      headers: {
        // No es necesario configurar el Content-Type a multipart/form-data manualmente, Angular lo hará.
      }
    });
  }
  
  getAllTypes(): Observable<PlotTypeModel[]>{
    return this.http.get<PlotTypeModel[]>(this.url + '/plots/types');
  }

  getAllPlots(): Observable<GetPlotModel[]>{
    return this.http.get<GetPlotModel[]>(this.url + '/plots');
  }

  getAllPlotsAvailables(): Observable<GetPlotModel[]>{
    return this.http.get<GetPlotModel[]>(this.url + '/plots/availables');
  }

  getPlotById(plotId: number): Observable<GetPlotModel>{
    return this.http.get<GetPlotModel>(this.url + '/plots/' + plotId);
  }

  getPlotsByOwnerId(ownerId: number): Observable<GetPlotModel[]>{
    return this.http.get<GetPlotModel[]>(this.url + '/plots/' + ownerId + '/owner' )
  }
  
  getAllStates(): Observable<PlotStateModel[]>{
    return this.http.get<PlotStateModel[]>(this.url + '/plots/states');
  }

  putPlot(id: number,  plot: PutPlot): Observable<PutPlot>{

    const formData: FormData = new FormData();
  
    formData.append('total_area_in_m2', plot.total_area_in_m2.toString());
    formData.append('built_area_in_m2', plot.built_area_in_m2.toString());
    formData.append('plot_state_id', plot.plot_state_id.toString());
    formData.append('plot_type_id', plot.plot_type_id.toString());
    formData.append('userUpdateId', plot.userUpdateId.toString());
  
    // Agregamos los archivos al FormData
    plot.files.forEach((file, index) => {
      formData.append('files', file);  // 'files' debe coincidir con el nombre del campo en tu backend
    });

    return this.http.put<PutPlot>(`${this.url}/plots?plotId=${id}`, formData, {
      headers: {
        
      }
    });
  }
}