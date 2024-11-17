import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AccessNewVehicleDto, AccessUserAllowedInfoDto } from '../../models/access-visitors/access-visitors-models';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/access-visitors/interface/access-owner';
import { API_ENDPOINTS } from '../../entries-environment';

@Injectable({
  providedIn: 'root'
})
export class Access_vehicleService {

constructor() { }
private readonly POST_ADD_VEHICLES = API_ENDPOINTS.ADD_VEHICLE;
private readonly PATCH_LOGIC_DOWN = API_ENDPOINTS.LOGIC_DOWN;
private http=inject(HttpClient)

addVehicle(vehicles:AccessNewVehicleDto[],dni:string,documentType:string):Observable<ApiResponse<AccessUserAllowedInfoDto>>{
return this.http.post<ApiResponse<AccessUserAllowedInfoDto>>(`${this.POST_ADD_VEHICLES}/${dni}/${documentType}`,vehicles)
}
logicDown(plate:string,userId:number):Observable<ApiResponse<AccessNewVehicleDto>>{
    return this.http.patch<ApiResponse<AccessNewVehicleDto>>(`${this.PATCH_LOGIC_DOWN}/${plate}/${userId}`,{})
}

}
