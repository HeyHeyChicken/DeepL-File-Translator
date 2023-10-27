import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DeeplService } from './service/deepl/deepl';
import { TranslatingFile } from './util/translating-file';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  //#region Attributes

  protected files: TranslatingFile[] = [];
  protected inputID: string = "input_files";
  protected get compatibility(): string {
    return this.deeplService.compatibility.join(", ");
  }
  
  @ViewChild('myInput') myInputFile?: ElementRef;

  //#endregion

  constructor(protected deeplService: DeeplService /*, private _azureService: AzureService */) {
    const SELF = this;
    setInterval(function () {
      SELF.files.forEach(file => {
        file.initDate += 1;
      });
    }, 1000);
  }

  //#region Functions

  ngOnInit(): void {
    const API_KEY: string | null = localStorage.getItem("API_KEY");
    if(API_KEY){
      this.deeplService.api_key = API_KEY;
    }
  }

  protected apiKeyChanged(){
    localStorage.setItem("API_KEY", this.deeplService.api_key);
  }

  protected onFileChange(event: Event): void{
    const INPUT = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = INPUT.files;
    if (fileList) {
      Array.from(fileList).forEach((file: File) => {
        const TRANSLATING_FILE: TranslatingFile = new TranslatingFile("uploading...", "", file);
        this.files.push(TRANSLATING_FILE);
        if(this.myInputFile){
          this.myInputFile.nativeElement.value = "";
        }
        this.deeplService.translate(TRANSLATING_FILE, "EN");
      });
    }
  }

  protected onFileClicked(file: TranslatingFile): void{
    if(file.success){
      this.deeplService.downloadFile(file.translatedFile!, file.translatedFileName!);
    }
  }

  protected dropperClicked(): void{
    document.getElementById(this.inputID)?.click();
  }

  //#endregion
}
