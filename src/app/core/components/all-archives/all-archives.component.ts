import {
	Component,
	AfterViewInit,
	Optional,
	OnDestroy,
	ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';

import { remove, orderBy, partition } from 'lodash';

import { AccountService } from '@shared/services/account/account.service';
import {
	PromptService,
	PromptButton,
	PromptField,
} from '@shared/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';

import { ArchiveVO, FolderVO } from '@root/app/models';
import { BaseResponse } from '@shared/services/api/base';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { RELATIONSHIP_FIELD } from '@shared/components/prompt/prompt-fields';
import { DataService } from '@shared/services/data/data.service';
import { SidebarActionPortalService } from '@core/services/sidebar-action-portal/sidebar-action-portal.service';
import { CdkPortal } from '@angular/cdk/portal';

@Component({
	selector: 'pr-all-archives',
	templateUrl: './all-archives.component.html',
	styleUrls: ['./all-archives.component.scss'],
	standalone: false,
})
export class AllArchivesComponent implements AfterViewInit, OnDestroy {
	public currentArchive: ArchiveVO;
	public archives: ArchiveVO[];
	public pendingArchives: ArchiveVO[];

	@ViewChild(CdkPortal) sidebarActionPortal: CdkPortal;

	constructor(
		private accountService: AccountService,
		private api: ApiService,
		private data: DataService,
		private prConstants: PrConstantsService,
		private route: ActivatedRoute,
		private prompt: PromptService,
		private message: MessageService,
		private router: Router,
		@Optional() private portalService: SidebarActionPortalService,
	) {
		this.data.setCurrentFolder(
			new FolderVO({
				displayName: 'Archives',
				pathAsText: ['Archives'],
				type: 'page',
			}),
		);
		this.currentArchive = accountService.getArchive();

		const archivesData = this.route.snapshot.data.archives || [];
		const archives = orderBy(
			archivesData.map((archiveData) => new ArchiveVO(archiveData)),
			'fullName',
		);
		const currentArchiveFetched = remove(archives, {
			archiveId: this.currentArchive.archiveId,
		})[0] as ArchiveVO;

		this.currentArchive.update(currentArchiveFetched);
		this.accountService.setArchive(this.currentArchive);

		[this.pendingArchives, this.archives] = partition(
			archives as ArchiveVO[],
			(a) => a.isPending(),
		);
	}

	ngAfterViewInit() {
		if (this.portalService) {
			this.portalService.providePortal(this.sidebarActionPortal);
		}
	}

	ngOnDestroy() {
		if (this.portalService) {
			this.portalService.detachPortal(this.sidebarActionPortal);
		}
	}

	archiveClick(archive: ArchiveVO) {
		const { promise, resolve } = Promise.withResolvers();

		const buttons: PromptButton[] = [
			{
				buttonName: 'switch',
				buttonText: archive.isPending()
					? 'Accept and switch archive'
					: 'Switch archive',
			},
			{
				buttonName: 'cancel',
				buttonText: 'Cancel',
				class: 'btn-secondary',
			},
		];

		let message = `Switch to The ${archive.fullName} Archive?`;

		if (archive.isPending()) {
			message = `You have been invited to collaborate on the ${
				archive.fullName
			} archive. Accept ${this.prConstants.translate(
				archive.accessRole,
			)} access and switch?`;
		}

		this.prompt.promptButtons(buttons, message, promise).then((result) => {
			if (result === 'switch') {
				let acceptIfNeeded: Promise<ArchiveResponse | any> = Promise.resolve();

				if (archive.isPending()) {
					acceptIfNeeded = this.api.archive.accept(archive);
				}

				acceptIfNeeded
					.then(async () => await this.accountService.changeArchive(archive))
					.then(() => {
						resolve(undefined);
						this.router.navigate(['/private']);
					})
					.catch((response: BaseResponse) => {
						resolve(undefined);
						this.message.showError({
							message: response.getMessage(),
							translate: true,
						});
					});
			} else {
				resolve(undefined);
			}
		});
	}

	async switchToArchive(archive: ArchiveVO) {
		try {
			await this.accountService.changeArchive(archive);
			this.router.navigate(['/private']);
		} catch (err) {
			if (err instanceof ArchiveResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			}
		}
	}

	async acceptPendingArchive(archive: ArchiveVO) {
		try {
			await this.api.archive.accept(archive);
			archive.status = 'status.generic.ok';
			remove(this.pendingArchives, archive);
			this.archives.push(archive);
		} catch (err) {
			if (err instanceof ArchiveResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			}
		}
	}

	async declinePendingArchive(archive: ArchiveVO) {
		try {
			await this.api.archive.decline(archive);
			remove(this.pendingArchives, archive);
		} catch (err) {
			if (err instanceof ArchiveResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			}
		}
	}

	onCreateArchiveClick() {
		const { promise, resolve, reject } = Promise.withResolvers();

		const fields: PromptField[] = [
			{
				fieldName: 'fullName',
				placeholder: 'Archive Name',
				config: {
					autocapitalize: 'off',
					autocorrect: 'off',
					autocomplete: 'off',
					spellcheck: 'off',
				},
				validators: [Validators.required],
			},
			{
				fieldName: 'type',
				type: 'select',
				placeholder: 'Archive Type',
				validators: [Validators.required],
				selectOptions: [
					{
						text: 'Person',
						value: 'type.archive.person',
					},
					{
						text: 'Group',
						value: 'type.archive.group',
					},
					{
						text: 'Group',
						value: 'type.archive.family',
					},
					{
						text: 'Organization',
						value: 'type.archive.organization',
					},
				],
			},
			RELATIONSHIP_FIELD,
		];

		this.prompt
			.prompt(fields, 'Create new archive', promise, 'Create archive')
			.then(
				async (value) => await this.api.archive.create(new ArchiveVO(value)),
			)
			.then((response: ArchiveResponse) => {
				const newArchive = response.getArchiveVO();
				this.archives.push(newArchive);
				this.archiveClick(newArchive);
				resolve(undefined);
			})
			.catch((response: ArchiveResponse | BaseResponse) => {
				if (response) {
					this.message.showError({
						message: response.getMessage(),
						translate: true,
					});
					reject();
				}
			});
	}
}
