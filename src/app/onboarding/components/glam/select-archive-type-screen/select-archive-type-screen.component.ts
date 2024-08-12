/* @format */
import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
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
export class SelectArchiveTypeScreenComponent implements OnInit {
  selectedValue = '';
  buttonText = 'a Personal';
  public headerText: string = '';
  @Input() tag: string = '';
  public type: string = '';

  @Output() submitEmitter = new EventEmitter<Record<string, string>>();

  ngOnInit(): void {
    if (this.tag) {
      this.buttonText = generateElementText(
        this.tag,
        archiveOptionsWithArticle,
      );
    }
  }

  public navigate(screen) {
    this.submitEmitter.emit({
      screen,
      type: this.type,
      tag: this.tag,
      headerText: this.headerText,
    });
  }

  public onValueChange(event: string): void {
    this.tag = event;
    this.type = archiveOptions.find((val) => val.type === event).value;
    this.selectedValue = `${this.type}+${event}`;
    this.buttonText = generateElementText(event, archiveOptionsWithArticle);
    this.headerText = generateElementText(event, archiveCreationHeaderText);
  }
}
