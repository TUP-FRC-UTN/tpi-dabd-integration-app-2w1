export class AgeDistribution {
    ageRange: string;
    activeCount: number;
    inactiveCount: number;
    activePercentage: number;
    inactivePercentage: number;

    constructor(){
        this.ageRange = '';
        this.activeCount = 0;
        this.inactiveCount = 0;
        this.activePercentage = 0;
        this.inactivePercentage = 0;
    }
}

export class AgeStatics {
    totalUsers: number;
    averageAge: number;
    youngestAge: number;
    oldestAge: number;

    constructor(){
        this.totalUsers = 0;
        this.averageAge = 0;
        this.youngestAge = 0;
        this.oldestAge = 0;
    }
}

export class UserStatusDistribution {
    activeUsers: number;
    inactiveUsers: number;
    activePercentage: number;
    inactivePercentage: number;

    constructor(){
        this.activeUsers = 0;
        this.inactiveUsers = 0;
        this.activePercentage = 0;
        this.inactivePercentage = 0;
    }
  }
export class AgeDistributionResponse {
    ageDistribution: AgeDistribution[];
    statics: AgeStatics;
    userStatusDistribution: UserStatusDistribution;

    constructor(){
        this.ageDistribution = [];
        this.statics = new AgeStatics();
        this.userStatusDistribution = new UserStatusDistribution();
    }
}