import { FindManyOptions, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { uuid } from '../../../types/miscellaneous/system.types';
import { BaseService } from './base.service';
import {
    SupportMessageCreateModel,
    SupportMessageResponseDto,
    SupportMessageSearchFilters,
    // SupportMessageSearchResults,
    SupportMessageUpdateModel,
} from '../../../types/domain.models/support.message.domain.models';
import { SupportMessageMapper } from '../mappers/support.message.mapper';
import { SupportMessage } from '../models/support.message.entity';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';

///////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class SupportMessageService extends BaseService {

    constructor(
        @inject(TenantEnvironmentProvider) private _envProvider: TenantEnvironmentProvider
    ) {
        super();
    }

    public create = async (createModel: SupportMessageCreateModel): Promise<SupportMessageResponseDto> => {
        try {
            const supportMessageRepo: Repository<SupportMessage> =
                await this.getRepository(this._envProvider, SupportMessage);
            const entity: SupportMessage = SupportMessageMapper.toEntity(createModel);
            const supportMessage = supportMessageRepo.create(entity);
            var record = await supportMessageRepo.save(supportMessage);
            return SupportMessageMapper.toResponseDto(record);
        }
        catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getById = async (id: uuid): Promise<SupportMessageResponseDto> => {
        try {
            const repo: Repository<SupportMessage> = await this.getRepository(this._envProvider, SupportMessage);
            var message = await repo.findOne({
                where : {
                    id : id,
                }
            });
            return SupportMessageMapper.toResponseDto(message);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getLatestMessageForSession = async (sessionId: uuid): Promise<SupportMessageResponseDto> => {
        try {
            const repo: Repository<SupportMessage> = await this.getRepository(this._envProvider, SupportMessage);
            var message = await repo.findOne({
                where : {
                    SessionId : sessionId,
                },
                order : {
                    Timestamp : 'DESC',
                },
            });
            return SupportMessageMapper.toResponseDto(message);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getByChatMessageId = async (channelMessageId: string): Promise<SupportMessageResponseDto> => {
        try {
            const repo: Repository<SupportMessage> = await this.getRepository(this._envProvider, SupportMessage);
            var message = await repo.findOne({
                where : {
                    ChatMessageId : channelMessageId,
                },
            });
            return SupportMessageMapper.toResponseDto(message);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getAllBySupportTicketId = async (supportTicketId: string): Promise<SupportMessageResponseDto[]> => {
        try {
            const repo: Repository<SupportMessage> = await this.getRepository(this._envProvider, SupportMessage);
            var chatMessages = await repo.find({
                where : {
                    SupportTicketId : supportTicketId,
                },
            });
            var messages = chatMessages.map(x => SupportMessageMapper.toResponseDto(x));
            messages = messages.sort((a, b) => {
                return a.Timestamp.getTime() - b.Timestamp.getTime();
            });
            return messages;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getLatestBySupportTicketId = async (supportTicketId: string): Promise<SupportMessageResponseDto> => {
        try {
            const repo: Repository<SupportMessage> = await this.getRepository(this._envProvider, SupportMessage);
            var chatMessage = await repo.findOne({
                where : {
                    SupportTicketId : supportTicketId,
                },
                order : {
                    Timestamp : 'DESC',
                },
            });
            return SupportMessageMapper.toResponseDto(chatMessage);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public update = async (id: uuid, model: SupportMessageUpdateModel): Promise<SupportMessageResponseDto> => {
        try {
            const repo: Repository<SupportMessage> = await this.getRepository(this._envProvider, SupportMessage);
            const chatMessage = await repo.findOne({
                where : {
                    id : id,
                },
            });
            if (!chatMessage) {
                ErrorHandler.throwNotFoundError('Chat message not found!');
            }

            if (model.ChatMessageId !== undefined && model.ChatMessageId != null) {
                chatMessage.ChatMessageId = model.ChatMessageId;
            }

            if (model.SupportChannelUserId !== undefined && model.SupportChannelUserId != null) {
                chatMessage.SupportChannelUserId = model.SupportChannelUserId;
            }

            if (model.SupportChannelMessageId !== undefined && model.SupportChannelMessageId != null) {
                chatMessage.SupportChannelMessageId = model.SupportChannelMessageId;
            }

            if (model.Content !== undefined && model.Content != null) {
                chatMessage.Content = model.Content;
            }

            if (model.TranslatedContent !== undefined && model.TranslatedContent != null) {
                chatMessage.TranslatedContent = model.TranslatedContent;
            }

            if (model.Direction !== undefined && model.Direction != null) {
                chatMessage.Direction = model.Direction;
            }

            if (model.LanguageCode !== undefined && model.LanguageCode != null) {
                chatMessage.LanguageCode = model.LanguageCode;
            }

            if (model.IsExitMessage !== undefined && model.IsExitMessage != null) {
                chatMessage.IsExitMessage = model.IsExitMessage;
            }

            if (model.Metadata !== undefined && model.Metadata != null) {
                chatMessage.Metadata = model.Metadata;
            }

            var record = await repo.save(chatMessage);
            return SupportMessageMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            const repo: Repository<SupportMessage> = await this.getRepository(this._envProvider, SupportMessage);
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

    private getSearchObject = (filters: SupportMessageSearchFilters) => {
        var search: FindManyOptions<SupportMessage> = {
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

        if (filters.SupportChannel) {
            search.where['SupportChannel'] = filters.SupportChannel;
        }

        if (filters.ChannelUserId) {
            search.where['ChannelUserId'] = Like(`%${filters.ChannelUserId}%`);
        }

        if (filters.LanguageCode) {
            search.where['LanguageCode'] = Like(`%${filters.LanguageCode}%`);
        }

        if (filters.Direction) {
            search.where['Direction'] = filters.Direction;
        }

        if (filters.SupportTicketId) {
            search.where['SupportTicketId'] = filters.SupportTicketId;
        }

        if (filters.TimestampAfter) {
            search.where['Timestamp'] = MoreThanOrEqual(filters.TimestampAfter);
        }

        return search;
    };

    public getBySupportChannelMessageId = async (supportChannelMessageId: string)
        : Promise<SupportMessageResponseDto> => {
        try {
            const repo: Repository<SupportMessage> = await this.getRepository(this._envProvider, SupportMessage);
            var message = await repo.findOne({
                where : {
                    SupportChannelMessageId : supportChannelMessageId,
                },
            });
            return SupportMessageMapper.toResponseDto(message);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#endregion

}
