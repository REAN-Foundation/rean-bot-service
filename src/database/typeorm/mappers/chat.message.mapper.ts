import { ChatMessage } from '../models/chat.message.entity';
import { ChatMessageCreateModel, ChatMessageResponseDto } from '../../../domain.types/chat.message.types';
import { getLanguage } from '../../../domain.types/language';
import {
    QnADetails,
    HumanHandoff,
    Feedback,
    AssessmentDetails,
    IntentDetails,
    MessageChannelDetails,
} from '../../../domain.types/message';

///////////////////////////////////////////////////////////////////////////////////

export class ChatMessageMapper {

    static toEntity = (model: ChatMessageCreateModel): any => {
        if (model == null) {
            return null;
        }
        const entity: any = {
            TenantId              : model.TenantId,
            TenantName            : model.TenantName ?? null,
            UserId                : model.UserId,
            SessionId             : model.SessionId,
            Channel               : model.Channel,
            ChannelUserId         : model.ChannelUserId,
            ChannelMessageId      : model.ChannelMessageId ?? null,
            MessageType           : model.MessageType,
            LanguageCode          : model.LanguageCode,
            Direction             : model.Direction,
            Content               : model.Content,
            TranslatedContent     : model.TranslatedContent ?? null,
            Timestamp             : model.Timestamp,
            PrevMessageId         : model.PrevMessageId,
            PrimaryMessageHandler : model.PrimaryMessageHandler ?? null,
            GeoLocation           : model.GeoLocation ?? null,
            ChannelSpecifics      : model.ChannelSpecifics ?? null,
            Metadata              : model.Metadata ?? null,
            Intent                : model.Intent ?? null,
            Assessment            : model.Assessment ?? null,
            Feedback              : model.Feedback ?? null,
            HumanHandoff          : model.HumanHandoff ?? null,
            QnA                   : model.QnA ?? null,
        };
        return entity;
    };

    static toResponseDto = (m: ChatMessage): ChatMessageResponseDto => {
        if (m == null) {
            return null;
        }
        const dto: ChatMessageResponseDto = {
            id                    : m.id,
            TenantId              : m.TenantId,
            TenantName            : m.TenantName,
            UserId                : m.UserId,
            SessionId             : m.SessionId,
            Channel               : m.Channel,
            ChannelUserId         : m.ChannelUserId,
            ChannelMessageId      : m.ChannelMessageId,
            MessageType           : m.MessageType,
            Language              : m.LanguageCode ? getLanguage(m.LanguageCode) : null,
            Content               : m.Content,
            TranslatedContent     : m.TranslatedContent ?? null,
            Timestamp             : m.Timestamp,
            PrevMessageId         : m.PrevMessageId,
            PrimaryMessageHandler : m.PrimaryMessageHandler ?? null,
            GeoLocation           : m.GeoLocation ? JSON.parse(m.GeoLocation) : null,
            ChannelSpecifics      : m.ChannelSpecifics ? JSON.parse(m.ChannelSpecifics) as MessageChannelDetails : null,
            Metadata              : m.Metadata ? JSON.parse(m.Metadata) : null,
            Intent                : m.Intent ? JSON.parse(m.Intent) as IntentDetails : null,
            Assessment            : m.Assessment ? JSON.parse(m.Assessment) as AssessmentDetails : null,
            Feedback              : m.Feedback ? JSON.parse(m.Feedback) as Feedback : null,
            HumanHandoff          : m.HumanHandoff ? JSON.parse(m.HumanHandoff) as HumanHandoff : null,
            QnA                   : m.QnA ? JSON.parse(m.QnA) as QnADetails : null,
        };
        return dto;
    };

}
