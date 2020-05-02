import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';

export type DragTargetType = 'folder' | 'record';

export interface DraggableComponent {
  onDrop(dropTarget: DragTargetDroppable);
}
export type DragTargetDroppable = FileListItemComponent;

export interface DragServiceStartEndEvent {
  type: 'start' | 'end';
  targetTypes: DragTargetType[];
  event: MouseEvent;
  srcComponent: DraggableComponent;
}

export interface DragServiceEnterLeaveEvent {
  type: 'enter' | 'leave';
  event: MouseEvent;
  srcComponent: DragTargetDroppable;
}

export type DragServiceEvent = DragServiceStartEndEvent | DragServiceEnterLeaveEvent;


@Injectable()
export class DragService {
  private subject = new Subject<DragServiceEvent>();

  private currentTarget: DragTargetDroppable;

  constructor() { }

  dispatch(dragEvent: DragServiceEvent) {
    switch (dragEvent.type) {
      case 'enter':
        this.currentTarget = dragEvent.srcComponent;
        break;
      case 'leave':
        this.currentTarget = null;
        break;
    }
    this.subject.next(dragEvent);

    if (dragEvent.type === 'end') {
      dragEvent.srcComponent.onDrop(this.currentTarget);
    }
  }

  events() {
    return this.subject.asObservable();
  }
}
