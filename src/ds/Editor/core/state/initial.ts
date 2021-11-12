import { Dusty } from '../../../../types';

const editorsInitialState: Dusty.EditorsState = {
  activeEditor: null,
  // 'editor-1': {
  //   element: document.getElementById('editor-1'),
  // },
};

const tabManagersInitialState: Dusty.State['tabManagers'] = {
  // 'editor-1': {
  //   openedTab: '/test.ts',
  //   tabs: ['/test.ts'],
  // },
};

const tabsInitialState: Dusty.TabsState = {
  // '/test.ts': {
  //   path: '/test.ts',
  //   fileName: 'test.ts',
  //   fileContent: '',
  //   isChanged: true,
  //   isSaved: false,
  //   highlightMode: '',
  //   caret: {
  //     line: 1,
  //     column: 1,
  //   },
  // },
};

const workspaceInitialState: Dusty.WorkspaceState = {};

export const initialState: Dusty.State = {
  editors: editorsInitialState,
  tabManagers: tabManagersInitialState,
  tabs: tabsInitialState,
  workspace: workspaceInitialState,
};
