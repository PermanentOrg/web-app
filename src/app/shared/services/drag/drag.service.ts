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
import { MainComponent } from '@core/components/main/main.component';

export type DragTargetType = 'folder' | 'record';

export interface DraggableComponent {
  onDrop(dropTarget: DragTargetDroppableComponent, dragEvent?: DragServiceEvent);
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
  event: MouseEvent | DragEvent;
  srcComponent: DraggableComponent;
}

export interface DragServiceEnterLeaveEvent {
  type: 'enter' | 'leave';
  event: MouseEvent | DragEvent;
  srcComponent: DragTargetDroppableComponent;
}

export type DragServiceEvent = DragServiceStartEndEvent | DragServiceEnterLeaveEvent;

const DRAG_CURSOR_OFFSET_X = 15;
@Injectable()
export class DragService {
  private subject = new Subject<DragServiceEvent>();

  private dragSrc: DraggableComponent;
  private dropTarget: DragTargetDroppableComponent;

  private hasFiles = false;

  private mouseMoveHandler: (MouseEvent) => any;
  private dropHandler: (DragEvent) => any;
  private dragCursorElement: HTMLElement;
  private actionLabelElement: HTMLElement;
  private itemsLabelElement: HTMLElement;
  private screenOutlineElement: HTMLElement;

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

    this.dropHandler = (event: DragEvent) => {
      event.stopPropagation();
      event.preventDefault();
      this.dispatch({
        type: 'end',
        targetTypes: ['folder'],
        srcComponent: this.dragSrc,
        event: event
      });
      console.log(this);
    };
  }

  dispatch(dragEvent: DragServiceEvent, delay = 0) {
    if (delay) {
      return setTimeout(() => {
        this.dispatch(dragEvent);
      }, delay);
    }

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
    console.log('DISPATCH:', dragEvent);

    if (dragEvent.type === 'end' && (this.dropTarget || this.dragSrc instanceof MainComponent) ) {
      dragEvent.srcComponent.onDrop(this.dropTarget, dragEvent);
      this.dropTarget = null;
    }
  }

  events() {
    return this.subject.asObservable();
  }

  private cancelEvent(e: Event) {
    e.preventDefault();
  }

  private onDragStart(dragEvent: DragServiceStartEndEvent) {
    this.dragSrc = dragEvent.srcComponent;
    this.createDragCursor(dragEvent.event);
    this.updateItemLabelText(dragEvent.event);
    this.document.addEventListener('mousemove', this.mouseMoveHandler);
    this.renderer.addClass(this.document.body, 'dragging');
    this.hasFiles = dragEvent.srcComponent instanceof MainComponent;
    if (this.hasFiles) {
      this.document.addEventListener('drop', this.dropHandler);
      this.document.addEventListener('dragover', this.cancelEvent);
      this.document.addEventListener('dragenter', this.cancelEvent);
      this.createOutline();
    }
  }

  private onDragEnd(dragEvent: DragServiceStartEndEvent) {
    this.document.removeEventListener('mousemove', this.mouseMoveHandler);
    this.destroyDragCursor();
    this.dragSrc = null;
    this.renderer.removeClass(this.document.body, 'dragging');
    if (this.hasFiles) {
      this.document.removeEventListener('drop', this.dropHandler);
      this.document.removeEventListener('dragover', this.cancelEvent);
      this.document.removeEventListener('dragenter', this.cancelEvent);
      this.destroyOutline();
    }
  }

  private onDragEnter(dragEvent: DragServiceEnterLeaveEvent) {
    this.dropTarget = dragEvent.srcComponent;
    this.updateActionLabelText();
  }

  private onDragLeave(dragEvent: DragServiceEnterLeaveEvent) {
    this.dropTarget = null;
    this.updateActionLabelText();
  }

  private createOutline() {
    this.screenOutlineElement = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(this.screenOutlineElement, 'drag-service-screen-outline');
    this.renderer.appendChild(this.document.body, this.screenOutlineElement);
    gsap.from(this.screenOutlineElement, { opacity: 0 , duration: 0.125 });
  }

  private destroyOutline() {
    const outline = this.screenOutlineElement;
    const duration = 1 / 6;
    const destroy = () => {
      this.renderer.removeChild(outline.parentNode, outline);
    };

    gsap.to(outline, { duration, opacity: 0, ease: 'ease', onComplete: destroy });
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
    } else if (this.dragSrc instanceof MainComponent) {
      this.renderer.addClass(this.dragCursorElement, 'for-file-upload');
    }


    gsap.from(this.dragCursorElement, { opacity: 0 , duration: 0.125 });
  }

  private setCursorPosition(event: MouseEvent) {
    if (!(this.dragSrc instanceof MainComponent)) {
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

  private updateItemLabelText(event: DragEvent | MouseEvent) {
    let label = '';
    if (this.dragSrc instanceof FileListItemComponent) {
      const srcItem = this.dragSrc.item;
      const selectedItems = this.dataService.getSelectedItems();
      const srcItemSelected = selectedItems.has(srcItem);
      const multipleItemsSelected = selectedItems.size > 1;

      if (multipleItemsSelected && srcItemSelected) {
        label = `${selectedItems.size} items`;
      } else {
        label = srcItem.displayName;
      }
    } else if (this.dragSrc instanceof MainComponent) {
      label = 'Drop files to upload';
    }

    this.itemsLabelElement.innerText = label;
  }

  private updateActionLabelText() {

    let label = '';
    if (this.dragSrc instanceof FileListItemComponent) {
      if (!this.dropTarget) {
        label = '';
      } else if (this.dropTarget instanceof FileListItemComponent) {
        label = `Move to ${this.dropTarget.item.displayName}`;
      } else if (this.dropTarget instanceof BreadcrumbComponent) {
        label = `Move to ${this.dropTarget.breadcrumb.text}`;
      } else if (this.dropTarget instanceof DragTargetRouterLinkDirective) {
        label = `Move to ${this.dropTarget.linkText}`;
      }
    } else if (this.dragSrc instanceof MainComponent) {
      if (this.dropTarget instanceof MainComponent) {
        label = `Upload to ${this.dataService.currentFolder.displayName}`;
      } else if (this.dropTarget instanceof FileListItemComponent) {
        label = `Upload to ${this.dropTarget.item.displayName}`;
      }
    }
    this.actionLabelElement.innerText = label;
  }
}
