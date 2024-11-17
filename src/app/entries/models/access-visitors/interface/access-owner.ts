import { AccessDocumentTypeDto } from "../access-VisitorsModels";

export interface AccessVehicleOwner {
  plate: string;
  vehicle_Type: VehicleTypeDto;
  insurance: string;
}
export interface AccessDay{
  name: string,
  value: boolean
}
export interface AccessDayAllowedOwner {
  day: AccessDay;
  initHour: Date;
  endHour: Date;
  throughMidnight: boolean;
}
export interface AccessNewMovementsEntryDtoOwner {
  movementDatetime: Date; 
  observations: string;
  newUserAllowedDto: AccessNewUserAllowedDtoOwner; 
  authRangesDto: AccessNewAuthRangeDtoOwner; 
  vehiclesId?: number;
  userId: number;
}
export interface AccessNewAuthRangeDtoOwner {
  neighbor_id: number;
  init_date: Date; 
  end_date: Date;
  allowedDaysDtos: AccessAllowedDaysDtoOwner[] ;
}
export interface AccessDocumentTypeDtoOwner {
  description: string;
}
export interface AccessUserallowedTypeDtoOwner {
  description: string;
}
export interface VehicleTypeDto {
  description: string;
}
export interface AccessUserAllowedInfoDtoOwner {
  document:string,    
  name:string,
  last_name:string,
  email:string,
  vehicles:AccessVehicleOwner[],
  userType:AccessUserallowedTypeDtoOwner,
  authRanges:AccessAuthRangeInfoDtoOwner[],
  documentTypeDto: AccessDocumentTypeDto;
}
export interface AccessAuthRangeInfoDtoOwner {
  neighbor_id: number;
  init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  allowedDays: AccessAllowedDaysDtoOwner[]; //List<Allowed_DaysDto> 
}
export interface AccessAllowedDaysDtoOwner {
  day: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  init_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
  end_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
}
export interface AccessNewUserAllowedDtoOwner {
  document: string;
  name: string;
  last_name: string;
  documentType: AccessDocumentTypeDtoOwner;
  user_allowed_Type: AccessUserallowedTypeDtoOwner;
  vehicle?: AccessVehicleOwner;
  email: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
export interface MovementBodyEmployee{
  movementType: string;
  movementDatetime: string;
  document: string;
  typeUser: string;
}