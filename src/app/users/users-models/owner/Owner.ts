import { FileDto } from "./FileDto";

export class Owner{

    id: number;
    name: string;
    lastname: string;
    dni: string;
    dni_type: string;
    dateBirth: string;
    businessName: string;
    taxStatus: string;
    active: boolean;
    ownerType: string;
    files: FileDto[];
    create_date: string;
    plot?: number[];
    // files: string[]

    constructor(){
        this.id = 0;
        this.name = "";
        this.lastname = "";
        this.dni = "";
        this.dni_type = "";
        this.dateBirth = "";
        this.businessName = "";
        this.taxStatus = "";
        this.active = true;
        this.ownerType = "";
        this.files = []
        this.create_date = "";
    }
}