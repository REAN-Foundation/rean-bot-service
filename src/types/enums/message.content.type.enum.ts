export enum MessageContentType {
    Text            = 'Text',              // Text message
    Image           = 'Image',             // Image message
    Location        = 'Location',          // Location message
    Audio           = 'Audio',             // Audio message
    Video           = 'Video',             // Video message
    DateTime        = 'DateTime',          // Date and time message
    File            = 'File',              // Uploaded File message
    OptionChoice    = 'OptionChoice',      // User's selection of choice for a given options
    OptionsUI       = 'OptionsUI',         // User is presented with Options UI
    Feedback        = 'Feedback',          // User feedback message
    MessageReaction = 'MessageReaction',   // User reaction to a message
    SharedContact   = 'SharedContact',     // Shared contact
    Other           = 'Other',             // Other type of message
}

export const MessageContentTypeList: MessageContentType[] = [
    MessageContentType.Text,
    MessageContentType.Image,
    MessageContentType.Location,
    MessageContentType.Audio,
    MessageContentType.Video,
    MessageContentType.DateTime,
    MessageContentType.File,
    MessageContentType.OptionChoice,
    MessageContentType.OptionsUI,
    MessageContentType.Feedback,
    MessageContentType.MessageReaction,
    MessageContentType.SharedContact,
    MessageContentType.Other,
];
