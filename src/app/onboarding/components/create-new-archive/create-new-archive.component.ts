import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ArchiveVO } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';

type NewArchiveScreen = 'type' | 'name';

@Component({
  selector: 'pr-create-new-archive',
  templateUrl: './create-new-archive.component.html',
  styleUrls: ['./create-new-archive.component.scss']
})
export class CreateNewArchiveComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  @Output() createdArchive = new EventEmitter<ArchiveVO>();
  @Output() error = new EventEmitter<string>();
  @Output() progress = new EventEmitter<number>();

  public archiveType: string;
  public archiveName: string = '';
  public screen: NewArchiveScreen = 'type';
  public loading: boolean = false;

  constructor(
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.progress.emit(1);
  }

  public setArchiveType(type: string): void {
    this.archiveType = type;
  }

  public getArchiveTypeClasses(type: string) {
    return {
      'archive-type': true,
      'selected': this.archiveType === type
    };
  }

  public getArchiveNamePlaceholder(): string {
    switch (this.archiveType) {
      case 'type.archive.person':
        return 'Person Name';
      case 'type.archive.family':
        return 'Group Name';
      case 'type.archive.organization':
        return 'Organization Name';
    }
    return 'Name';
  }

  public onBackPress(): void {
    this.progress.emit(0);
    this.back.emit();
  }

  public setScreen(screen: NewArchiveScreen): void {
    this.screen = screen;
    if (screen === 'name') {
      this.progress.emit(2);
    } else {
      this.progress.emit(1);
    }
  }

  public isFormValid(): boolean {
    return this.archiveType !== null && this.archiveName.trim().length > 0;
  }

  public async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.isFormValid()) {
      const form = event.target as HTMLFormElement;
      form.reportValidity();
      return;
    }
    try {
      this.loading = true;
      const archive = new ArchiveVO({
        fullName: this.archiveName,
        type: this.archiveType,
      });
      const response = await this.api.archive.create(archive);
      const createdArchive = response.getArchiveVO();
      this.createdArchive.emit(createdArchive);
    } catch {
      this.loading = false;
      this.error.emit('There was an error creating your new archive. Please try again.');
    }
  }
}
