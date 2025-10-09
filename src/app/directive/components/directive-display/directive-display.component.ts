import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Directive } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';

@Component({
	selector: 'pr-directive-display',
	templateUrl: './directive-display.component.html',
	styleUrls: ['./directive-display.component.scss'],
	standalone: false,
})
export class DirectiveDisplayComponent implements OnInit {
	@Input() public checkLegacyContact: boolean = true;
	@Input() public initialDirective: Directive;
	@Output() public loadedDirective = new EventEmitter<Directive>();
	@Output() public beginEdit = new EventEmitter<Directive>();
	public archiveName: string;
	public directive: Directive;
	public error: boolean;
	public noPlan: boolean;

	constructor(
		private account: AccountService,
		private api: ApiService,
	) {
		this.error = false;
		this.noPlan = false;
	}

	async ngOnInit(): Promise<void> {
		this.directive = this.initialDirective;
		this.archiveName = this.account.getArchive().fullName;
		if (this.checkLegacyContact) {
			await this.getLegacyContact();
		}
		await this.getDirective();
	}

	protected async getLegacyContact(): Promise<void> {
		try {
			const legacyContact = await this.api.directive.getLegacyContact();
			if (!legacyContact?.name || !legacyContact?.email) {
				this.noPlan = true;
			}
		} catch {
			this.error = true;
		}
	}

	protected async getDirective(): Promise<void> {
		try {
			this.directive = await this.api.directive.get(this.account.getArchive());
		} catch {
			this.error = true;
			return;
		}
		if (this.directive?.note) {
			this.directive.note = this.directive.note.trim();
		}
		this.loadedDirective.emit(this.directive);
	}
}
