// cosas front de fede

export interface AccessAuthRange {
  initDate: Date;
  endDate: Date;
  allowedDays: AccessAllowedDay[]; 
  neighbourId:number; 
}
export interface AccessDay {
  name: string;
  value: boolean;
}

export interface AccessVehicleType {
  description: string;
}

export interface QrDto{
  uid:string;
}

export interface AccessAllowedDay {
  day: AccessDay;
  startTime: Date;
  endTime: Date;
  crossesMidnight: boolean;
}

export interface AccessVisitor {
  firstName: string;
  lastName: string;
  document: string;
  documentType:number;
  email: string;
  hasVehicle: boolean;
  vehicle?: AccessVehicle; 
  visitDate?: Date;
  neighborName?:string;
  neighborLastName?:string;
  userType?:number;
}
export interface AccessVehicle {
  licensePlate: string; 
  vehicleType: AccessVehicleType; 
  insurance: string;
}
export interface AccessVisitorRecord {
  visitors: AccessVisitor[];
  authRange: AccessAuthRange | null;
}

export interface AccessDay2 {
  name: string;      
  displayName: string; 
  value: boolean;
}
export interface AccessUser{
  id:number;
  name:string;
  lastname:string;
  username:string;
  email:string;
  dni:number;
  contact_id:number;
  active:boolean;
  avatar_url:string;
  datebirth:string;
  roles:string[];
}

export interface UserType{
  id:number;
  description:string;
}

// FIN cosas front de fede






// CLASES del back necesarias para ciertos METODOS

  // METODOS: registerMovementEntry(NewMovements_EntryDto movementsEntryDto) / registerMoventEntryIfNotExistsInvitation(String documento, LocalDate date, NewMovements_EntryDto movementsEntryDto)
  // CLase necesaria: NewMovements_EntryDto
  export interface AccessNewMovementsEntryDto {
    movementDatetime: Date; // LocalDateTime (EJ: "2024-10-11T04:58:43.536Z")
    observations: string;
    newUserAllowedDto: AccessNewUserAllowedDto; //interface declarada mas abajo
    authRangesDto: AccessNewAuthRangeDto; //interface declarada mas abajo
    vehiclesId: number;
  }

    // todo lo necesario para NewAuthRangeDto
    export interface AccessNewAuthRangeDto {
      neighbor_id: number;
      init_date: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      end_date: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      allowedDaysDtos: AccessAllowedDaysDto[];
    }
    export interface AccessAllowedDaysDto {
      day: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      init_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
      end_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
    }
    // FIN todo lo necesario para NewAuthRangeDto

    // todo lo necesario para NewUserAllowedDto
    export interface AccessNewUserAllowedDto {
      document: string;
      name: string;
      last_name: string;
      documentType: AccessDocumentTypeDto;
      user_allowed_Type: AccessUserAllowedTypeDto;
      vehicle?: AccessNewVehicleDto;
      email: string;
    }

    export interface AccessNewVehicleDto {
      plate: string;
      vehicle_Type: AccessVehicleTypeDto;
      insurance: string;
    }

      // types
      export interface AccessDocumentTypeDto {
        description: string;
      }
      export interface AccessUserAllowedTypeDto {
        description: string;
      }
      export interface AccessVehicleTypeDto {
        description: string;
      }
      //FIN types
    // FIN todo lo necesario para NewUserAllowedDto

    
    //METODO getAllUserAllowedVisitors(@PathVariable String visitor)
    //Clase necesaria (para recibir la data): User_AllowedInfoDto
    export interface AccessUserAllowedInfoDto {
      document: string;
      name: string;
      last_name: string;
      email: string;
      vehicles: AccessNewVehicleDto[]; //List<NewVehicleDto> 
      authRanges: AccessAuthRangeInfoDto[]; //List<AuthRangeInfoDto>
      observations?: string; //campo extra (no esta en el back)
    }

    export interface AccessAuthRangeInfoDto {
      init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      allowedDays: AccessAllowedDaysDto[]; //List<Allowed_DaysDto> 
    }
    //FIN Clase necesaria (para recibir la data): User_AllowedInfoDto
    export interface AccessVisitorEdit {
      firstName: string;
      lastName: string;
      document: string;
      documentType:number;
      email: string;
      hasVehicle: boolean;
      vehicle?: AccessVehicle; 
      authRange: AccessAuthRange;
    }

// FIN CLASES del back necesarias para ciertos METODOS
export interface accessTempRegist {
  visitor: AccessVisitor3
  guard_Id: number
  neighbor_Id: number
}

export interface AccessVisitor3 {
  firstName: string;
  lastName: string;
  document: string;
  documentType:number;
  vehicle?: AccessVehicle2 | null;
  userType?: number;
}
export interface AccessVehicle2 {
  plate: string; 
  vehicle_Type: AccessVehicleType; 
  insurance: string;
}