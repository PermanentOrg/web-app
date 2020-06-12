import {
  trigger,
  animate,
  transition,
  style,
  query,
  state
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
export const TWEAKED = 'cubic-bezier(.63,.01,.3,1)';
const slideUpAnimationLength = 500;

export const slideUpAnimation = trigger('slideUpAnimation', [
  transition('* => *', [
    query(
      ':leave',
      [
        style({ transform: 'translateY(0)' }),
        animate(`${slideUpAnimationLength}ms ${TWEAKED}`,
          style({ transform: 'translateY(100vh)' })
        )
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        style({ transform: 'translateY(100vh)' }),
        animate(`${slideUpAnimationLength}ms ${TWEAKED}`,
          style({ transform: 'translateY(0)' })
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

export const ngIfFadeInAnimationSlow = trigger('ngIfFadeInAnimationSlow', [
  transition(
    ':enter',
    [
      style({ opacity: 0 }),
      animate(`500ms ${TWEAKED}`, style({ opacity: '*' }))
    ]
  ),
  transition(
    ':leave',
    [
      style({ opacity: 1 }),
      animate(`500ms ${TWEAKED}`, style({ opacity: '*' }))
    ]
  )
]);

export const ngIfScaleAnimation = trigger('ngIfScaleAnimation', [
  transition(
    ':enter',
    [
      style({ height: '0px', width: '0px', opacity: 0 }),
      animate(`125ms ${TWEAKED}`, style({ height: '*', width: '*' })),
      animate(`125ms ${TWEAKED}`, style({ opacity: 1 })),
    ]
  ),
  transition(
    ':leave',
    [
      style({ height: '*', width: '*', opacity: '*' }),
      animate(`125ms ${TWEAKED}`, style({ opacity: 0 })),
      animate(`125ms ${TWEAKED}`, style({ height: '0px', width: '0px' }))
    ]
  )
]);

export const ngIfScaleAnimationDynamic = trigger('ngIfScaleAnimationDynamic', [
  transition(
    'void => animate',
    [
      style({ height: '0px', width: '0px', opacity: 0 }),
      animate(`125ms ${TWEAKED}`, style({ height: '*', width: '*' })),
      animate(`125ms ${TWEAKED}`, style({ opacity: 1 })),
    ]
  ),
  transition(
    'animate => void',
    [
      style({ height: '*', width: '*', opacity: '*' }),
      animate(`125ms ${TWEAKED}`, style({ opacity: 0 })),
      animate(`125ms ${TWEAKED}`, style({ height: '0px', width: '0px' }))
    ]
  )
]);

export function collapseAnimationCustom(ms: number) {
  return trigger('collapseAnimation', [
    state('closed',
      style({ height: '0px', display: 'none', overflow: 'hidden'})
    ),
    transition(
      'closed => open',
      [
        style({ height: '0px', opacity: 0, display: 'block' }),
        animate(`${ms}ms ${TWEAKED}`, style({ height: '*', width: '*' })),
        animate(`${ms}ms ${TWEAKED}`, style({ opacity: 1 })),
      ]
    ),
    transition(
      'open => closed',
      [
        style({ height: '*', opacity: '*' }),
        animate(`${ms}ms ${TWEAKED}`, style({ opacity: 0 })),
        animate(`${ms}ms ${TWEAKED}`, style({ height: '0px', width: '0px' })),
      ]
    )
  ]);
}
export const collapseAnimation = collapseAnimationCustom(125);

export const ngIfScaleHeightEnterAnimation = trigger('ngIfScaleHeightEnterAnimation', [
  transition(
    ':enter',
    [
      style({ height: '0px', opacity: 0 }),
      animate(`125ms ${TWEAKED}`, style({ height: '*', opacity: 1 })),
    ]
  )
]);

export const ngIfScaleHeightAnimation = trigger('ngIfScaleHeightAnimation', [
  transition(
    ':enter',
    [
      style({ height: '0px' }),
      animate(`250ms ${TWEAKED}`, style({ height: '*' })),
    ]
  ),
  transition(
    ':leave',
    [
      style({ height: '*', opacity: 0 }),
      animate(`250ms ${TWEAKED}`, style({ height: '0px' })),
    ]
  )
]);

export const ngIfSlideInAnimation = trigger('ngIfSlideInAnimation', [
  transition(
    ':enter',
    [
      style({ transform: 'translateX(calc(-100% - 20px))' }),
      animate(`250ms ${TWEAKED}`, style({ transform: '*'}))
    ]
  ),
  transition(
    ':leave',
    [
      style({ transform: '*' }),
      animate(`250ms ${TWEAKED}`, style({ transform: 'translateX(calc(-100% - 20px))'})),
    ]
  )
]);
