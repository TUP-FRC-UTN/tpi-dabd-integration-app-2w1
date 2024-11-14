export interface Complaint {
    id: number;
    nombre: string
    detalle: string
    tipo:TipoDenuncia
    estado:EstadoDenuncia
    fecha: Date;
}

//(aprobada, ignorada, rechazada, pendiente)
//(incimplimiento daño  infrwaccion de volumen, no manteni miento de limpieza)

export enum EstadoDenuncia {
    Aprobada = 'aprobada',
    Ignorada = 'ignorada',
    Rechazada = 'rechazada',
    Pendiente = 'pendiente'
}

export enum TipoDenuncia {
    IncumplimientoDeVelocidad = 'incumplimiento de velocidad',
    Daño = 'daño',
    InfracciónDeinquilino = 'infracción contra el inquilino',
    NoMantenimientoDeLimpieza = 'no mantenimiento de limpieza'
}



//Aca deberia ser como ComplaintDto lo anterior debe ser llamado desde los services

export interface ComplaintDto {
    id: number;
    userId: number;
    reportId: number | null;
    complaintReason: string;
    anotherReason: string;
    complaintState: string;
    description: string;
    createdDate: Date;
    lastUpdatedDate: Date;
    fileQuantity: number;
}

export interface PutStateComplaintDto{
    id: number,
    userId: number,
    complaintState: String,
    stateReason: String
}
