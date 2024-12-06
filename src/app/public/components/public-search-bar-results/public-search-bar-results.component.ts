/* @format */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderVO, RecordVO, TagVOData } from '@models/index';

@Component({
  selector: 'pr-public-search-bar-results',
  templateUrl: './public-search-bar-results.component.html',
  styleUrl: './public-search-bar-results.component.scss',
})
export class PublicSearchBarResultsComponent {
  @Input() searchResults: FolderVO[] | RecordVO[] = [];
  @Input() tags: TagVOData[] = [];

  @Output() search = new EventEmitter<void>();
  @Output() tagClickOutput = new EventEmitter<TagVOData[]>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  public viewAllResults(): void {
    this.search.emit();
  }

  public onTagClick(tag: TagVOData): void {
    this.tagClickOutput.emit([tag]);
  }

  public goToFile(item: RecordVO | FolderVO): void {
    if (item.type === 'type.folder.public') {
      this.router.navigate([item.archiveNbr, item.folder_linkId], {
        relativeTo: this.route,
      });
    } else {
      this.router.navigate(['record', item.archiveNbr], {
        relativeTo: this.route,
      });
    }
  }
}
