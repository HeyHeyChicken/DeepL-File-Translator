export class TranslatingFile{
    public get percent(): number{
        if(this.timeRemaining > 0){
            return Math.min(100, this.elapsed * 100 / this.timeRemaining);
        }
        return 0;
    }
    public get elapsed(): number{
        return Math.round((new Date().getTime() - this.initDate) / 1000);
    }

    public error: boolean = false;
    public success: boolean = false;
    public initDate: number;
    public translatedFile?: Blob;
    public translatedFileName?: string;

    constructor(public status: string, public message: string, public file: File, public timeRemaining: number = 0){
        this.initDate = new Date().getTime();
    }
}