import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { filter } from 'lodash';
import { ArchiveVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { GuidedTourService } from '@shared/services/guided-tour/guided-tour.service';
import { CreateArchivesComplete } from '@shared/services/guided-tour/tours/familysearch.tour';
import { GuidedTourEvent } from '@shared/services/guided-tour/events';
import { timeout } from '@shared/utilities/timeout';

interface FamilySearchPersonI {
	id: string;
	display: {
		name: string;
		lifespan: string;
		ascendancyNumber: number;
	};
	isSelected?: boolean;
	permExists?: boolean;
}

@Component({
	selector: 'pr-family-search-import',
	templateUrl: './family-search-import.component.html',
	styleUrls: ['./family-search-import.component.scss'],
	standalone: false,
})
export class FamilySearchImportComponent {
	public stage: 'people' | 'memories' | 'importing' = 'people';
	public importMemories = 'yes';
	public familyMembers: FamilySearchPersonI[] = [];
	public currentUser: FamilySearchPersonI;
	public waiting = false;
	public showImportSpinner = true;

	constructor(
		private dialogRef: DialogRef,
		@Inject(DIALOG_DATA) public data: any,
		private api: ApiService,
		private message: MessageService,
		private guidedTour: GuidedTourService,
	) {
		this.currentUser = data.currentUserData;
		this.familyMembers = filter(
			data.treeData,
			(person) => person.id !== this.currentUser.id,
		);
	}

	cancel() {
		this.dialogRef.close();
	}

	async startImport() {
		const selected = this.familyMembers.filter((person) => person.isSelected);
		if (!selected.length) {
			return this.cancel();
		}

		this.stage = 'importing';
		const archivesToCreate = selected.map(
			(person) =>
				new ArchiveVO({
					fullName: person.display.name,
					type: 'type.archive.person',
					relationType: this.getRelationshipFromAncestryNumber(
						person.display.ascendancyNumber,
					),
				}),
		);

		this.waiting = true;

		const total = archivesToCreate.length;

		this.message.showMessage({
			message: `Starting archive import for ${total} person(s). Do not close this window or refresh your browser.`,
			style: 'info',
		});

		this.showImportSpinner = true;
		try {
			const response = await this.api.archive.create(archivesToCreate);

			const newArchives = response.getArchiveVOs();
			const personIds = [];
			for (let index = 0; index < newArchives.length; index += 1) {
				personIds.push(selected[index].id);
			}

			await this.api.connector.familysearchFactImportRequest(
				newArchives,
				personIds,
			);

			if (this.importMemories === 'yes') {
				await this.api.connector.familysearchMemoryImportRequest(
					newArchives,
					personIds,
				);
			}

			this.showImportSpinner = false;

			this.message.showMessage({
				message: `Import complete. Tap here to view your new archives.`,
				style: 'success',
				translate: false,
				navigateTo: ['/choosearchive'],
			});

			this.waiting = false;
			this.dialogRef.close();

			if (!this.guidedTour.isStepComplete('familysearch', 'switchArchives')) {
				this.guidedTour.startTour([
					{
						...CreateArchivesComplete,
						beforeShowPromise: async () => {
							this.guidedTour.emit(GuidedTourEvent.RequestAccountDropdownOpen);
							return await timeout(500);
						},
						when: {
							show: () => {
								this.guidedTour.markStepComplete(
									'familysearch',
									'switchArchives',
								);
							},
						},
					},
				]);
			}
		} catch (err) {
			this.showImportSpinner = false;
			this.waiting = false;
			this.message.showError({
				message:
					'There was an error importing facts and memories. Please try again later.',
			});
			this.dialogRef.close();
		}
	}

	getSelectedCount() {
		return this.familyMembers.filter((person) => person.isSelected).length;
	}

	getRelationshipFromAncestryNumber(ancestryNumber: number) {
		switch (1 * ancestryNumber) {
			case 2:
				return 'relation.family.father';
			case 3:
				return 'relation.family.mother';
			case 4:
			case 6:
				return 'relation.family.grandfather';
			case 5:
			case 7:
				return 'relation.family.grandmother';
			default:
				return 'relation.family_member';
		}
	}
}
