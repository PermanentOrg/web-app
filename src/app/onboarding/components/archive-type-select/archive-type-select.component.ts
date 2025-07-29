/* @format */
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ArchiveType } from '@models/archive-vo';
import {
  archiveOptions,
  archiveDescriptions,
} from '@root/app/onboarding/shared/onboarding-screen';
import { OnboardingTypes } from '../../shared/onboarding-screen';

@Component({
  selector: 'pr-archive-type-select',
  templateUrl: './archive-type-select.component.html',
  styleUrls: ['./archive-type-select.component.scss'],
  standalone: false,
})
export class ArchiveTypeSelectComponent {
  @Input() selectedValue: string = '';
  @Output() valueChange = new EventEmitter<{
    type: ArchiveType;
    tag: OnboardingTypes;
  }>();

  options = archiveOptions;
  descriptions = archiveDescriptions;

  icons = {
    'type.archive.person': 'assets/svg/onboarding/archive-person.svg',
    'type.archive.group': 'assets/svg/onboarding/archive-group.svg',
    'type.archive.family': 'assets/svg/onboarding/archive-group.svg',
    'type.archive.organization':
      'assets/svg/onboarding/archive-organization.svg',
  };

  altTexts = {
    'type.archive.person': 'Person Archive',
    'type.archive.group': 'Group Archive',
    'type.archive.family': 'Group Archive',
    'type.archive.organization': 'Organization Archive',
  };

  onSelectionChange(): void {
    const type = this.selectedValue.split('+')[0] as ArchiveType;
    const tag = this.selectedValue.split('+')[1] as OnboardingTypes;
    this.valueChange.emit({ type, tag });
  }
}
