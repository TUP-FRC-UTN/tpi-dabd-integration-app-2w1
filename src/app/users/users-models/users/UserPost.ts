export class UserPost {
    name: string;
    lastname: string;   
    username: string;     
    password: string;
    email: string | null;       
    phone_number: string | null;
    dni_type_id : number;
    dni: string;         
    active: boolean;      
    avatar_url: string;   
    datebirth: string | null;    
    roles: string[];  
    userUpdateId: number;
    plot_id?: number;
    telegram_id: number;

    constructor() {
        this.name = '';
        this.lastname = '';
        this.username = '';
        this.email = '';
        this.dni_type_id = 0;
        this.dni = "";
        this.active = true;
        this.avatar_url = '';
        this.datebirth = '';
        this.roles = [];
        this.password = '';
        this.phone_number = '';
        this.userUpdateId = 0;
        this.telegram_id = 0;
        this.plot_id = 0;
    }
}
