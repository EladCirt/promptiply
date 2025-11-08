/**
 * Refine commands - main user interface
 */

import * as vscode from 'vscode';
import { RefinementEngine } from '../refinement/engine';
import { ProfileManager } from '../profiles/manager';

export class RefineCommands {
  private engine: RefinementEngine;
  private profileManager: ProfileManager;

  constructor(engine: RefinementEngine, profileManager: ProfileManager) {
    this.engine = engine;
    this.profileManager = profileManager;
  }

  /**
   * Refine selected text
   */
  async refineSelection(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (!text.trim()) {
      vscode.window.showErrorMessage('Please select some text to refine');
      return;
    }

    await this.refineText(text, editor, selection);
  }

  /**
   * Refine entire file
   */
  async refineFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const text = editor.document.getText();

    if (!text.trim()) {
      vscode.window.showErrorMessage('File is empty');
      return;
    }

    const fullRange = new vscode.Range(
      editor.document.positionAt(0),
      editor.document.positionAt(text.length)
    );

    await this.refineText(text, editor, fullRange);
  }

  /**
   * Main refinement logic
   */
  private async refineText(
    text: string,
    editor: vscode.TextEditor,
    range: vscode.Range | vscode.Selection
  ): Promise<void> {
    // Get UI mode preference
    const config = vscode.workspace.getConfiguration('promptiply');
    const uiMode = config.get('ui.defaultMode', 'ask');

    // Ask user if mode is 'ask'
    let selectedMode = uiMode;
    if (uiMode === 'ask') {
      const choice = await vscode.window.showQuickPick(
        [
          { label: '$(replace) Replace Inline', value: 'inline', description: 'Replace text immediately' },
          { label: '$(window) Open in Panel', value: 'webview', description: 'Review before applying' },
          { label: '$(diff) Show Diff', value: 'diff', description: 'Side-by-side comparison' },
          { label: '$(clippy) Copy to Clipboard', value: 'copy', description: 'Just copy, don\'t replace' },
        ],
        {
          placeHolder: 'How would you like to view the refined prompt?',
        }
      );

      if (!choice) {
        return; // User cancelled
      }

      selectedMode = choice.value;
    }

    // Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Refining prompt...',
        cancellable: true,
      },
      async (progress, token) => {
        try {
          const config = RefinementEngine.getConfig();

          // Refine
          const refined = await this.engine.refine(
            text,
            config,
            (message) => {
              progress.report({ message });
            },
            token
          );

          if (token.isCancellationRequested) {
            return;
          }

          // Apply based on selected mode
          switch (selectedMode) {
            case 'inline':
              await this.applyInline(editor, range, refined);
              break;

            case 'webview':
              await this.showInWebview(text, refined, editor, range);
              break;

            case 'diff':
              await this.showDiff(text, refined, editor, range);
              break;

            case 'copy':
              await vscode.env.clipboard.writeText(refined);
              vscode.window.showInformationMessage('✨ Refined prompt copied to clipboard!');
              break;

            default:
              await this.applyInline(editor, range, refined);
          }
        } catch (error: any) {
          vscode.window.showErrorMessage(`Refinement failed: ${error.message}`);
        }
      }
    );
  }

  /**
   * Apply refinement inline (replace immediately)
   */
  private async applyInline(
    editor: vscode.TextEditor,
    range: vscode.Range | vscode.Selection,
    refined: string
  ): Promise<void> {
    await editor.edit(editBuilder => {
      editBuilder.replace(range, refined);
    });

    vscode.window.showInformationMessage('✨ Prompt refined! (Cmd+Z to undo)');
  }

  /**
   * Show refinement in webview panel
   */
  private async showInWebview(
    original: string,
    refined: string,
    editor: vscode.TextEditor,
    range: vscode.Range | vscode.Selection
  ): Promise<void> {
    // TODO: Implement webview panel
    // For now, show a simple input box that allows editing
    const result = await vscode.window.showInputBox({
      prompt: 'Edit the refined prompt or press Enter to apply',
      value: refined,
      valueSelection: [0, 0],
      placeHolder: 'Refined prompt...',
    });

    if (result !== undefined) {
      await editor.edit(editBuilder => {
        editBuilder.replace(range, result);
      });
      vscode.window.showInformationMessage('✨ Prompt applied!');
    }
  }

  /**
   * Show refinement in diff editor
   */
  private async showDiff(
    original: string,
    refined: string,
    editor: vscode.TextEditor,
    range: vscode.Range | vscode.Selection
  ): Promise<void> {
    // Create temporary documents for diff
    const originalUri = vscode.Uri.parse(`promptiply-original:Original Prompt`);
    const refinedUri = vscode.Uri.parse(`promptiply-refined:Refined Prompt`);

    // Register text document content provider
    const provider = new (class implements vscode.TextDocumentContentProvider {
      provideTextDocumentContent(uri: vscode.Uri): string {
        if (uri.scheme === 'promptiply-original') {
          return original;
        }
        if (uri.scheme === 'promptiply-refined') {
          return refined;
        }
        return '';
      }
    })();

    const disposable = vscode.workspace.registerTextDocumentContentProvider(
      'promptiply-original',
      provider
    );
    const disposable2 = vscode.workspace.registerTextDocumentContentProvider(
      'promptiply-refined',
      provider
    );

    try {
      // Show diff
      await vscode.commands.executeCommand(
        'vscode.diff',
        originalUri,
        refinedUri,
        'Promptiply: Original ↔ Refined'
      );

      // Ask if user wants to apply
      const apply = await vscode.window.showInformationMessage(
        'Apply refined prompt?',
        'Apply',
        'Cancel'
      );

      if (apply === 'Apply') {
        await editor.edit(editBuilder => {
          editBuilder.replace(range, refined);
        });
        vscode.window.showInformationMessage('✨ Prompt applied!');
      }
    } finally {
      disposable.dispose();
      disposable2.dispose();
    }
  }
}
