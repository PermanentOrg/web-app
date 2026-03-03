import { Injectable } from '@angular/core';
import { ArchiveVO } from '@models/index';

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

	public clearSessionStorage(): void {
		sessionStorage.removeItem('archiveName');
		sessionStorage.removeItem('archiveType');
		sessionStorage.removeItem('archiveTypeTag');
		sessionStorage.removeItem('goals');
		sessionStorage.removeItem('reasons');
		sessionStorage.removeItem('onboardingScreen');
	}

	public resetSessionState(): void {
		this.onboardedArchives = [];
		this.clearSessionStorage();
	}
}
