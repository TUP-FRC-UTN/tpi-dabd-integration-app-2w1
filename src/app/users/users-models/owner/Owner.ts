import { FileDto } from "./FileDto";

export class Owner{

    id: number;
    name: string;
    lastname: string;
    dni: string;
    cuitCuil: string;
    dateBirth: string;
    businessName: string;
    taxStatus: string;
    active: boolean;
    ownerType: string;
    files: FileDto[];
    create_date: string;
    // files: string[]

    constructor(){
        this.id = 0;
        this.name = "";
        this.lastname = "";
        this.dni = "";
        this.cuitCuil = "";
        this.dateBirth = "";
        this.businessName = "";
        this.taxStatus = "";
        this.active = true;
        this.ownerType = "";
        this.files = []
        this.create_date = "";
    }
}