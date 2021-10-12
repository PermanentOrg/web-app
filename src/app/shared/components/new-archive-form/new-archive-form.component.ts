import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ArchiveVO, ArchiveType } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';
import { RELATION_OPTIONS } from '@shared/services/prompt/prompt.service';

export interface ArchiveFormData {
  fullName: string;
  type: ArchiveType;
  relationType?: string;
}

const ARCHIVE_TYPES: { text: string, value: ArchiveType }[] = [
  {
    text: 'Person',
    value: 'type.archive.person'
  },
  {
    text: 'Family',
    value: 'type.archive.family'
  },
  {
    text: 'Organization',
    value: 'type.archive.organization'
  },
];

@Component({
  selector: 'pr-new-archive-form',
  templateUrl: './new-archive-form.component.html',
  styleUrls: ['./new-archive-form.component.scss']
})
export class NewArchiveFormComponent implements OnInit {
  @Input() showRelations: boolean = false;
  @Output() success = new EventEmitter<ArchiveVO>();
  @Output() error = new EventEmitter();
  @ViewChild('newArchiveName') fullNameRef: ElementRef<HTMLInputElement>;
  public archiveTypes = ARCHIVE_TYPES;
  public relationTypes = RELATION_OPTIONS;
  public waiting: boolean = false;
  public formData: ArchiveFormData;

  constructor(
    private api: ApiService,
  ) {
    this.formData = {
      fullName: '',
      type: null,
      relationType: null,
    };
  }

  ngOnInit(): void {
  }

  public isFormValid() {
    return this.fullNameRef?.nativeElement.validity.valid && this.formData.type !== null;
  }

  public async onSubmit() {
    if (!this.isFormValid()) {
      return;
    }
    try {
      this.waiting = true;
      const response = await this.api.archive.create(new ArchiveVO(this.formData));
      const newArchive = response.getArchiveVO();
      this.success.emit(newArchive);
    } catch (err) {
      this.error.emit(err);
    } finally {
      this.waiting = false;
    }
  }

}
