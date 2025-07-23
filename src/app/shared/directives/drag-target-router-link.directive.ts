import {
	Directive,
	ElementRef,
	Input,
	HostBinding,
	HostListener,
	OnDestroy,
	AfterViewInit,
	Optional,
} from '@angular/core';
import {
	DragService,
	DragTargetDroppableComponent,
	DragServiceEvent,
} from '@shared/services/drag/drag.service';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '@shared/services/data/data.service';

@Directive({
	selector: '[prDragTargetRouterLink]',
	standalone: false,
})
export class DragTargetRouterLinkDirective
	implements DragTargetDroppableComponent, OnDestroy, AfterViewInit
{
	private nativeElement: HTMLElement;
	private dragSubscription: Subscription;

	@HostBinding('class.drag-target') public isDragTarget = false;
	@HostBinding('class.drop-target') public isDropTarget = false;

	@Input() routerLink: string[];
	linkText: string;
	constructor(
		private element: ElementRef,
		@Optional() private drag: DragService,
		private data: DataService,
	) {
		this.nativeElement = this.element.nativeElement;
		if (this.drag) {
			this.dragSubscription = this.drag.events().subscribe((dragEvent) => {
				this.onDragServiceEvent(dragEvent);
			});
		}
	}

	ngAfterViewInit() {
		this.linkText = this.nativeElement.innerText;
	}

	ngOnDestroy() {
		if (this.dragSubscription) {
			this.dragSubscription.unsubscribe();
		}
	}

	onDragServiceEvent(dragEvent: DragServiceEvent) {
		switch (dragEvent.type) {
			case 'start':
			case 'end':
				if (dragEvent.targetTypes.includes('folder')) {
					if (dragEvent.type === 'start') {
						if (this.checkCurrentFolder()) {
							this.isDragTarget = true;
						}
					} else {
						this.isDragTarget = false;
						this.isDropTarget = false;
					}
				}
		}
	}

	checkCurrentFolder() {
		const folder = this.data.currentFolder;

		if (folder.type.includes('apps') || folder.type.includes('share')) {
			return false;
		}

		if (this.routerLink.includes('/private')) {
			if (folder.type.includes('root.private')) {
				return false;
			}
		}

		if (this.routerLink.includes('/public')) {
			if (folder.type.includes('root.public')) {
				return false;
			}
		}

		return true;
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
				event,
			});
			this.isDropTarget = enter;
		}
	}

	getFolderTypeFromLink() {
		if (this.routerLink.includes('/private')) {
			return 'type.folder.root.private';
		} else if (this.routerLink.includes('/public')) {
			return 'type.folder.root.public';
		}
	}
}
