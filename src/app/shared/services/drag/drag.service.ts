import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumbs/breadcrumb.component';

export type DragTargetType = 'folder' | 'record';

export interface DraggableComponent {
  onDrop(dropTarget: DragTargetDroppableComponent);
}

export interface DragTargetDroppableComponent {
  isDragTarget?: boolean;
  isDropTarget?: boolean;
  onDragServiceEvent(dragEvent: DragServiceEvent);
  onMouseEnterLeave?(event: MouseEvent);
}

export interface DragServiceStartEndEvent {
  type: 'start' | 'end';
  targetTypes: DragTargetType[];
  event: MouseEvent;
  srcComponent: DraggableComponent;
}

export interface DragServiceEnterLeaveEvent {
  type: 'enter' | 'leave';
  event: MouseEvent;
  srcComponent: DragTargetDroppableComponent;
}

export type DragServiceEvent = DragServiceStartEndEvent | DragServiceEnterLeaveEvent;


@Injectable()
export class DragService {
  private subject = new Subject<DragServiceEvent>();

  private currentTarget: DragTargetDroppableComponent;

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
    console.log('DISPATCH:', dragEvent);

    if (dragEvent.type === 'end' && this.currentTarget) {
      dragEvent.srcComponent.onDrop(this.currentTarget);
    }
  }

  events() {
    return this.subject.asObservable();
  }
}
