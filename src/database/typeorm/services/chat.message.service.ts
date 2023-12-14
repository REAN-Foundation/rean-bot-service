import { FindManyOptions, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { BaseService } from './base.service';
import {
    ChatMessageCreateModel,
    ChatMessageResponseDto,
    ChatMessageSearchFilters,
    ChatMessageSearchResults,
    ChatMessageUpdateModel,
} from '../../../domain.types/chat.message.types';
import { ChatMessageMapper } from '../mappers/chat.message.mapper';
import { Session } from '../models/session.entity';
import { User } from '../models/user.entity';
import { ChatMessage } from '../models/chat.message.entity';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';

///////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class ChatMessageService extends BaseService {

    constructor(
        @inject(TenantEnvironmentProvider) private _envProvider: TenantEnvironmentProvider
    ) {
        super();
    }

    public create = async (createModel: ChatMessageCreateModel): Promise<ChatMessageResponseDto> => {
        const chatMessageRepo: Repository<ChatMessage> = await this.getRepository(this._envProvider, ChatMessage);
        // const sessionRepo: Repository<Session> = await this.getRepository(this._envProvider, Session);
        // const userRepo: Repository<User> = await this.getRepository(this._envProvider, User);
        const entity: ChatMessage = ChatMessageMapper.toEntity(createModel);
        const chatMessage = chatMessageRepo.create(entity);
        var record = await chatMessageRepo.save(chatMessage);
        return ChatMessageMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<ChatMessageResponseDto> => {
        try {
            const repo: Repository<ChatMessage> = await this.getRepository(this._envProvider, ChatMessage);
            var chatMessage = await repo.findOne({
                where : {
                    id : id,
                }
            });
            return ChatMessageMapper.toResponseDto(chatMessage);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public search = async (filters: ChatMessageSearchFilters): Promise<ChatMessageSearchResults> => {
        try {
            var search = this.getSearchObject(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const repo: Repository<ChatMessage> = await this.getRepository(this._envProvider, ChatMessage);
            const [list, count] = await repo.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map((x) => ChatMessageMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: ChatMessageUpdateModel): Promise<ChatMessageResponseDto> => {
        try {
            const repo: Repository<ChatMessage> = await this.getRepository(this._envProvider, ChatMessage);
            const chatMessage = await repo.findOne({
                where : {
                    id : id,
                },
            });
            if (!chatMessage) {
                ErrorHandler.throwNotFoundError('Chat message not found!');
            }

            if (model.LanguageCode !== undefined && model.LanguageCode != null) {
                chatMessage.LanguageCode = model.LanguageCode;
            }

            if (model.MessageType !== undefined && model.MessageType != null) {
                chatMessage.MessageType = model.MessageType;
            }

            if (model.Content !== undefined && model.Content != null) {
                chatMessage.Content = model.Content;
            }

            if (model.TranslatedContent !== undefined && model.TranslatedContent != null) {
                chatMessage.TranslatedContent = model.TranslatedContent;
            }

            if (model.LanguageCode !== undefined && model.LanguageCode != null) {
                chatMessage.LanguageCode = model.LanguageCode;
            }

            if (model.GeoLocation !== undefined && model.GeoLocation != null) {
                chatMessage.GeoLocation = model.GeoLocation;
            }

            if (model.ChannelSpecifics !== undefined && model.ChannelSpecifics != null) {
                chatMessage.ChannelSpecifics = model.ChannelSpecifics;
            }

            if (model.PrimaryMessageHandler !== undefined && model.PrimaryMessageHandler != null) {
                chatMessage.PrimaryMessageHandler = model.PrimaryMessageHandler;
            }

            if (model.Metadata !== undefined && model.Metadata != null) {
                chatMessage.Metadata = model.Metadata;
            }

            if (model.Intent !== undefined && model.Intent != null) {
                chatMessage.Intent = model.Intent;
            }

            if (model.Assessment !== undefined && model.Assessment != null) {
                chatMessage.Assessment = model.Assessment;
            }

            if (model.Feedback !== undefined && model.Feedback != null) {
                chatMessage.Feedback = model.Feedback;
            }

            if (model.HumanHandoff !== undefined && model.HumanHandoff != null) {
                chatMessage.HumanHandoff = model.HumanHandoff;
            }

            if (model.QnA !== undefined && model.QnA != null) {
                chatMessage.QnA = model.QnA;
            }

            var record = await repo.save(chatMessage);
            return ChatMessageMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            const repo: Repository<ChatMessage> = await this.getRepository(this._envProvider, ChatMessage);
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

    private getSearchObject = (filters: ChatMessageSearchFilters) => {
        var search: FindManyOptions<ChatMessage> = {
            where : {},
        };

        if (filters.TenantId) {
            search.where['TenantId'] = filters.TenantId;
        }

        if (filters.UserId) {
            search.where['UserId'] = filters.UserId;
        }

        if (filters.SessionId) {
            search.where['SessionId'] = filters.SessionId;
        }

        if (filters.Channel) {
            search.where['Channel'] = Like(`%${filters.Channel}%`);
        }

        if (filters.LanguageCode) {
            search.where['LanguageCode'] = Like(`%${filters.LanguageCode}%`);
        }

        if (filters.Direction) {
            search.where['Direction'] = filters.Direction;
        }

        if (filters.ContentType) {
            search.where['ContentType'] = filters.ContentType;
        }

        if (filters.PrimaryHandler) {
            search.where['PrimaryHandler'] = filters.PrimaryHandler;
        }

        if (filters.TimestampAfter) {
            search.where['Timestamp'] = MoreThanOrEqual(filters.TimestampAfter);
        }

        return search;
    };

    //#endregion

    private async getSession(sessionId: uuid) {
        const sessionRepo: Repository<Session> = await this.getRepository(this._envProvider, Session);
        const session = await sessionRepo.findOne({
            where : {
                id : sessionId,
            },
        });
        if (!session) {
            ErrorHandler.throwNotFoundError('Session cannot be found');
        }
        return session;
    }

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
