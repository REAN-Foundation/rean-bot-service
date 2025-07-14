import { MessageContent, TextMessageContent, MediaMessageContent, LocationMessageContent, ContactMessageContent, InteractiveMessageContent } from "../../domain.types/message.types";

// Type guard functions for MessageContent

export function isTextMessageContent(content: MessageContent): content is TextMessageContent {
    return 'text' in content;
}

export function isMediaMessageContent(content: MessageContent): content is MediaMessageContent {
    return 'mediaType' in content;
}

export function isLocationMessageContent(content: MessageContent): content is LocationMessageContent {
    return 'latitude' in content && 'longitude' in content;
}

export function isContactMessageContent(content: MessageContent): content is ContactMessageContent {
    return 'name' in content && 'phone' in content;
}

export function isInteractiveMessageContent(content: MessageContent): content is InteractiveMessageContent {
    return 'type' in content && 'buttons' in content;
}
