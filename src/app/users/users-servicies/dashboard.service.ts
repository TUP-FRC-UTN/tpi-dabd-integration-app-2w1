import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BlockData } from '../users-models/dashboard/BlockData';
import { AgeDistributionResponse } from '../users-models/dashboard/age-distribution';
import { ConstructionProgress, OwnersPlotsDistribution, PlotsByBlock, PlotsStats } from '../users-models/dashboard/plots-stats';
import { PlotStateCount } from '../users-models/dashboard/PlotStateCount';
import { PlotTypeCount } from '../users-models/dashboard/PlotTypeCount';
import { environment } from '../../common/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http = inject(HttpClient);
  private readonly urlOwners = environment.services.ownersAndPlots +  '/dashboard';
  private readonly urlUsers = environment.services.usersAndAddresses + '/dashboard';


  // Métodos para el gráfico comparativo de manzanas. Gráfico de barras
  getBlockStats(startDate?: string, endDate?: string): Observable<BlockData[]>{
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    return this.http.get<BlockData[]>(`${this.urlOwners}/blockStats`, { params });
  }

  // Métodos para el gráfico de distribución de edades. Gráfico de Barras
  getAgeDistribution(startDate?: string, endDate?: string): Observable<AgeDistributionResponse> {
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    return this.http.get<AgeDistributionResponse>(`${this.urlUsers}/age-data`, { params });
  }

  // Métodos para el gráfico de distribución de lotes por manzana y propietarios Gráfico de barras
  getPlotsStats(startDate?: string, endDate?: string, plotType?: string, plotStatus?: string): Observable<PlotsStats> {

    const params = this.createParams(startDate, endDate, plotType, plotStatus);
    return this.http.get<PlotsStats>(`${this.urlOwners}/plots-stats`, { params });
  }

  getPlotsByBlock(startDate?: string, endDate?: string): Observable<PlotsByBlock[]> {

    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    return this.http.get<PlotsByBlock[]>(`${this.urlOwners}/plots-by-block`, { params});
  }

  getOwnersPlotsDistribution(startDate?: string, endDate?: string, plotType?: string, plotStatus?: string): Observable<OwnersPlotsDistribution[]> {
    const params = this.createParams(startDate, endDate, plotType, plotStatus);
    return this.http.get<OwnersPlotsDistribution[]>(`${this.urlOwners}/owners-distribution`, {params});
  }

  getConstructionProgress(): Observable<ConstructionProgress> {
    return this.http.get<ConstructionProgress>(`${this.urlOwners}/construction-progress`);
  }

  // Métodos para el gráfico de distribución de lotes por estado. Gráfico de pastel
  getPlotsByState(startDate?: string, endDate?: string, plotType?: number): Observable<PlotStateCount[]> {
    let params = this.createParams(startDate, endDate);
    if (plotType) {
      params = params.append('plotType', plotType);
    }
    return this.http.get<PlotStateCount[]>(`${this.urlOwners}/Plot-By-State-Count`, {params});
  }

  getPlotsByType(startDate?: string, endDate?: string): Observable<PlotTypeCount[]> {
    let params = this.createParams(startDate, endDate);
    return this.http.get<PlotTypeCount[]>(`${this.urlOwners}/Plot-By-Type-Count`, {params});
  }

  // Método para simplificar la creación de parámetros
  createParams(startDate?: string, endDate?: string, plotType?: string, plotStatus?: string) : HttpParams {
    
    let params = new HttpParams();

    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    if (plotType) {
      params = params.append('plotType', plotType);
    }
    if (plotStatus) {
      params = params.append('plotStatus', plotStatus);
    }

    return params;
  }
}
