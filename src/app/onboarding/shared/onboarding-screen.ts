/* @format */
export enum OnboardingScreen {
  welcomeScreen = 'welcomeScreen',
  goals = 'goals',
  done = 'done',
  pendingArchives = 'pendingArchives',
}

<<<<<<< HEAD
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
=======

export const reasons = [
  {
    tag: 'why:safe',
    text: 'Access to a safe and secure digital storage platform'
  },
  {
    tag: 'why:nonprofit',
    text: 'Supporting a mission-driven nonprofit'
  },
  {
    tag: 'why:genealogy',
    text: 'Preserving family history or genealogy research'
  },
  {
    tag: 'why:professional',
    text: 'Professional business needs/clients'
  },
  {
    tag: 'why:colalborate',
    text: 'Collaborate with a family member, friend, or colleague'
  },
  {
    tag: 'why:digipres',
    text: 'Interest in digital preservation solutions'
  }
]

export const goals = [
  {
    tag: 'goal:capture',
    text: 'Capture and preserve memories for storytelling'
  },
  {
    tag: 'goal:digitize',
    text: 'Digitize or transfer my materials securely'
  },
  {
    tag: 'goal:collaborate',
    text: 'Collaborate with others to build my archive'
  },
  {
    tag: 'goal:publish',
    text: 'Create a public archive to share a legacy',
  },
  {
    tag: 'goal:share',
    text: 'Share my archive with others securely',
  },
  {
    tag: 'goal:legacy',
    text: 'Create a plan for passing on my digital materials '
  },
  {
    tag: 'goal:organize',
    text: 'Organize my materials'
  },
  {
    tag: 'goal:undefined',
    text: 'Something else'
  }
]
>>>>>>> 87690145 (Create new onboarding flow)

export const archiveOptions = [
  {
    value: 'type.archive.person',
    text: 'Myself',
<<<<<<< HEAD
    type: OnboardingTypes.myself,
=======
    type: 'type:myself',
>>>>>>> 87690145 (Create new onboarding flow)
  },
  {
    value: 'type.archive.person',
    text: 'An individual',
<<<<<<< HEAD
    type: OnboardingTypes.individual,
=======
    type: 'type:individual',
>>>>>>> 87690145 (Create new onboarding flow)
  },
  {
    value: 'type.archive.family',
    text: 'My family in the present',
<<<<<<< HEAD
    type: OnboardingTypes.family,
=======
    type: 'type:family',
>>>>>>> 87690145 (Create new onboarding flow)
  },
  {
    value: 'type.archive.family',
    text: "My family's history",
<<<<<<< HEAD
    type: OnboardingTypes.famhist,
  },
  {
    value: 'type.archive.family',
    text: "A community I'm part of",
    type: OnboardingTypes.community,
=======
    type: 'type:famhist',
  },
  {
    value: 'type.archive.organization',
    text: "A community I'm part of",
    type: 'type:community',
>>>>>>> 87690145 (Create new onboarding flow)
  },
  {
    value: 'type.archive.organization',
    text: 'An organization, company, or nonprofit',
<<<<<<< HEAD
    type: OnboardingTypes.org,
=======
    type: 'type:org',
>>>>>>> 87690145 (Create new onboarding flow)
  },
  {
    value: 'type.archive.person',
    text: 'Something else',
<<<<<<< HEAD
    type: OnboardingTypes.other,
=======
    type: 'type:other',
>>>>>>> 87690145 (Create new onboarding flow)
  },
  {
    value: 'type.archive.person',
    text: "I'm not sure yet",
<<<<<<< HEAD
    type: OnboardingTypes.unsure,
=======
    type: 'type:unsure',
>>>>>>> 87690145 (Create new onboarding flow)
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
<<<<<<< HEAD
  'type:org':
    'Create an archive that preserves the history of an organization or nonprofit.',
  'type:other': '',
  'type:unsure': '',
};
=======
  'type:org': 'Create an archive that preserves the history of an organization or nonprofit.',
  'type:other': '',
  'type:unsure': '',
};
>>>>>>> 87690145 (Create new onboarding flow)
