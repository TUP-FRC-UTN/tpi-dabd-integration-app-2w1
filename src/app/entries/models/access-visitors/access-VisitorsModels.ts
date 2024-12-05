// CLASES del back necesarias para ciertos METODOS

  // METODOS: registerMovementEntry(NewMovements_EntryDto movementsEntryDto) / registerMoventEntryIfNotExistsInvitation(String documento, LocalDate date, NewMovements_EntryDto movementsEntryDto)
  // CLase necesaria: NewMovements_EntryDto
  export interface AccessNewMovementsEntryDto {
    movementDatetime: Date; // LocalDateTime (EJ: "2024-10-11T04:58:43.536Z")
    observations: string;
    newUserAllowedDto: AccessNewUserAllowedDto; //interface declarada mas abajo
    authRangesDto: AccessNewAuthRangeDto; //interface declarada mas abajo
    vehiclesId: number;
    userId: number;
  }

    // todo lo necesario para NewAuthRangeDto
    export interface AccessNewAuthRangeDto {
      neighbor_id: number; //me lo tiene q pasar el back (Todavia no esta implementado!!)
      init_date: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      end_date: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      allowedDaysDtos: AccessAllowedDaysDto[];
    }
    export interface AccessAllowedDaysDto {
      day: string; // (EJ: "Monday")
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
      vehicle_Type: VehicleTypeDto;
      insurance: string;
    }

      // types
      export interface AccessDocumentTypeDto {
        description: string;
      }
      export interface AccessUserAllowedTypeDto {
        description: string;
      }
      export interface VehicleTypeDto {
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
      userType: AccessUserAllowedTypeDto;
      authRanges: AuthRangeInfoDto[]; //List<AuthRangeInfoDto>
      observations?: string; //campo extra (no esta en el back)

      //ATENCION: documentTypeDto antes se llamaba document_TypeDto 
      // (no se pq pero si tenia _ no me lo leia y tiraba error, ese cambio lo arreglo)
      documentTypeDto: AccessDocumentTypeDto; // tipo de documento q se va a mostrar
      neighbor_id: number; //se necesita para el post del Visitor
    }
    export interface AccessesUpdateAccesDto{
      userAllowedInfoDto:AccessUserAllowedInfoDto1,
      authRangeDto:AccessNewAuthRangeDto
    }
    export interface AccessUserAllowedInfoDto1 {
      
      document: string;
      name: string;
      last_name: string;
      email: string;
      vehicles: AccessNewVehicleDto[]; //List<NewVehicleDto> 
      userType: AccessUserAllowedTypeDto;
      authRanges: AuthRangeInfoDto[];
      documentTypeDto: AccessDocumentTypeDto; // tipo de documento q se va a mostrar
      neighbor_id: number;
    }
    export interface QRData {
      neighborId: number;
      neighborName: string;
      neighborNameLastName: string;
      name: string;
      lastName: string;
      document: string;
      documentType: string;
      vehicleType: string;
      plate: string;
      uid: string;
      init_date: string;
      end_date: string;
      init_hour: string;
      end_hour: string;
      generatedDate: string;
    }
    

    
    export interface AuthRangeInfoDto {
      neighbor_id: number;
      init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      allowedDays: AccessAllowedDaysDto[]; //List<Allowed_DaysDto> 
    }

    //FIN Clase necesaria (para recibir la data): User_AllowedInfoDto

    // METODO: registerMovementExit(NewMovements_ExitDto movementsExitDto)
    // CLase necesaria: NewMovements_ExitDto
    export interface AccessNewMovementExitDto {
      movementDatetime: Date; // LocalDateTime (EJ: "2024-10-11T04:58:43.536Z")
      observations: string;
      newUserAllowedDto: AccessNewUserAllowedDto; //interface declarada mas abajo
      authRangesDto: AccessNewAuthRangeDto; //interface declarada mas abajo
      vehiclesId: number;
    }
    // FIN METODOS: registerMovementExit(NewMovements_ExitDto movementsExitDto)
    // FIN CLase necesaria: NewMovements_ExitDto

    //METODO: getUserAllowedLastExitByDocument(@RequestParam String document)
    //Clase q recibe la info: LastExitUserAllowedDto
    export interface AccessLastExitUserAllowedDto {
      //la data q nos importa
      movementDatetime: number[] | null;
      firstExit: boolean;
  
      //datos del UserAllowed
      userType: AccessUserAllowedTypeDto;
      name: string;
      last_name: string;
      document: string;
      documentType: AccessDocumentTypeDto;
    }
    //FIN METODO: getUserAllowedLastExitByDocument(@RequestParam String document)

    //METODO: getUserAllowedLastEntryByDocument(@RequestParam String document)
    //Clase q recibe la info: LastEntryUserAllowedDto
    export interface AccessLastEntryUserAllowedDto {
      //la data q nos importa
      movementDatetime: number[] | null;
      firstEntry: boolean;
  
      //datos del UserAllowed
      userType: AccessUserAllowedTypeDto;
      name: string;
      last_name: string;
      document: string;
      documentType: AccessDocumentTypeDto;
    }
    //FIN METODO: getUserAllowedLastEntryByDocument(@RequestParam String document)

// FIN CLASES del back necesarias para ciertos METODOS



// cosas front de fede
export interface AccessVehicle {
  type: string;
  plat: string;
}
export interface AccessDay{
  name: string,
  value: boolean
}
export interface AccessDayAllowed {
  day: AccessDay;
  initHour: Date;
  endHour: Date;
  throughMidnight: boolean;
}
export interface AccessVisitor {
  name: string;
  lastName: string;
  document: string;
  phoneNumber: string;
  email: string;
  vehicle?: AccessVehicle;
  hasVehicle: boolean;
  plate?: string;
  vehicleType?:string;
}
export interface AccessRegistryVisitor {
  visitors: AccessVisitor[];
  daysAllowed: AccessDayAllowed[];
}
// FIN cosas front de fede

export type AccessDayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';


export interface AccessApiAllowedDay {
  day: string;
  init_hour: number[];
  end_hour: number[];
}

export interface AccessFormattedHours {
  init_hour: string;
  end_hour: string;
}

export interface AccessUserAllowedInfoDto2 {
  document: string;
  documentType: number;
  name: string;
  last_name: string;
  email: string;
  authId : string ;
  authRange: AccessAuthRangeInfoDto2;
  vehicle: AccessNewVehicleDto2 | null;
  visitorId: number | null;
}
export interface AccessNewVehicleDto2 {
  id: number;
  plate: string;
  vehicle_Type: VehicleTypeDto;
  insurance: string;
}
export interface AccessAuthRangeInfoDto2 {
  init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  allowedDays: AccessApiAllowedDay[]; //List<Allowed_DaysDto> 
  neighbor_id : number;
}
export interface AccessCommonSettings {
  authRange: {
    init_date: Date;
    end_date: Date;
    allowedDays: any[];
  };
}

export interface Owner {
  document: string;
  name: string;
  last_name: string;
  email: string;
  vehicles: AccessNewVehicleDto[]; //List<NewVehicleDto> 
  authRanges: AccessAuthRangeInfoDto2[]; //List<AuthRangeInfoDto>
  documentTypeDto : AccessDocumentTypeDto;
  neighbor_id : number| null;
}

