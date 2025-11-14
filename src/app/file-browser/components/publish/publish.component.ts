import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { RecordVO, FolderVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { find, maxBy } from 'lodash';
import { copyFromInputElement } from '@shared/utilities/forms';
import { PublicLinkPipe } from '@shared/pipes/public-link.pipe';
import { AccountService } from '@shared/services/account/account.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';
import { FolderResponse } from '@shared/services/api/index.repo';
import { PublicRoutePipe } from '@shared/pipes/public-route.pipe';
import { Router } from '@angular/router';
import { PublishIaData } from '@models/publish-ia-vo';
import { EventService } from '@shared/services/event/event.service';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
	selector: 'pr-publish',
	templateUrl: './publish.component.html',
	styleUrls: ['./publish.component.scss'],
	providers: [PublicLinkPipe, PublicRoutePipe],
	standalone: false,
})
export class PublishComponent {
	public sourceItem: RecordVO | FolderVO = null;
	public publicItem: RecordVO | FolderVO = null;

	public publicLink: string = null;
	public publishIa: PublishIaData = null;

	public waiting = false;
	public linkCopied = false;
	public iaLinkCopied = false;
	public isAtleastManager = false;

	@ViewChild('publicLinkInput', { static: false }) publicLinkInput: ElementRef;
	@ViewChild('iaLinkInput', { static: false }) iaLinkInput: ElementRef;

	constructor(
		@Inject(DIALOG_DATA) public data: any,
		private dialogRef: DialogRef,
		private account: AccountService,
		private ga: GoogleAnalyticsService,
		private api: ApiService,
		private messageService: MessageService,
		private accountService: AccountService,
		private router: Router,
		private linkPipe: PublicLinkPipe,
		private routePipe: PublicRoutePipe,
		private event: EventService,
	) {
		this.sourceItem = this.data.item as FolderVO | RecordVO;

		this.isAtleastManager =
			this.getRole().includes('manager') || this.getRole().includes('owner');

		if (this.sourceItem?.folder_linkType?.includes('public')) {
			this.publicItem = this.sourceItem;
			this.publicLink = this.linkPipe.transform(this.publicItem);
			this.checkInternetArchiveLink();
		}
	}

	async publishItem() {
		if (this.sourceItem.type.includes('public')) {
			return;
		}

		this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.initiated.params);

		this.waiting = true;
		try {
			const publicRoot = find(
				this.accountService.getRootFolder().ChildItemVOs,
				{ type: 'type.folder.root.public' },
			) as FolderVO;
			if (this.sourceItem instanceof FolderVO) {
				await this.api.folder.copy([this.sourceItem], publicRoot);
				let tries = 0;
				while (!this.publicItem && tries < 10) {
					tries += 1;
					const publicRootResponse = (await this.api.folder
						.navigateLean(publicRoot)
						.toPromise()) as FolderResponse;
					const publicRootFull = publicRootResponse.getFolderVO(true);
					const publicFolders: FolderVO[] = publicRootFull.ChildItemVOs.filter(
						(i) => i instanceof FolderVO,
					) as FolderVO[];
					const latest = maxBy(publicFolders, (folder) => folder.updatedDT);
					if (latest && latest.displayName === this.sourceItem.displayName) {
						this.publicItem = latest;
					} else {
						await new Promise<void>((r) => {
							setTimeout(() => r(), 1000);
						});
					}
				}

				if (!this.publicItem) {
					this.publicItem = this.sourceItem;
				}
			} else {
				const response = await this.api.record.copy(
					[this.sourceItem],
					publicRoot,
				);
				this.publicItem = response.getRecordVO();
			}
			this.publicLink = this.linkPipe.transform(this.publicItem);

			this.event.dispatch({
				entity: 'record',
				action: 'publish',
			});
		} catch (err) {
			if (err.getMessage) {
				this.messageService.showError(err.getMessage());
			}
		} finally {
			this.waiting = false;
			this.accountService.refreshAccountDebounced();
		}
	}

	copyPublicLink() {
		this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.getLink.params);

		this.event.dispatch({
			entity: 'account',
			action: 'copy_share_link',
		});

		const element = this.publicLinkInput.nativeElement as HTMLInputElement;
		copyFromInputElement(element);

		this.linkCopied = true;
		setTimeout(() => {
			this.linkCopied = false;
		}, 5000);
	}

	copyInternetArchiveLink() {
		const element = this.iaLinkInput.nativeElement as HTMLInputElement;
		copyFromInputElement(element);

		this.iaLinkCopied = true;
		setTimeout(() => {
			this.iaLinkCopied = false;
		}, 5000);
	}

	onViewOnWebClick() {
		this.close();
		this.router.navigate(
			this.routePipe.transform(this.publicItem || this.sourceItem),
		);
	}

	async checkInternetArchiveLink() {
		this.waiting = true;
		try {
			const response = await this.api.publish.getInternetArchiveLink({
				folder_linkId: this.publicItem.folder_linkId,
			});
			this.publishIa = response.getPublishIaVO();
		} catch (err) {
			this.messageService.showError({
				message:
					'There was a problem loading the Internet Archive publish status of this item.',
			});
		}

		this.waiting = false;
	}

	async publishItemToInternetArchive() {
		this.waiting = true;
		try {
			const archive = this.account.getArchive();
			const account = this.account.getAccount();
			const response = await this.api.publish.publishToInternetArchive({
				accountId: account.accountId,
				archiveId: archive.archiveId,
				folder_linkId: this.publicItem.folder_linkId,
			});
			this.publishIa = response.getPublishIaVO();
		} catch (err) {
			this.messageService.showError({
				message:
					'There was a problem publishing this item to the Internet Archive. Please try again later.',
			});
		}

		this.waiting = false;
	}

	close() {
		this.dialogRef.close();
	}

	private getRole(): string {
		return this.accountService.getArchive().accessRole;
	}
}
