export interface Payments {
    id:number;
    subject: string;            
    dateFrom: Date;            
    dateTo: Date;              
    status: string;            
    ownerId: number;           
    message:string
    tableName:string;
    created_datetime:Date;
    amount: number;
    nombre: string;
    apellido: string;
    dni: number;
    markedRead: boolean;
}
