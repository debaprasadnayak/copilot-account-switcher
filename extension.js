// @ts-check

/**
 * @param {import('vscode').ExtensionContext} context
 * @param {typeof import('vscode')} vscode
 */
function activate(context, vscode = require('vscode')) {
  const output = vscode.window.createOutputChannel('Copilot Account Switcher');
  context.subscriptions.push(output);

  /**
   * @param {string} command
   * @param {string} manualSteps
   * @param {unknown[]} args
   */
  async function runBuiltIn(command, manualSteps, ...args) {
    const commands = await vscode.commands.getCommands(false);
    if (!commands.includes(command)) {
      throw new Error(`This VS Code version does not expose the required command. ${manualSteps}`);
    }
    await vscode.commands.executeCommand(command, ...args);
  }

  /** @param {() => Promise<unknown>} action */
  function guarded(action) {
    return async () => {
      try {
        await action();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        output.appendLine(`Account switching failed: ${message}`);
        await vscode.window.showErrorMessage(`Copilot Account Switcher: ${message}`);
      }
    };
  }

  const chooseAccount = () => {
    if (!vscode.extensions.getExtension('GitHub.copilot-chat')) {
      throw new Error('Enable GitHub Copilot Chat in this profile, sign in, then try again.');
    }
    return runBuiltIn(
      '_manageAccountPreferencesForExtension',
      'Use Accounts > Manage Extension Account Preferences > GitHub Copilot Chat.',
      'GitHub.copilot-chat'
    );
  };

  const switchProfile = () => runBuiltIn(
    'workbench.profiles.actions.switchProfile',
    'Run Profiles: Switch Profile from the Command Palette.'
  );
  const newProfileWindow = () => runBuiltIn(
    'workbench.profiles.actions.newWindowWithProfile',
    'Use File > New Window with Profile.'
  );
  const manageProfiles = () => runBuiltIn(
    'workbench.profiles.actions.manageProfiles',
    'Open the Profiles editor from the Manage menu.'
  );

  const options = [
    {
      label: 'Choose Copilot account',
      description: 'Applies to this workspace/profile, not one chat',
      action: chooseAccount
    },
    {
      label: 'Open separate profile window',
      description: 'Keep work and personal chats in separate windows',
      action: newProfileWindow
    },
    {
      label: 'Switch profile in this window',
      description: 'Changes the window profile, not just the active chat',
      action: switchProfile
    },
    {
      label: 'Create or manage profiles',
      description: 'Set up a profile for each account',
      action: manageProfiles
    }
  ];

  async function showMenu() {
    const selection = await vscode.window.showQuickPick(options, {
      title: 'Copilot accounts — workspace/profile scope',
      placeHolder: 'Each account needs its own Copilot entitlement. Chats are not account-isolated.'
    });
    if (selection) {
      await selection.action();
    }
  }

  const actions = {
    'copilotAccounts.chooseAccount': chooseAccount,
    'copilotAccounts.menu': showMenu,
    'copilotAccounts.switchProfile': switchProfile,
    'copilotAccounts.newProfileWindow': newProfileWindow,
    'copilotAccounts.manageProfiles': manageProfiles
  };
  for (const [command, action] of Object.entries(actions)) {
    context.subscriptions.push(vscode.commands.registerCommand(command, guarded(action)));
  }

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
  status.name = 'Copilot Account Switcher';
  status.text = '$(account) Copilot Accounts';
  status.tooltip = 'Choose Copilot account for this workspace/profile (not per chat). More options in the Command Palette.';
  status.command = 'copilotAccounts.chooseAccount';
  status.accessibilityInformation = {
    label: 'Choose Copilot account for this workspace or profile'
  };
  status.show();
  context.subscriptions.push(status);
}

module.exports = { activate };
