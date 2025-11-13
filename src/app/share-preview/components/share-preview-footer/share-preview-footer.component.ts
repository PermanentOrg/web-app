import { transition, trigger, style, animate } from '@angular/animations';
import {
	Component,
	ElementRef,
	Input,
	OnDestroy,
	OnInit,
	Renderer2,
	ViewChild,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
	selector: 'pr-share-preview-footer',
	templateUrl: './share-preview-footer.component.html',
	styleUrls: ['./share-preview-footer.component.scss'],
	animations: [
		trigger('banner', [
			transition(':enter', [
				style({ opacity: 0, transform: 'translateY(100%)' }),
				animate(
					'0.3s ease',
					style({ opacity: 1, transform: 'translateY(0%)' }),
				),
			]),
			transition(':leave', [
				style({ opacity: 1, transform: 'translateY(0%)' }),
				animate(
					'0.3s ease',
					style({ opacity: 0, transform: 'translateY(100%)' }),
				),
			]),
		]),
	],
	standalone: false,
})
export class SharePreviewFooterComponent implements OnInit, OnDestroy {
	@Input() public accountUserName: string;
	@Input() public closeEvent: Observable<void>;
	@ViewChild('element') element: ElementRef;

	public visible: boolean = false;
	public triggered: boolean = false;

	private closeEventSubscription: Subscription;
	private scrollTimeout: number;
	private scrollTimestamp: number;

	constructor(private renderer: Renderer2) {
		this.renderer.listen('window', 'scroll', (e: Event) => {
			if (this.scrollTimeout) {
				window.clearTimeout(this.scrollTimeout);
			}
			if (
				window.scrollY + document.body.clientHeight ===
				document.body.scrollHeight
			) {
				this.show();
			} else {
				this.scrollTimestamp = e.timeStamp;
				window.setTimeout(() => {
					if (this.scrollTimestamp === e.timeStamp) {
						if (!document.querySelector('pr-dialog')) {
							this.show();
						}
					}
				}, 1000);
			}
		});
	}

	ngOnInit(): void {
		this.closeEventSubscription = this.closeEvent.subscribe(() => {
			this.close();
		});

		setTimeout(() => {
			if (document.body.scrollHeight === document.body.clientHeight) {
				this.show();
			}
		}, 1000);
	}

	ngOnDestroy(): void {
		this.closeEventSubscription.unsubscribe();
	}

	public close(): void {
		this.visible = false;
	}

	public show(): void {
		if (!this.triggered) {
			this.visible = true;
			this.triggered = true;
		}
	}
}
