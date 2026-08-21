export enum AccessRole {
	Viewer,
	Contributor,
	Editor,
	Curator,
	Manager,
	Owner,
}

export type AccessRoleType =
	| 'access.role.viewer'
	| 'access.role.contributor'
	| 'access.role.editor'
	| 'access.role.curator'
	| 'access.role.manager'
	| 'access.role.owner';

export type PermissionsLevel =
	| 'contributor'
	| 'editor'
	| 'manager'
	| 'owner'
	| 'viewer';

/** Mirrors Stela's ArchiveMembershipRole enum */
export type ArchiveMembershipRoleType =
	| 'contributor'
	| 'curator'
	| 'editor'
	| 'manager'
	| 'owner'
	| 'viewer';

export const ARCHIVE_MEMBERSHIP_ROLE_TO_ACCESS_ROLE: Record<
	ArchiveMembershipRoleType,
	AccessRoleType
> = {
	contributor: 'access.role.contributor',
	curator: 'access.role.curator',
	editor: 'access.role.editor',
	manager: 'access.role.manager',
	owner: 'access.role.owner',
	viewer: 'access.role.viewer',
};

function isArchiveMembershipRole(
	value: unknown,
): value is ArchiveMembershipRoleType {
	return (
		typeof value === 'string' &&
		Object.hasOwn(ARCHIVE_MEMBERSHIP_ROLE_TO_ACCESS_ROLE, value)
	);
}

export function getAccessRoleFromArchiveMembershipRole(
	archiveMembershipRole: ArchiveMembershipRoleType | undefined,
): AccessRoleType | undefined {
	if (!isArchiveMembershipRole(archiveMembershipRole)) {
		return undefined;
	}

	return ARCHIVE_MEMBERSHIP_ROLE_TO_ACCESS_ROLE[archiveMembershipRole];
}

/**
 * Spread into VO data so that a role Stela did not send -- or one we cannot
 * translate -- leaves no accessRole field behind at all, letting permission
 * checks keep using the role the v1 endpoints supplied.
 */
export function getOptionalAccessRoleField(
	archiveMembershipRole: ArchiveMembershipRoleType | undefined,
): { accessRole?: AccessRoleType } {
	const accessRole = getAccessRoleFromArchiveMembershipRole(
		archiveMembershipRole,
	);

	return accessRole ? { accessRole } : {};
}

// Mapping for share link permissions. Note the stela share link API
// mistakenly returns "manager" where it should use "curator" -- see
// https://github.com/PermanentOrg/stela/issues/540
export const ACCESS_ROLE_TO_PERMISSIONS_LEVEL: Record<
	AccessRoleType,
	PermissionsLevel
> = {
	'access.role.viewer': 'viewer',
	'access.role.editor': 'editor',
	'access.role.contributor': 'contributor',
	'access.role.curator': 'manager',
	'access.role.manager': 'manager',
	'access.role.owner': 'owner',
};

export const PERMISSIONS_LEVEL_TO_ACCESS_ROLE: Record<
	PermissionsLevel,
	AccessRoleType
> = {
	viewer: 'access.role.viewer',
	editor: 'access.role.editor',
	contributor: 'access.role.contributor',
	manager: 'access.role.curator',
	owner: 'access.role.owner',
};

export function checkMinimumAccess(
	accessRole: AccessRoleType,
	minimumAccess: AccessRole,
) {
	return getAccessAsEnum(accessRole) >= minimumAccess;
}

export function getAccessAsEnum(accessRole: AccessRoleType): AccessRole {
	switch (accessRole) {
		case 'access.role.viewer':
			return AccessRole.Viewer;
		case 'access.role.editor':
			return AccessRole.Editor;
		case 'access.role.contributor':
			return AccessRole.Contributor;
		case 'access.role.curator':
			return AccessRole.Curator;
		case 'access.role.manager':
			return AccessRole.Manager;
		case 'access.role.owner':
			return AccessRole.Owner;
	}
}
