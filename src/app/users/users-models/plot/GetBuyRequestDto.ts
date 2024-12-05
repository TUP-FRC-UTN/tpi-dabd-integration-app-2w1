export class GetBuyRequestDto{
    id: number;
    name: string;
    email: string;
    phone: string;
    contacted: boolean;
    observations: string;
    plot_id: number;
    plot_number: number;
    block_number: number;
    request_date: Date;

    constructor(){
        this.id = 0;
        this.name = '';
        this.email = '';
        this.phone = '';
        this.contacted = false;
        this.observations = '';
        this.plot_id = 0;
        this.plot_number = 0;
        this.block_number = 0;
        this.request_date = new Date();
    }
}