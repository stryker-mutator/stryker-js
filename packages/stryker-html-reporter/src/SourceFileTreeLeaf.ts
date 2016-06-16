import {SourceFile, MutantResult, MutantStatus} from 'stryker-api/report';
import HandlebarsModel from './HandlebarsModel';
import * as path from 'path';
import * as fs from 'fs';
import * as util from './util';

export default class SourceFileTreeLeaf {
  public name: string;
  public model: HandlebarsModel;
  public filename: string;
  
  constructor(public file: SourceFile, public results: MutantResult[] = []) {
    this.name = path.basename(file.path);
    this.filename = `${this.name}.html`;
  }
  
  public writeFileReport(directory: string){
    fs.writeFileSync(path.join(directory, this.filename), util.sourceFileTemplate(this), 'utf8');    
  }

  public calculateModel(urlPrefix: string) {
    let killed = 0, survived = 0, untested = 0;
    this.results.forEach(mutation => {
      switch (mutation.status) {
        case MutantStatus.KILLED:
        case MutantStatus.TIMEDOUT:
          killed++;
          break;
        case MutantStatus.SURVIVED:
          survived++;
          break;
        case MutantStatus.UNTESTED:
          untested++;
          break;
      }
    });
    this.model = new HandlebarsModel(this.name, urlPrefix, this.filename, killed, survived, untested);
  };
}