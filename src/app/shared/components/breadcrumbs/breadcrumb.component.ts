import { Component, OnInit, OnDestroy, ViewEncapsulation, Input, HostListener, HostBinding } from '@angular/core';
import { Breadcrumb } from './breadcrumbs.component';
import { DragTargetDroppableComponent, DragServiceEvent, DragService } from '@shared/services/drag/drag.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pr-breadcrumb',
  templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements DragTargetDroppableComponent, OnDestroy {
  @Input() breadcrumb: Breadcrumb;
  @Input() last: boolean;

  @HostBinding('class.drag-target') public isDragTarget = false;
  @HostBinding('class.drop-target') public isDropTarget = false;

  private dragSubscription: Subscription;
  constructor( private drag: DragService ) {
    this.dragSubscription = this.drag.events().subscribe(dragEvent => {
      this.onDragServiceEvent(dragEvent);
    });
  }

  ngOnDestroy() {
    this.dragSubscription.unsubscribe();
  }

  onDragServiceEvent(dragEvent: DragServiceEvent) {
    switch (dragEvent.type) {
      case 'start':
      case 'end':
        if (!this.last && dragEvent.targetTypes.includes('folder')) {
          this.isDragTarget = dragEvent.type === 'start';
          if (!this.isDragTarget) {
            this.isDropTarget = false;
          }
        }
    }
  }

  @HostListener('mouseenter', ['$event'])
  @HostListener('mouseleave', ['$event'])
  onMouseEnterLeave(event: MouseEvent) {
    if (this.isDragTarget) {
      const enter = event.type === 'mouseenter';
      let type;
      if (enter) {
        type = 'enter';
      } else {
        type = 'leave';
      }
      this.drag.dispatch({
        type,
        srcComponent: this,
        event
      });
      this.isDropTarget = enter;
    }
  }
}
