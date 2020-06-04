import { EventParams } from './google-analytics.service';

interface KeyedEventDict {
  key: string;
  params: EventParams;
}

interface NestedEventDict {
  [key: string]: {
    [key: string]: KeyedEventDict
  };
}

interface SimpleEventDict {
  [key: string]: EventParams;
}

export const SHARE_EVENTS: NestedEventDict = {
  ShareByRelationship: {
    initiated: { 'key': 'Evt-Sh10', 'params': { hitType: 'event', eventCategory: 'Share by relationship', eventAction: 'initiated' } },
    previewed: { 'key': 'Evt-Sh11', 'params': { hitType: 'event', eventCategory: 'Share by relationship', eventAction: 'previewed' } },
    signup: { 'key': 'Evt-Sh12', 'params': { hitType: 'event', eventCategory: 'Share by relationship', eventAction: 'signup' } },
    viewed: { 'key': 'Evt-Sh13', 'params': { hitType: 'event', eventCategory: 'Share by relationship', eventAction: 'viewed' } },
    reshare: { 'key': 'Evt-Sh14', 'params': { hitType: 'event', eventCategory: 'Share by relationship', eventAction: 'reshared' } }
  },
  ShareByInvite: {
    initiated: { 'key': 'Evt-Sh20', 'params': { hitType: 'event', eventCategory: 'Share by invite', eventAction: 'initiated' } },
    previewed: { 'key': 'Evt-Sh21', 'params': { hitType: 'event', eventCategory: 'Share by invite', eventAction: 'previewed' } },
    signup: { 'key': 'Evt-Sh22', 'params': { hitType: 'event', eventCategory: 'Share by invite', eventAction: 'signup' } },
    viewed: { 'key': 'Evt-Sh23', 'params': { hitType: 'event', eventCategory: 'Share by invite', eventAction: 'viewed' } },
    reshare: { 'key': 'Evt-Sh24', 'params': { hitType: 'event', eventCategory: 'Share by invite', eventAction: 'reshared' } }
  },
  ShareByAccountNoRel: {
    initiated: { 'key': 'Evt-Sh30', 'params': { hitType: 'event', eventCategory: 'Share by account no rel', eventAction: 'initiated' } },
    previewed: { 'key': 'Evt-Sh31', 'params': { hitType: 'event', eventCategory: 'Share by account no rel', eventAction: 'previewed' } },
    signup: { 'key': 'Evt-Sh32', 'params': { hitType: 'event', eventCategory: 'Share by account no rel', eventAction: 'signup' } },
    viewed: { 'key': 'Evt-Sh33', 'params': { hitType: 'event', eventCategory: 'Share by account no rel', eventAction: 'viewed' } },
    reshare: { 'key': 'Evt-Sh34', 'params': { hitType: 'event', eventCategory: 'Share by account no rel', eventAction: 'reshared' } }
  },
  ShareByUrl: {
    initiated: { 'key': 'Evt-Sh40', 'params': { hitType: 'event', eventCategory: 'Share by url', eventAction: 'initiated' } },
    previewed: { 'key': 'Evt-Sh41', 'params': { hitType: 'event', eventCategory: 'Share by url', eventAction: 'previewed' } },
    signup: { 'key': 'Evt-Sh42', 'params': { hitType: 'event', eventCategory: 'Share by url', eventAction: 'signup' } },
    viewed: { 'key': 'Evt-Sh43', 'params': { hitType: 'event', eventCategory: 'Share by url', eventAction: 'viewed' } },
    reshare: { 'key': 'Evt-Sh44', 'params': { hitType: 'event', eventCategory: 'Share by url', eventAction: 'reshared' } }
  }
};

export const PUBLISH_EVENTS: NestedEventDict = {
  PublishByUrl: {
    initiated: { 'key': 'Evt-Pu40', 'params': { hitType: 'event', eventCategory: 'Publish by url', eventAction: 'initiated' } },
    getLink: { 'key': 'Evt-Pu41', 'params': { hitType: 'event', eventCategory: 'Publish by url', eventAction: 'get link' } },
    viewed: { 'key': 'Evt-Pu42', 'params': { hitType: 'event', eventCategory: 'Publish by url', eventAction: 'viewed' } },
    uploaded: { 'key': 'Evt-Pu43', 'params': { hitType: 'event', eventCategory: 'Publish by url', eventAction: 'uploaded' } },
    reshare: { 'key': 'Evt-Pu422', 'params': { hitType: 'event', eventCategory: 'Publish by url', eventAction: 'reshared' } },
    signup: { 'key': 'Evt-Pu423', 'params': { hitType: 'event', eventCategory: 'Publish by url', eventAction: 'signup' } },
  }
};

export const BETA_EVENTS = {
  optIn: {
    hitType: 'event',
    eventCategory: 'Beta UI',
    eventAction: 'Opt in'
  },
  optOut: {
    hitType: 'event',
    eventCategory: 'Beta UI',
    eventAction: 'Opt out'
  }
};

export const EVENTS = {
  SHARE: SHARE_EVENTS,
  PUBLISH: PUBLISH_EVENTS,
  BETA: BETA_EVENTS
};

