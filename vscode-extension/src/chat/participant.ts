/**
 * Chat participant for refining prompts directly in AI chats
 */

import * as vscode from 'vscode';
import { RefinementEngine } from '../refinement/engine';
import { ProfileManager } from '../profiles/manager';
import { HistoryManager } from '../history/manager';
import { ProfileRecommender } from '../profiles/recommender';

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
        // Check for slash commands
        const command = request.command;

        // Get the prompt from the request
        const prompt = request.prompt.trim();

        if (!prompt) {
          this.showHelp(stream);
          return;
        }

        // Handle special commands
        if (command === 'profile') {
          await this.handleProfileSwitch(stream, prompt);
          return;
        }

        if (command === 'help') {
          this.showHelp(stream);
          return;
        }

        // Show that we're working
        stream.progress('Analyzing your prompt...');

        // Get configuration
        const config = RefinementEngine.getConfig();
        let profile = await this.profileManager.getActiveProfile();

        // Check if recommendations are enabled and no profile is active
        const recommendConfig = vscode.workspace.getConfiguration('promptiply');
        const showRecommendations = recommendConfig.get<boolean>('recommendations.enabled', true);

        if (showRecommendations && !profile) {
          const profiles = await this.profileManager.getProfiles();
          const recommendation = ProfileRecommender.recommend(prompt, profiles.list);

          if (recommendation.profile && recommendation.confidence > 0.5) {
            stream.markdown(`💡 **Recommended Profile:** ${recommendation.profile.name}\n`);
            stream.markdown(`*${recommendation.reason}* (${Math.round(recommendation.confidence * 100)}% confidence)\n\n`);

            stream.button({
              command: 'promptiply.chatRefineWithSpecificProfile',
              title: `✨ Use ${recommendation.profile.name}`,
              arguments: [prompt, recommendation.profile.id]
            });

            stream.markdown('\n\n');
          }
        }

        stream.progress('Refining your prompt...');

        // Calculate original stats
        const originalChars = prompt.length;
        const originalWords = prompt.split(/\s+/).filter(w => w.length > 0).length;

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
        await this.historyManager.addEntry({
          originalPrompt: prompt,
          refinedPrompt: result.refinedPrompt,
          profile: profile?.name,
          mode: config.mode,
          isEconomy: config.useEconomyModel,
          tokenUsage: result.tokenUsage,
          topics: result.topics,
        });

        // Calculate refined stats
        const refinedChars = result.refinedPrompt.length;
        const refinedWords = result.refinedPrompt.split(/\s+/).filter(w => w.length > 0).length;

        // Format the response with before/after
        stream.markdown('## 📝 Original Prompt\n\n');
        stream.markdown('```\n' + prompt + '\n```\n');
        stream.markdown(`*${originalWords} words, ${originalChars} characters*\n\n`);

        stream.markdown('---\n\n');

        stream.markdown('## ✨ Refined Prompt\n\n');
        stream.markdown('```\n' + result.refinedPrompt + '\n```\n');
        stream.markdown(`*${refinedWords} words, ${refinedChars} characters*\n\n`);

        // Show improvement stats
        const wordIncrease = refinedWords - originalWords;
        const charIncrease = refinedChars - originalChars;
        if (wordIncrease > 0 || charIncrease > 0) {
          stream.markdown(`📊 **Enhanced:** +${wordIncrease} words, +${charIncrease} characters\n\n`);
        }

        // Show metadata
        stream.markdown('---\n\n');
        const metadata: string[] = [];
        if (profile) {
          metadata.push(`👤 **${profile.name}**`);
        } else {
          metadata.push(`👤 **No Profile**`);
        }
        metadata.push(`⚙️ **${config.mode}**`);
        metadata.push(`${config.useEconomyModel ? '💰 Economy' : '💎 Premium'}`);

        if (result.tokenUsage) {
          metadata.push(`🎯 ${result.tokenUsage.input + result.tokenUsage.output} tokens`);
        }

        stream.markdown(metadata.join(' • ') + '\n\n');

        // Show topics if available
        if (result.topics && result.topics.length > 0) {
          stream.markdown('🏷️ **Topics:** ' + result.topics.map(t => `\`${t}\``).join(', ') + '\n\n');
        }

        // Add follow-up actions
        stream.button({
          command: 'promptiply.sendRefinedToChat',
          title: '🚀 Send Refined to Chat',
          arguments: [result.refinedPrompt]
        });

        stream.button({
          command: 'promptiply.copyLastRefinement',
          title: '📋 Copy Refined',
          arguments: [result.refinedPrompt]
        });

        stream.button({
          command: 'promptiply.copyLastOriginal',
          title: '📄 Copy Original',
          arguments: [prompt]
        });

        // Add profile switching options
        stream.button({
          command: 'promptiply.chatRefineWithProfile',
          title: '🔄 Refine with Different Profile',
          arguments: [prompt]
        });

        // Add economy/premium toggle
        stream.button({
          command: 'promptiply.chatToggleEconomy',
          title: config.useEconomyModel ? '💎 Try Premium' : '💰 Try Economy',
          arguments: [prompt]
        });

        stream.button({
          command: 'promptiply.switchProfile',
          title: '⚙️ Settings'
        });

      } catch (error: any) {
        stream.markdown('## ❌ Refinement Failed\n\n');
        stream.markdown('**Error:** ' + error.message + '\n\n');
        stream.markdown('### 🔧 Troubleshooting\n\n');
        stream.markdown('Try:\n');
        stream.markdown('- Check your API keys in settings\n');
        stream.markdown('- Switch to a different mode (VSCode LM, Ollama, etc.)\n');
        stream.markdown('- Make sure the AI service is available\n');
        stream.markdown('- Run `Promptiply: Open Settings` from Command Palette\n\n');

        stream.button({
          command: 'promptiply.openSettings',
          title: '⚙️ Open Settings'
        });
      }
    });

    // Set participant metadata
    this.participant.iconPath = vscode.Uri.file('media/icon.png');

    return this.participant;
  }

  /**
   * Show help message
   */
  private showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('## 💡 Promptiply Help\n\n');
    stream.markdown('Refine your prompts for better AI responses!\n\n');
    stream.markdown('### 📝 Usage\n\n');
    stream.markdown('```\n@promptiply <your prompt>\n```\n\n');
    stream.markdown('### 🎯 Examples\n\n');
    stream.markdown('```\n@promptiply make a function that sorts arrays\n```\n\n');
    stream.markdown('```\n@promptiply help me debug this error\n```\n\n');
    stream.markdown('### ⚡ Quick Commands\n\n');
    stream.markdown('- `@promptiply /help` - Show this help\n');
    stream.markdown('- After refining, use the buttons to copy, change profile, or toggle economy/premium\n\n');
    stream.markdown('### 🔧 Settings\n\n');

    stream.button({
      command: 'promptiply.switchProfile',
      title: '👤 Change Profile'
    });

    stream.button({
      command: 'promptiply.openSettings',
      title: '⚙️ Open Settings'
    });
  }

  /**
   * Handle profile switching
   */
  private async handleProfileSwitch(stream: vscode.ChatResponseStream, prompt: string): Promise<void> {
    stream.markdown('## 👤 Profile Selection\n\n');
    stream.markdown('Click a button to refine with that profile:\n\n');

    const profiles = await this.profileManager.getProfiles();
    const activeProfile = await this.profileManager.getActiveProfile();

    for (const profile of profiles.list) {
      const isActive = activeProfile?.id === profile.id;
      stream.button({
        command: 'promptiply.chatRefineWithSpecificProfile',
        title: `${isActive ? '✓ ' : ''}${profile.name}`,
        arguments: [prompt, profile.id]
      });
    }

    stream.button({
      command: 'promptiply.chatRefineWithSpecificProfile',
      title: activeProfile ? 'No Profile' : '✓ No Profile',
      arguments: [prompt, null]
    });
  }
}

/**
 * Register commands for chat buttons
 */
export function registerChatCommands(
  context: vscode.ExtensionContext,
  engine: RefinementEngine,
  profileManager: ProfileManager,
  historyManager: HistoryManager
): void {
  // Send refined prompt to chat
  context.subscriptions.push(
    vscode.commands.registerCommand('promptiply.sendRefinedToChat', async (text: string) => {
      try {
        // Send the refined prompt to the active chat
        await vscode.commands.executeCommand('workbench.action.chat.open', {
          query: text
        });
        vscode.window.showInformationMessage('🚀 Refined prompt sent to chat!');
      } catch (error) {
        // Fallback: copy to clipboard if sending fails
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('📋 Copied to clipboard (chat not available). Paste to use!');
      }
    })
  );

  // Copy refined prompt
  context.subscriptions.push(
    vscode.commands.registerCommand('promptiply.copyLastRefinement', async (text: string) => {
      await vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage('📋 Refined prompt copied to clipboard!');
    })
  );

  // Copy original prompt
  context.subscriptions.push(
    vscode.commands.registerCommand('promptiply.copyLastOriginal', async (text: string) => {
      await vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage('📄 Original prompt copied to clipboard!');
    })
  );

  // Refine with different profile (opens profile selector)
  context.subscriptions.push(
    vscode.commands.registerCommand('promptiply.chatRefineWithProfile', async (prompt: string) => {
      const profiles = await profileManager.getProfiles();
      const activeProfile = await profileManager.getActiveProfile();

      const items = [
        {
          label: '$(circle-outline) No Profile',
          description: 'Use base refinement without customization',
          profileId: null,
        },
        ...profiles.list.map(profile => ({
          label: `${activeProfile?.id === profile.id ? '$(check) ' : ''}${profile.name}`,
          description: `${profile.persona} • ${profile.tone}`,
          profileId: profile.id,
        })),
      ];

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select profile to refine with',
      });

      if (selected !== undefined) {
        // Switch profile and trigger chat with refined prompt
        await profileManager.setActiveProfile(selected.profileId);
        vscode.window.showInformationMessage(
          `Refining with: ${selected.profileId ? profiles.list.find(p => p.id === selected.profileId)?.name : 'No Profile'}`
        );

        // Trigger a new chat message with the prompt
        vscode.commands.executeCommand('workbench.action.chat.open', {
          query: `@promptiply ${prompt}`
        });
      }
    })
  );

  // Refine with specific profile
  context.subscriptions.push(
    vscode.commands.registerCommand('promptiply.chatRefineWithSpecificProfile', async (prompt: string, profileId: string | null) => {
      await profileManager.setActiveProfile(profileId);

      // Trigger a new chat message with the prompt
      vscode.commands.executeCommand('workbench.action.chat.open', {
        query: `@promptiply ${prompt}`
      });
    })
  );

  // Toggle economy/premium and re-refine
  context.subscriptions.push(
    vscode.commands.registerCommand('promptiply.chatToggleEconomy', async (prompt: string) => {
      const config = vscode.workspace.getConfiguration('promptiply');
      const current = config.get('useEconomyModel', true);
      await config.update(
        'useEconomyModel',
        !current,
        vscode.ConfigurationTarget.Global
      );

      vscode.window.showInformationMessage(
        `Switched to ${!current ? 'Economy' : 'Premium'} mode. Refining...`
      );

      // Trigger a new chat message with the prompt
      vscode.commands.executeCommand('workbench.action.chat.open', {
        query: `@promptiply ${prompt}`
      });
    })
  );
}
