/* @format */
export enum OnboardingScreen {
  welcomeScreen = 'welcomeScreen',
  goals = 'goals',
  done = 'done',
  pendingArchives = 'pendingArchives',
}

export enum OnboardingReasonsTags {
  safe = 'why:safe',
  nonprofit = 'why:nonprofit',
  genealogy = 'why:genealogy',
  professional = 'why:professional',
  collaborate = 'why:collaborate',
  digipres = 'why:digipres',
}

export enum OnboardingGoalsTags {
  capture = 'goal:capture',
  digitize = 'goal:digitize',
  collaborate = 'goal:collaborate',
  publish = 'goal:publish',
  share = 'goal:share',
  legacy = 'goal:legacy',
  organize = 'goal:organize',
  undefined = 'goal:undefined',
}

export enum OnboardingTypes {
  myself = 'type:myself',
  individual = 'type:individual',
  family = 'type:family',
  famhist = 'type:famhist',
  community = 'type:community',
  org = 'type:org',
  other = 'type:other',
  unsure = 'type:unsure',
}

export const reasons = [
  {
    tag: OnboardingReasonsTags.safe,
    text: 'Access to a safe and secure digital storage platform',
  },
  {
    tag: OnboardingReasonsTags.nonprofit,
    text: 'Supporting a mission-driven nonprofit',
  },
  {
    tag: OnboardingReasonsTags.genealogy,
    text: 'Preserving family history or genealogy research',
  },
  {
    tag: OnboardingReasonsTags.professional,
    text: 'Professional business needs/clients',
  },
  {
    tag: OnboardingReasonsTags.collaborate,
    text: 'Collaborate with a family member, friend, or colleague',
  },
  {
    tag: OnboardingReasonsTags.digipres,
    text: 'Interest in digital preservation solutions',
  },
];

export const goals = [
  {
    tag: OnboardingGoalsTags.capture,
    text: 'Capture and preserve memories for storytelling',
  },
  {
    tag: OnboardingGoalsTags.digitize,
    text: 'Digitize or transfer my materials securely',
  },
  {
    tag: OnboardingGoalsTags.collaborate,
    text: 'Collaborate with others to build my archive',
  },
  {
    tag: OnboardingGoalsTags.publish,
    text: 'Create a public archive to share a legacy',
  },
  {
    tag: OnboardingGoalsTags.share,
    text: 'Share my archive with others securely',
  },
  {
    tag: OnboardingGoalsTags.legacy,
    text: 'Create a plan for passing on my digital materials ',
  },
  {
    tag: OnboardingGoalsTags.organize,
    text: 'Organize my materials',
  },
  {
    tag: OnboardingGoalsTags.undefined,
    text: 'Something else',
  },
];

export const archiveOptions = [
  {
    value: 'type.archive.person',
    text: 'Myself',
    type: OnboardingTypes.myself,
  },
  {
    value: 'type.archive.person',
    text: 'An individual',
    type: OnboardingTypes.individual,
  },
  {
    value: 'type.archive.group',
    text: 'My family in the present',
    type: OnboardingTypes.family,
  },
  {
    value: 'type.archive.group',
    text: "My family's history",
    type: OnboardingTypes.famhist,
  },
  {
    value: 'type.archive.group',
    text: "A community I'm part of",
    type: OnboardingTypes.community,
  },
  {
    value: 'type.archive.organization',
    text: 'An organization, company, or nonprofit',
    type: OnboardingTypes.org,
  },
  {
    value: 'type.archive.person',
    text: 'Something else',
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
