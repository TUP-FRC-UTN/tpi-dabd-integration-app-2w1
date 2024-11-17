import { UserDTO } from "./UserDTO";

export interface NotificationGeneralDTO {
    users: UserDTO[],
    senderId : number,
    subject: string,
    description: string,
    channel : string,
}