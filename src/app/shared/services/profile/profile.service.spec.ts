import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { ArchiveVO, FolderVO } from '@models/index';
import { RecordVO } from '../../../models/record-vo';
import { ArchiveResponse } from '../api/archive.repo';
import { AccountService } from '../account/account.service';
import { ApiService } from '../api/api.service';
import { MessageService } from '../message/message.service';
import { PrConstantsService } from '../pr-constants/pr-constants.service';
import { ProfileService } from './profile.service';

const PROFILE_TEMPLATE = require('../../../../../constants/profile_template.json');

const mockApiService = {
	archive: {
		update: async (archive: ArchiveVO) =>
			await Promise.resolve(new ArchiveResponse({})),
		getAllProfileItems: async (archive: ArchiveVO) =>
			await Promise.resolve(new ArchiveResponse({})),
		addUpdateProfileItems: async (profileItems: any[]) =>
			await Promise.resolve(new ArchiveResponse({})),
		deleteProfileItem: async (profileItem: any) =>
			await Promise.resolve(new ArchiveResponse({})),
	},
};
const mockConstantsService = {
	getProfileTemplate: () => PROFILE_TEMPLATE,
};
const mockAccountService = {
	getArchive: () =>
		new ArchiveVO({ archiveId: 1, type: 'archive.type.organization' }),
};
const mockFolderPickerService = {
	chooseRecord: async (startingFolder: FolderVO) =>
		await Promise.resolve(new RecordVO({})),
};

describe('ProfileService', () => {
	beforeEach(async () => {
		await MockBuilder(ProfileService)
			.mock(MessageService, { showError: () => {} })
			.provide({ provide: ApiService, useValue: mockApiService })
			.provide({
				provide: PrConstantsService,
				useValue: mockConstantsService,
			})
			.provide({ provide: AccountService, useValue: mockAccountService })
			.provide({
				provide: FolderPickerService,
				useValue: mockFolderPickerService,
			});
	});

	it('should exist', () => {
		const instance = TestBed.inject(ProfileService);

		expect(instance).toBeTruthy();
	});

	it('should return the correct completion value when not all the fields have a value', () => {
		const mockDictionary = {
			birth_info: [
				{
					day1: '2023-11-10',
					locnId1: null,
				},
			],
			description: [
				{
					textData1: 'Description',
				},
			],
			email: [
				{
					string1: 'email@example',
				},
			],
			social_media: [
				{
					string1: 'testSocialMedia',
				},
			],
			basic: [
				{
					string1: 'Archive',
				},
			],
			blurb: [
				{
					string1: 'BlurbTest',
				},
			],
			established_info: [
				{
					day1: '2023-07-11',
				},
			],
			milestone: [
				{
					string1: 'Milestone',
					day1: '2024-02-01',
					locnId1: null,
				},
			],
		};
		const instance = TestBed.inject(ProfileService);
		(instance as any).profileItemDictionary = mockDictionary;

		const progress = instance.calculateProfileProgress();

		expect(progress).toBe(0.8);
	});

	it('should 1 when at least one of each profile category has a value', () => {
		const mockDictionary = {
			birth_info: [
				{
					day1: '2023-11-10',
					locnId1: 'loc',
				},
			],
			description: [
				{
					textData1: 'Description',
				},
			],
			email: [
				{
					string1: 'email@example',
				},
			],
			social_media: [
				{
					string1: 'testSocialMedia',
				},
			],
			basic: [
				{
					string1: 'Archive',
				},
			],
			blurb: [
				{
					string1: 'BlurbTest',
				},
			],
			established_info: [
				{
					day1: '2023-07-11',
					locnId1: 'loc',
				},
			],
			milestone: [
				{
					string1: 'Milestone',
					day1: '2024-02-01',
					locnId1: 'loc',
				},
			],
		};
		const instance = TestBed.inject(ProfileService);
		(instance as any).profileItemDictionary = mockDictionary;

		const progress = instance.calculateProfileProgress();

		expect(progress).toBe(1);
	});

	it('should return 0 when no fields have any values', () => {
		const mockDictionary = {};
		const instance = TestBed.inject(ProfileService);
		(instance as any).profileItemDictionary = mockDictionary;

		const progress = instance.calculateProfileProgress();

		expect(progress).toBe(0);
	});
});
