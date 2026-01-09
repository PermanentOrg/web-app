export type FolderViewType =
	| 'folder.view.grid'
	| 'folder.view.list'
	| 'folder.view.timeline';
export type SortType =
	| 'sort.display_date_asc'
	| 'sort.display_date_desc'
	| 'sort.alphabetical_asc'
	| 'sort.alphabetical_desc'
	| 'sort.type_asc'
	| 'sort.type_desc';

export type FolderType =
	| 'type.folder.root.app'
	| 'type.folder.root.private'
	| 'type.folder.root.public'
	| 'type.folder.root.share'
	| 'type.folder.root.vault'
	| 'type.folder.app'
	| 'type.folder.private'
	| 'type.folder.public'
	| 'type.folder.share'
	| 'type.folder.vault'
	| 'page';

export type FolderLinkType =
	| 'type.folder_link.root.app'
	| 'type.folder_link.root.private'
	| 'type.folder_link.root.public'
	| 'type.folder_link.root.share'
	| 'type.folder_link.root.vault'
	| 'type.folder_link.app'
	| 'type.folder_link.private'
	| 'type.folder_link.public'
	| 'type.folder_link.share'
	| 'type.folder_link.vault';

export type RecordType =
	| 'type.record.archive'
	| 'type.record.audio'
	| 'type.record.document'
	| 'type.record.experience'
	| 'type.record.folder'
	| 'type.record.image'
	| 'type.record.pdf'
	| 'type.record.presentation'
	| 'type.record.reference'
	| 'type.record.spreadsheet'
	| 'type.record.unknown'
	| 'type.record.video'
	| 'type.record.web_archive';

export type GenericStatus =
	| 'status.generic.declined'
	| 'status.generic.deleted'
	| 'status.generic.error'
	| 'status.generic.orphaned'
	| 'status.generic.invited'
	| 'status.generic.ok'
	| 'status.generic.pending'
	| 'status.generic.undefined'
	| 'status.generic.manual_review';

export type FolderStatus =
	| 'status.folder.genthumb'
	| 'status.folder.new'
	| 'status.folder.moving'
	| 'status.folder.copying'
	| GenericStatus;

export type RecordStatus =
	| 'status.record.needs_decryption'
	| 'status.record.needs_encryption'
	| 'status.record.needs_processing'
	| 'status.record.new'
	| 'status.record.only_meta'
	| 'status.record.overwrite'
	| 'status.record.processing'
	| 'status.record.reprocessing'
	| 'status.record.converting'
	| 'status.record.needs_converting'
	| 'status.record.queued'
	| 'status.record.uploading'
	| 'status.record.uploaded'
	| 'status.record.needs_thumb'
	| 'status.record.moving'
	| 'status.record.copying'
	| GenericStatus;

export type GenericErrorType =
	| 'error.generic.internal'
	| 'error.generic.invalid_csrf';

export type ResponseMessageType = GenericErrorType | string;
