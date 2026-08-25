import {
	ARCHIVE_MEMBERSHIP_ROLE_TO_ACCESS_ROLE,
	getAccessRoleFromArchiveMembershipRole,
	getAccessAsEnum,
	type ArchiveMembershipRoleType,
} from './access-role';

describe('getAccessRoleFromArchiveMembershipRole', () => {
	const expectedTranslations: Array<[ArchiveMembershipRoleType, string]> = [
		['contributor', 'access.role.contributor'],
		['curator', 'access.role.curator'],
		['editor', 'access.role.editor'],
		['manager', 'access.role.manager'],
		['owner', 'access.role.owner'],
		['viewer', 'access.role.viewer'],
	];

	expectedTranslations.forEach(
		([archiveMembershipRole, expectedAccessRole]) => {
			it(`should translate ${archiveMembershipRole}`, () => {
				expect(
					getAccessRoleFromArchiveMembershipRole(archiveMembershipRole),
				).toBe(expectedAccessRole);
			});
		},
	);

	it('should cover every role Stela can send', () => {
		expect(Object.keys(ARCHIVE_MEMBERSHIP_ROLE_TO_ACCESS_ROLE).length).toBe(
			expectedTranslations.length,
		);
	});

	it('should produce roles that getAccessAsEnum understands', () => {
		expectedTranslations.forEach(([archiveMembershipRole]) => {
			const accessRole = getAccessRoleFromArchiveMembershipRole(
				archiveMembershipRole,
			);

			expect(getAccessAsEnum(accessRole)).toBeDefined();
		});
	});

	it('should translate manager to manager, not the curator that PERMISSIONS_LEVEL_TO_ACCESS_ROLE maps it to', () => {
		expect(getAccessRoleFromArchiveMembershipRole('manager')).toBe(
			'access.role.manager',
		);
	});

	it('should return undefined rather than guess at an unknown role', () => {
		expect(
			getAccessRoleFromArchiveMembershipRole(
				'wizard' as ArchiveMembershipRoleType,
			),
		).toBeUndefined();
	});

	it('should return undefined when no role is given', () => {
		expect(getAccessRoleFromArchiveMembershipRole(undefined)).toBeUndefined();
	});

	it('should return undefined for an inherited object property name', () => {
		expect(
			getAccessRoleFromArchiveMembershipRole(
				'toString' as ArchiveMembershipRoleType,
			),
		).toBeUndefined();
	});
});
