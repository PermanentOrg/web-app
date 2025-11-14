import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Component({
	selector: 'pr-metadata-creation-form',
	templateUrl: './form-create.component.html',
	styleUrls: ['./form-create.component.scss'],
	standalone: false,
})
export class FormCreateComponent implements OnInit, OnDestroy {
	@Input() public placeholder = '';
	@Input() public submitCallback: (t: string) => Promise<void>;
	@Input() public closeWindowEvent: Subject<number>;

	public editing = false;
	public waiting = false;
	public newTagName = '';

	protected closeWindowSub: Subscription;

	ngOnInit(): void {
		this.closeWindowSub = this.closeWindowEvent?.subscribe(() => {
			if (!this.waiting) {
				this.editing = false;
			}
		});
	}

	ngOnDestroy(): void {
		this.closeWindowSub?.unsubscribe();
	}

	public reset(): void {
		if (!this.waiting) {
			this.editing = false;
			this.newTagName = '';
		}
	}

	public async runSubmitCallback() {
		if (this.waiting) {
			return;
		}
		this.waiting = true;
		try {
			await this.submitCallback(this.newTagName);
			this.editing = false;
			this.newTagName = '';
		} catch (c) {
			// Wait for next tick to keep waiting = false in case submit is run multiple times
			await new Promise<void>((resolve) => {
				setTimeout(resolve);
			});
		} finally {
			this.waiting = false;
		}
	}
}
