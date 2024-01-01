import { FindManyOptions, Like, Repository, MoreThanOrEqual } from 'typeorm';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { BaseService } from './base.service';
import { SessionMapper } from '../mappers/session.mapper';
import { User } from '../models/user.entity';
import { Session } from '../models/session.entity';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';
import {
    SessionCreateModel,
    SessionResponseDto,
    SessionSearchFilters,
    SessionSearchResults,
    SessionUpdateModel,
} from '../../../domain.types/domain.models/session.domain.models';

///////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class SessionService extends BaseService {

    constructor(
        @inject(TenantEnvironmentProvider) private _envProvider: TenantEnvironmentProvider
    ) {
        super();
    }

    public create = async (createModel: SessionCreateModel): Promise<SessionResponseDto> => {
        // const user = await this.getUser(createModel.UserId);
        const repo: Repository<Session> = await this.getRepository(this._envProvider, Session);
        const session = repo.create({
            UserId        : createModel.UserId,
            Channel       : createModel.Channel,
            ChannelUserId : createModel.ChannelUserId,
        });
        var record = await repo.save(session);
        return SessionMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<SessionResponseDto> => {
        try {
            const repo: Repository<Session> = await this.getRepository(this._envProvider, Session);
            var session = await repo.findOne({
                where : {
                    id : id,
                },
                select : {
                    UserId          : true,
                    Channel         : true,
                    ChannelUserId   : true,
                    LastMessageDate : true,
                    CreatedAt       : true,
                },
            });
            if (!session) {
                ErrorHandler.throwNotFoundError('Session not found!');
            }
            const userRepo: Repository<User> = await this.getRepository(this._envProvider, User);
            const user = await userRepo.findOne({
                where : {
                    id : session.UserId,
                },
            });
            if (!user) {
                ErrorHandler.throwNotFoundError('User not found!');
            }
            return SessionMapper.toResponseDto(session, user);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getByChannelUserId = async (channelUserId: string): Promise<SessionResponseDto> => {
        try {
            const sessionRepo: Repository<Session> = await this.getRepository(this._envProvider, Session);
            var session = await sessionRepo.findOne({
                where : {
                    ChannelUserId : channelUserId,
                }
            });
            if (!session) {
                ErrorHandler.throwNotFoundError('User not found!');
            }
            const userRepo: Repository<User> = await this.getRepository(this._envProvider, User);
            const user = await userRepo.findOne({
                where : {
                    id : session.UserId,
                },
            });
            if (!user) {
                ErrorHandler.throwNotFoundError('User not found!');
            }
            return SessionMapper.toResponseDto(session, user);
        }
        catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: SessionSearchFilters): Promise<SessionSearchResults> => {
        try {
            var search = this.getSearchObject(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const repo: Repository<Session> = await this.getRepository(this._envProvider, Session);
            const [list, count] = await repo.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
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
            const repo: Repository<Session> = await this.getRepository(this._envProvider, Session);
            const session = await repo.findOne({
                where : {
                    id : id,
                },
            });
            if (!session) {
                ErrorHandler.throwNotFoundError('Session not found!');
            }
            if (model.LastMessageDate !== undefined && model.LastMessageDate != null) {
                session.LastMessageDate = model.LastMessageDate;
            }
            var record = await repo.save(session);
            return SessionMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            const repo: Repository<Session> = await this.getRepository(this._envProvider, Session);
            var record = await repo.findOne({
                where : {
                    id : id,
                },
            });
            var result = await repo.remove(record);
            return result != null;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchObject = (filters: SessionSearchFilters) => {
        var search: FindManyOptions<Session> = {
            where  : {},
            select : {
                id              : true,
                UserId          : true,
                Channel         : true,
                ChannelUserId   : true,
                LastMessageDate : true,
                CreatedAt       : true,
                UpdatedAt       : true,
            },
        };

        if (filters.UserId) {
            search.where['UserId'] = filters.UserId;
        }

        if (filters.Channel) {
            search.where['Channel'] = Like(`%${filters.Channel}%`);
        }

        if (filters.LastMessageDateAfter) {
            search.where['LastMessageDate'] = MoreThanOrEqual(filters.LastMessageDateAfter);
        }

        return search;
    };

    //#endregion

    private async getUser(userId: uuid) {
        const userRepo: Repository<User> = await this.getRepository(this._envProvider, User);
        const user = await userRepo.findOne({
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
