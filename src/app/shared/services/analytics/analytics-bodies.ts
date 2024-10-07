import { PermanentEvent } from '../event/event-types';

type AnalyticsLookupTable = {
  [T in PermanentEvent['entity']]?: {
    [U in PermanentEvent['action']]?: {
      event: string;
      data: Record<string, unknown>;
    };
  };
};

function createPageViewBody(page: string) {
  return {
    event: 'Page View',
    data: { page },
  };
}

export const AnalyticsBodies: AnalyticsLookupTable = {
  account: {
    create: {
      event: 'Sign up',
      data: {},
    },
    initiate_upload: {
      event: 'Initiate Upload',
      data: {
        workspace: 'Public Files',
      },
    },
    login: {
      event: 'Sign in',
      data: {},
    },
    open_account_menu: createPageViewBody('Account Menu'),
    open_archive_menu: createPageViewBody('Archive Menu'),
    open_archive_profile: createPageViewBody('Archive Profile'),
    open_archive_steward: {
      event: 'View Archive Steward',
      data: {
        page: 'Archive Steward',
      },
    },
    open_billing_info: {
      event: 'View Billing Info',
      data: {
        page: 'Billing Info',
      },
    },
    open_legacy_contact: {
      event: 'View Legacy Contact',
      data: {
        page: 'Legacy Contact',
      },
    },
    open_login_info: {
      event: 'View Login Info',
      data: {
        page: 'Login info',
      },
    },
    open_promo_entry: createPageViewBody('Redeem Gift'),
    open_verify_email: {
      event: 'Verify Email',
      data: {},
    },
    open_storage_modal: createPageViewBody('Storage'),
    purchase_storage: {
      event: 'Purchase Storage',
      data: {},
    },
    skip_create_archive: {
      event: 'Skip Create Archive',
      data: {},
    },
    skip_goals: {
      event: 'Skip goals',
      data: {},
    },
    skip_why_permanent: {
      event: 'Skip why permanent',
      data: {},
    },
    start_onboarding: {
      event: 'Onboarding: start',
      data: {},
    },
    submit_goals: {
      event: 'Onboarding: goals',
      data: {},
    },
    submit_promo: {
      event: 'Redeem Gift',
      data: {},
    },
    submit_reasons: {
      event: 'Onboarding: reasons',
      data: {},
    },
    open_private_workspace: {
      event: 'View Private Workspace',
      data: {
        workspace: 'Private Files',
      },
    },
    open_public_workspace: {
      event: 'View Public Workspace',
      data: {
        workspace: 'Public Files',
      },
    },
    open_shared_workspace: {
      event: 'View Shared Workspace',
      data: {
        workspace: 'Shared Files',
      },
    },
    open_public_gallery: {
      event: 'View Public Gallery',
      data: {
        page: 'Public Gallery',
      },
    },
    open_redeem_gift: {
      event: 'View Redeem Gift',
      data: {
        page: 'Redeem Gift',
      },
    },
    open_share_modal: {
      event: 'Share',
      data: {},
    },
    copy_share_link: {
      event: 'Copy Share Link',
      data: {},
    },
  },
  directive: {
    create: {
      event: 'Edit Archive Steward',
      data: {},
    },
    update: {
      event: 'Edit Archive Steward',
      data: {},
    },
  },
  legacy_contact: {
    create: {
      event: 'Edit Legacy Contact',
      data: {},
    },
    update: {
      event: 'Edit Legacy Contact',
      data: {},
    },
  },
  profile_item: {
    update: {
      event: 'Edit Archive Profile',
      data: {},
    },
  },
  record: {
    submit: {
      event: 'Finalize Upload',
      data: {
        workspace: 'Public Files',
      },
    },
  },
};
