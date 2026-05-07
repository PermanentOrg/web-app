import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Directive } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
	selector: 'pr-directive-display',
	templateUrl: './directive-display.component.html',
	styleUrls: ['./directive-display.component.scss'],
	standalone: false,
})
export class DirectiveDisplayComponent implements OnInit {
	@Input() public checkLegacyContact: boolean = true;
	@Input() public initialDirectives: Directive[] = [];
	@Output() public loadedDirectives = new EventEmitter<Directive[]>();
	@Output() public beginEdit = new EventEmitter<Directive | null>();
	public archiveName: string;
	public directives: Directive[] = [];
	public error: boolean;
	public noPlan: boolean;

	constructor(
		private account: AccountService,
		private api: ApiService,
		private message: MessageService,
	) {
		this.error = false;
		this.noPlan = false;
	}

	async ngOnInit(): Promise<void> {
		this.directives = this.initialDirectives ?? [];
		this.archiveName = this.account.getArchive().fullName;
		if (this.checkLegacyContact) {
			await this.getLegacyContact();
		}
		await this.getDirectives();
	}

	public get gateAddButton(): boolean {
		return this.error || (this.noPlan && this.directives.length === 0);
	}

	public get showNoPlanWarning(): boolean {
		return this.noPlan && this.directives.length === 0;
	}

	public onCardActivated(
		event: KeyboardEvent | MouseEvent,
		directive: Directive,
	): void {
		event.preventDefault();
		this.beginEdit.emit(directive);
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

	protected async getDirectives(): Promise<void> {
		try {
			const fetchedDirectives = await this.api.directive.get(
				this.account.getArchive(),
			);
			this.directives = (fetchedDirectives ?? []).map((directive) => {
				if (directive?.note) {
					directive.note = directive.note.trim();
				}
				return directive;
			});
		} catch {
			this.error = true;
			this.message.showError({
				message:
					'There was an error loading the Archive Stewards. Please reload the page and try again.',
			});
			return;
		}
		this.loadedDirectives.emit(this.directives);
	}
}
