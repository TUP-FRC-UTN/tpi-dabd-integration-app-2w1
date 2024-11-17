import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BlockData } from '../users-models/dashboard/BlockData';
import { AgeDistributionResponse } from '../users-models/dashboard/age-distribution';
import { ConstructionProgress, OwnersPlotsDistribution, PlotsByBlock, PlotsStats } from '../users-models/dashboard/plots-stats';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http = inject(HttpClient);
  private readonly urlOwners = 'http://localhost:9062/dashboard';
  private readonly urlUsers = 'http://localhost:9060/dashboard';


  // Método para obtener los datos de los bloques
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
