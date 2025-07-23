export type FilesystemItemIdentifier =
	| { folder_linkId: number }
	| { archiveNbr: string };

export type FolderIdentifier = FilesystemItemIdentifier | { folderId: number };
export type RecordIdentifier = FilesystemItemIdentifier | { recordId: number };
