export class PutOwnerDto {
    name: string;
    lastname: string;
    dni: string;
    cuitCuil: string;
    dateBirth: Date;
    ownerTypeId: number;
    taxStatusId: number;
    businessName?: string;
    phoneNumber: string;
    email: string;
    userUpdateId : number;
    active: boolean;
    files: File[] = [];

    constructor() {
        this.name = '';        
        this.lastname = '';          
        this.dni = '';             
        this.cuitCuil = '';          
        this.dateBirth = new Date();
        this.ownerTypeId = 0;        
        this.taxStatusId = 0;
        this.phoneNumber = '';
        this.email = '';
        this.userUpdateId = 0; 
        this.active = true;
    }
}
