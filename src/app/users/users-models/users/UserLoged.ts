export class UserLoged{
    id: number;
    name: string;
    lastname: string;
    roles: string[];
    plotId: number;
    constructor(){
        this.id = 0;
        this.roles = [];
        this.plotId = 0;
        this.name = '';
        this.lastname = '';
    }
}