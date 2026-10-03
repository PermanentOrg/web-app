import { Component, computed, input, output } from '@angular/core';
import {
	RecordPreviewState,
	UnreadyPreviewState,
} from '@models/record-preview-state';

interface PreviewStateContent {
	iconUrl: string;
	heading: string;
	body: string;
	helpLinkText: string;
}

export const ACCESS_COPY_HELP_LINK = 'about:blank';

const PREVIEW_STATE_CONTENT: Record<UnreadyPreviewState, PreviewStateContent> =
	{
		[RecordPreviewState.Preparing]: {
			iconUrl: 'assets/svg/record-preview-state/preparing.svg',
			heading: "We're still preparing this file to view",
			body: "Your original file is stored and safe. We're making a copy you can read in the browser, which usually takes a few minutes and can take longer after a large upload.",
			helpLinkText: 'What does it mean when my file is processing?',
		},
		[RecordPreviewState.Unavailable]: {
			iconUrl: 'assets/svg/record-preview-state/unavailable.svg',
			heading: "This file is stored, but we can't show it here",
			body: "This isn't a format we can make a viewable copy of. Your original is kept exactly as you uploaded it and you can download it any time.",
			helpLinkText: 'Which files can Permanent preview?',
		},
		[RecordPreviewState.Failed]: {
			iconUrl: 'assets/svg/record-preview-state/failed.svg',
			heading: "We couldn't make a copy of this file to view",
			body: "Something went wrong while preparing it. This doesn't affect your original, which is stored exactly as you uploaded it. Download it to check it opens on your device.",
			helpLinkText: 'Get help with this file',
		},
	};

@Component({
	selector: 'pr-record-preview-state',
	standalone: true,
	templateUrl: './record-preview-state.component.html',
	styleUrls: ['./record-preview-state.component.scss'],
})
export class RecordPreviewStateComponent {
	previewState = input.required<UnreadyPreviewState>();
	fileExtension = input<string | undefined>();
	canDownload = input(true);

	downloadOriginal = output<void>();

	readonly helpLink = ACCESS_COPY_HELP_LINK;
	readonly content = computed(() => PREVIEW_STATE_CONTENT[this.previewState()]);
	readonly isUnavailable = computed(
		() => this.previewState() === RecordPreviewState.Unavailable,
	);
	readonly showsExtensionOnIcon = computed(
		() => this.isUnavailable() && !!this.fileExtension(),
	);
}
