import { FindManyOptions, Like, Repository } from 'typeorm';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { Source } from '../typeorm.database.connector';
import { BaseService } from './base.service';
import {
    UserCreateModel,
    UserResponseDto,
    UserSearchFilters,
    UserSearchResults,
    UserUpdateModel,
} from '../../../domain.types/user.types';
import { UserMapper } from '../mappers/user.mapper';
import { Session } from '../models/session.entity';
import { ChatMessage } from '../models/chat.message.entity';
import { User } from '../models/user.entity';

///////////////////////////////////////////////////////////////////////

export class UserService extends BaseService {

    //#region Repositories

    _sessionRepository: Repository<Session> = Source.getRepository(Session);

    _chatMessageRepository: Repository<ChatMessage> = Source.getRepository(ChatMessage);

    _userRepository: Repository<User> = Source.getRepository(User);

    //#endregion

    public create = async (createModel: UserCreateModel): Promise<UserResponseDto> => {
        const user = this._userRepository.create({
            TenantId          : createModel.TenantId,
            Prefix            : createModel.Prefix,
            FirstName         : createModel.FirstName,
            LastName          : createModel.LastName,
            Phone             : createModel.Phone,
            Email             : createModel.Email,
            Gender            : createModel.Gender,
            BirthDate         : createModel.BirthDate,
            PreferredLanguage : createModel.PreferredLanguage,
        });
        var record = await this._userRepository.save(user);
        return UserMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<UserResponseDto> => {
        try {
            var user = await this._userRepository.findOne({
                where : {
                    id : id,
                },
                select : {
                    TenantId          : true,
                    Prefix            : true,
                    FirstName         : true,
                    LastName          : true,
                    Phone             : true,
                    Email             : true,
                    Gender            : true,
                    BirthDate         : true,
                    PreferredLanguage : true,
                },
                relations : {
                },
            });
            return UserMapper.toResponseDto(user);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: UserSearchFilters): Promise<UserSearchResults> => {
        try {
            var search = this.getSearchObject(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._userRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending'             : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map((x) => UserMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: UserUpdateModel): Promise<UserResponseDto> => {
        try {
            const user = await this._userRepository.findOne({
                where : {
                    id : id,
                },
            });
            if (!user) {
                ErrorHandler.throwNotFoundError('User not found!');
            }

            if (model.TenantId !== undefined && model.TenantId != null) {
                user.TenantId = model.TenantId;
            }

            if (model.Prefix !== undefined && model.Prefix != null) {
                user.Prefix = model.Prefix;
            }

            if (model.FirstName !== undefined && model.FirstName != null) {
                user.FirstName = model.FirstName;
            }

            if (model.LastName !== undefined && model.LastName != null) {
                user.LastName = model.LastName;
            }

            if (model.Phone !== undefined && model.Phone != null) {
                user.Phone = model.Phone;
            }

            if (model.Email !== undefined && model.Email != null) {
                user.Email = model.Email;
            }

            if (model.Gender !== undefined && model.Gender != null) {
                user.Gender = model.Gender;
            }

            if (model.BirthDate !== undefined && model.BirthDate != null) {
                user.BirthDate = model.BirthDate;
            }

            if (model.PreferredLanguage !== undefined && model.PreferredLanguage != null) {
                user.PreferredLanguage = model.PreferredLanguage;
            }
            var record = await this._userRepository.save(user);
            return UserMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._userRepository.findOne({
                where : {
                    id : id,
                },
            });
            var result = await this._userRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchObject = (filters: UserSearchFilters) => {
        var search: FindManyOptions<User> = {
            relations : {
                // Client: true
            },
            where  : {},
            select : {
                id                : true,
                TenantId          : true,
                Prefix            : true,
                FirstName         : true,
                LastName          : true,
                Phone             : true,
                Email             : true,
                PreferredLanguage : true,
                CreatedAt         : true,
                UpdatedAt         : true,
            },
        };

        if (filters.TenantId) {
            search.where['TenantId'] = filters.TenantId;
        }

        if (filters.Prefix) {
            search.where['Prefix'] = Like(`%${filters.Prefix}%`);
        }

        if (filters.FirstName) {
            search.where['FirstName'] = Like(`%${filters.FirstName}%`);
        }

        if (filters.LastName) {
            search.where['LastName'] = Like(`%${filters.LastName}%`);
        }

        if (filters.Phone) {
            search.where['Phone'] = Like(`%${filters.Phone}%`);
        }

        if (filters.Email) {
            search.where['Email'] = Like(`%${filters.Email}%`);
        }

        if (filters.Gender) {
            search.where['Gender'] = filters.Gender;
        }

        if (filters.BirthDate) {
            search.where['BirthDate'] = filters.BirthDate;
        }

        if (filters.PreferredLanguage) {
            search.where['PreferredLanguage'] = Like(`%${filters.PreferredLanguage}%`);
        }

        return search;
    };

    //#endregion

}
