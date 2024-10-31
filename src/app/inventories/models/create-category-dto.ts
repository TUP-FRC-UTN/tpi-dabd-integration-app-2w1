export class CreateCategoryDto{
    category: string | undefined;
    createdDatetime: Date | undefined;
    createdUser: number | undefined;
    lastUpdatedDatetime: Date | undefined;
    lastUpdatedUser: number | undefined;

    constructor(
        category?: string,
        createdDatetime?: Date,
        createdUser?: number,
        lastUpdatedDatetime?: Date,
        lastUpdatedUser?: number
    ) {
        this.category = category;
        this.createdDatetime = createdDatetime;
        this.createdUser = createdUser;
        this.lastUpdatedDatetime = lastUpdatedDatetime;
        this.lastUpdatedUser = lastUpdatedUser;
    }
    
}