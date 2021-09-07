import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ArchiveVO, ArchiveType } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';

interface ArchiveFormData {
  fullName: string;
  type: ArchiveType;
  relationType: string;
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
  @Output() success = new EventEmitter<ArchiveVO>();
  @Output() error =  new EventEmitter();
  public form: FormGroup;
  public archiveTypes = ARCHIVE_TYPES;
  public waiting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required]],
      type: [ARCHIVE_TYPES[0].value, [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  public async onSubmit(data: ArchiveFormData) {
    try {
      this.waiting = true;
      const response = await this.api.archive.create(new ArchiveVO(data));
      const newArchive = response.getArchiveVO();
      this.success.emit(newArchive);
    } catch (err) {
      this.error.emit(err);
    } finally {
      this.waiting = false;
    }
  }

}
