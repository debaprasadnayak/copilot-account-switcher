# Copilot Account Switcher

A VS Code extension with a status-bar button and keyboard shortcut to
GitHub Copilot Chat's account preferences, plus profile/window shortcuts.

**This does not switch accounts per individual built-in chat.** VS Code saves
Copilot's account preference per workspace and profile. Changing that preference
is not scoped to the active conversation. This extension does not bind an account
to a chat, transfer licenses, verify entitlements, or merge quotas.

## Install

1. In VS Code, run **Extensions: Install from VSIX...**.
2. Select `copilot-account-switcher-0.1.0.vsix` from this folder.
3. Enable GitHub Copilot Chat in the profile and sign in normally.
4. Click **Copilot Accounts** in the status bar and choose your account.

The shortcut is **Cmd+Alt+Shift+A** on macOS or **Ctrl+Alt+Shift+A** on
Windows/Linux. Change it in Keyboard Shortcuts if it conflicts with another tool.
The picker may also offer another sign-in; authentication is managed by VS Code.

## Work and personal accounts side by side

1. Run **Copilot Accounts: Create or Manage Profiles**.
2. Create profiles such as **Work Copilot** and **Personal Copilot**.
3. Install/enable GitHub Copilot Chat and this extension in both profiles.
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
GitHub or Microsoft product. No open-source license is provided (`UNLICENSED`).
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

## Development

Requires Node.js 22+ and npm. Install dependencies with `npm install`, then use
`npm run check`, `npm test`, and `npm run package`. Packaging also runs checks and
tests. Open this folder in VS Code and press F5 to launch an Extension Development
Host.

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
