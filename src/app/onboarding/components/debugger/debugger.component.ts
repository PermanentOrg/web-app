import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OnboardingComponent } from '@onboarding/components/onboarding/onboarding.component';

import { ArchiveVO } from '@models/archive-vo';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';

const PENDING_ARCHIVE_TEST = [
  new ArchiveVO({
    fullName: 'Pending Test #1',
    accessRole: 'access.role.contributor',
    status: 'status.generic.ok',
    thumbStatus: 'status.generic.ok',
    thumbURL200: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    thumbURL500: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    thumbURL1000: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    thumbURL2000: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    type: 'type.archive.person',
  }),
  new ArchiveVO({
    fullName: 'Pending Test #2',
    accessRole: 'access.role.editor',
    status: 'status.generic.ok',
    thumbStatus: 'status.generic.ok',
    thumbURL200: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    thumbURL500: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    thumbURL1000: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    thumbURL2000: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    type: 'type.archive.person',
  }),
  new ArchiveVO({
    fullName: 'Pending Test #3',
    accessRole: 'access.role.manager',
    status: 'status.generic.ok',
    thumbStatus: 'status.generic.ok',
    thumbURL200: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    thumbURL500: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    thumbURL1000: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    thumbURL2000: 'https://www.permanent.org/app/assets/icon/apple-touch-icon.png',
    type: 'type.archive.person',
  }),
]

@Component({
  selector: 'pr-debugger',
  templateUrl: './debugger.component.html',
  styleUrls: ['./debugger.component.scss']
})
export class DebuggerComponent implements OnInit {
  @Input() currentScreen: OnboardingScreen;
  @Output() setState = new EventEmitter<Partial<OnboardingComponent>>();
  public state: Partial<OnboardingComponent> = {
    pendingArchives: [],
  };

  constructor() { }

  ngOnInit(): void {
  }

  public setPendingArchive(active: boolean): void {
    this.state.pendingArchives = active ? PENDING_ARCHIVE_TEST : [];
    this.dispatchState();
  }

  public dispatchState(): void {
    this.setState.emit(this.state);
  }
}
