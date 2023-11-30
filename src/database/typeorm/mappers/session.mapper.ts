import { Session } from '../models/session.entity';
import { SessionResponseDto } from '../../../domain.types/session.types';

///////////////////////////////////////////////////////////////////////////////////

export class SessionMapper {

    static toResponseDto = (session: Session): SessionResponseDto => {
        if (session == null) {
            return null;
        }
        const dto: SessionResponseDto = {
            id              : session.id,
            UserId          : session.UserId,
            Platform        : session.Platform,
            LastMessageDate : session.LastMessageDate,

            /*
            User: session.User ? {
                id: session.User.id,
                TenantId: session.User.TenantId,
                Prefix: session.User.Prefix,
                FirstName: session.User.FirstName,
                LastName: session.User.LastName,
                Phone: session.User.Phone,
                Email: session.User.Email,
                Gender: session.User.Gender,
                BirthDate: session.User.BirthDate,
                PreferredLanguage: session.User.PreferredLanguage
            } : null
            */
        };
        return dto;
    };

}
