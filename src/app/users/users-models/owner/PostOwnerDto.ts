export class OwnerModel {
    name: string;
    lastname: string;
    dni: string;
    dni_type_id: number;
    dateBirth: Date | null;
    ownerTypeId: number;
    taxStatusId: number;
    businessName?: string;
    active: boolean;
    username: string;
    password: string;
    email: string | null;
    phoneNumber: string | null;
    avatarUrl: string;
    roles: string[];
    userCreateId: number;
    plotId: number[];
    telegramId: number;
    files: File[];

    constructor() {
        this.name = '';        
        this.lastname = '';          
        this.dni = '';             
        this.dni_type_id = 0;          
        this.dateBirth = new Date();
        this.ownerTypeId = 0;        
        this.taxStatusId = 0;   
        this.active = true;        
        this.username = '';       
        this.password = '';     
        this.email = '';          
        this.phoneNumber = '';  
        this.avatarUrl = '';
        this.roles = [];
        this.userCreateId = 0;
        this.plotId = [];
        this.telegramId = 0;
        this.files = [];
    }
}
