export class Category {
    id: number;
    description: string;
    lastUpdatedDatetime: string;
    state:string;
  
    constructor() {
      this.id = 0;
      this.description = '';
      this.lastUpdatedDatetime = ''
      this.state=''
    }
  }
