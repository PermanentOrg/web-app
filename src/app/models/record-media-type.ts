import { RecordVO } from './record-vo';

export function isImageRecord(record: RecordVO): boolean {
	return record.type.includes('image');
}

export function isVideoRecord(record: RecordVO): boolean {
	return record.type.includes('video');
}

export function isAudioRecord(record: RecordVO): boolean {
	return record.type.includes('audio');
}

export function isWebArchiveRecord(record: RecordVO): boolean {
	return record.type.includes('web_archive');
}

export function hasDocumentFile(record: RecordVO): boolean {
	return (
		record.FileVOs?.some(
			(file) => file.type.includes('pdf') || file.type.includes('txt'),
		) ?? false
	);
}
