/* @format */
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ArchiveVO } from '@models/index';
import { OnboardingService } from '@root/app/onboarding/services/onboarding.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pr-name-archive-screen',
  templateUrl: './name-archive-screen.component.html',
  styleUrl: './name-archive-screen.component.scss',
})
export class NameArchiveScreenComponent implements OnInit, OnDestroy {
  public nameForm: UntypedFormGroup;

  @Input() name = '';
  @Output() backToCreateEmitter = new EventEmitter<string>();
  @Output() archiveCreatedEmitter = new EventEmitter<string>();
  private nameSubscription: Subscription;

  constructor(
    private fb: UntypedFormBuilder,
    private onboardingService: OnboardingService,
  ) {
    this.nameForm = fb.group({
      archiveName: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const storageName = sessionStorage.getItem('archiveName');
    if (storageName) {
      this.name = storageName;
    }
    this.nameForm.patchValue({ archiveName: this.name });

    this.nameSubscription = this.nameForm
      .get('archiveName')
      .valueChanges.subscribe((value) => {
        sessionStorage.setItem('archiveName', value);
      });
  }

  ngOnDestroy(): void {
    if (this.nameSubscription) {
      this.nameSubscription.unsubscribe();
    }
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
