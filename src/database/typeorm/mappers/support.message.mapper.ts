import { SupportMessage } from '../models/support.message.entity';
import { SupportMessageCreateModel, SupportMessageResponseDto } from '../../../domain.types/support.message.types';
import { StringUtils } from '../../../common/utilities/string.utils';

///////////////////////////////////////////////////////////////////////////////////

export class SupportMessageMapper {

    static toEntity = (model: SupportMessageCreateModel): any => {
        if (model == null) {
            return null;
        }
        const entity: any = {
            TenantId                : model.TenantId,
            UserId                  : model.UserId,
            SessionId               : model.SessionId,
            SupportChannel          : model.SupportChannel,
            SupportChannelUserId    : model.SupportChannelUserId,
            SupportChannelMessageId : model.SupportChannelMessageId ?? null,
            SupportTicketId         : model.SupportTicketId ?? StringUtils.generateCryptoToken(),
            ChatMessageId           : model.ChatMessageId ?? null,
            LanguageCode            : model.LanguageCode,
            Direction               : model.Direction,
            Content                 : model.Content,
            TranslatedContent       : model.TranslatedContent ?? null,
            Timestamp               : model.Timestamp,
            IsSupportResponse       : model.IsSupportResponse ?? false,
            IsExitMessage           : model.IsExitMessage ?? false,
            Metadata                : model.Metadata ?? null,
        };
        return entity;
    };

    static toResponseDto = (m: SupportMessage): SupportMessageResponseDto => {
        if (m == null) {
            return null;
        }
        const dto: SupportMessageResponseDto = {
            id                      : m.id,
            TenantId                : m.TenantId,
            UserId                  : m.UserId,
            SessionId               : m.SessionId,
            SupportChannel          : m.SupportChannel,
            SupportChannelUserId    : m.SupportChannelUserId,
            SupportChannelMessageId : m.SupportChannelMessageId,
            LanguageCode            : m.LanguageCode ?? null,
            Content                 : m.Content,
            TranslatedContent       : m.TranslatedContent ?? null,
            Timestamp               : m.Timestamp,
            IsSupportResponse       : m.IsSupportResponse,
            IsExitMessage           : m.IsExitMessage,
            SupportTicketId         : m.SupportTicketId,
            ChatMessageId           : m.ChatMessageId,
            Direction               : m.Direction,
            Metadata                : m.Metadata ? JSON.parse(m.Metadata) : null,
            CreatedAt               : m.CreatedAt,
            UpdatedAt               : m.UpdatedAt,
        };
        return dto;
    };

}
