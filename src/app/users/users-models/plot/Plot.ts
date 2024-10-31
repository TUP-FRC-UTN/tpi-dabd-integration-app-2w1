export class PlotModel {
    plot_number: number;      
    block_number: number;
    total_area_in_m2: number;        
    built_area_in_m2: number;   
    plot_state_id: number;      
    plot_type_id: number;   
    userCreateId: number;
    files: File[];

    constructor() {
        this.plot_number = 0;
        this.block_number = 0;
        this.total_area_in_m2 = 0;
        this.built_area_in_m2 = 0;
        this.plot_state_id = 0;
        this.plot_type_id = 0;
        this.userCreateId = 0;
        this.files = [];
    }
}