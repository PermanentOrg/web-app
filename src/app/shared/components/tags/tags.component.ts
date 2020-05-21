import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { TagVOData } from '@models/tag-vo';
import { orderBy } from 'lodash';
import { ngIfScaleAnimationDynamic } from '@shared/animations';

@Component({
  selector: 'pr-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
  animations: [ ngIfScaleAnimationDynamic ]
})
export class TagsComponent implements OnInit, OnChanges {
  @Input() tags: TagVOData[];
  @Input() canEdit: boolean;
  @Input() animate = false;

  orderedTags: TagVOData[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    if (!this.tags?.length) {
      this.orderedTags = [];
    } else {
      while (this.orderedTags.length) {
        this.orderedTags.pop();
      }
      const ordered = orderBy(this.tags, 'name');
      for (const i of ordered) {
        this.orderedTags.push(i);
      }
    }
  }

  tagTrackByFn(index, tag: TagVOData) {
    return tag.name;
  }

}
