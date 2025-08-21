import {
	Component,
	OnDestroy,
	ViewChildren,
	QueryList,
	AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DataService } from '@shared/services/data/data.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { ConnectorOverviewVO, FolderVO } from '@root/app/models';
import { find } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { HasSubscriptions } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { GuidedTourService } from '@shared/services/guided-tour/guided-tour.service';
import {
	ConnectorComponent,
	FAMILYSEARCH_CONNECT_KEY,
} from '../connector/connector.component';

@Component({
	selector: 'pr-apps',
	templateUrl: './apps.component.html',
	styleUrls: ['./apps.component.scss'],
	standalone: false,
})
export class AppsComponent
	implements AfterViewInit, OnDestroy, HasSubscriptions
{
	appsFolder: FolderVO;
	connectors: ConnectorOverviewVO[];

	@ViewChildren(ConnectorComponent)
	connectorComponents: QueryList<ConnectorComponent>;

	subscriptions: Subscription[] = [];
	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private accountService: AccountService,
		private dataService: DataService,
		private storage: StorageService,
		private guidedTour: GuidedTourService,
	) {
		this.appsFolder = this.route.snapshot.data.appsFolder;
		this.connectors = this.route.snapshot.data.connectors;

		this.dataService.setCurrentFolder(this.appsFolder);

		this.registerArchiveChangeHandlers();
		this.registerRouterEventHandlers();
	}

	registerArchiveChangeHandlers() {
		// register for archive change events to reload the root section
		this.subscriptions.push(
			this.accountService.archiveChange.subscribe(async (archive) => {
				this.router.navigate(['.'], { relativeTo: this.route });
			}),
		);
	}

	registerRouterEventHandlers() {
		// register for navigation events to reinit page on folder changes
		this.subscriptions.push(
			this.router.events
				.pipe(filter((event) => event instanceof NavigationEnd))
				.subscribe((event: NavigationEnd) => {
					if (event.url === '/app/apps') {
						this.appsFolder = this.route.snapshot.data.appsFolder;
						this.connectors = this.route.snapshot.data.connectors;

						this.dataService.setCurrentFolder(this.appsFolder);
					}
				}),
		);
	}

	ngAfterViewInit() {
		const queryParams = this.route.snapshot.queryParams;

		if (queryParams.facebook !== undefined) {
			const connectorComponents = this.connectorComponents.toArray();
			const fbConnectorComponent = find(
				connectorComponents,
				(comp: ConnectorComponent) =>
					comp.connector.type === 'type.connector.facebook',
			);
			fbConnectorComponent.connect();
		}

		if (queryParams.code && this.storage.local.get(FAMILYSEARCH_CONNECT_KEY)) {
			const connectorComponents = this.connectorComponents.toArray();
			const fsConnectorComponent = find(
				connectorComponents,
				(comp: ConnectorComponent) =>
					comp.connector.type === 'type.connector.familysearch',
			);
			setTimeout(() => {
				fsConnectorComponent.authorize(queryParams.code);
			});
		}
	}

	ngOnDestroy() {
		this.dataService.setCurrentFolder();
	}
}
