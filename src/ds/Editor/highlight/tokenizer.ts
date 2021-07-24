import type {
  ILanguage,
  IRegex,
  IRule,
  IAction,
  IShortAction,
  IExpandedAction,
} from './languages/language';

export interface IParsed {
  regex?: IRegex;
  action?: IAction;
  include?: string;
  included?: IParsed[];
  next?: string;
}

export class Tokenizer {
  private _mode: ILanguage;

  constructor(mode: ILanguage) {
    this._mode = mode;
  }

  public parseMode(): IParsed[] {
    let result: IParsed[] = [];

    this._mode['tokenizer']['root'].forEach((rule: IRule) => {
      result.push(this._chechRule(rule));
    });

    return result;
  }

  private _chechRule(rule: IRule): IParsed {
    const parsed: IParsed = {};

    if (!Array.isArray(rule)) {
      if (rule.regex) {
        parsed.regex = this._checkRegex(rule.regex);
      }

      if (rule.action) {
        parsed.action = this._checkAction(rule.action);
      }

      if (rule.include) {
        if (
          rule.include === '@pop' ||
          rule.include === '@push' ||
          rule.include === '@popall'
        )
          parsed.next = rule.include;
        else parsed.include = rule.include;
      }

      if (
        parsed.include &&
        parsed.include !== '@pop' &&
        parsed.include !== '@push' &&
        parsed.include !== '@popall'
      ) {
        let included: IRule | IRule[] | IRegex | string[] | null =
          this._include(parsed.include);

        parsed.included = [];

        if (Array.isArray(included)) {
          (included as any[]).forEach((includedRule: IRule) => {
            parsed.included.push(this._chechRule(includedRule));
          });
        } else {
          parsed.included.push(included as any);
        }
      }
    } else {
      parsed.regex = this._checkRegex(rule[0]);

      if (rule[1]) {
        parsed.action = this._checkAction(rule[1]);
      }

      // @ts-ignore
      if (rule[1].next) {
        // @ts-ignore
        parsed.next = rule[1].next;
      }

      if (rule[2]) {
        if (rule[2] === '@pop' || rule[2] === '@push' || rule[2] === '@popall')
          parsed.next = rule[2];
        else parsed.include = rule[2];
      }

      if (
        parsed.include &&
        parsed.include !== '@pop' &&
        parsed.include !== '@push' &&
        parsed.include !== '@popall'
      ) {
        let included: IRule | IRule[] | IRegex | string[] | null =
          this._include(parsed.include);

        parsed.included = [];

        if (Array.isArray(included)) {
          (included as any[]).forEach((includedRule: IRule) => {
            parsed.included.push(this._chechRule(includedRule));
          });
        } else {
          parsed.included.push(included as any);
        }
      }
    }

    return parsed;
  }

  private _checkExpandedAction(
    action: IExpandedAction | IExpandedAction[]
  ): IExpandedAction | IExpandedAction[] {
    function check(_action: IExpandedAction): IExpandedAction {
      if (_action.group) {
        let groupActions: IAction[] = [];

        _action.group.forEach((groupAction: IAction) =>
          groupActions.push(this._checkAction(groupAction))
        );

        _action.group = groupActions;
      }

      return _action;
    }

    if (Array.isArray(action)) {
      let actions: IExpandedAction[] = [];

      action.forEach((_action) => {
        actions.push(check(_action));
      });

      return actions;
    } else {
      return check(action);
    }
  }

  private _checkAction(action: IAction): IAction {
    if (
      typeof action === 'string' ||
      (Array.isArray(action) && typeof action[0] === 'string')
    ) {
      return action as IShortAction | IShortAction[];
    }
    return this._checkExpandedAction(
      action as IExpandedAction | IExpandedAction[]
    );
  }

  private _checkRegex(regex: IRegex): IRegex {
    let stringRegex = typeof regex === 'string' ? regex : String(regex);

    const matches = stringRegex.match(/@(\w+)/g);

    // check imports in regex
    if (matches) {
      matches.forEach((match: string) => {
        let imported = this._importRegex(match.split('@')[1]);

        if (imported) {
          imported = imported.toString();

          stringRegex = stringRegex.replace(
            match,
            imported.slice(1, imported.length - 1) // removing "/.../" from imported regex
          );
        }
      });
    }

    try {
      return new RegExp(stringRegex.slice(1, stringRegex.length - 1));
    } catch (error) {
      return stringRegex;
    }
  }

  private _importRegex(name: string): IRegex | null {
    return this._mode[name] || null;
  }

  private _include(state: string): IRule | IRule[] | IRegex | string[] {
    if (state.startsWith('@')) {
      state = state.split('@')[1];
    }

    if (this._mode[state]) return this._mode[state];
    else if (this._mode.tokenizer[state]) return this._mode.tokenizer[state];
    else return;
  }
}
