import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';

export type DragTargetType = 'folder' | 'record';

export type DragComponent = FileListItemComponent;

export interface DragServiceEvent {
  type: 'start' | 'end';
  targetTypes?: DragTargetType[];
  event: MouseEvent;
  srcComponent: DragComponent;
}

@Injectable()
export class DragService {
  private subject = new Subject<DragServiceEvent>();

  constructor() { }

  dispatch(dragEvent: DragServiceEvent) {
    console.log('dispatch!', dragEvent);
    this.subject.next(dragEvent);
  }

  events() {
    return this.subject.asObservable();
  }
}
