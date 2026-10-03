import { Component, computed, input, signal } from '@angular/core';

@Component({
	selector: 'pr-archive-avatar',
	standalone: true,
	templateUrl: './archive-avatar.component.html',
	styleUrls: ['./archive-avatar.component.scss'],
})
export class ArchiveAvatarComponent {
	thumbnailUrl = input<string | undefined>();
	archiveName = input<string | undefined>();

	archiveInitial = computed(() =>
		(this.archiveName() ?? '').trim().charAt(0).toUpperCase(),
	);

	private loadedThumbnailUrl = signal<string | null>(null);
	private failedThumbnailUrl = signal<string | null>(null);

	shouldTryThumbnail = computed(() => {
		const thumbnailUrl = this.thumbnailUrl();
		return !!thumbnailUrl && thumbnailUrl !== this.failedThumbnailUrl();
	});

	isThumbnailLoaded = computed(
		() =>
			this.shouldTryThumbnail() &&
			this.thumbnailUrl() === this.loadedThumbnailUrl(),
	);

	public onThumbnailLoad(): void {
		this.loadedThumbnailUrl.set(this.thumbnailUrl());
	}

	public onThumbnailError(): void {
		this.failedThumbnailUrl.set(this.thumbnailUrl());
	}
}
