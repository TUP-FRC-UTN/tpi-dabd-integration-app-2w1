export class GetuserDto {
    id: number;
    name: string;
    lastname: string;   
    username: string;   
    password: string;  
    email: string;        
    phone_number: number;
    dni: number;        
    active: boolean;      
    avatar_url: string;   
    datebirth: string;    
    roles: string[];      
    plot_id: number[];
    telegram_id: number;
    create_date: string;
    dni_type: string;

    constructor() {
        this.id = 0;
        this.name = '';
        this.lastname = '';
        this.username = '';
        this.email = '';
        this.dni = 0;
        this.active = true;
        this.avatar_url = '';
        this.datebirth = '';
        this.roles = [];
        this.password = ''; 
        this.phone_number = 0;
        this.plot_id = [];
        this.telegram_id = 0;
        this.dni_type = "";
        this.create_date = '';
        this.dni_type = '';
    }
}
