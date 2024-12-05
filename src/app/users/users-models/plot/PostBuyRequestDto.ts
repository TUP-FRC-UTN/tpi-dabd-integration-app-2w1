export class PostBuyRequestDto{
    name: string;
    email: string | null;
    phone: string | null;
    observations: string;
    lot_id: number

    constructor(){
        this.email = '';
        this.phone = '';
        this.observations = '';
        this.name = '';
        this.lot_id = 0;
    }
}