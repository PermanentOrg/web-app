import { Injectable } from '@angular/core';
import { ArchiveVO } from '@models/index';
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

	public registerArchive(archive: ArchiveVO): void {
		this.onboardedArchives.push(archive);
	}

	public getFinalArchives(): ArchiveVO[] {
		return this.onboardedArchives;
	}

	public getArchiveName(): string | null {
		return sessionStorage.getItem(STORAGE_KEYS.archiveName);
	}

	public setArchiveName(name: string): void {
		sessionStorage.setItem(STORAGE_KEYS.archiveName, name);
	}

	public getArchiveType(): string | null {
		return sessionStorage.getItem(STORAGE_KEYS.archiveType);
	}

	public setArchiveType(type: string): void {
		sessionStorage.setItem(STORAGE_KEYS.archiveType, type);
	}

	public getArchiveTypeTag(): OnboardingTypes | null {
		return sessionStorage.getItem(
			STORAGE_KEYS.archiveTypeTag,
		) as OnboardingTypes | null;
	}

	public setArchiveTypeTag(tag: OnboardingTypes): void {
		sessionStorage.setItem(STORAGE_KEYS.archiveTypeTag, tag);
	}

	public getGoals(): string[] {
		const raw = sessionStorage.getItem(STORAGE_KEYS.goals);
		return raw ? JSON.parse(raw) : [];
	}

	public setGoals(goals: string[]): void {
		sessionStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
	}

	public getReasons(): string[] {
		const raw = sessionStorage.getItem(STORAGE_KEYS.reasons);
		return raw ? JSON.parse(raw) : [];
	}

	public setReasons(reasons: string[]): void {
		sessionStorage.setItem(STORAGE_KEYS.reasons, JSON.stringify(reasons));
	}

	public getOnboardingScreen(): NewArchiveScreen | null {
		return sessionStorage.getItem(
			STORAGE_KEYS.onboardingScreen,
		) as NewArchiveScreen | null;
	}

	public setOnboardingScreen(screen: NewArchiveScreen): void {
		sessionStorage.setItem(STORAGE_KEYS.onboardingScreen, screen);
	}

	public removeOnboardingScreen(): void {
		sessionStorage.removeItem(STORAGE_KEYS.onboardingScreen);
	}

	public clearSessionStorage(): void {
		Object.values(STORAGE_KEYS).forEach((key) =>
			sessionStorage.removeItem(key),
		);
	}

	public resetSessionState(): void {
		this.onboardedArchives = [];
		this.clearSessionStorage();
	}
}
