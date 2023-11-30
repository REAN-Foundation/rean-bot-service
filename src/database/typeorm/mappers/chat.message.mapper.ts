import { ChatMessage } from '../models/chat.message.entity';
import { ChatMessageResponseDto } from '../../../domain.types/chat.message.types';

///////////////////////////////////////////////////////////////////////////////////

export class ChatMessageMapper {

    static toResponseDto = (chatMessage: ChatMessage): ChatMessageResponseDto => {
        if (chatMessage == null) {
            return null;
        }
        const dto: ChatMessageResponseDto = {
            id                        : chatMessage.id,
            TenantId                  : chatMessage.TenantId,
            UserId                    : chatMessage.UserId,
            SessionId                 : chatMessage.SessionId,
            Platform                  : chatMessage.Platform,
            LanguageCode              : chatMessage.LanguageCode,
            Name                      : chatMessage.Name,
            MessageContent            : chatMessage.MessageContent,
            ImageContent              : chatMessage.ImageContent,
            ImageUrl                  : chatMessage.ImageUrl,
            PlatformUserId            : chatMessage.PlatformUserId,
            PlatformMessageId         : chatMessage.PlatformMessageId,
            PlatformResponseMessageId : chatMessage.PlatformResponseMessageId,
            SentTimestamp             : chatMessage.SentTimestamp,
            DeliveredTimestamp        : chatMessage.DeliveredTimestamp,
            ReadTimestamp             : chatMessage.ReadTimestamp,
            Direction                 : chatMessage.Direction,
            ContentType               : chatMessage.ContentType,
            AssessmentId              : chatMessage.AssessmentId,
            AssessmentNodeId          : chatMessage.AssessmentNodeId,
            FeedbackType              : chatMessage.FeedbackType,
            IdentifiedIntent          : chatMessage.IdentifiedIntent,
            HumanHandoff              : chatMessage.HumanHandoff,

            /*
            Session: chatMessage.Session ? {
                id: chatMessage.Session.id,
                UserId: chatMessage.Session.UserId,
                Platform: chatMessage.Session.Platform,
                LastMessageDate: chatMessage.Session.LastMessageDate,
            } : null,
            User: chatMessage.User? {
                id: chatMessage.User.id,
                TenantId: chatMessage.User.TenantId,
                Prefix: chatMessage.User.Prefix,
                FirstName: chatMessage.User.FirstName,
                LastName: chatMessage.User.LastName,
                Phone: chatMessage.User.Phone,
                Email: chatMessage.User.Email,
                Gender: chatMessage.User.Gender,
                BirthDate: chatMessage.User.BirthDate,
                PreferredLanguage: chatMessage.User.PreferredLanguage
            } : null
            */
        };
        return dto;
    };

}
