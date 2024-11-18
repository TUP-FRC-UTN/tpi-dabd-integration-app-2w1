import { AccessDocumentTypeDto, VehicleTypeDto } from "../access-visitors/access-VisitorsModels";

export interface AccessNewEmergencyDto {
    people: AccessNewEmergencyPerson[];
    vehicle: AccessNewEmergencyVehicleDto | null;
    observations: String | null;
    loggedUserId: number;
    neighborId: number;
}

export interface AccessNewEmergencyPerson {
    document: {
        type: AccessDocumentTypeDto;
        number: string;
    }
    name: String;
    lastName: String;
}

export interface AccessNewEmergencyVehicleDto {
    plate: string | null;
    vehicle_Type: VehicleTypeDto;
}