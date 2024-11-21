export interface SanctionsDTO {
    id: number;
    fineState: string | null;  
    plotId: number;  
    description: string;  
    amount: number | null;  
    createdDate: string;  
    hasSubmittedDisclaimer: boolean;  
    reportId?: number;
}
