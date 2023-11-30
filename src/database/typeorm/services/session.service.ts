import { FindManyOptions, Like, Repository } from 'typeorm';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { Source } from '../typeorm.database.connector';
import { BaseService } from './base.service';
import {
    SessionCreateModel,
    SessionResponseDto,
    SessionSearchFilters,
    SessionSearchResults,
    SessionUpdateModel,
} from '../../../domain.types/session.types';
import { SessionMapper } from '../mappers/session.mapper';
import { User } from '../models/user.entity';
import { ChatMessage } from '../models/chat.message.entity';
import { Session } from '../models/session.entity';

///////////////////////////////////////////////////////////////////////

export class SessionService extends BaseService {

    //#region Repositories

    _userRepository: Repository<User> = Source.getRepository(User);

    _chatMessageRepository: Repository<ChatMessage> = Source.getRepository(ChatMessage);

    _sessionRepository: Repository<Session> = Source.getRepository(Session);

    //#endregion

    public create = async (createModel: SessionCreateModel): Promise<SessionResponseDto> => {
        // const user = await this.getUser(createModel.UserId);
        const session = this._sessionRepository.create({
            // User     : user,
            UserId   : createModel.UserId,
            Platform : createModel.Platform,
        });
        var record = await this._sessionRepository.save(session);
        return SessionMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<SessionResponseDto> => {
        try {
            var session = await this._sessionRepository.findOne({
                where : {
                    id : id,
                },
                select : {
                    UserId          : true,
                    Platform        : true,
                    LastMessageDate : true,
                    // User            : {
                    //     id                : true,
                    //     TenantId          : true,
                    //     Prefix            : true,
                    //     FirstName         : true,
                    //     LastName          : true,
                    //     Phone             : true,
                    //     Email             : true,
                    //     Gender            : true,
                    //     BirthDate         : true,
                    //     PreferredLanguage : true,
                    // },
                },
                // relations : {
                //     User : true,
                // },
            });
            return SessionMapper.toResponseDto(session);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: SessionSearchFilters): Promise<SessionSearchResults> => {
        try {
            var search = this.getSearchObject(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._sessionRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending'                : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map((x) => SessionMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: SessionUpdateModel): Promise<SessionResponseDto> => {
        try {
            const session = await this._sessionRepository.findOne({
                where : {
                    id : id,
                },
            });
            if (!session) {
                ErrorHandler.throwNotFoundError('Session not found!');
            }

            if (model.UserId !== undefined && model.UserId != null) {
                session.UserId = model.UserId;
            }

            if (model.Platform !== undefined && model.Platform != null) {
                session.Platform = model.Platform;
            }

            if (model.UserId != null) {
                session.UserId = model.UserId;
                // const user = await this.getUser(model.UserId);
                // session.User = user;
            }
            var record = await this._sessionRepository.save(session);
            return SessionMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._sessionRepository.findOne({
                where : {
                    id : id,
                },
            });
            var result = await this._sessionRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchObject = (filters: SessionSearchFilters) => {
        var search: FindManyOptions<Session> = {
            // relations : {
            //     User : true,
            // },
            where  : {},
            select : {
                id              : true,
                UserId          : true,
                Platform        : true,
                LastMessageDate : true,
                CreatedAt       : true,
                UpdatedAt       : true,
                // User            : {
                //     id                : true,
                //     TenantId          : true,
                //     Prefix            : true,
                //     FirstName         : true,
                //     LastName          : true,
                //     Phone             : true,
                //     Email             : true,
                //     PreferredLanguage : true,
                // },
            },
        };

        if (filters.UserId) {
            search.where['UserId'] = filters.UserId;
        }

        if (filters.Platform) {
            search.where['Platform'] = Like(`%${filters.Platform}%`);
        }

        if (filters.LastMessageDate) {
            search.where['LastMessageDate'] = filters.LastMessageDate;
        }

        return search;
    };

    //#endregion

    private async getUser(userId: uuid) {
        const user = await this._userRepository.findOne({
            where : {
                id : userId,
            },
        });
        if (!user) {
            ErrorHandler.throwNotFoundError('User cannot be found');
        }
        return user;
    }

}
