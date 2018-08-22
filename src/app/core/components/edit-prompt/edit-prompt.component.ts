import { Component, OnInit, EventEmitter, Input, Output, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { PromptService, PromptField } from '@core/services/prompt/prompt.service';

@Component({
  selector: 'pr-edit-prompt',
  templateUrl: './edit-prompt.component.html',
  styleUrls: ['./edit-prompt.component.scss']
})
export class EditPromptComponent implements OnInit {
  @Input() isVisible: boolean;

  public waiting = false;
  public editForm: FormGroup;
  public fields: any[] = [];
  public placeholderText = 'test';

  public saveText = 'OK';
  public cancelText = 'Cancel';

  public savePromise: Promise<any>;

  public donePromise: Promise<any>;
  public doneResolve: Function;
  public doneReject: Function;

  private defaultForm: FormGroup;

  constructor(private service: PromptService, private fb: FormBuilder, private element: ElementRef) {
    this.service.registerComponent(this);
    this.defaultForm = fb.group({});
    this.editForm = this.defaultForm;
  }

  ngOnInit() {

  }

  hide(event: Event) {
    this.isVisible = false;
    setTimeout(() => {
      this.reset();
    }, 500);
    return false;
  }

  prompt(form: FormGroup, fields: PromptField[], savePromise?: Promise<any>, saveText?: string, cancelText?: string) {
    if (this.donePromise) {
      throw new Error('Prompt in progress');
    }

    this.savePromise = savePromise;

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

    setTimeout(() => {
      const elem = this.element.nativeElement as Element;
      elem.querySelector('input').focus();
    });

    return this.donePromise;
  }

  save(event: Event) {
    event.stopPropagation();
    this.doneResolve(this.editForm.value);
    if (!this.savePromise) {
      this.hide(event);
    } else {
      this.waiting = true;
      this.savePromise
        .then(() => {
          this.waiting = false;
          this.hide(event);
        })
        .catch(() => {
          this.waiting = false;
        });
    }
    return false;
  }

  cancel(event: Event) {
    event.stopPropagation();
    this.hide(event);
    return false;
  }

  reset() {
    this.editForm = this.defaultForm;
    this.fields = null;
    this.donePromise = null;
    this.doneResolve = null;
    this.doneReject = null;
  }
}
