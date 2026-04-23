import { createBearerOAuthFetch, createOAuthCredentialManager } from '../../oauth'
import { ModelProviderEnum, ModelProviderType } from '../../types'
import { defineProvider } from '../registry'
import OpenAI from './models/openai'

export const GITHUB_COPILOT_API_HOST = 'https://api.githubcopilot.com/v1'

export const githubCopilotProvider = defineProvider({
  id: ModelProviderEnum.GitHubCopilot,
  name: 'GitHub Copilot',
  type: ModelProviderType.OpenAI,
  modelsDevProviderId: 'github-copilot',
  urls: {
    website: 'https://github.com/features/copilot',
  },
  defaultSettings: {
    activeAuthMode: 'oauth',
    apiHost: GITHUB_COPILOT_API_HOST,
    models: [
      {
        modelId: 'gpt-4o',
        nickname: 'GPT-4o',
        capabilities: ['vision', 'tool_use'],
        contextWindow: 128_000,
        maxOutput: 4_096,
      },
      {
        modelId: 'gpt-4-turbo',
        nickname: 'GPT-4 Turbo',
        capabilities: ['vision', 'tool_use'],
        contextWindow: 128_000,
        maxOutput: 4_096,
      },
      {
        modelId: 'o1-preview',
        nickname: 'o1 Preview',
        capabilities: ['reasoning'],
        contextWindow: 128_000,
        maxOutput: 4_096,
      },
      {
        modelId: 'o1-mini',
        nickname: 'o1 Mini',
        capabilities: ['reasoning'],
        contextWindow: 128_000,
        maxOutput: 4_096,
      },
    ],
  },
  createModel: (config) => {
    const isOAuth = config.providerSetting.activeAuthMode === 'oauth' && !!config.providerSetting.oauth?.accessToken
    const credentialManager = createOAuthCredentialManager(
      ModelProviderEnum.GitHubCopilot,
      config.providerSetting,
      config.dependencies
    )

    return new OpenAI(
      {
        apiKey: isOAuth ? 'oauth-placeholder' : config.effectiveApiKey,
        apiHost: config.formattedApiHost || GITHUB_COPILOT_API_HOST,
        model: config.model,
        dalleStyle: 'vivid',
        temperature: config.settings.temperature,
        topP: config.settings.topP,
        maxOutputTokens: config.settings.maxTokens,
        injectDefaultMetadata: config.globalSettings.injectDefaultMetadata,
        useProxy: config.providerSetting.useProxy || false,
        stream: config.settings.stream,
        customFetch:
          isOAuth && credentialManager
            ? createBearerOAuthFetch(config.dependencies, credentialManager)
            : undefined,
        listModelsFallback: config.providerSetting.models || githubCopilotProvider.defaultSettings?.models,
      },
      config.dependencies
    )
  },
  getDisplayName: (modelId, providerSettings) => {
    return `GitHub Copilot (${providerSettings?.models?.find((m) => m.modelId === modelId)?.nickname || modelId})`
  },
})
