export interface PutReportDTO {
    id: number,
    userId: number,
    description: string,
    complaintsIds: number[]
}