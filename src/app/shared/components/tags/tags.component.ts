import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { TagVOData } from '@models/tag-vo';
import { orderBy } from 'lodash';

@Component({
  selector: 'pr-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit, OnChanges {
  @Input() tags: TagVOData[];

  private orderedTags: TagVOData[];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    if (!this.tags?.length) {
      this.orderedTags = [];
    } else {
      this.orderedTags = orderBy(this.tags, 'name');
    }
  }

}
