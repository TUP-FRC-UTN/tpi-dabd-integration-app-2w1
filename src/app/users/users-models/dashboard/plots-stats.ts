export class PlotsStats {

    totalPlots: number;
    availablePlots: number;
    constructionPlots: number;
    occupiedPlots: number;
    totalArea: number;
    constructedArea: number;
    constructor() {
        this.totalPlots = 0;
        this.availablePlots = 0;
        this.constructionPlots = 0;
        this.occupiedPlots = 0;
        this.totalArea = 0;
        this.constructedArea = 0;
    }   
}

export class PlotsByBlock {
    blockNumber: number;
    occupied: number;
    available: number;
    inConstruction: number;
    total: number;

    constructor() {
        this.blockNumber = 0;
        this.occupied = 0;
        this.available = 0;
        this.inConstruction = 0;
        this.total = 0;
    }
}

export class OwnersPlotsDistribution {
    ownerName: string;
    plotCount: number;
    totalArea: number;

    constructor() {
        this.ownerName = '';
        this.plotCount = 0;
        this.totalArea = 0;
    }
}

export class ConstructionProgress {
    year: number;
    plotsCount: number;

    constructor() {
        this.year = 0;
        this.plotsCount = 0;
    }
}
