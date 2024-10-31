export class OwnerModel {
    name: string;
    lastname: string;
    dni: string;
    cuitCuil: string;
    dateBirth: Date;
    ownerTypeId: number;
    taxStatusId: number;
    businessName?: string;
    active: boolean;
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string;
    roles: string[];
    userCreateId: number;
    plotId: number;
    telegramId: number;
    files: File[];

    constructor() {
        this.name = '';        
        this.lastname = '';          
        this.dni = '';             
        this.cuitCuil = '';          
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
        this.plotId = 0;
        this.telegramId = 0;
        this.files = [];
    }
}
