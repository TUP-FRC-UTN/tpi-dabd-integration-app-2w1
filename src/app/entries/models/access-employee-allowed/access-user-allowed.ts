export interface AccessNewVehicleDto {
  plate: string;
  vehicle_Type: string;
  insurance : string;
}

export interface AccessSuppEmpDto {
  document: string;
  name: string;
  last_name: string;
  userType: string;
  documentTypeDto: string;
  email: string;
  vehicles: AccessNewVehicleDto[];
  authRanges:AccessAuthRangeInfoDto;
  neighbor_id: 0;
}
export interface AccessAuthRangeInfoDto {
  neighbor_id: number;
  init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  allowedDays: AccessAllowedDaysDto[]; //List<Allowed_DaysDto> 
}
export interface AccessAllowedDaysDto {
  day: string; // (EJ: "Monday")
  init_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
  end_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
}
export interface AccessMovementEntryDto {
  description: string;
  movementDatetime: string; //string reprecenta LocalDateTime
  vehiclesId: number;
  document: string;
}

export interface AccessMovementExitDto {
  description: string;
  movementDatetime: string; //string reprecenta LocalDateTime
  vehiclesId: number;
  document: string;
}