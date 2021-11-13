import { Dusty } from '../../../../types';

const editorsInitialState: Dusty.EditorsState = {
  activeEditor: null,
};
const tabManagersInitialState: Dusty.State['tabManagers'] = {};
const tabsInitialState: Dusty.TabsState = {};
const workspaceInitialState: Dusty.WorkspaceState = {};

export const initialState: Dusty.State = {
  editors: editorsInitialState,
  tabManagers: tabManagersInitialState,
  tabs: tabsInitialState,
  workspace: workspaceInitialState,
};
