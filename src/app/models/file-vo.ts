export const enum FileFormat {
  Original = 'file.format.original',
  Converted = 'file.format.converted',
  ArchivematicaAccess = 'file.format.archivematica.access',
}

export interface PermanentFile {
  fileId: number;
  size: number;
  format: FileFormat;
  parentFileId?: number;
  fileURL: string;
  downloadURL: string;
  type: string;
}


export interface File {
  size: number;
  type: string;
  fileId: string;
  format: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  downloadUrl: string;
}