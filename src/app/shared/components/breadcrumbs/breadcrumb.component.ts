import {
	Component,
	OnInit,
	OnDestroy,
	Input,
	HostListener,
	HostBinding,
	Optional,
} from '@angular/core';
import {
	DragTargetDroppableComponent,
	DragServiceEvent,
	DragService,
} from '@shared/services/drag/drag.service';
import { Subscription } from 'rxjs';
import debug from 'debug';
import { Breadcrumb } from './breadcrumbs.component';

@Component({
	selector: 'pr-breadcrumb',
	templateUrl: './breadcrumb.component.html',
	standalone: false,
})
export class BreadcrumbComponent
	implements DragTargetDroppableComponent, OnDestroy, OnInit
{
	@Input() breadcrumb: Breadcrumb;
	@Input() last: boolean;

	@HostBinding('class.drag-target') public isDragTarget = false;
	@HostBinding('class.drop-target') public isDropTarget = false;

	private dragSubscription: Subscription;
	private debug = debug('component:breadcrumb');
	constructor(@Optional() private drag: DragService) {
		if (this.drag) {
			this.dragSubscription = this.drag.events().subscribe((dragEvent) => {
				this.onDragServiceEvent(dragEvent);
			});
		}
	}

	ngOnInit() {
		this.debug('created %o', this.breadcrumb);
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
				event,
			});
			this.isDropTarget = enter;
		}
	}
}
