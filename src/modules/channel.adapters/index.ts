// Channel Adapters
export { WhatsAppAdapter } from './whatsapp.adapter';
export { TelegramAdapter } from './telegram.adapter';
export { SlackAdapter } from './slack.adapter';
export { SignalAdapter } from './signal.adapter';
export { WebChatAdapter } from './web.adapter';

// Message Transformers
export { BaseMessageTransformer } from './transformers/base.message.transformer';
export { WhatsAppMessageTransformer } from './transformers/whatsapp.message.transformer';
export { TelegramMessageTransformer } from './transformers/telegram.message.transformer';
export { SlackMessageTransformer } from './transformers/slack.message.transformer';
export { SignalMessageTransformer } from './transformers/signal.message.transformer';
export { WebMessageTransformer } from './transformers/web.message.transformer';

// Channel Factory
export { ChannelFactory } from './channel.factory';

// Webhook Validators
export { WebhookValidators } from './webhook.validators';

// Types and Interfaces
export type {
    WhatsAppConfig,
    WhatsAppWebhookMessage,
    WhatsAppOutgoingMessage
} from './whatsapp.adapter';

export type {
    TelegramConfig,
    TelegramMessage,
    TelegramOutgoingMessage
} from './telegram.adapter';

export type {
    SlackConfig,
    SlackMessage,
    SlackOutgoingMessage
} from './slack.adapter';

export type {
    SignalConfig,
    SignalMessage,
    SignalOutgoingMessage
} from './signal.adapter';

export type {
    WebChatConfig,
    WebChatMessage,
    WebChatOutgoingMessage,
    WebChatUser,
    WebChatSession,
    WebChatEvent,
    WebChatTypingIndicator,
    WebChatDeliveryReceipt,
    WebChatConnection
} from './web.adapter';

export type {
    ChannelConfiguration,
    ChannelFactoryOptions
} from './channel.factory';

export type {
    WebhookValidationResult,
    WebhookValidationConfig
} from './webhook.validators';

export type {
    PlatformMessage,
    TransformedMessage
} from './transformers/base.message.transformer';

// Channel Adapter Constants
export const SUPPORTED_CHANNEL_TYPES = [
    'whatsapp',
    'telegram',
    'slack',
    'signal',
    'web'
] as const;

export const CHANNEL_FEATURES = {
    whatsapp: [
        'text_messages',
        'media_messages',
        'interactive_messages',
        'templates',
        'location_sharing',
        'contact_sharing',
        'delivery_receipts',
        'read_receipts',
        'typing_indicators',
        'message_reactions',
        'quoted_replies'
    ],
    telegram: [
        'text_messages',
        'media_messages',
        'inline_keyboards',
        'callback_queries',
        'file_uploads',
        'message_formatting',
        'message_editing',
        'message_deletion',
        'typing_indicators',
        'file_downloads',
        'group_management',
        'channel_management'
    ],
    slack: [
        'text_messages',
        'media_messages',
        'interactive_messages',
        'file_sharing',
        'threading',
        'reactions',
        'mentions',
        'rich_formatting',
        'blocks',
        'attachments',
        'slash_commands',
        'interactive_components',
        'app_home',
        'modals',
        'shortcuts'
    ],
    signal: [
        'text_messages',
        'media_messages',
        'contact_sharing',
        'message_reactions',
        'message_deletion',
        'message_editing',
        'disappearing_messages',
        'voice_messages',
        'stickers',
        'read_receipts',
        'typing_indicators',
        'message_quotes',
        'group_messaging',
        'end_to_end_encryption'
    ],
    web: [
        'text_messages',
        'media_messages',
        'interactive_messages',
        'location_sharing',
        'contact_sharing',
        'file_uploads',
        'real_time_messaging',
        'typing_indicators',
        'read_receipts',
        'delivery_receipts',
        'presence_status',
        'message_history',
        'session_management',
        'multi_device_support',
        'offline_messaging',
        'message_reactions',
        'message_editing',
        'message_deletion'
    ]
} as const;

export const MESSAGE_TYPE_MAPPINGS = {
    whatsapp: {
        text: 'text',
        image: 'image',
        audio: 'audio',
        video: 'video',
        document: 'document',
        location: 'location',
        contacts: 'contacts',
        interactive: 'interactive',
        button: 'button',
        template: 'template'
    },
    telegram: {
        text: 'text',
        photo: 'image',
        audio: 'audio',
        voice: 'audio',
        video: 'video',
        video_note: 'video',
        document: 'document',
        location: 'location',
        contact: 'contact',
        sticker: 'sticker',
        animation: 'animation',
        poll: 'poll'
    },
    slack: {
        message: 'text',
        file_share: 'file',
        app_mention: 'mention',
        channel_join: 'system',
        channel_leave: 'system',
        channel_topic: 'system',
        channel_purpose: 'system',
        channel_name: 'system',
        file_comment: 'comment',
        reaction_added: 'reaction',
        reaction_removed: 'reaction'
    },
    signal: {
        text: 'text',
        image: 'image',
        audio: 'audio',
        video: 'video',
        document: 'document',
        contact: 'contact',
        sticker: 'sticker',
        reaction: 'reaction',
        remote_delete: 'deletion',
        group_update: 'system'
    },
    web: {
        text: 'text',
        media: 'media',
        image: 'image',
        audio: 'audio',
        video: 'video',
        document: 'document',
        location: 'location',
        contact: 'contact',
        interactive: 'interactive',
        typing: 'typing',
        system: 'system',
        file_upload: 'file',
        delivery_receipt: 'receipt',
        read_receipt: 'receipt',
        presence: 'presence'
    }
} as const;
