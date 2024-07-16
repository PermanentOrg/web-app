/* @format */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'pr-name-archive-screen',
  templateUrl: './name-archive-screen.component.html',
  styleUrl: './name-archive-screen.component.scss',
})
export class NameArchiveScreenComponent implements OnInit {
  public nameForm: UntypedFormGroup;

  @Input() name = '';
  @Output() backToCreateEmitter = new EventEmitter<string>();
  @Output() archiveCreatedEmitter = new EventEmitter<string>();

  constructor(private fb: UntypedFormBuilder) {
    this.nameForm = fb.group({
      name: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.nameForm.patchValue({ name: this.name });
  }

  public backToCreate(): void {
    this.backToCreateEmitter.emit('create');
  }

  public createArchive(): void {
    if (this.nameForm.valid) {
      this.archiveCreatedEmitter.emit(this.nameForm.value.name);
    }
  }
}
