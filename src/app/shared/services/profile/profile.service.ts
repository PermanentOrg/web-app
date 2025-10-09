import { Injectable } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { RecordVO, ArchiveVO } from '@models';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import {
	FieldNameUI,
	ProfileItemVOData,
	ProfileItemVODictionary,
	FieldNameUIShort,
} from '@models/profile-item-vo';
import { remove, orderBy, some } from 'lodash';
import { MessageService } from '../message/message.service';
import { PrConstantsService } from '../pr-constants/pr-constants.service';

type ProfileItemsStringDataCol =
	| 'string1'
	| 'string2'
	| 'string3'
	| 'datetime1'
	| 'datetime2'
	| 'textData1'
	| 'textData2'
	| 'day1'
	| 'day2';

type ProfileItemsIntDataCol =
	| 'int1'
	| 'int2'
	| 'int3'
	| 'locnId1'
	| 'locnId2'
	| 'otherId1'
	| 'otherId2'
	| 'text_dataId1'
	| 'text_dataId2';

const DATA_FIELDS: ProfileItemsDataCol[] = [
	'string1',
	'string2',
	'string3',
	'day1',
	'day2',
	'textData1',
	'locnId1',
];

export type ProfileItemsDataCol =
	| ProfileItemsStringDataCol
	| ProfileItemsIntDataCol;

export type ProfileProgressChecklist = {
	[key in FieldNameUIShort]?: ProfileItemsDataCol[];
};

const CHECKLIST: ProfileProgressChecklist = {
	basic: ['string1'],
	blurb: ['string1'],
	description: ['textData1'],
	birth_info: ['day1', 'locnId1'],
	established_info: ['day1', 'locnId1'],
	gender: ['string1'],
	email: ['string1'],
	social_media: ['string1'],
	milestone: ['day1', 'string1', 'locnId1'],
};

export const ALWAYS_PUBLIC: FieldNameUI[] = [
	'profile.basic',
	'profile.description',
	'profile.timezone',
];

export function addProfileItemToDictionary(
	dict: ProfileItemVODictionary,
	item: ProfileItemVOData,
) {
	const fieldNameUIShort = item.fieldNameUI.replace('profile.', '');

	if (dict[fieldNameUIShort]) {
		dict[fieldNameUIShort].push(item);
	} else {
		dict[fieldNameUIShort] = [item];
	}
}

export function orderItemsInDictionary(
	dict: ProfileItemVODictionary,
	field: FieldNameUIShort,
	column: ProfileItemsDataCol = 'day1',
) {
	if (dict[field]?.length > 1) {
		dict[field] = orderBy(dict[field], column);
	}
}

@Injectable()
export class ProfileService {
	private profileItemDictionary: ProfileItemVODictionary = {};

	constructor(
		private api: ApiService,
		private constants: PrConstantsService,
		private account: AccountService,
		private folderPicker: FolderPickerService,
		private message: MessageService,
	) {}

	async promptForProfilePicture() {
		const privateRoot = this.account.getPrivateRoot();
		try {
			const currentArchive = this.account.getArchive();
			const record = (await this.folderPicker.chooseRecord(
				privateRoot,
			)) as RecordVO;
			const updateArchive = new ArchiveVO(currentArchive);
			updateArchive.thumbArchiveNbr = record.archiveNbr;
			const updateResponse = await this.api.archive.update(updateArchive);
			currentArchive.update(updateResponse.getArchiveVO());

			// borrow thumb URLs from record for now, until they can be regenerated
			const thumbProps: Array<keyof (ArchiveVO | RecordVO)> = [
				'thumbURL200',
				'thumbURL500',
				'thumbURL1000',
				'thumbURL2000',
			];
			for (const prop of thumbProps) {
				currentArchive[prop] = record[prop] as never;
			}
		} catch (err) {
			if (err instanceof ArchiveResponse) {
				this.message.showError({
					message: 'There was a problem changing the archive profile picture.',
				});
			}
		}
	}

	async fetchProfileItems() {
		const currentArchive = this.account.getArchive();
		const profileResponse =
			await this.api.archive.getAllProfileItems(currentArchive);
		const profileItems = profileResponse?.getProfileItemVOs();
		this.profileItemDictionary = {};

		for (const item of profileItems) {
			// override type to convert to milestone on update
			const fieldsToConvert: FieldNameUI[] = [
				'profile.home',
				'profile.job',
				'profile.location',
			];

			// borrow description for title to overwrite phone nbr
			if (
				item.fieldNameUI === 'profile.home' ||
				item.fieldNameUI === 'profile.location'
			) {
				item.string2 = item.string1;
			}

			if (fieldsToConvert.includes(item.fieldNameUI)) {
				item.fieldNameUI = 'profile.milestone';
			}
			addProfileItemToDictionary(this.profileItemDictionary, item);
		}

		// create stubs for the rest of the profile items so at least one exists for given profile item type
		this.stubEmptyProfileItems();

		// order things by start date that have a start date
		this.orderItems('milestone');
	}

	getProfileItemDictionary() {
		return this.profileItemDictionary;
	}

	clearProfileDictionary() {
		this.profileItemDictionary = {};
	}

	addProfileItemToDictionary(item: ProfileItemVOData) {
		addProfileItemToDictionary(this.profileItemDictionary, item);
	}

	createEmptyProfileItem(fieldNameShort: FieldNameUIShort) {
		const currentArchive = this.account.getArchive();
		const shortType = currentArchive?.type.split('.').pop();
		const template = this.constants.getProfileTemplate();
		const templateForType = template[shortType];
		const valueTemplate = templateForType[fieldNameShort];

		const item: ProfileItemVOData = {
			archiveId: currentArchive?.archiveId,
			fieldNameUI: valueTemplate?.field_name_ui,
		};

		// completely useless type field but have to still set it for now
		switch (fieldNameShort) {
			case 'birth_info':
			case 'death_info':
				item.type = 'type.widget.date';
				break;
			case 'job':
			case 'home':
			case 'milestone':
				item.type = 'type.widget.locn';
				break;
			case 'description':
				item.type = 'type.widget.description';
				break;
			default:
				item.type = 'type.widget.string';
		}

		return item;
	}

	getProfileItemsAsArray() {
		const allItems: ProfileItemVOData[] = [];

		for (const key in this.profileItemDictionary) {
			if (
				Object.prototype.hasOwnProperty.call(this.profileItemDictionary, key)
			) {
				const items = this.profileItemDictionary[key];
				allItems.push(...items);
			}
		}

		return allItems;
	}

	stubEmptyProfileItems() {
		const currentArchive = this.account.getArchive();
		const shortType = currentArchive?.type.split('.').pop();
		const template = this.constants.getProfileTemplate();
		const templateForType = template[shortType];

		const fields = Object.keys(templateForType) as FieldNameUIShort[];
		for (const fieldNameShort of fields) {
			if (!this.profileItemDictionary[fieldNameShort]) {
				this.profileItemDictionary[fieldNameShort] = [
					this.createEmptyProfileItem(fieldNameShort),
				];
			}
		}
	}

	async setProfilePublic(setPublic = true) {
		const allItems = this.getProfileItemsAsArray().filter(
			(i) => !ALWAYS_PUBLIC.includes(i.fieldNameUI),
		);
		const originalValues = [];

		const minItems = allItems
			.filter((i) => i.profile_itemId)
			.map((i) => {
				originalValues.push(i.publicDT);
				const minItem: ProfileItemVOData = {
					profile_itemId: i.profile_itemId,
					publicDT: setPublic ? new Date().toISOString() : null,
				};
				return minItem;
			});

		if (!minItems.length) {
			if (this.checkProfilePublic() === setPublic) {
				return;
			} else {
				const currentArchive = this.account.getArchive();
				const publicDummy: ProfileItemVOData = {
					archiveId: currentArchive.archiveId,
					fieldNameUI: 'profile.FORCE_PUBLIC_UPDATE',
					string1: setPublic ? 'true' : 'false',
					type: 'type.widget.string',
					publicDT: setPublic ? new Date().toISOString() : null,
				};
				minItems.push(publicDummy);
			}
		}

		try {
			const response = await this.api.archive.addUpdateProfileItems(minItems);
			const updated = response.getProfileItemVOs();
			updated.forEach((item, i) => {
				allItems[i].updatedDT = item.updatedDT;
				allItems[i].publicDT = item.publicDT;
			});
		} catch (err) {
			allItems.forEach((item, i) => {
				item.publicDT = originalValues[i];
			});

			throw err;
		}
	}

	checkProfilePublic() {
		const allItems = this.getProfileItemsAsArray();
		const nonDefaultItems = allItems.filter(
			(i) => !ALWAYS_PUBLIC.includes(i.fieldNameUI) && i.profile_itemId,
		);
		if (!nonDefaultItems.length) {
			return true;
		}

		const isPublic = some(nonDefaultItems, 'publicDT');

		return isPublic;
	}

	async saveProfileItem(
		item: ProfileItemVOData,
		valueWhitelist?: (keyof ProfileItemVOData)[],
	) {
		const updateItem = item;
		if (valueWhitelist) {
			const minWhitelist: (keyof ProfileItemVOData)[] = [
				'profile_itemId',
				'fieldNameUI',
				'archiveId',
			];

			for (const value of minWhitelist.concat(...valueWhitelist)) {
				(updateItem as any)[value] = item[value];
			}
		}

		if (
			!updateItem.profile_itemId &&
			(ALWAYS_PUBLIC.includes(updateItem.fieldNameUI) ||
				this.checkProfilePublic())
		) {
			updateItem.publicDT = new Date().toISOString();
		}

		const response = await this.api.archive.addUpdateProfileItems([updateItem]);

		const updated = response.getProfileItemVOs()[0];
		item.updatedDT = updated.updatedDT;
		if (!item.profile_itemId) {
			item.profile_itemId = updated.profile_itemId;
		}
	}

	async deleteProfileItem(item: ProfileItemVOData) {
		if (item.profile_itemId) {
			await this.api.archive.deleteProfileItem(item);
		}
		const fieldNameShort = item.fieldNameUI.split('.')[1] as FieldNameUIShort;
		const list = this.profileItemDictionary[fieldNameShort];

		if (list.length === 1) {
			list[0] = this.createEmptyProfileItem(fieldNameShort);
		} else {
			remove(this.profileItemDictionary[fieldNameShort], item);
		}
	}

	getSpecificFieldNameUIFromValueKey(
		field: FieldNameUI,
		valueKey: keyof ProfileItemVOData,
	) {
		const template = this.constants.getProfileTemplate();
		const currentArchive = this.account.getArchive();
		const shortType = currentArchive.type.split('.').pop();
		const shortField = field.split('.').pop();
		const templateForType = template[shortType];
		const valueTemplate = templateForType[shortField].values[valueKey];
		return valueTemplate.field_name_ui;
	}

	isItemEmpty(item: ProfileItemVOData) {
		const fieldsToCheck = DATA_FIELDS;

		for (const field of fieldsToCheck) {
			if (item[field]) {
				return false;
			}
		}

		return true;
	}

	orderItems(field: FieldNameUIShort, column: ProfileItemsDataCol = 'day1') {
		orderItemsInDictionary(this.profileItemDictionary, field);
	}

	calculateProfileProgress(): number {
		let totalEntries = 0;
		let filledEntries = 0;
		const template = this.constants.getProfileTemplate();
		const currentArchive = this.account.getArchive();
		const shortType = currentArchive.type.split('.').pop();
		const templateForType = template[shortType];

		for (const fieldNameShort in CHECKLIST) {
			if (
				Object.prototype.hasOwnProperty.call(CHECKLIST, fieldNameShort) &&
				templateForType[fieldNameShort]
			) {
				const cols = CHECKLIST[fieldNameShort];
				totalEntries += cols.length;

				const itemToCheck = this.profileItemDictionary[fieldNameShort]?.[0];
				if (itemToCheck) {
					for (const col of cols) {
						if (itemToCheck[col]) {
							filledEntries++;
						}
					}
				}
			}
		}

		return filledEntries / totalEntries;
	}
}
