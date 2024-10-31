export interface ReportDTO {
    id: number;
    reportState: string;
    plotId: number;
    description: string;
    createdDate: Date;
    baseAmount: number;
}

//*ACA PONGO EL DTO DEL PLOT, ES DECIR, EL PROPIETARIO A DENUNCIAR
export interface plotOwner{
    //*Definir que queremos mostrar y hablar con los de usuarios para que nos habiliten el endpoint 
}
