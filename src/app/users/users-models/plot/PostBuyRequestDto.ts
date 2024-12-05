export class PostBuyRequestDto{
    name: string;
    email: string | null;
    phone: string | null;
    observations: string;
    plot_id: number

    constructor(){
        this.email = '';
        this.phone = '';
        this.observations = '';
        this.name = '';
        this.plot_id = 0;
    }
}