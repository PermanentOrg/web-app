import { Injectable } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { StorageService } from '@shared/services/storage/storage.service';
import { NewArchiveScreen, OnboardingTypes } from '../shared/onboarding-screen';

const STORAGE_KEYS = {
	archiveName: 'archiveName',
	archiveType: 'archiveType',
	archiveTypeTag: 'archiveTypeTag',
	goals: 'goals',
	reasons: 'reasons',
	onboardingScreen: 'onboardingScreen',
} as const;

@Injectable({
	providedIn: 'root',
})
export class OnboardingService {
	private onboardedArchives: ArchiveVO[] = [];

	constructor(private storage: StorageService) {}

	public registerArchive(archive: ArchiveVO): void {
		this.onboardedArchives.push(archive);
	}

	public getFinalArchives(): ArchiveVO[] {
		return this.onboardedArchives;
	}

	public getArchiveName(): string | null {
		return this.storage.session.get(STORAGE_KEYS.archiveName) ?? null;
	}

	public setArchiveName(name: string): void {
		this.storage.session.set(STORAGE_KEYS.archiveName, name);
	}

	public getArchiveType(): string | null {
		return this.storage.session.get(STORAGE_KEYS.archiveType) ?? null;
	}

	public setArchiveType(type: string): void {
		this.storage.session.set(STORAGE_KEYS.archiveType, type);
	}

	public getArchiveTypeTag(): OnboardingTypes | null {
		return this.storage.session.get(STORAGE_KEYS.archiveTypeTag) ?? null;
	}

	public setArchiveTypeTag(tag: OnboardingTypes): void {
		this.storage.session.set(STORAGE_KEYS.archiveTypeTag, tag);
	}

	public getGoals(): string[] {
		return this.storage.session.get(STORAGE_KEYS.goals) ?? [];
	}

	public setGoals(goals: string[]): void {
		this.storage.session.set(STORAGE_KEYS.goals, goals);
	}

	public getReasons(): string[] {
		return this.storage.session.get(STORAGE_KEYS.reasons) ?? [];
	}

	public setReasons(reasons: string[]): void {
		this.storage.session.set(STORAGE_KEYS.reasons, reasons);
	}

	public getOnboardingScreen(): NewArchiveScreen | null {
		return this.storage.session.get(STORAGE_KEYS.onboardingScreen) ?? null;
	}

	public setOnboardingScreen(screen: NewArchiveScreen): void {
		this.storage.session.set(STORAGE_KEYS.onboardingScreen, screen);
	}

	public removeOnboardingScreen(): void {
		this.storage.session.delete(STORAGE_KEYS.onboardingScreen);
	}

	public clearOnboardingStorage(): void {
		Object.values(STORAGE_KEYS).forEach((key) =>
			this.storage.session.delete(key),
		);
	}

	public resetOnboardingState(): void {
		this.onboardedArchives = [];
		this.clearOnboardingStorage();
	}
}
