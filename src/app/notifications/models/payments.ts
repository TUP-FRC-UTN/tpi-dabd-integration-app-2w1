export interface Payments {
    subject: string;            // Asunto del mensaje
    description: string;        // Cuerpo del mensaje que se enviará a Inventory
    date: Date;                // Fecha de envío
    dateFrom: Date;            // Fecha inicial
    dateTo: Date;              // Fecha de finalización
    status: string;            // Estado de la deuda
    ownerId: number;           // ID del propietario
    message:string
    created_datetime:Date;
    amount: number;
    nombre: string;
    apellido: string;
    dni: number;
}
