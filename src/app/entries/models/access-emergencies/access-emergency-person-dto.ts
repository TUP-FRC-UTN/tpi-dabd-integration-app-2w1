import { AccessUserAllowedInfoDto } from "../access-visitors/access-VisitorsModels";


export interface AccessEmergencyPersonDto {
    data: AccessUserAllowedInfoDto;
    state: String;
}