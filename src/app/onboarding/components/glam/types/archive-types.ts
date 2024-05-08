import { OnboardingTypes } from '@root/app/onboarding/shared/onboarding-screen';

export const archiveOptions = [
  {
    value: 'type.archive.person',
    text: 'Personal',
    type: OnboardingTypes.myself,
  },
  {
    value: 'type.archive.person',
    text: 'An individual',
    type: OnboardingTypes.individual,
  },
  {
    value: 'type.archive.group',
    text: 'Family',
    type: OnboardingTypes.family,
  },
  {
    value: 'type.archive.group',
    text: "My family's history",
    type: OnboardingTypes.famhist,
  },
  {
    value: 'type.archive.group',
    text: 'Community',
    type: OnboardingTypes.community,
  },
  {
    value: 'type.archive.organization',
    text: 'Organization',
    type: OnboardingTypes.org,
  },
  {
    value: 'type.archive.person',
    text: 'Other',
    type: OnboardingTypes.other,
  },
  {
    value: 'type.archive.person',
    text: "I'm not sure yet",
    type: OnboardingTypes.unsure,
  },
];

export const archiveDescriptions = {
  'type:myself': 'Create an archive that captures my personal life journey.',
  'type:individual':
    'Create an archive that captures an individual person’s life journey other than your own.',
  'type:family': 'Create an archive that captures my family life.',
  'type:famhist':
    'Create an archive that preserves the memory of my ancestors, family history, or genealogy.',
  'type:community':
    'Create an archive that preserves the history of a community, group, or other association of people.',
  'type:org':
    'Create an archive that preserves the history of an organization or nonprofit.',
  'type:other': '',
  'type:unsure': '',
};
