export class GetPlotDto {
    id: number;
    plot_number: number;      
    block_number: number;
    total_area_in_m2: number;        
    built_area_in_m2: number;   
    plot_state: string;      
    plot_type: string;   

    constructor() {
        this.id = 0;
        this.plot_number = 0;
        this.block_number = 0;
        this.total_area_in_m2 = 0;
        this.built_area_in_m2 = 0;
        this.plot_state = '';
        this.plot_type = '';
    }
}