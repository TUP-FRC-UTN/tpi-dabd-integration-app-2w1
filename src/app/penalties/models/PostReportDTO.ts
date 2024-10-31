export interface PostReportDTO {
    reportReasonId: number,
    plotId: number,
    description: string,
    complaints: number[],
    userId: number
}