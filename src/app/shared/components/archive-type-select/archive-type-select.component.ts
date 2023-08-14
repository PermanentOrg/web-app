/* format */
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { archiveOptions, archiveDescriptions } from '@root/app/onboarding/shared/onboarding-screen';

@Component({
  selector: 'pr-archive-type-select',
  templateUrl: './archive-type-select.component.html',
  styleUrls: ['./archive-type-select.component.scss'],
})
export class ArchiveTypeSelectComponent {
  @Input() selectedValue: string = '';
  @Output() valueChange = new EventEmitter<string>();

  options = archiveOptions
  descriptions = archiveDescriptions

  icons = {
    'type.archive.person': 'assets/svg/onboarding/archive-person.svg',
    'type.archive.family': 'assets/svg/onboarding/archive-group.svg',
    'type.archive.organization':
      'assets/svg/onboarding/archive-organization.svg',
  };

  altTexts = {
    'type.archive.person': 'Person Archive',
    'type.archive.family': 'Family Archive',
    'type.archive.organization': 'Organization Archive',
  };

  onSelectionChange(): void {
    this.valueChange.emit(this.selectedValue);
  }
}
