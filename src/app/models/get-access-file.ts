import { prioritizeIf } from '@root/utils/prioritize-if';
import { File, FileFormat, PermanentFile } from './file-vo';

export interface HasFiles {
  FileVOs: PermanentFile[];
}

export interface HasFilesV2 {
  files?: File[];
}

// Overload signatures
function getArchivematicaAccess(files: File[]): File | undefined;
function getArchivematicaAccess(
  files: PermanentFile[],
): PermanentFile | undefined;

// Implementation
function getArchivematicaAccess(
  files: (File | PermanentFile)[],
): File | PermanentFile | undefined {
  return files.find((file) => file.format === FileFormat.ArchivematicaAccess);
}

function getPrioritizedConvertedFile(files: PermanentFile[]);
function getPrioritizedConvertedFile(files: File[]);

function getPrioritizedConvertedFile(
  files: (File | PermanentFile)[],
): File | PermanentFile | undefined {
  return prioritizeIf(
    files.filter((file) => file.format === FileFormat.Converted),
    (file) => file.type.includes('pdf'),
  )[0];
}

export function GetAccessFile(record: HasFiles): PermanentFile | undefined {
  const files = record?.FileVOs ?? [];
  return (
    getArchivematicaAccess(files) ||
    getPrioritizedConvertedFile(files) ||
    files[0]
  );
}

export function GetAccessFileV2(record: HasFilesV2): File | undefined {
  const files = record?.files ?? [];
  return (
    getArchivematicaAccess(files) ||
    getPrioritizedConvertedFile(files) ||
    files[0]
  );
}
