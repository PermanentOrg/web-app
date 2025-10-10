import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import { map } from 'rxjs/operators';

import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { ApiService } from '@shared/services/api/api.service';

import { ConnectorOverviewVO, FolderVO, SimpleVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { ConnectorResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { ConnectorType } from '@models/connector-overview-vo';
import { GuidedTourService } from '@shared/services/guided-tour/guided-tour.service';
import { ImportFamilyTree } from '@shared/services/guided-tour/tours/familysearch.tour';
import { FamilySearchImportComponent } from '../family-search-import/family-search-import.component';

export enum ConnectorImportType {
	Everything,
	Tagged,
}

export const FAMILYSEARCH_CONNECT_KEY = 'familysearchConnect';

@Component({
	selector: 'pr-connector',
	templateUrl: './connector.component.html',
	styleUrls: ['./connector.component.scss'],
	standalone: false,
})
export class ConnectorComponent implements OnInit {
	@Input() connector: ConnectorOverviewVO;
	@Input() appsFolder: FolderVO;

	public connected: boolean;
	public folder: FolderVO;
	public connectorName: string;

	public waiting: boolean;

	public connectedAccountName: string;

	public connectText: string = null;

	constructor(
		private router: Router,
		private prConstants: PrConstantsService,
		private api: ApiService,
		private account: AccountService,
		private message: MessageService,
		private prompt: PromptService,
		private storage: StorageService,
		private dialog: DialogCdkService,
		private guidedTour: GuidedTourService,
	) {}

	ngOnInit() {
		const type = this.connector.type.split('.').pop();
		this.folder = _.find(this.appsFolder.ChildItemVOs, {
			special: `${type}.root.folder`,
		}) as FolderVO;
		this.connectorName = this.prConstants.translate(this.connector.type);
		this.setStatus();

		this.connectText = 'Sign In with FamilySearch';
	}

	setStatus() {
		this.connected = this.connector.status === 'status.connector.connected';
	}

	getConnectorClass(type: ConnectorType) {
		return 'connector-familysearch';
	}

	async familysearchUploadRequest() {
		this.waiting = true;
		const archive = this.account.getArchive();
		try {
			await this.api.connector.familysearchMemoryUploadRequest(archive);
			this.message.showMessage({
				message:
					'FamilySearch memory upload started in background. This may take a few moments.',
				style: 'success',
			});
		} catch (err) {
			if (err instanceof ConnectorResponse) {
				this.message.showError({ message: err.getMessage() });
			}
		} finally {
			this.waiting = false;
		}
	}

	async familysearchDownloadRequest() {
		this.waiting = true;
		const archive = this.account.getArchive();
		try {
			await this.api.connector.familysearchMemoryImportRequest(archive);
			this.message.showMessage({
				message:
					'FamilySearch memory download started in background. This may take a few moments.',
				style: 'success',
			});
		} catch (err) {
			if (err instanceof ConnectorResponse) {
				this.message.showError({ message: err.getMessage() });
			}
		} finally {
			this.waiting = false;
		}
	}

	async familysearchSyncRequest() {
		this.waiting = true;
		const archive = this.account.getArchive();
		try {
			await this.api.connector.familysearchMemorySyncRequest(archive);
			this.message.showMessage({
				message:
					'FamilySearch sync started in background. This may take a few moments.',
				style: 'success',
			});
		} catch (err) {
			if (err instanceof ConnectorResponse) {
				this.message.showError({ message: err.getMessage() });
			}
		} finally {
			this.waiting = false;
		}
	}

	async startFamilysearchTreeImport() {
		let generationsToImport = 4;

		try {
			const result = await this.prompt.prompt(
				[
					{
						fieldName: 'generations',
						placeholder: 'Number of generations',
						type: 'select',
						initialValue: generationsToImport.toString(),
						selectOptions: [1, 2, 3, 4, 5, 6, 7].map((i) => ({
							text: i,
							value: i.toString(),
						})),
					},
				],
				'How many generations of ancestors would you like to import?',
			);

			generationsToImport = parseInt(result.generations, 10);
		} catch (err) {
			return;
		}

		const data = await this.getFamilysearchTreeData();

		if (!data) {
			return;
		}

		data.treeData = data.treeData.filter(
			(i) =>
				parseInt(i.display.ascendancyNumber, 10) <
				Math.pow(2, generationsToImport + 1),
		);

		try {
			this.dialog.open(FamilySearchImportComponent, { data });
		} catch (err) {}
	}

	async getFamilysearchTreeData() {
		this.waiting = true;

		try {
			const userResponse = await this.api.connector.getFamilysearchTreeUser(
				this.account.getArchive(),
			);
			const userResponseData = userResponse.getResultsData()[0][0];

			const treeResponse = await this.api.connector.getFamilysearchAncestry(
				this.account.getArchive(),
				userResponseData.id,
			);
			this.waiting = false;

			const treeResponseData = treeResponse.getResultsData()[0][0];
			return {
				currentUserData: userResponseData,
				treeData: treeResponseData.persons,
			};
		} catch (response) {
			this.waiting = false;
			this.connector.status = 'status.connector.disconnected';
			this.setStatus();
			this.message.showError(response.getMessage());
		}
	}

	showHelp() {
		let template: string;
		const familySearchHelp = `
    <p>This feature will import memories from persons you select
    in your family tree, then automatically create individual
    archives for each of those persons. You'll find those
    memories saved in the apps section of those person archives.</p>
    `;
		if (this.connected) {
			template = `
          <p>Create separate, private Permanent Archives from your existing FamilySearch family tree data using the <strong>Import Family Tree</strong> option.</p>
          ${familySearchHelp}
          `;
		} else {
			template = `
          <p>Connect to your FamilySearch account with the <strong>Sign In with FamilySearch</strong> option.</p>
          ${familySearchHelp}
          `;
		}

		const done: string = 'Learn More';

		try {
			this.prompt
				.confirm(
					done,
					this.prConstants.translate(this.connector.type),
					null,
					null,
					template,
				)
				.then((val) => {
					window.open(
						'https://desk.zoho.com/portal/permanent/en/kb/articles/import-persons-memories-familysearch',
						'_blank',
					);
				})
				.catch(() => {
					// Do nothing on "Cancel" press, but still catch the promise rejection.
				});
		} catch (err) {}
	}

	goToFolder() {
		if (!this.folder) {
			return;
		}

		this.router.navigate([
			'/apps',
			this.folder.archiveNbr,
			this.folder.folder_linkId,
		]);
	}

	getTooltip() {
		if (!this.folder) {
			return '';
		}

		return 'View imported memories and add new memories to upload';
	}

	async connect() {
		const archive = this.account.getArchive();

		this.waiting = true;

		this.storage.local.set('familysearchConnect', true);
		const connectRequest = this.api.connector.familysearchConnect(archive);

		if (connectRequest) {
			return await connectRequest
				.pipe(
					map((response: ConnectorResponse) => {
						this.waiting = false;
						if (!response.isSuccessful) {
							throw response;
						}

						return response.getSimpleVO();
					}),
				)
				.toPromise()
				.then((result: SimpleVO) => {
					location.assign(result.value);
				})
				.catch((response: ConnectorResponse) => {
					this.message.showError({
						message: response.getMessage(),
						translate: true,
					});
				});
		}
	}

	async disconnect() {
		const archive = this.account.getArchive();

		this.waiting = true;

		const disconnectRequest =
			this.api.connector.familysearchDisconnect(archive);

		if (disconnectRequest) {
			return await disconnectRequest
				.pipe(
					map((response: ConnectorResponse) => {
						this.waiting = false;
						if (!response.isSuccessful) {
							throw response;
						}

						return response.getConnectorOverviewVO();
					}),
				)
				.toPromise()
				.then((connector: ConnectorOverviewVO) => {
					this.connector = connector;
					this.setStatus();
				})
				.catch((response: ConnectorResponse) => {
					this.message.showError({
						message: response.getMessage(),
						translate: true,
					});
				});
		}
	}

	async authorize(code: string) {
		const archive = this.account.getArchive();

		this.waiting = true;

		const connectRequest = this.api.connector.familysearchAuthorize(
			archive,
			code,
		);

		if (connectRequest) {
			try {
				const response = await connectRequest;
				const connector = response.getConnectorOverviewVO();
				this.connector.update(connector);
				this.setStatus();
				this.router.navigate(['/apps'], { queryParams: {} });
				if (
					!this.guidedTour.isStepComplete('familysearch', 'importFamilyTree')
				) {
					this.guidedTour.startTour([
						{
							...ImportFamilyTree,
							when: {
								show: () => {
									this.guidedTour.markStepComplete(
										'familysearch',
										'importFamilyTree',
									);
								},
							},
						},
					]);
				}
			} catch (err) {
				if (err instanceof ConnectorResponse) {
					this.message.showError({
						message: err.getMessage(),
						translate: true,
					});
				}
			}
			this.waiting = false;
		}
	}
}
