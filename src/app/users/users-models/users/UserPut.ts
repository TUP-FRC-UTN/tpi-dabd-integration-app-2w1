export class UserPut {
    name: string;
    lastName: string;     
    dni_type_id: number;
    dni: string;   
    phoneNumber: string | null;
    email: string | null;                  
    avatar_url: string;   
    datebirth: string | null;    
    roles: string[];      
    userUpdateId: number;
    telegram_id: number;

    constructor() {
        this.name = '';
        this.lastName = '';
        this.email = '';
        this.dni = '';
        this.avatar_url = '';
        this.datebirth = '';
        this.roles = [];
        this.phoneNumber = '';
        this.userUpdateId= 0;
        this.telegram_id = 0;
        this.dni_type_id = 0;
    }
}
