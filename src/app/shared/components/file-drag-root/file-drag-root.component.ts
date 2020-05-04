import { Component, OnInit, HostListener, Host } from '@angular/core';
import { DraggableComponent, DragServiceEvent, DragTargetDroppableComponent } from '@shared/services/drag/drag.service';

@Component({
  selector: 'pr-file-drag-root',
  template: '',
  styleUrls: ['./file-drag-root.component.scss'],
})
export class FileDragRootComponent implements OnInit, DraggableComponent {
  private isDragging = false;
  constructor(
  ) { }

  ngOnInit(): void {
  }

  @HostListener('dragenter', ['$event'])
  onWindowDragEnter(event: DragEvent) {
    if (!this.isDragging) {
      const files = event.dataTransfer?.files;
      if (files) {
        this.isDragging = true;
        console.log('dragstart!', event);
      }
    }
  }

  @HostListener('drop', ['$event'])
  onWindowDrop(event: DragEvent) {
    if (this.isDragging && event.dataTransfer?.files) {
      console.log('file drop?', event);
    }
  }

  @HostListener('dragleave', ['$event'])
  onWindowDragLeave(event: DragEvent) {
    if (this.isDragging && event.dataTransfer?.files) {
      this.isDragging = false;
      console.log('dragleave!', event);
    }
  }

  onDrop(dropTarget: DragTargetDroppableComponent) {
  }

}
