import {
  trigger,
  animate,
  transition,
  style,
  query
} from '@angular/animations';

const animationLength = 750;

const FULLSCREEN = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  'z-index': 10
};

const EASE_IN_QUART = 'cubic-bezier(0.5, 0, 0.75, 0)';
const EASE_OUT_QUART = 'cubic-bezier(0.25, 1, 0.5, 1)';
const EASE_IN_SINE = 'cubic-bezier(0.12, 0, 0.39, 0)';
const EASE_OUT_SINE = 'cubic-bezier(0.61, 1, 0.88, 1)';

const TAYLOR = 'cubic-bezier(.77, 0, .175, 1)';
const TWEAKED = 'cubic-bezier(.63,.01,.3,1)';
const slideUpAnimationLength = 500;

export const slideUpAnimation = trigger('slideUpAnimation', [
  transition('* => *', [
    query(
      ':leave',
      [
        style({ ...FULLSCREEN, transform: 'translateY(0)' }),
        animate(`${slideUpAnimationLength}ms ${TWEAKED}`,
          style({ ...FULLSCREEN, transform: 'translateY(100vh)' })
        )
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        style({ ...FULLSCREEN, transform: 'translateY(100vh)' }),
        animate(`${slideUpAnimationLength}ms ${TWEAKED}`,
          style({ ...FULLSCREEN, transform: 'translateY(0)' })
        )
      ],
      { optional: true }
    )
  ])
]);

export const fadeAnimation = trigger('fadeAnimation', [
  // The '* => *' will trigger the animation to change between any two states
  transition('* => *', [
    // The query function has three params.
    // First is the event, so this will apply on entering or when the element is added to the DOM.
    // Second is a list of styles or animations to apply.
    // Third we add a config object with optional set to true, this is to signal
    // angular that the animation may not apply as it may or may not be in the DOM.
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    query(
      ':leave',
      // here we apply a style and use the animate function to apply the style over 0.3 seconds
      [style({ opacity: 1 }), animate('0.3s', style({ opacity: 0 }))],
      { optional: true }
    ),
    query(
      ':enter',
      [style({ opacity: 0 }), animate('0.3s', style({ opacity: 1 }))],
      { optional: true }
    )
  ])
]);

export const ngIfFadeInAnimation = trigger('ngIfFadeInAnimation', [
  transition(
    ':enter',
    [
      style({ opacity: 0 }),
      animate(`125ms ${TWEAKED}`, style({ opacity: 1 }))
    ]
  ),
  transition(
    ':leave',
    [
      style({ opacity: 1 }),
      animate(`125ms ${TWEAKED}`, style({ opacity: 0 }))
    ]
  )
]);

export const ngIfScaleAnimation = trigger('ngIfScaleAnimation', [
  transition(
    ':enter',
    [
      style({ height: '0px', opacity: 0 }),
      animate(`125ms ${TWEAKED}`, style({ height: '*' })),
      animate(`125ms ${TWEAKED}`, style({ opacity: 1 })),
    ]
  ),
  transition(
    ':leave',
    [
      style({ height: '*', opacity: '*' }),
      animate(`125ms ${TWEAKED}`, style({ opacity: 0 })),
      animate(`125ms ${TWEAKED}`, style({ height: '0px' }))
    ]
  )
]);
