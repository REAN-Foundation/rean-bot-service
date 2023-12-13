export enum MessageContentType {
    Text         = 'Text',          // Text message
    Image        = 'Image',         // Image message
    Location     = 'Location',      // Location message
    Audio        = 'Audio',         // Audio message
    Video        = 'Video',         // Video message
    DateTime     = 'DateTime',      // Date and time message
    OptionChoice = 'OptionChoice',  // User's selection of choice for a given options
    File         = 'File',          // Uploaded File message
    OptionsUI    = 'OptionsUI',     // User is presented with Options UI
    Feedback     = 'Feedback',      // User feedback message
    ImageUrl     = 'ImageUrl',      // Image url
    LocationUrl  = 'LocationUrl',   // Location url
    VideoUrl     = 'VideoUrl',      // Video url
    AudioUrl     = 'AudioUrl',      // Audio url
    FileUrl      = 'FileUrl',       // File url
    Other        = 'Other',         // Other type of message
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
    MessageContentType.ImageUrl,
    MessageContentType.LocationUrl,
    MessageContentType.VideoUrl,
    MessageContentType.AudioUrl,
    MessageContentType.FileUrl,
    MessageContentType.Other,
];
