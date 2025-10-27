import {
	Component,
	OnInit,
	ElementRef,
	OnDestroy,
	Input,
	ViewEncapsulation,
	Optional,
	Output,
	EventEmitter,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';
import debug from 'debug';
import { EditService } from '@core/services/edit/edit.service';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';

export class Breadcrumb {
	public id: number;
	public routerPath: string;
	constructor(
		id: number,
		rootUrl: string,
		public text: string,
		public archiveNbr?: string,
		public folder_linkId?: number,
		rootUrlOnly = false,
	) {
		this.id = id;
		if (rootUrlOnly) {
			this.routerPath = rootUrl;
		} else if (!archiveNbr && !folder_linkId) {
			this.routerPath = this.getSpecialRouterPath(text).join('/');
		} else {
			this.routerPath = [rootUrl, archiveNbr, folder_linkId].join('/');
		}
	}

	getSpecialRouterPath(displayText) {
		switch (displayText) {
			case 'My Files':
				return ['/private'];
			case 'Public':
				return ['/public'];
			case 'Apps':
				return ['/apps'];
			case 'Shares':
				return ['/shares'];
			default:
				return ['/'];
		}
	}
}

@Component({
	selector: 'pr-breadcrumbs',
	templateUrl: './breadcrumbs.component.html',
	styleUrls: ['./breadcrumbs.component.scss'],
	encapsulation: ViewEncapsulation.None,
	standalone: false,
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
	public currentFolder: FolderVO;
	public breadcrumbs;

	public showingShareArchives = false;

	@Input() darkText = false;
	@Input() large = false;

	@Output() breadcrumbClicked = new EventEmitter<any>();

	private scrollElement: Element;
	private folderChangeListener: Subscription;

	private debug = debug('component:breadcrumbs');
	constructor(
		private dataService: DataService,
		private elementRef: ElementRef,
		private router: Router,
		private route: ActivatedRoute,
		@Optional() private edit: EditService,
		private shareLinkService: ShareLinksService,
	) {}

	ngOnInit() {
		this.scrollElement =
			this.elementRef.nativeElement.querySelector('.breadcrumbs');
		this.setFolder(this.dataService.currentFolder);
		setTimeout(() => {
			this.scrollToEnd();
		});

		this.folderChangeListener = this.dataService.currentFolderChange.subscribe(
			(folder: FolderVO) => {
				this.setFolder(folder);
				setTimeout(() => {
					this.scrollToEnd();
				}, 0);
			},
		);
	}

	areBreadcrumbsHidden() {
		return !this.dataService.showBreadcrumbs;
	}

	ngOnDestroy() {
		this.folderChangeListener.unsubscribe();
	}

	breadcrumbItemClicked(breadcrumbId: number) {
		this.breadcrumbClicked.emit(breadcrumbId);
	}

	async setFolder(folder) {
		this.currentFolder = folder;
		this.breadcrumbs = [];

		const isInSharePreview =
			this.router.routerState.snapshot.url.includes('/share/');
		const isInShareInvitePreview =
			this.router.routerState.snapshot.url.includes('/share/invite');
		const isInSharePreviewView =
			isInSharePreview &&
			!isInShareInvitePreview &&
			this.router.routerState.snapshot.url.includes('/view');
		const isInSharePreviewInviteView =
			isInShareInvitePreview &&
			this.router.routerState.snapshot.url.includes('/view');
		const isInPublicArchive =
			this.router.routerState.snapshot.url.includes('/p/archive');
		const isInPublic = this.router.routerState.snapshot.url.includes('/p/');
		const isInFolderView =
			this.router.routerState.snapshot.url.includes('/view/');
		const isUnlistedShare = await this.shareLinkService.isUnlistedShare();

		const showRootBreadcrumb =
			!isInPublic &&
			!isInSharePreviewView &&
			!isInSharePreviewInviteView &&
			!isUnlistedShare;

		let rootUrl;

		if (this.router.routerState.snapshot.url.includes('/apps')) {
			rootUrl = '/apps';
		} else if (this.router.routerState.snapshot.url.includes('/shares')) {
			rootUrl = '/shares';
		} else if (isInSharePreviewView) {
			rootUrl = `/share/${this.route.snapshot.params.shareToken}/view`;
		} else if (isInSharePreviewInviteView) {
			rootUrl = `/share/invite/${this.route.snapshot.params.inviteCode}/view`;
		} else if (isInPublicArchive) {
			if (isInFolderView) {
				const folderViewEx = /\/view\/([a-z]*)/;
				const folderViewName = folderViewEx.exec(
					this.router.routerState.snapshot.url,
				)[1];
				rootUrl = `/p/archive/${this.route.snapshot.params.publicArchiveNbr}/view/${folderViewName}`;
			} else {
				rootUrl = `/p/archive/${this.route.snapshot.params.publicArchiveNbr}`;
			}
		} else if (isInPublic) {
			rootUrl = `/p/${this.route.firstChild.snapshot.params.publishUrlToken}`;
		} else if (this.router.routerState.snapshot.url.includes('/public')) {
			rootUrl = '/public';
		} else {
			rootUrl = '/private';
		}

		if (!folder) {
			this.debug('no folder');
			return;
		}

		if (showRootBreadcrumb) {
			this.breadcrumbs.push(new Breadcrumb(0, rootUrl, folder.pathAsText[0]));
			if (this.breadcrumbs[0].routerPath === '/private')
				this.breadcrumbs[0].text = 'Private';
		}

		if (isInPublicArchive) {
			this.breadcrumbs.push(
				new Breadcrumb(0, rootUrl, folder.pathAsText[0], null, null, true),
			);
		}

		for (let i = 1; i < folder.pathAsText.length; i += 1) {
			if ((isInSharePreviewView || isInSharePreviewInviteView) && i < 2) {
				continue;
			}

			this.breadcrumbs.push(
				new Breadcrumb(
					i,
					rootUrl,
					folder.pathAsText[i],
					folder.pathAsArchiveNbr && folder.pathAsArchiveNbr[i],
					folder.pathAsFolder_linkId && folder.pathAsFolder_linkId[i],
					null,
				),
			);
		}

		this.debug('breadcrumbs %o', this.breadcrumbs);
	}

	scrollToEnd() {
		this.scrollElement.scrollLeft =
			this.scrollElement.scrollWidth - this.scrollElement.clientWidth;
	}

	onShareIconClick() {
		if (this.edit) {
			this.edit.openShareDialog(this.dataService.currentFolder);
		}
	}
}
