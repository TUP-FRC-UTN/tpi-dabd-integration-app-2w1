export class LandingNotification{
    subject: string;
    message: string;
    created_datetime: string;
    userId: number;

    constructor(){
        this.userId = 0
        this.subject = '';
        this.message = '';
        this.created_datetime = '';
    }
}