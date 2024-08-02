/* @format */
import { Component, Output, EventEmitter } from '@angular/core';
import { generateElementText } from '../../../utils/utils';
import {
  archiveOptionsWithArticle,
  archiveCreationHeaderText,
  archiveOptions,
} from '../types/archive-types';

@Component({
  selector: 'pr-select-archive-type-screen',
  templateUrl: './select-archive-type-screen.component.html',
  styleUrl: './select-archive-type-screen.component.scss',
})
export class SelectArchiveTypeScreenComponent {
  selectedValue = '';
  buttonText = '';
  public headerText: string = '';
  public tag: string = '';
  public type: string = '';

  @Output() navigationEmitter = new EventEmitter<string>();
  @Output() submitEmitter = new EventEmitter<Record<string, string>>();

  public navigate(screen) {
    if (screen === 'start') {
      this.navigationEmitter.emit(screen);
    } else {
      this.submitEmitter.emit({
        screen,
        type: this.type,
        tag: this.tag,
        headerText: this.headerText,
      });
    }
  }

  public onValueChange(event: string): void {
    this.tag = event;
    this.type = archiveOptions.find((val) => val.type === event).value;
    this.selectedValue = `${this.type}+${event}`;
    this.buttonText = generateElementText(event, archiveOptionsWithArticle);
    this.headerText = generateElementText(event, archiveCreationHeaderText);
  }
}
