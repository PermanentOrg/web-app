import { Component, OnInit, Input, OnDestroy, OnChanges, DoCheck } from '@angular/core';
import { TagsService } from '@core/services/tags/tags.service';
import { ItemVO, TagVOData } from '@models';
import { DataService } from '@shared/services/data/data.service';
import { Subject, Subscription } from 'rxjs';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { DataStatus } from '@models/data-status.enum';

@Component({
  selector: 'pr-edit-tags',
  templateUrl: './edit-tags.component.html',
  styleUrls: ['./edit-tags.component.scss']
})
export class EditTagsComponent implements OnInit, DoCheck, OnDestroy, HasSubscriptions {
  @Input() item: ItemVO;
  public allTags: TagVOData[];

  public itemTagsById: Set<number> = new Set();

  public isEditing = false;

  subscriptions: Subscription[] = [];

  private lastDataStatus: DataStatus;
  private lastFolderLinkId: number;

  constructor(
    private tagsService: TagsService,
    private dataService: DataService
  ) {
    this.allTags = tagsService.getTags();

    this.subscriptions.push(
      this.tagsService.getTags$().subscribe(tags => {
        this.allTags = tags;
      })
    );
  }

  async ngOnInit() {
    await this.dataService.fetchFullItems([this.item]);
    this.checkItemTags();
    this.lastDataStatus = this.item?.dataStatus;
    this.lastFolderLinkId = this.item?.folder_linkId;
  }

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
  }

  ngDoCheck() {
    if (this.item?.folder_linkId !== this.lastFolderLinkId) {
      this.endEditing();
      this.checkItemTags();
    } else if (this.item?.dataStatus !== this.lastDataStatus) {
      this.checkItemTags();
    }
  }

  startEditing() {
    this.checkItemTags();
    this.isEditing = true;
  }

  endEditing() {
    this.isEditing = false;
  }

  checkItemTags() {
    this.lastFolderLinkId = this.item?.folder_linkId;
    this.lastDataStatus = this.item?.dataStatus;

    this.itemTagsById.clear();

    if (!this.item.TagVOs?.length) {
      return;
    }

    for (const tag of this.item.TagVOs) {
      this.itemTagsById.add(tag.tagId);
    }
  }

  addTagToItem(tag: TagVOData) {
  }

  removeTagFromItem(tag: TagVOData) {

  }

}
