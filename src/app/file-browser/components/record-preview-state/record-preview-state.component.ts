import { Component, computed, input, output } from '@angular/core';
import { RecordPreviewState } from '@models/record-preview-state';

export const ACCESS_COPY_HELP_LINK = 'about:blank';

type UnreadyPreviewState = Exclude<
	RecordPreviewState,
	RecordPreviewState.Ready
>;

interface PreviewStateContent {
	iconSource: string;
	showsFileExtensionOnIcon: boolean;
	heading: string;
	body: string;
	helpLinkText: string;
}

const PREVIEW_STATE_CONTENT: Record<UnreadyPreviewState, PreviewStateContent> =
	{
		[RecordPreviewState.Preparing]: {
			iconSource: 'assets/svg/access-copy/preview-preparing.svg',
			showsFileExtensionOnIcon: false,
			heading: "We're still preparing this file to view",
			body: "Your original file is stored and safe. We're making a copy you can read in the browser, which usually takes a few minutes and can take longer after a large upload.",
			helpLinkText: 'What does it mean when my file is processing?',
		},
		[RecordPreviewState.Unavailable]: {
			iconSource: 'assets/svg/access-copy/preview-file-outline.svg',
			showsFileExtensionOnIcon: true,
			heading: "This file is stored, but we can't show it here",
			body: "This isn't a format we can make a viewable copy of. Your original is kept exactly as you uploaded it and you can download it any time.",
			helpLinkText: 'Which files can Permanent preview?',
		},
		[RecordPreviewState.Failed]: {
			iconSource: 'assets/svg/access-copy/preview-failed.svg',
			showsFileExtensionOnIcon: false,
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
}
