/* @format */
import { Component } from '@angular/core';
import { Directive } from '@models/directive';

type DialogState = 'display' | 'edit';

@Component({
  selector: 'pr-directive-dialog',
  templateUrl: './directive-dialog.component.html',
  styleUrls: ['./directive-dialog.component.scss'],
})
export class DirectiveDialogComponent {
  public mode: DialogState = 'display';
  public directive: Directive;

  public setSavedDirective(directive: Directive): void {
    this.directive = directive;
  }

  public switchToEdit(directive: Directive): void {
    this.setSavedDirective(directive);
    this.mode = 'edit';
  }

  public saveEditedDirective(directive: Directive): void {
    this.setSavedDirective(directive);
    this.mode = 'display';
  }
}
