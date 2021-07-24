export type IRegex = string | RegExp;

export type IShortAction = string;

export interface IExpandedAction {
  group?: IAction[];

  cases?: {
    [key: string]: any;
  };

  token?: string;

  next?: string;

  switchTo?: string;

  goBack?: number;

  bracket?: string;

  nextEmbedded?: string;

  log?: string;
}

export type IAction =
  | IShortAction
  | IExpandedAction
  | IShortAction[]
  | IExpandedAction[];

export type IShortRule1 = [IRegex];

export type IShortRule2 = [IRegex, IAction];

export type IExpandedRule =
  | {
      regex?: IRegex;
      action?: IAction;
      include?: string;
    }
  | [IRegex, IAction, string];

export type IRule = IShortRule1 | IShortRule2 | IExpandedRule;

export interface IBrackets {
  open: string;
  close: string;
  token: string;
}

export interface ILanguage {
  name: string;
  defaultExtension: string;
  extensions: string[];

  ignoreCase?: boolean;
  defaultToken?: 'source' | 'invalid';
  defaultToken?: string;
  brackets?: IBrackets[];
  start?: string;
  tokenPostfix?: string;

  tokenizer: {
    [name: string]: IRule[];
  };

  [key: string]: any;
}
