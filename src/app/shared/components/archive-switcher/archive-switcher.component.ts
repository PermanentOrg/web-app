import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { remove, orderBy } from 'lodash';
import { gsap } from 'gsap';

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
import { Router } from '@angular/router';

@Component({
	selector: 'pr-archive-switcher',
	templateUrl: './archive-switcher.component.html',
	styleUrls: ['./archive-switcher.component.scss'],
	standalone: false,
})
export class ArchiveSwitcherComponent implements OnInit, AfterViewInit {
	public currentArchive: ArchiveVO;
	public archives: ArchiveVO[] = [];
	public archivesLoading = true;

	constructor(
		private accountService: AccountService,
		private api: ApiService,
		private data: DataService,
		private prConstants: PrConstantsService,
		private prompt: PromptService,
		private message: MessageService,
		private router: Router,
	) {}

	async ngOnInit() {
		this.data.setCurrentFolder(
			new FolderVO({
				displayName: 'Archives',
				pathAsText: ['Archives'],
				type: 'page',
			}),
		);
		this.currentArchive = this.accountService.getArchive();

		const archivesData = await this.accountService.refreshArchives();
		const archives = orderBy(
			archivesData.map((archiveData) => new ArchiveVO(archiveData)),
			'fullName',
		);
		const currentArchiveFetched = remove(archives, {
			archiveId: this.currentArchive.archiveId,
		})[0] as ArchiveVO;

		this.currentArchive.update(currentArchiveFetched);
		this.accountService.setArchive(this.currentArchive);

		this.archives = archives as ArchiveVO[];
		this.archivesLoading = false;
	}

	ngAfterViewInit() {
		const targetElems = document.querySelectorAll(
			'.archive-list pr-archive-small',
		);
		gsap.from(targetElems, {
			duration: 0.75,
			opacity: 0,
			ease: 'Power4.easeOut',
			stagger: {
				amount: 0.5,
			},
		});
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

	createArchiveClick() {
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
