import { FolderResponse } from '@shared/services/api/index.repo';

export const GENERIC_FOLDER_ERROR_MESSAGE = 'error.generic.internal';

/**
 * Legacy endpoints failed with a FolderResponse carrying a translatable message,
 * while Stela rejects with the raw HTTP error, which has none.
 */
export function getFolderErrorMessage(error: unknown): string {
	if (error instanceof FolderResponse) {
		return error.getMessage() ?? GENERIC_FOLDER_ERROR_MESSAGE;
	}

	return GENERIC_FOLDER_ERROR_MESSAGE;
}
