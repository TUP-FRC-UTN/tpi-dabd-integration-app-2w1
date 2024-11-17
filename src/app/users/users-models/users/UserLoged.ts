export class UserLoged{
    id: number;
    name: string;
    lastname: string;
    roles: string[];
    plotId: number[];
    constructor(){
        this.id = 0;
        this.roles = [];
        this.plotId = [];
        this.name = '';
        this.lastname = '';
    }
}