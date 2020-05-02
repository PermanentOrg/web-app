import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject } from 'rxjs';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumbs/breadcrumb.component';
import { DOCUMENT } from '@angular/common';
import { DataService } from '../data/data.service';

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
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    this.mouseMoveHandler = (event: MouseEvent) => {
      this.renderer.setStyle(
        this.dragCursorElement,
        'transform',
        `translate(${event.clientX + DRAG_CURSOR_OFFSET_X}px, ${event.clientY}px)`
      );
      this.renderer.setStyle(this.dragCursorElement, 'opacity', `0.6`);
    };
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
    }
  }

  onDragStart(dragEvent: DragServiceStartEndEvent) {
    this.dragSrc = dragEvent.srcComponent;
    this.createDragCursor();
    this.updateItemLabelText();
    this.document.addEventListener('mousemove', this.mouseMoveHandler);
  }

  onDragEnd(dragEvent: DragServiceStartEndEvent) {
    this.document.removeEventListener('mousemove', this.mouseMoveHandler);
    this.destroyDragCursor();
    this.dragSrc = null;
  }

  onDragEnter(dragEvent: DragServiceEnterLeaveEvent) {
    this.dropTarget = dragEvent.srcComponent;
    this.updateActionLabelText();
  }

  onDragLeave(dragEvent: DragServiceEnterLeaveEvent) {
    this.dropTarget = null;
    this.updateActionLabelText();
  }

  onMouseMove(event: MouseEvent) {

  }

  createDragCursor() {
    const parent = this.renderer.createElement('div');
    const actionLabel = this.renderer.createElement('div');
    const itemLabel = this.renderer.createElement('div');

    this.renderer.addClass(parent, 'drag-service-cursor');
    this.renderer.addClass(itemLabel, 'drag-service-cursor-item');
    this.renderer.addClass(actionLabel, 'drag-service-cursor-action');

    this.renderer.appendChild(parent, itemLabel);
    this.renderer.appendChild(parent, actionLabel);
    this.renderer.appendChild(this.document.body, parent);

    this.dragCursorElement = parent;
    this.actionLabelElement = actionLabel;
    this.itemsLabelElement = itemLabel;
  }

  destroyDragCursor() {
    this.renderer.removeChild(this.dragCursorElement.parentNode, this.dragCursorElement);
  }

  updateDragCursorLabels() {
    if (this.dragSrc) {

    }
  }

  updateItemLabelText() {
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

  updateActionLabelText() {
    if (!this.dropTarget) {
      this.actionLabelElement.innerText = '';
      return;
    }
    if (this.dragSrc instanceof FileListItemComponent) {
      if (this.dropTarget instanceof FileListItemComponent) {
        this.actionLabelElement.innerText = `Move to ${this.dropTarget.item.displayName}`;
      } else if (this.dropTarget instanceof BreadcrumbComponent) {
        this.actionLabelElement.innerText = `Move to ${this.dropTarget.breadcrumb.text}`;
      }
    }
  }

  events() {
    return this.subject.asObservable();
  }
}
