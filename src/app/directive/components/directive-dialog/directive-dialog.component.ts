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

  public setSavedDirective(d: Directive): void {
    this.directive = d;
  }

  public switchToEdit(d: Directive): void {
    this.setSavedDirective(d);
    this.mode = 'edit';
  }

  public saveEditedDirective(d: Directive): void {
    this.setSavedDirective(d);
    this.mode = 'display';
  }
}
