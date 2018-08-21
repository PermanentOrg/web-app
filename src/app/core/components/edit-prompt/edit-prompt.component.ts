import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { PromptService, PromptField } from '@core/services/prompt/prompt.service';

@Component({
  selector: 'pr-edit-prompt',
  templateUrl: './edit-prompt.component.html',
  styleUrls: ['./edit-prompt.component.scss']
})
export class EditPromptComponent implements OnInit {
  @Input() isVisible: boolean;
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public waiting = false;
  public editForm: FormGroup;
  public fields: any[];
  public placeholderText = 'test';

  public saveText = 'OK';
  public cancelText = 'Cancel';

  public donePromise: Promise<any>;
  public doneResolve: Function;
  public doneReject: Function;

  constructor(private service: PromptService, private fb: FormBuilder) {
    this.service.registerComponent(this);
  }

  ngOnInit() {
  }

  hide(event: Event) {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
    event.stopPropagation();
    setTimeout(() => {
      this.reset();
    }, 500);
    return false;
  }

  prompt(form: FormGroup, fields: PromptField[], saveText?: string, cancelText?: string) {
    if (this.editForm || this.donePromise) {
      throw new Error('Prompt in progress');
    }

    if (saveText) {
      this.saveText = saveText;
    }

    if (cancelText) {
      this.cancelText = cancelText;
    }

    this.editForm = form;
    this.fields = fields;
    this.donePromise = new Promise((resolve, reject) => {
      this.doneResolve = resolve;
      this.doneReject = reject;
    });

    this.isVisible = true;

    return this.donePromise;
  }

  save(event: Event) {
    event.stopPropagation();
    this.doneResolve(this.editForm.value);
    this.hide(event);
    return false;
  }

  cancel(event: Event) {
    event.stopPropagation();
    this.doneReject();
    this.hide(event);
    return false;
  }

  reset() {
    this.editForm = null;
    this.fields = null;
    this.donePromise = null;
    this.doneResolve = null;
    this.doneReject = null;
  }
}
