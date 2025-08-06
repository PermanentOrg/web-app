import {
	Component,
	OnInit,
	Input,
	ElementRef,
	HostBinding,
} from '@angular/core';
import { NotificationVOData } from '@models/notification-vo';

@Component({
	selector: 'pr-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['./notification.component.scss'],
	standalone: false,
})
export class NotificationComponent implements OnInit {
	@Input() notification: NotificationVOData;
	@HostBinding('class.is-unread') @Input() isUnread: boolean;

	element: HTMLElement;

	showActions = false;

	constructor(private elementRef: ElementRef) {
		this.element = elementRef.nativeElement as HTMLElement;
	}

	ngOnInit(): void {
		this.showActions = this.notification.type === 'type.notification.zip';
	}
}
