import { Component, OnInit, Input } from '@angular/core';
import { TagVOData } from '@models/tag-vo';

@Component({
  selector: 'pr-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  @Input() tags: TagVOData[];

  constructor() { }

  ngOnInit(): void {
  }

}
