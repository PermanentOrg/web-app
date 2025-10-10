import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Component({
	selector: 'pr-metadata-form-edit',
	templateUrl: './form-edit.component.html',
	styleUrls: ['./form-edit.component.scss'],
	standalone: false,
})
export class FormEditComponent implements OnInit, OnDestroy {
	public static nextId = 0;

	@Input() public displayName: string;
	@Input() public delete: () => Promise<void>;
	@Input() public save: (newName: string) => Promise<void>;
	@Input() public closeWindowEvent: Subject<number>;

	public menuOpen = false;
	public editing = false;
	public waiting = false;
	public newValueName = '';
	public id: number;

	protected closeWindowSub: Subscription;

	constructor() {
		this.id = FormEditComponent.nextId;
		FormEditComponent.nextId += 1;
	}

	ngOnInit(): void {
		if (this.closeWindowEvent) {
			this.closeWindowSub = this.closeWindowEvent.subscribe((id) => {
				if (this.id !== id) {
					this.menuOpen = false;
					if (!this.waiting) {
						this.editing = false;
					}
				}
			});
		}
	}

	ngOnDestroy(): void {
		this.closeWindowSub?.unsubscribe();
	}

	public openMenu(event: MouseEvent): void {
		if (event.target) {
			event.stopPropagation();
		}
		this.menuOpen = true;
		this.closeWindowEvent?.next(this.id);
	}

	public openEditor(event: MouseEvent): void {
		if (event.target) {
			event.stopPropagation();
		}
		this.newValueName = this.displayName;
		this.editing = true;
		this.menuOpen = false;
	}

	public reset() {
		if (!this.waiting) {
			this.editing = false;
			this.newValueName = '';
		}
	}

	public dismissAllEditors(e: MouseEvent): void {
		this.closeWindowEvent?.next(-1);
	}

	public async saveTag() {
		if (this.waiting) {
			return;
		}
		this.waiting = true;
		try {
			await this.save(this.newValueName);
			this.editing = false;
		} catch {
			// Do nothing
		} finally {
			this.waiting = false;
		}
	}

	public async deleteTag(event: MouseEvent) {
		if (event.target) {
			event.stopPropagation();
		}
		this.menuOpen = false;
		if (this.waiting) {
			return;
		}
		this.waiting = true;
		await this.delete();
		this.waiting = false;
	}
}
