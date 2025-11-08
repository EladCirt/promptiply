/**
 * Promptiply VSCode Extension
 * Main entry point
 */

import * as vscode from 'vscode';
import { ProfileManager } from './profiles/manager';
import { RefinementEngine } from './refinement/engine';
import { RefineCommands } from './commands/refine';
import { ProfileCommands } from './commands/profiles';
import { StatusBarManager } from './ui/statusBar';

let statusBarManager: StatusBarManager | undefined;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('Promptiply extension is now active');

  // Initialize managers
  const profileManager = new ProfileManager(context);
  const engine = new RefinementEngine(profileManager);
  const refineCommands = new RefineCommands(engine, profileManager);
  const profileCommands = new ProfileCommands(profileManager);

  // Initialize status bar
  statusBarManager = new StatusBarManager(profileManager);
  await statusBarManager.initialize();
  context.subscriptions.push(statusBarManager);

  // Register commands
  context.subscriptions.push(
    // Refinement commands
    vscode.commands.registerCommand(
      'promptiply.refineSelection',
      () => refineCommands.refineSelection()
    ),
    vscode.commands.registerCommand(
      'promptiply.refineFile',
      () => refineCommands.refineFile()
    ),

    // Profile commands
    vscode.commands.registerCommand(
      'promptiply.switchProfile',
      async () => {
        await profileCommands.switchProfile();
        await statusBarManager?.update();
      }
    ),
    vscode.commands.registerCommand(
      'promptiply.importProfiles',
      () => profileCommands.importProfiles()
    ),
    vscode.commands.registerCommand(
      'promptiply.exportProfiles',
      () => profileCommands.exportProfiles()
    ),
    vscode.commands.registerCommand(
      'promptiply.createProfile',
      async () => {
        await profileCommands.createProfile();
        await statusBarManager?.update();
      }
    ),
    vscode.commands.registerCommand(
      'promptiply.deleteProfile',
      async () => {
        await profileCommands.deleteProfile();
        await statusBarManager?.update();
      }
    ),
    vscode.commands.registerCommand(
      'promptiply.viewProfile',
      () => profileCommands.viewProfile()
    ),

    // Settings commands
    vscode.commands.registerCommand(
      'promptiply.toggleEconomy',
      async () => {
        const config = vscode.workspace.getConfiguration('promptiply');
        const current = config.get('useEconomyModel', true);
        await config.update(
          'useEconomyModel',
          !current,
          vscode.ConfigurationTarget.Global
        );
        await statusBarManager?.update();
        vscode.window.showInformationMessage(
          `Switched to ${!current ? 'Economy' : 'Premium'} mode`
        );
      }
    ),
    vscode.commands.registerCommand(
      'promptiply.openSettings',
      () => {
        vscode.commands.executeCommand(
          'workbench.action.openSettings',
          'promptiply'
        );
      }
    )
  );

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('promptiply')) {
        await statusBarManager?.update();
      }
    })
  );

  // Show welcome message on first install
  const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
  if (!hasShownWelcome) {
    const action = await vscode.window.showInformationMessage(
      'Welcome to Promptiply! Refine your AI prompts for better results.',
      'View Settings',
      'Switch Profile'
    );

    if (action === 'View Settings') {
      vscode.commands.executeCommand('promptiply.openSettings');
    } else if (action === 'Switch Profile') {
      vscode.commands.executeCommand('promptiply.switchProfile');
    }

    await context.globalState.update('hasShownWelcome', true);
  }
}

/**
 * Extension deactivation
 */
export function deactivate() {
  console.log('Promptiply extension is now deactivated');
}
