export interface ShepherdStep {
  id: string;
  attachTo: AttachTo;
  beforeShowPromise?: ShowOrHideOrBeforeShowPromise;
  buttons?: (ButtonsEntity)[] | null;
  cancelIcon?: CancelIcon;
  classes?: string;
  highlightClass?: string;
  scrollTo?: boolean;
  title?: string;
  text?: (string)[] | null;
  when?: When;
}
export interface AttachTo {
  element: string;
  on: 'left' | 'right' | 'top' | 'bottom';
}
export interface ShowOrHideOrBeforeShowPromise {
}
export interface ButtonsEntity {
  classes: string;
  text: string;
  type: string;
}
export interface CancelIcon {
  enabled: boolean;
}
export interface When {
  show: ShowOrHideOrBeforeShowPromise;
  hide: ShowOrHideOrBeforeShowPromise;
}
