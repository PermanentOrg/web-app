import { Component, OnInit, EventEmitter, Input, Output, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { PromptService, PromptField, PromptButton, PromptConfig } from '@core/services/prompt/prompt.service';

const DEFAULT_SAVE_TEXT = 'OK';
const DEFAULT_CANCEL_TEXT = 'Cancel';

@Component({
  selector: 'pr-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss']
})
export class PromptComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean;

  public waiting = false;
  public editForm: FormGroup;
  public fields: any[] = [];
  public placeholderText = 'test';
  public title: string;

  public editButtons: PromptButton[];

  public saveText = DEFAULT_SAVE_TEXT;
  public cancelText = DEFAULT_CANCEL_TEXT;

  public savePromise: Promise<any>;

  public donePromise: Promise<any>;
  public doneResolve: Function;
  public doneReject: Function;

  private defaultForm: FormGroup;

  private promptQueue: PromptConfig[] = [];

  constructor(private service: PromptService, private fb: FormBuilder, private element: ElementRef) {
    this.service.registerComponent(this);
    this.defaultForm = fb.group({});
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.service.deregisterComponent();
  }

  hide(event: Event) {
    this.isVisible = false;
    setTimeout(() => {
      this.reset();
    }, 500);
    return false;
  }

  prompt(
    form: FormGroup,
    fields: PromptField[],
    title: string,
    savePromise?: Promise<any>,
    saveText?: string,
    cancelText?: string,
    donePromise?: Promise<any>,
    doneResolve?: Function,
    doneReject?: Function
  ) {
    if (this.donePromise) {
      let newDoneReject, newDoneResolve;

      const newDonePromise = new Promise((resolve, reject) => {
        newDoneResolve = resolve;
        newDoneReject = reject;
      });

      this.promptQueue.push({
        form: form,
        fields: fields,
        title: title,
        savePromise: savePromise,
        saveText: saveText,
        cancelText: cancelText,
        donePromise: newDonePromise,
        doneResolve: newDoneResolve,
        doneReject: newDoneReject
      });

      return newDonePromise;
    }

    this.title = title;
    this.savePromise = savePromise;

    this.saveText = saveText || DEFAULT_SAVE_TEXT;
    this.cancelText = cancelText || DEFAULT_CANCEL_TEXT;

    this.editForm = form;
    this.fields = fields;

    if (!donePromise) {
      this.donePromise = new Promise((resolve, reject) => {
        this.doneResolve = resolve;
        this.doneReject = reject;
      });
    } else {
      this.donePromise = donePromise;
      this.doneResolve = doneResolve;
      this.doneReject = doneReject;
    }

    this.isVisible = true;

    setTimeout(() => {
      const elem = this.element.nativeElement as Element;
      const firstInput = elem.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
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
          this.hide(event);
        });
    }
    return false;
  }

  cancel(event: Event) {
    event.stopPropagation();
    this.doneReject();
    this.hide(event);
    return false;
  }

  promptButtons(
    buttons: PromptButton[],
    title: string,
    savePromise?: Promise<any>,
    donePromise?: Promise<any>,
    doneResolve?: Function,
    doneReject?: Function
  ) {
    if (this.donePromise) {
      let newDoneReject, newDoneResolve;

      const newDonePromise = new Promise((resolve, reject) => {
        newDoneResolve = resolve;
        newDoneReject = reject;
      });

      this.promptQueue.push({
        buttons: buttons,
        title: title,
        savePromise: savePromise,
        donePromise: newDonePromise,
        doneResolve: newDoneResolve,
        doneReject: newDoneReject
      });

      return newDonePromise;
    }

    this.editButtons = buttons;
    this.title = title;
    this.savePromise = savePromise;

    if (!donePromise) {
      this.donePromise = new Promise((resolve, reject) => {
        this.doneResolve = resolve;
        this.doneReject = reject;
      });
    } else {
      this.donePromise = donePromise;
      this.doneResolve = doneResolve;
      this.doneReject = doneReject;
    }

    this.isVisible = true;

    return this.donePromise;
  }

  clickButton(button: PromptButton, event: Event) {
    this.doneResolve(button.value || button.buttonName);
    event.stopPropagation();
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

  reset() {
    this.editForm =  null;
    this.editButtons = null;
    this.title = null;
    this.fields = null;
    this.donePromise = null;
    this.doneResolve = null;
    this.doneReject = null;
    this.waiting = false;

    if (this.promptQueue.length) {
      const next = this.promptQueue.shift();
      if (next.fields) {
        this.prompt(
          next.form,
          next.fields,
          next.title,
          next.savePromise,
          next.saveText,
          next.cancelText,
          next.donePromise,
          next.doneResolve,
          next.doneReject
        );
      } else if (next.buttons) {
        this.promptButtons(
          next.buttons,
          next.title,
          next.savePromise,
          next.donePromise,
          next.doneResolve,
          next.doneReject
        );
      }
    }
  }
}
