import { User } from '../models/user.entity';
import { UserResponseDto } from '../../../domain.types/user.types';

///////////////////////////////////////////////////////////////////////////////////

export class UserMapper {

    static toResponseDto = (user: User): UserResponseDto => {
        if (user == null) {
            return null;
        }
        const dto: UserResponseDto = {
            id                : user.id,
            TenantId          : user.TenantId,
            Prefix            : user.Prefix,
            FirstName         : user.FirstName,
            LastName          : user.LastName,
            Phone             : user.Phone,
            Email             : user.Email,
            Gender            : user.Gender,
            BirthDate         : user.BirthDate,
            PreferredLanguage : user.PreferredLanguage,
            Sessions          : user.Sessions ? user.Sessions.map(x => {
                return {
                    id              : x.id,
                    UserId          : x.UserId,
                    Channel         : x.Channel,
                    LastMessageDate : x.LastMessageDate
                };
            }) : null
        };
        return dto;
    };

}
