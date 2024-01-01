import { Session } from '../models/session.entity';
import { SessionResponseDto } from '../../../domain.types/domain.models/session.domain.models';
import { ChannelType } from '../../../domain.types/enums';
import { User } from '../models/user.entity';

///////////////////////////////////////////////////////////////////////////////////

export class SessionMapper {

    static toResponseDto = (session: Session, user?: User): SessionResponseDto => {
        if (session == null) {
            return null;
        }
        const dto: SessionResponseDto = {
            id              : session.id,
            UserId          : session.UserId,
            Channel         : session.Channel as ChannelType,
            LastMessageDate : session.LastMessageDate,
            User            : user ? {
                id                : user.id,
                TenantId          : user.TenantId,
                Prefix            : user.Prefix,
                FirstName         : user.FirstName,
                LastName          : user.LastName,
                Phone             : user.Phone,
                Email             : user.Email,
                Gender            : user.Gender,
                BirthDate         : user.BirthDate,
                PreferredLanguage : user.PreferredLanguage
            } : null
        };
        return dto;
    };

}
