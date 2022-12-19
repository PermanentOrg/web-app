/* @format */
import { Component, OnInit } from '@angular/core';
import { TagsService } from '@core/services/tags/tags.service';
import { ApiService } from '@shared/services/api/api.service';
import { TagVO, TagVOData } from '@models/tag-vo';

@Component({
  selector: 'pr-manage-custom-metadata',
  templateUrl: './manage-custom-metadata.component.html',
  styleUrls: ['./manage-custom-metadata.component.scss'],
})
export class ManageCustomMetadataComponent implements OnInit {
  public categories: string[] = [];
  public activeCategory: string | null = null;
  public values: TagVO[] = [];

  protected tagsList: TagVO[] = [];
  protected tagMap: Map<string, TagVO[]> = new Map<string, TagVO[]>();

  constructor(private api: ApiService, private tag: TagsService) {}

  ngOnInit(): void {
    this.getTagsFromTagService();
    this.reloadTagMap();
  }

  public setActiveCategory(category: string): void {
    this.activeCategory = category;
    this.values = this.tagMap.get(category);
  }

  public async refreshTagsInPlace() {
    await this.tag.refreshTags();
    this.getTagsFromTagService();
    this.tagMap.clear();
    this.reloadTagMap();
    this.setActiveCategory(this.activeCategory);
    console.log(this.values);
  }

  public identifyTag(index: number, item: TagVO): number {
    return item.tagId;
  }

  protected getTagsFromTagService() {
    this.tagsList = this.tag
      .getTags()
      .map((data) => new TagVO(data))
      .filter((tag) => tag.isCustomMetadata());
  }

  protected addTagToTagMap(category: string, tag?: TagVO): void {
    if (this.tagMap.has(category)) {
      if (tag) {
        this.tagMap.get(category).push(tag);
      }
    } else {
      if (tag) {
        this.tagMap.set(category, [tag]);
      } else {
        this.tagMap.set(category, []);
      }
    }
  }

  protected reloadTagMap(): void {
    for (const tag of this.tagsList) {
      if (tag.name.indexOf(':') !== -1) {
        const [category, value] = tag.name.split(':');
        this.addTagToTagMap(category, tag);
      } else {
        this.addTagToTagMap(tag.name);
      }
    }
    this.categories = Array.from(this.tagMap.keys());
  }
}
