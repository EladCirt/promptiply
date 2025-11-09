/**
 * Chat participant for refining prompts directly in AI chats
 */

import * as vscode from 'vscode';
import { RefinementEngine } from '../refinement/engine';
import { ProfileManager } from '../profiles/manager';
import { HistoryManager } from '../history/manager';

export class PromptiplyChat {
  private engine: RefinementEngine;
  private profileManager: ProfileManager;
  private historyManager: HistoryManager;
  private participant: vscode.ChatParticipant | undefined;

  constructor(
    engine: RefinementEngine,
    profileManager: ProfileManager,
    historyManager: HistoryManager
  ) {
    this.engine = engine;
    this.profileManager = profileManager;
    this.historyManager = historyManager;
  }

  /**
   * Register the chat participant
   */
  register(): vscode.Disposable {
    // Create chat participant
    this.participant = vscode.chat.createChatParticipant('promptiply.refine', async (request, context, stream, token) => {
      try {
        // Get the prompt from the request
        const prompt = request.prompt.trim();

        if (!prompt) {
          stream.markdown('Please provide a prompt to refine. Usage: `@promptiply <your prompt>`');
          return;
        }

        // Show that we're working
        stream.progress('Refining your prompt...');

        // Get configuration
        const config = RefinementEngine.getConfig();

        // Refine the prompt
        const result = await this.engine.refine(
          prompt,
          config,
          (message) => {
            stream.progress(message);
          },
          token
        );

        if (token.isCancellationRequested) {
          return;
        }

        // Save to history
        const profile = await this.profileManager.getActiveProfile();
        await this.historyManager.addEntry({
          originalPrompt: prompt,
          refinedPrompt: result.refinedPrompt,
          profile: profile?.name,
          mode: config.mode,
          isEconomy: config.useEconomyModel,
          tokenUsage: result.tokenUsage,
          topics: result.topics,
        });

        // Format the response
        stream.markdown('## ✨ Refined Prompt\n\n');
        stream.markdown('```\n' + result.refinedPrompt + '\n```\n\n');

        // Show metadata
        const metadata: string[] = [];
        if (profile) {
          metadata.push(`Profile: **${profile.name}**`);
        }
        metadata.push(`Mode: **${config.mode}**`);
        metadata.push(`Model: **${config.useEconomyModel ? 'Economy' : 'Premium'}**`);

        if (result.tokenUsage) {
          metadata.push(`Tokens: **${result.tokenUsage.input + result.tokenUsage.output}**`);
        }

        if (metadata.length > 0) {
          stream.markdown('\n---\n');
          stream.markdown(metadata.join(' • '));
        }

        // Show topics if available
        if (result.topics && result.topics.length > 0) {
          stream.markdown('\n\n**Topics:** ' + result.topics.map(t => `\`${t}\``).join(', '));
        }

        // Add follow-up actions
        stream.button({
          command: 'promptiply.copyLastRefinement',
          title: '📋 Copy Refined Prompt',
          arguments: [result.refinedPrompt]
        });

        stream.button({
          command: 'promptiply.switchProfile',
          title: '👤 Change Profile'
        });

      } catch (error: any) {
        stream.markdown('❌ **Refinement failed:** ' + error.message);
        stream.markdown('\n\nTry:\n- Checking your API keys in settings\n- Switching to a different mode (VSCode LM, Ollama, etc.)\n- Running `Promptiply: Open Settings`');
      }
    });

    // Set participant metadata
    this.participant.iconPath = vscode.Uri.file('media/icon.png');

    return this.participant;
  }
}

/**
 * Register copy command for chat buttons
 */
export function registerChatCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('promptiply.copyLastRefinement', async (text: string) => {
      await vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage('📋 Refined prompt copied to clipboard!');
    })
  );
}
