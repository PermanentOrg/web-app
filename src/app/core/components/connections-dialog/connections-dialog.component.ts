import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import {
	PromptService,
	PromptButton,
	RELATIONSHIP_FIELD,
	PromptField,
	RELATIONSHIP_FIELD_INITIAL,
} from '@shared/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { AccountService } from '@shared/services/account/account.service';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { RelationVO, ArchiveVO } from '@models';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { RelationResponse } from '@shared/services/api/index.repo';
import { remove, find } from 'lodash';
import {
	ArchivePickerComponent,
	ArchivePickerComponentConfig,
} from '@shared/components/archive-picker/archive-picker.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { DataService } from '@shared/services/data/data.service';

const ConnectionActions: { [key: string]: PromptButton } = {
	Edit: {
		buttonName: 'edit',
		buttonText: 'Edit',
	},
	Accept: {
		buttonName: 'accept',
		buttonText: 'Accept',
	},
	Decline: {
		buttonName: 'decline',
		buttonText: 'decline',
		class: 'btn-danger',
	},
	Remove: {
		buttonName: 'remove',
		buttonText: 'Remove',
		class: 'btn-danger',
	},
};

export type ConnectionsTab = 'connections' | 'pending' | 'new';

@Component({
	selector: 'pr-connections-dialog',
	templateUrl: './connections-dialog.component.html',
	styleUrls: ['./connections-dialog.component.scss'],
	providers: [DataService],
	standalone: false,
})
export class ConnectionsDialogComponent {
	connections: RelationVO[] = [];
	connectionRequests: RelationVO[] = [];
	sentConnectionsRequests: RelationVO[] = [];

	connectionOptions: FormInputSelectOption[];

	activeTab: ConnectionsTab = 'connections';
	@ViewChild('panel') panelElem: ElementRef;

	constructor(
		private route: ActivatedRoute,
		private api: ApiService,
		private promptService: PromptService,
		private messageService: MessageService,
		private prConstants: PrConstantsService,
		private accountService: AccountService,
		private relationService: RelationshipService,
		private dialog: DialogCdkService,
		@Inject(DIALOG_DATA) public data: any,
		private dialogRef: DialogRef,
	) {
		this.data.connections.forEach((relation: RelationVO) => {
			if (relation.status.includes('ok')) {
				// existing connectionship
				this.connections.push(relation);
			} else if (
				relation.ArchiveVO.archiveId ===
				this.accountService.getArchive().archiveId
			) {
				// sent connectionship request
				this.sentConnectionsRequests.push(relation);
			} else {
				// incoming connectionship request
				this.connectionRequests.push(relation);
			}
		});

		this.connectionOptions = this.prConstants.getRelations().map((type) => ({
			text: type.name,
			value: type.type,
		}));

		if (this.route.snapshot.queryParams.tab) {
			const tab = this.route.snapshot.queryParams.tab as ConnectionsTab;
			switch (tab) {
				case 'new':
				case 'pending':
					this.activeTab = tab;
			}
		}
	}

	onDoneClick(): void {
		this.dialogRef.close();
	}

	setTab(tab: ConnectionsTab): void {
		this.activeTab = tab;
		this.panelElem.nativeElement.scrollTop = 0;
	}

	onConnectionClick(relation: RelationVO) {
		const buttons = [ConnectionActions.Edit, ConnectionActions.Remove];
		this.promptService
			.promptButtons(
				buttons,
				`Relationship with ${relation.RelationArchiveVO.fullName}`,
			)
			.then((value: string) => {
				switch (value) {
					case 'edit':
						this.editRelation(relation);
						break;
					case 'remove':
						this.removeRelation(relation);
						break;
				}
			})
			.catch();
	}

	onSentRelationRequestClick(relation: RelationVO) {
		const buttons = [ConnectionActions.Remove];
		this.promptService
			.promptButtons(
				buttons,
				`Relationship with ${relation.RelationArchiveVO.fullName}`,
			)
			.then((value: string) => {
				switch (value) {
					case 'remove':
						this.removeRelation(relation);
						break;
				}
			})
			.catch();
	}

	onRelationRequestClick(relation: RelationVO, skipDecline = false) {
		const { promise, resolve } = Promise.withResolvers();
		this.promptService
			.prompt(
				[RELATIONSHIP_FIELD],
				`Accept relationship with ${relation.ArchiveVO.fullName}?`,
				promise,
				'Accept',
				skipDecline ? 'Cancel' : 'Decline',
			)
			.then(async (value) => {
				const relationMyVo = new RelationVO({
					type: value.relationType,
				});
				return await this.api.relation
					.accept(relation, relationMyVo)
					.then((response: RelationResponse) => {
						this.messageService.showMessage({
							message: 'Relationship created successfully.',
							style: 'success',
						});
						const newRelation = response.getRelationVO();
						relation.relationId = newRelation.relationId;
						relation.archiveId = newRelation.archiveId;
						relation.relationArchiveId = newRelation.relationArchiveId;
						relation.status = newRelation.status;
						relation.type = newRelation.type;

						const archiveVo = relation.ArchiveVO;
						const relationArchiveVo = relation.RelationArchiveVO;

						relation.ArchiveVO = relationArchiveVo;
						relation.RelationArchiveVO = archiveVo;

						remove(this.connectionRequests, relation);
						this.connections.push(relation);

						resolve(undefined);
					});
			})
			.catch((response: RelationResponse) => {
				if (response) {
					resolve(undefined);
					this.messageService.showError({
						message: response.getMessage(),
						translate: true,
					});
				} else if (!skipDecline) {
					resolve(undefined);
					this.removeRelation(relation);
				}
			});
	}

	async addRelation() {
		const newRelation: RelationVO = new RelationVO({});
		const config: ArchivePickerComponentConfig = {
			hideAccessRoleOnInvite: true,
		};

		return await (
			this.dialog.open(ArchivePickerComponent, {
				data: config,
			}) as unknown as Promise<ArchiveVO>
		)
			.then(async (archive: ArchiveVO) => {
				if (find(this.connections, { relationArchiveId: archive.archiveId })) {
					return this.messageService.showMessage({
						message: 'You already have a relationship with this archive.',
						style: 'info',
					});
				}

				newRelation.relationArchiveId = archive.archiveId;
				newRelation.RelationArchiveVO = archive;
				this.sentConnectionsRequests.push(newRelation);
				return await this.editRelation(newRelation);
			})
			.catch();
	}

	async editRelation(relation: RelationVO) {
		let updatedRelation: RelationVO;
		const isNewRelation = !relation.relationId;
		const { promise, resolve, reject } = Promise.withResolvers();
		const fields: PromptField[] = [RELATIONSHIP_FIELD_INITIAL(relation.type)];

		return await this.promptService
			.prompt(
				fields,
				`Relationship with ${relation.RelationArchiveVO.fullName}`,
				promise,
				'Save',
			)
			.then(async (value) => {
				updatedRelation = new RelationVO({
					relationId: relation.relationId,
					type: value.relationType,
				});

				if (updatedRelation.relationId) {
					return await this.api.relation.update(updatedRelation);
				} else {
					updatedRelation.relationArchiveId = relation.relationArchiveId;
					return await this.api.relation.create(updatedRelation);
				}
			})
			.then((response: RelationResponse) => {
				this.messageService.showMessage({
					message: 'Relationship saved successfully.',
					style: 'success',
				});
				relation.type = updatedRelation.type;
				if (isNewRelation) {
					relation.relationId = response.getRelationVO().relationId;
				}
				resolve(undefined);
			})
			.catch((response: RelationResponse) => {
				if (response) {
					this.messageService.showError({
						message: response.getMessage(),
						translate: true,
					});
					reject();
				} else if (isNewRelation) {
					remove(this.connections, relation);
				}
			});
	}

	async removeRelation(relation: RelationVO) {
		const { promise, resolve } = Promise.withResolvers();
		let confirmTitle = `Remove relationship with ${relation.RelationArchiveVO.fullName}?`;
		let confirmText = 'Remove';

		if (
			relation.RelationArchiveVO.archiveId ===
			this.accountService.getArchive().archiveId
		) {
			confirmTitle = `Decline relationship with ${relation.ArchiveVO.fullName}?`;
			confirmText = 'Decline';
		}

		try {
			await this.promptService.confirm(
				confirmText,
				confirmTitle,
				promise,
				'btn-danger',
			);
			const response = await this.relationService.remove(relation);
			this.messageService.showMessage({
				message: response.getMessage(),
				style: 'success',
				translate: true,
			});
			remove(this.connections, relation);
			remove(this.connectionRequests, relation);
			remove(this.sentConnectionsRequests, relation);
		} catch (err) {
			if (err instanceof RelationResponse) {
				this.messageService.showError({
					message: err.getMessage(),
					translate: true,
				});
			}
		} finally {
			resolve(undefined);
		}
	}
}
