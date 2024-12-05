/* @format */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AccessRole } from '@models/access-role';
import { ArchiveVO } from '@models/index';
import { OnboardingService } from '@root/app/onboarding/services/onboarding.service';

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

  constructor(
    private fb: UntypedFormBuilder,
    private onboardingService: OnboardingService,
  ) {
    this.nameForm = fb.group({
      archiveName: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.nameForm.patchValue({ archiveName: this.name });
  }

  public backToCreate(): void {
    this.backToCreateEmitter.emit('create');
  }

  public createArchive(): void {
    if (this.nameForm.valid) {
      this.archiveCreatedEmitter.emit(this.nameForm.value.archiveName);
      this.onboardingService.registerArchive(
        new ArchiveVO({
          fullName: this.nameForm.value.archiveName,
          accessRole: 'access.role.owner',
        }),
      );
    }
  }
}
