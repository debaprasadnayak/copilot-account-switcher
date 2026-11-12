# Copilot Account and Profile Shortcuts

A VS Code extension with a status-bar button and keyboard shortcut to
GitHub Copilot Chat's account preferences, plus profile/window shortcuts.

**This does not switch accounts per individual built-in chat.** VS Code saves
Copilot's account preference per workspace and profile. Changing that preference
is not scoped to the active conversation. This extension does not bind an account
to a chat, transfer licenses, verify entitlements, or merge quotas.

## Install

1. In VS Code, open **Extensions** with **Cmd+Shift+X** on macOS or
   **Ctrl+Shift+X** on Windows/Linux.
2. Search for `@id:debaprasadnayak.copilot-account-profile-switcher`.
3. Select **Copilot Account and Profile Shortcuts** by **Deba Prasad Nayak**
   and click **Install**. Review any publisher trust prompt before continuing.
4. Install or enable **GitHub Copilot Chat** in the same profile and complete
   its sign-in/setup. Each account you use must have a valid Copilot entitlement.
5. Open your intended workspace, click **Copilot Accounts** in the status bar,
   and choose the GitHub account to use for this workspace/profile.

You can also open the [Visual Studio Marketplace listing](https://marketplace.visualstudio.com/items?itemName=debaprasadnayak.copilot-account-profile-switcher),
click **Install**, allow your browser to open Visual Studio Code, and complete
installation in VS Code. No repository clone or VSIX download is needed.

Alternatively, open **Quick Open** with **Cmd+P** on macOS or **Ctrl+P** on
Windows/Linux and enter:

```text
ext install debaprasadnayak.copilot-account-profile-switcher
```

The shortcut is **Cmd+Alt+Shift+A** on macOS or **Ctrl+Alt+Shift+A** on
Windows/Linux. Change it in Keyboard Shortcuts if it conflicts with another tool.
The picker may also offer another sign-in; authentication is managed by VS Code.

## Work and personal accounts side by side

1. Run **Copilot Accounts: Create or Manage Profiles**.
2. Create profiles such as **Work Copilot** and **Personal Copilot**.
3. In each profile, use the Extensions view to install or enable GitHub Copilot
   Chat and **Copilot Account and Profile Shortcuts**, following the steps above.
4. Run **Copilot Accounts: Open Separate Profile Window** and select a profile.
5. In each window, open the intended workspace, click **Copilot Accounts**, and
   select the intended GitHub account. Repeat for other workspaces as needed.
6. Check the selected account and organization policies before sending prompts.
   Start new chats in the appropriate window.

Use separate windows for concurrent conversations under different accounts.
**Switch Profile in This Window** changes the whole window's profile; it is not a
per-chat switch. Profiles are configuration boundaries, not separate OS users or
credential security boundaries. This extension does not enforce account isolation.
Do not assume an existing chat retains the account that was selected when it began.

The button is deliberately not labelled with a purported "active account":
the public authentication API does not expose Copilot Chat's selected account to
other extensions. A list of signed-in GitHub accounts would not prove which
account Copilot is actually using.

## Commands

- **Copilot Accounts: Choose Account for This Workspace/Profile** — direct account picker.
- **Copilot Accounts: Show Switching Options** — account/profile action menu.
- **Copilot Accounts: Switch Profile in This Window**.
- **Copilot Accounts: Open Separate Profile Window**.
- **Copilot Accounts: Create or Manage Profiles**.

## Compatibility and privacy

Requires VS Code 1.96 or newer. This is an independent extension, not an official
GitHub or Microsoft product. Licensed under the [MIT License](./LICENSE).
The minimum version is an engine baseline, not a guarantee that every built-in
command exists on every build.

VS Code does not expose a public API to set another extension's account
preference. This utility invokes VS Code's own account-preferences UI using the
internal `_manageAccountPreferencesForExtension` command, targeting
`GitHub.copilot-chat`. Profile shortcuts also invoke workbench commands. These
command IDs are implementation details and can change. Every invocation checks
availability and shows manual recovery instructions when unavailable.

The extension does not read/store tokens, request authentication scopes, inspect
chat content, modify settings or credential files, or make network requests.
VS Code and Copilot continue to handle authentication and service requests.
Each selected account needs its own valid Copilot entitlement. Organization
policies and data-handling restrictions still apply, especially when switching
from a work account to a personal account.

## Updates and support

VS Code normally updates Marketplace extensions automatically unless you have
disabled automatic updates. To update manually, open the Extensions view, select
this extension, and click **Update** when available.

Report problems through [GitHub Issues](https://github.com/debaprasadnayak/copilot-account-switcher/issues).
Include your VS Code version and the command that failed. Do not include tokens,
private chat content, or other sensitive information.

## Development

Requires Node.js 22+ and npm. Install dependencies with `npm install`, then use
`npm run check`, `npm test`, and `npm run package`. Packaging also runs checks and
tests. Open this folder in VS Code and press F5 to launch an Extension Development
Host.

VSIX installation is only needed for a local development build: run
`npm run package`, then use **Extensions: Install from VSIX...** to select the
generated package. Store users should follow the Marketplace installation steps
above.

Automated tests mock the VS Code boundary and cover dispatch, cancellation,
unavailable commands, errors, and disposal. They do not validate real sign-in,
license selection, or account changes in a live Extension Host.

Manual verification after installation:

1. Click the button; confirm Copilot Chat's account picker opens.
2. Select a different entitled account and verify it in VS Code/Copilot.
3. Cancel the picker and confirm no preference change.
4. Open a second profile window, choose its account, and check each window's
   preference independently.
5. Confirm switching one window's profile is not presented as changing one chat.

## References

- [VS Code: Copilot account selection per workspace/profile](https://code.visualstudio.com/docs/copilot/setup#_use-a-different-github-account-per-workspace-or-profile)
- [VS Code profiles](https://code.visualstudio.com/docs/configure/profiles)
- [VS Code authentication API](https://code.visualstudio.com/api/references/vscode-api#authentication)
