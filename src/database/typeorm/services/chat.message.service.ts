import { FindManyOptions, Like, Repository } from 'typeorm';
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
        // const session = await this.getSession(createModel.SessionId);
        // const user = await this.getUser(createModel.UserId);
        const repo: Repository<ChatMessage> = await this.getRepository(this._envProvider, ChatMessage);
        const chatMessage = repo.create({
            // Session                   : session,
            // User                      : user,
            TenantId                  : createModel.TenantId,
            UserId                    : createModel.UserId,
            SessionId                 : createModel.SessionId,
            Platform                  : createModel.Platform,
            LanguageCode              : createModel.LanguageCode,
            Name                      : createModel.Name,
            MessageContent            : createModel.MessageContent,
            ImageContent              : createModel.ImageContent,
            ImageUrl                  : createModel.ImageUrl,
            PlatformUserId            : createModel.PlatformUserId,
            PlatformMessageId         : createModel.PlatformMessageId,
            PlatformResponseMessageId : createModel.PlatformResponseMessageId,
            Direction                 : createModel.Direction,
            ContentType               : createModel.ContentType,
            AssessmentId              : createModel.AssessmentId,
            AssessmentNodeId          : createModel.AssessmentNodeId,
            FeedbackType              : createModel.FeedbackType,
            IdentifiedIntent          : createModel.IdentifiedIntent,
        });
        var record = await repo.save(chatMessage);
        return ChatMessageMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<ChatMessageResponseDto> => {
        try {
            const repo: Repository<ChatMessage> = await this.getRepository(this._envProvider, ChatMessage);

            var chatMessage = await repo.findOne({
                where : {
                    id : id,
                },
                select : {
                    TenantId                  : true,
                    UserId                    : true,
                    SessionId                 : true,
                    Platform                  : true,
                    LanguageCode              : true,
                    Name                      : true,
                    MessageContent            : true,
                    ImageContent              : true,
                    ImageUrl                  : true,
                    PlatformUserId            : true,
                    PlatformMessageId         : true,
                    PlatformResponseMessageId : true,
                    SentTimestamp             : true,
                    DeliveredTimestamp        : true,
                    ReadTimestamp             : true,
                    Direction                 : true,
                    ContentType               : true,
                    AssessmentId              : true,
                    AssessmentNodeId          : true,
                    FeedbackType              : true,
                    IdentifiedIntent          : true,
                    HumanHandoff              : true,
                    // Session                   : {
                    //     id              : true,
                    //     UserId          : true,
                    //     Platform        : true,
                    //     LastMessageDate : true,
                    // },
                    // User : {
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
                //     Session : true,
                //     User    : true,
                // },
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
                Order          : order === 'DESC' ? 'descending'                    : 'ascending',
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

            if (model.TenantId !== undefined && model.TenantId != null) {
                chatMessage.TenantId = model.TenantId;
            }

            if (model.UserId !== undefined && model.UserId != null) {
                chatMessage.UserId = model.UserId;
            }

            if (model.SessionId !== undefined && model.SessionId != null) {
                chatMessage.SessionId = model.SessionId;
            }

            if (model.Platform !== undefined && model.Platform != null) {
                chatMessage.Platform = model.Platform;
            }

            if (model.LanguageCode !== undefined && model.LanguageCode != null) {
                chatMessage.LanguageCode = model.LanguageCode;
            }

            if (model.Name !== undefined && model.Name != null) {
                chatMessage.Name = model.Name;
            }

            if (model.MessageContent !== undefined && model.MessageContent != null) {
                chatMessage.MessageContent = model.MessageContent;
            }

            if (model.ImageContent !== undefined && model.ImageContent != null) {
                chatMessage.ImageContent = model.ImageContent;
            }

            if (model.ImageUrl !== undefined && model.ImageUrl != null) {
                chatMessage.ImageUrl = model.ImageUrl;
            }

            if (model.PlatformUserId !== undefined && model.PlatformUserId != null) {
                chatMessage.PlatformUserId = model.PlatformUserId;
            }

            if (model.PlatformMessageId !== undefined && model.PlatformMessageId != null) {
                chatMessage.PlatformMessageId = model.PlatformMessageId;
            }

            if (model.PlatformResponseMessageId !== undefined && model.PlatformResponseMessageId != null) {
                chatMessage.PlatformResponseMessageId = model.PlatformResponseMessageId;
            }

            if (model.Direction !== undefined && model.Direction != null) {
                chatMessage.Direction = model.Direction;
            }

            if (model.ContentType !== undefined && model.ContentType != null) {
                chatMessage.ContentType = model.ContentType;
            }

            if (model.AssessmentId !== undefined && model.AssessmentId != null) {
                chatMessage.AssessmentId = model.AssessmentId;
            }

            if (model.AssessmentNodeId !== undefined && model.AssessmentNodeId != null) {
                chatMessage.AssessmentNodeId = model.AssessmentNodeId;
            }

            if (model.FeedbackType !== undefined && model.FeedbackType != null) {
                chatMessage.FeedbackType = model.FeedbackType;
            }

            if (model.IdentifiedIntent !== undefined && model.IdentifiedIntent != null) {
                chatMessage.IdentifiedIntent = model.IdentifiedIntent;
            }

            if (model.SessionId != null) {
                chatMessage.SessionId = model.SessionId;
                // const session = await this.getSession(model.SessionId);
                // chatMessage.Session = session;
            }

            if (model.UserId != null) {
                chatMessage.UserId = model.UserId;
                // const user = await this.getUser(model.UserId);
                // chatMessage.User = user;
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
            // relations : {
            //     Session : true,
            //     User    : true,
            // },
            where  : {},
            select : {
                id                 : true,
                TenantId           : true,
                UserId             : true,
                SessionId          : true,
                Platform           : true,
                Name               : true,
                MessageContent     : true,
                ImageContent       : true,
                ImageUrl           : true,
                SentTimestamp      : true,
                DeliveredTimestamp : true,
                ReadTimestamp      : true,
                Direction          : true,
                ContentType        : true,
                AssessmentId       : true,
                AssessmentNodeId   : true,
                FeedbackType       : true,
                IdentifiedIntent   : true,
                HumanHandoff       : true,
                CreatedAt          : true,
                UpdatedAt          : true,
                // Session            : {
                //     id              : true,
                //     UserId          : true,
                //     Platform        : true,
                //     LastMessageDate : true,
                // },
                // User : {
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

        if (filters.TenantId) {
            search.where['TenantId'] = filters.TenantId;
        }

        if (filters.UserId) {
            search.where['UserId'] = filters.UserId;
        }

        if (filters.SessionId) {
            search.where['SessionId'] = filters.SessionId;
        }

        if (filters.Platform) {
            search.where['Platform'] = Like(`%${filters.Platform}%`);
        }

        if (filters.LanguageCode) {
            search.where['LanguageCode'] = Like(`%${filters.LanguageCode}%`);
        }

        if (filters.Name) {
            search.where['Name'] = Like(`%${filters.Name}%`);
        }

        if (filters.MessageContent) {
            search.where['MessageContent'] = Like(`%${filters.MessageContent}%`);
        }

        if (filters.ImageContent) {
            search.where['ImageContent'] = Like(`%${filters.ImageContent}%`);
        }

        if (filters.ImageUrl) {
            search.where['ImageUrl'] = Like(`%${filters.ImageUrl}%`);
        }

        if (filters.PlatformUserId) {
            search.where['PlatformUserId'] = Like(`%${filters.PlatformUserId}%`);
        }

        if (filters.PlatformMessageId) {
            search.where['PlatformMessageId'] = Like(`%${filters.PlatformMessageId}%`);
        }

        if (filters.PlatformResponseMessageId) {
            search.where['PlatformResponseMessageId'] = Like(`%${filters.PlatformResponseMessageId}%`);
        }

        if (filters.SentTimestamp) {
            search.where['SentTimestamp'] = filters.SentTimestamp;
        }

        if (filters.DeliveredTimestamp) {
            search.where['DeliveredTimestamp'] = filters.DeliveredTimestamp;
        }

        if (filters.ReadTimestamp) {
            search.where['ReadTimestamp'] = filters.ReadTimestamp;
        }

        if (filters.Direction) {
            search.where['Direction'] = filters.Direction;
        }

        if (filters.ContentType) {
            search.where['ContentType'] = filters.ContentType;
        }

        if (filters.AssessmentId) {
            search.where['AssessmentId'] = filters.AssessmentId;
        }

        if (filters.AssessmentNodeId) {
            search.where['AssessmentNodeId'] = filters.AssessmentNodeId;
        }

        if (filters.FeedbackType) {
            search.where['FeedbackType'] = filters.FeedbackType;
        }

        if (filters.IdentifiedIntent) {
            search.where['IdentifiedIntent'] = Like(`%${filters.IdentifiedIntent}%`);
        }

        if (filters.HumanHandoff) {
            search.where['HumanHandoff'] = filters.HumanHandoff;
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
