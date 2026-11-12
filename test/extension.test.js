const assert = require('node:assert/strict');
const { test } = require('node:test');
const { activate } = require('../extension');
const manifest = require('../package.json');

function setup({ missing = [], installed = true, failure } = {}) {
  const handlers = new Map();
  const calls = [];
  const errors = [];
  const logs = [];
  const statuses = [];
  const disposables = [];
  let selection;
  const builtIns = [
    '_manageAccountPreferencesForExtension',
    'workbench.profiles.actions.switchProfile',
    'workbench.profiles.actions.newWindowWithProfile',
    'workbench.profiles.actions.manageProfiles'
  ];
  const disposable = () => {
    const item = { disposed: false, dispose() { this.disposed = true; } };
    disposables.push(item);
    return item;
  };
  const api = {
    StatusBarAlignment: { Right: 2 },
    extensions: { getExtension: id => installed && id === 'GitHub.copilot-chat' ? {} : undefined },
    commands: {
      getCommands: async filterInternal => {
        assert.equal(filterInternal, false);
        return builtIns.filter(command => !missing.includes(command));
      },
      executeCommand: async (...args) => {
        calls.push(args);
        if (failure) throw failure;
      },
      registerCommand: (id, handler) => {
        handlers.set(id, handler);
        return disposable();
      }
    },
    window: {
      createOutputChannel: () => ({ ...disposable(), appendLine: line => logs.push(line) }),
      showErrorMessage: async message => { errors.push(message); },
      createStatusBarItem: () => {
        const item = { ...disposable(), show() { this.visible = true; } };
        statuses.push(item);
        return item;
      },
      showQuickPick: async items => selection === undefined ? undefined : items[selection]
    }
  };
  const context = { subscriptions: [] };
  activate(context, api);
  return {
    handlers, calls, errors, logs, statuses, context,
    select: index => { selection = index; }
  };
}

test('all manifest commands are registered and the one-click button selects an account', async () => {
  const state = setup();
  assert.deepEqual([...state.handlers.keys()].sort(),
    manifest.contributes.commands.map(item => item.command).sort());
  assert.equal(state.statuses[0].visible, true);
  assert.match(state.statuses[0].tooltip, /not per chat/);
  await state.handlers.get(state.statuses[0].command)();
  assert.deepEqual(state.calls, [['_manageAccountPreferencesForExtension', 'GitHub.copilot-chat']]);
  assert.equal(state.errors.length, 0);
});

test('profile actions dispatch to their corresponding built-in commands', async () => {
  const state = setup();
  for (const action of ['switchProfile', 'newProfileWindow', 'manageProfiles']) {
    await state.handlers.get(`copilotAccounts.${action}`)();
  }
  assert.deepEqual(state.calls, [
    ['workbench.profiles.actions.switchProfile'],
    ['workbench.profiles.actions.newWindowWithProfile'],
    ['workbench.profiles.actions.manageProfiles']
  ]);
});

test('menu cancellation does nothing and every menu option dispatches correctly', async () => {
  const state = setup();
  await state.handlers.get('copilotAccounts.menu')();
  assert.deepEqual(state.calls, []);
  for (let index = 0; index < 4; index++) {
    state.select(index);
    await state.handlers.get('copilotAccounts.menu')();
  }
  assert.deepEqual(state.calls, [
    ['_manageAccountPreferencesForExtension', 'GitHub.copilot-chat'],
    ['workbench.profiles.actions.newWindowWithProfile'],
    ['workbench.profiles.actions.switchProfile'],
    ['workbench.profiles.actions.manageProfiles']
  ]);
});

test('missing built-in command is logged and shown with manual recovery instructions', async () => {
  const state = setup({ missing: ['_manageAccountPreferencesForExtension'] });
  await state.handlers.get('copilotAccounts.chooseAccount')();
  assert.deepEqual(state.calls, []);
  assert.match(state.errors[0], /Accounts > Manage Extension Account Preferences/);
  assert.equal(state.logs.length, 1);
});

test('each unavailable profile command has a visible failure instead of a success fallback', async () => {
  for (const action of ['switchProfile', 'newProfileWindow', 'manageProfiles']) {
    const state = setup({ missing: [
      'workbench.profiles.actions.switchProfile',
      'workbench.profiles.actions.newWindowWithProfile',
      'workbench.profiles.actions.manageProfiles'
    ] });
    await state.handlers.get(`copilotAccounts.${action}`)();
    assert.equal(state.errors.length, 1);
    assert.equal(state.logs.length, 1);
    assert.deepEqual(state.calls, []);
  }
});

test('disabled or missing Copilot Chat is reported without changing account preferences', async () => {
  const state = setup({ installed: false });
  await state.handlers.get('copilotAccounts.chooseAccount')();
  assert.match(state.errors[0], /Enable GitHub Copilot Chat/);
  assert.deepEqual(state.calls, []);
});

test('command failures are reported and logged', async () => {
  const state = setup({ failure: new Error('Account preference update failed') });
  await state.handlers.get('copilotAccounts.chooseAccount')();
  assert.match(state.errors[0], /Account preference update failed/);
  assert.match(state.logs[0], /Account preference update failed/);
});

test('all resources are owned by the extension context', () => {
  const state = setup();
  assert.equal(state.context.subscriptions.length, 7);
  for (const subscription of state.context.subscriptions) subscription.dispose();
  assert.ok(state.context.subscriptions.every(item => item.disposed));
});
