const ICON_DIRECTORY = 'assets/svg/record-type-thumbnail';

const ICON_FILE_BY_RECORD_TYPE: Record<string, string> = {
	'type.record.image': 'image.svg',
	'type.record.video': 'video.svg',
	'type.record.audio': 'audio.svg',
	'type.record.document': 'document.svg',
	'type.record.pdf': 'document.svg',
	'type.record.presentation': 'document.svg',
	'type.record.spreadsheet': 'document.svg',
	'type.record.archive': 'archive.svg',
};

const UNSUPPORTED_ICON_FILE = 'unsupported.svg';

export function getRecordTypeIconUrl(recordType: string): string {
	const iconFile =
		ICON_FILE_BY_RECORD_TYPE[recordType] ?? UNSUPPORTED_ICON_FILE;
	return `${ICON_DIRECTORY}/${iconFile}`;
}
