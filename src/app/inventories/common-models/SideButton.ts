export class SideButton{
    icon : string;
    title : string;
    route? : string;
    roles : string[];
    childButtons? : SideButton[];

    constructor(){
        this.icon = "";
        this.title = "";
        this.route = "";
        this.roles = [];
        this.childButtons = [];
    }
}