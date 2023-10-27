import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PostResponse } from "./util/post-response";
import { CheckResponse } from "./util/check-response";
import { TranslatingFile } from "src/app/util/translating-file";

@Injectable({
    providedIn: 'root'
})
export class DeeplService {
    //#region Attributes

    private _url: string = "/assets/server/";
    public api_key: string = ""; //"769b023e-fc9b-ddea-3834-32dab1bc5027:fx"; `${environment.deepl.api_key}`;
    public compatibility: string[] = [
        "docx", // Microsoft Word Document
        "pptx", // Microsoft PowerPoint Document
        "pdf",  // Portable Document Format
        "htm",  // HTML Document
        "html", // HTML Document
        "txt",  // Plain Text Document
        "xlf",  // XLIFF Document, version 2.1
        "xliff" // XLIFF Document, version 2.1
    ];

    //#endregion

    constructor(private _http: HttpClient){}

    //#region Functions

    public translate(file: TranslatingFile, lang: string): void{
        this._upload(file, lang, (response: PostResponse) => {
            if(!this.checkErrorInMessage(file, response.message)){
                this._checkLoop(response, file, () => {
                    const SPLITTER: string = ".";
                    const SPLITTED_NAME: string[] = file.file.name.split(SPLITTER);
                    SPLITTED_NAME.splice(SPLITTED_NAME.length - 1, 0, "translated." + lang.toLowerCase());
                    file.translatedFileName = SPLITTED_NAME.join(SPLITTER);
                    this._download(file, response);
                });
            }
        });
    }

    /**
     * This function checks the status of the translation.
     */
    private _check(data: PostResponse, callback: Function): void{
        const FORM_DATA = new FormData();
        FORM_DATA.append('api_key', this.api_key);
        FORM_DATA.append('document_id', data.document_id);
        FORM_DATA.append('document_key', data.document_key);
        FORM_DATA.append('free', this.api_key.endsWith(":fx").toString());
        
        this._http.post<any>(
            this._url + '?entity=check',
            FORM_DATA
        ).subscribe(
            (response: CheckResponse) => {
                callback(response);
            }
        );
    }

    private checkErrorInMessage(file: TranslatingFile, message: string): boolean{
        switch(message){
            case "Missing auth_key.":
            case "The auth key is invalid or the auth key is expired":
            case "Value for document_id is not supported.":
            case "Character limit reached":
                file.status = "";
                file.error = true;
                file.message = message;
                return true;
        }
        return false;
    }

    /**
     * This function checks the translation status until it is finished.
     */
    private _checkLoop(response: PostResponse, file: TranslatingFile, callback: Function){
        this._check(response, (response1: CheckResponse) => {
            file.status = response1.status + "...";
            file.status = file.status[0].toUpperCase() + file.status.substr(1);
            if(response1.status){
                switch(response1.status){
                    case "error":
                        file.message = response1.error_message;
                        file.error = true;
                        file.status = "";
                        console.error(response1.error_message);
                        break;
                    case "queued":
                    case "translating":
                        file.message = Math.floor(file.percent) + "%";
                        if(response1.seconds_remaining){
                            file.timeRemaining = file.elapsed + response1.seconds_remaining;
                            file.message += " • " + response1.seconds_remaining + " second left";
                        }
                        setTimeout(() => {
                            this._checkLoop(response, file, callback);
                        }, response1.seconds_remaining ? Math.min(5, response1.seconds_remaining) * 1000 : 1000);
                        break;
                    case "done":
                        file.status = "";
                        file.success = true;
                        callback();
                        break;
                }
            }
            else{
                this.checkErrorInMessage(file, response1.message);
            }
        });
    }

    /**
     * This function sends the file to be translated to the API.
     */
    private _upload(file: TranslatingFile, lang: string, callback: Function): void{
        const FORM_DATA = new FormData();
        FORM_DATA.append('file', file.file);
        FORM_DATA.append('target_lang', lang);
        FORM_DATA.append('api_key', this.api_key);
        FORM_DATA.append('free', this.api_key.endsWith(":fx").toString());

        this._http.post<any>(
            this._url + '?entity=upload',
            FORM_DATA
        ).subscribe({
            next: (response: PostResponse) => {
                callback(response);
            },
            error: (error: any) => {
                file.error = true;
                file.status = "";
                file.message = error.error.message;
                console.error(error);
            }
        });
    }

    public downloadFile(file: Blob, fileName: string): void{
        let url = window.URL.createObjectURL(file);
        let a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
    
    /**
     * This function downloads the file once it is translated.
     */
    private _download(file: TranslatingFile, data: PostResponse): void{
        const FORM_DATA = new FormData();
        FORM_DATA.append('api_key', this.api_key);
        FORM_DATA.append('document_id', data.document_id);
        FORM_DATA.append('document_key', data.document_key);
        FORM_DATA.append('free', this.api_key.endsWith(":fx").toString());

        this._http.post(
            this._url + '?entity=result',
            FORM_DATA,
            {
                responseType: "blob"
            }
            ).subscribe({
                next: (response: Blob) => {
                    file.translatedFile = response;
                    this.downloadFile(response, file.translatedFileName!);
                },
                error: (error: Error) => {
                    file.error = true;
                    file.success = false;
                    file.status = "";
                    file.message = "Character limit reached (Free: Character limit: 500000/month)";
                }
            }
        );
    }

    //#endregion
}