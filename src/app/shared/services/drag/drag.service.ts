import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject } from 'rxjs';
import { throttle } from 'lodash';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumbs/breadcrumb.component';
import { DOCUMENT } from '@angular/common';
import { DataService } from '../data/data.service';
import gsap from 'gsap';
import { DeviceService } from '../device/device.service';
import { DragTargetRouterLinkDirective } from '@shared/directives/drag-target-router-link.directive';
import { PromptService } from '@core/services/prompt/prompt.service';

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

const DRAG_CURSOR_OFFSET_X = 15;
@Injectable()
export class DragService {
  private subject = new Subject<DragServiceEvent>();

  private current;
  private dragSrc: DraggableComponent;
  private dropTarget: DragTargetDroppableComponent;

  private mouseMoveHandler: (MouseEvent) => any;
  private dragCursorElement: HTMLElement;
  private actionLabelElement: HTMLElement;
  private itemsLabelElement: HTMLElement;
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private dataService: DataService,
    rendererFactory: RendererFactory2,
    deviceService: DeviceService
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    this.mouseMoveHandler = throttle((event: MouseEvent) => {
      this.setCursorPosition(event);
    }, 8);
  }

  dispatch(dragEvent: DragServiceEvent) {
    switch (dragEvent.type) {
      case 'start':
        this.onDragStart(dragEvent);
        break;
      case 'end':
        this.onDragEnd(dragEvent);
        break;
      case 'enter':
        this.onDragEnter(dragEvent);
        break;
      case 'leave':
        this.onDragLeave(dragEvent);
        break;
    }
    this.subject.next(dragEvent);
    // console.log('DISPATCH:', dragEvent);

    if (dragEvent.type === 'end' && this.dropTarget) {
      dragEvent.srcComponent.onDrop(this.dropTarget);
      this.dropTarget = null;
    }
  }

  events() {
    return this.subject.asObservable();
  }

  private onDragStart(dragEvent: DragServiceStartEndEvent) {
    this.dragSrc = dragEvent.srcComponent;
    this.createDragCursor(dragEvent.event);
    this.updateItemLabelText();
    this.document.addEventListener('mousemove', this.mouseMoveHandler);
    this.renderer.addClass(this.document.body, 'dragging');
  }

  private onDragEnd(dragEvent: DragServiceStartEndEvent) {
    this.document.removeEventListener('mousemove', this.mouseMoveHandler);
    this.destroyDragCursor();
    this.dragSrc = null;
    this.renderer.removeClass(this.document.body, 'dragging');
  }

  private onDragEnter(dragEvent: DragServiceEnterLeaveEvent) {
    this.dropTarget = dragEvent.srcComponent;
    this.updateActionLabelText();
  }

  private onDragLeave(dragEvent: DragServiceEnterLeaveEvent) {
    this.dropTarget = null;
    this.updateActionLabelText();
  }

  private createDragCursor(event: MouseEvent) {
    const parent = this.renderer.createElement('div') as HTMLElement;
    const actionLabel = this.renderer.createElement('div') as HTMLElement;
    const itemLabel = this.renderer.createElement('div') as HTMLElement;

    this.renderer.addClass(parent, 'drag-service-cursor');
    this.renderer.addClass(itemLabel, 'drag-service-cursor-item');
    this.renderer.addClass(actionLabel, 'drag-service-cursor-action');

    this.renderer.appendChild(parent, itemLabel);
    this.renderer.appendChild(parent, actionLabel);
    this.renderer.appendChild(this.document.body, parent);


    this.dragCursorElement = parent;
    this.actionLabelElement = actionLabel;
    this.itemsLabelElement = itemLabel;

    this.setCursorPosition(event);

    if (this.dragSrc instanceof FileListItemComponent) {
      this.renderer.addClass(this.dragCursorElement, 'for-file-list-item');
      const width = (this.dragSrc.element.nativeElement as HTMLElement).clientWidth;
      gsap.from(this.dragCursorElement, { width, opacity: 0 , duration: 0.25 });
    }
  }

  private setCursorPosition(event: MouseEvent) {
    const width = this.dragCursorElement.clientWidth;
    const height = this.dragCursorElement.clientHeight;
    const targetX = event.clientX - (width / 2);
    const targetY = event.clientY - 5;
    this.renderer.setStyle(
      this.dragCursorElement,
      'transform',
      `translate(${targetX}px, ${targetY}px)`
    );
  }

  private destroyDragCursor() {
    const didDrop = !!this.dropTarget;
    const cursor = this.dragCursorElement;
    const destroy = () => {
      this.renderer.removeChild(cursor.parentNode, cursor);
    };

    const duration = 1 / 6;
    if (!didDrop) {
      gsap.to(cursor, { duration, opacity: 0, ease: 'ease', onComplete: destroy });
    } else {
      gsap.to(cursor, { duration, rotate: -5, opacity: 0, scale: 0.5, ease: 'ease', onComplete: destroy});
    }
  }

  private updateItemLabelText() {
    if (this.dragSrc instanceof FileListItemComponent) {
      const srcItem = this.dragSrc.item;
      const selectedItems = this.dataService.getSelectedItems();
      const srcItemSelected = selectedItems.has(srcItem);
      const multipleItemsSelected = selectedItems.size > 1;

      if (multipleItemsSelected && srcItemSelected) {
        this.itemsLabelElement.innerText = `${selectedItems.size} items`;
      } else {
        this.itemsLabelElement.innerText = srcItem.displayName;
      }
    }
  }

  private updateActionLabelText() {
    if (!this.dropTarget) {
      this.actionLabelElement.innerText = '';
      return;
    }
    let label = '';
    if (this.dragSrc instanceof FileListItemComponent) {
      if (this.dropTarget instanceof FileListItemComponent) {
        label = `Move to ${this.dropTarget.item.displayName}`;
      } else if (this.dropTarget instanceof BreadcrumbComponent) {
        label = `Move to ${this.dropTarget.breadcrumb.text}`;
      } else if (this.dropTarget instanceof DragTargetRouterLinkDirective) {
        label = `Move to ${this.dropTarget.linkText}`;
      }
    }
    this.actionLabelElement.innerText = label;
  }
}
