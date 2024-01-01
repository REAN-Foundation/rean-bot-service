import { FindManyOptions, Like, Repository } from 'typeorm';
import { logger } from '../../../logger/logger';
import { ErrorHandler } from '../../../common/handlers/error.handler';
import { uuid } from '../../../domain.types/miscellaneous/system.types';
import { BaseService } from './base.service';
import { AssessmentMapper } from '../mappers/assessment.mapper';
import { Assessment } from '../models/assessment.entity';
import { AssessmentQuestion } from '../models/assessment.question.entity';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';
import {
    AssessmentCreateModel,
    AssessmentResponseDto,
    AssessmentSearchFilters,
    AssessmentSearchResults,
    AssessmentUpdateModel,
} from '../../../domain.types/assessment.types';
import {
    AssessmentQuestionResponseDto,
    AssessmentQuestionUpdateModel
} from '../../../domain.types/assessment.question.types';

///////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class AssessmentService extends BaseService {

    constructor(
        @inject(TenantEnvironmentProvider) private _envProvider: TenantEnvironmentProvider
    ) {
        super();
    }

    public createAssessment = async (createModel: AssessmentCreateModel): Promise<AssessmentResponseDto> => {
        const assessmentRepo: Repository<Assessment> = await this.getRepository(this._envProvider, Assessment);
        const assessmentQuestionRepo: Repository<AssessmentQuestion> =
            await this.getRepository(this._envProvider, AssessmentQuestion);
        const entity = AssessmentMapper.toEntity(createModel);
        const assessment = assessmentRepo.create(entity);
        const currentQuestion = AssessmentMapper.toQuestionEntity(createModel.CurrentQuestion);
        const currentQuestionRecord = await assessmentQuestionRepo.save(currentQuestion);
        var record = await assessmentRepo.save(assessment);
        return AssessmentMapper.toResponseDto(record, currentQuestionRecord);
    };

    public getAssessmentById = async (id: uuid): Promise<AssessmentResponseDto> => {
        try {
            const repo: Repository<Assessment> = await this.getRepository(this._envProvider, Assessment);
            var assessment = await repo.findOne({
                where : {
                    id : id,
                }
            });
            if (!assessment) {
                ErrorHandler.throwNotFoundError('Assessment not found!');
            }
            return AssessmentMapper.toResponseDto(assessment);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public isAssessmentCompleted = async (id: uuid): Promise<boolean> => {
        try {
            const repo: Repository<Assessment> = await this.getRepository(this._envProvider, Assessment);
            var assessment = await repo.findOne({
                where : {
                    id : id,
                }
            });
            if (!assessment) {
                ErrorHandler.throwNotFoundError('Assessment not found!');
            }
            return assessment.IsCompleted;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getCurrentActiveAssessments = async (userId: uuid): Promise<AssessmentResponseDto[]> => {
        try {
            const repo: Repository<Assessment> = await this.getRepository(this._envProvider, Assessment);
            var assessments = await repo.find({
                where : {
                    UserId      : userId,
                    IsCompleted : false,
                }
            });
            if (!assessments) {
                ErrorHandler.throwNotFoundError('Assessment not found!');
            }
            var records = assessments.map((x) => AssessmentMapper.toResponseDto(x));
            records = records.sort((a, b) => {
                return a.UpdatedAt > b.UpdatedAt ? -1 : 1;
            });
            return records;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getAssessmentByChannelUserId = async (channelUserId: string): Promise<AssessmentResponseDto> => {
        try {
            const assessmentRepo: Repository<Assessment> = await this.getRepository(this._envProvider, Assessment);
            var assessment = await assessmentRepo.findOne({
                where : {
                    ChannelUserId : channelUserId,
                }
            });
            if (!assessment) {
                ErrorHandler.throwNotFoundError('User not found!');
            }
            return AssessmentMapper.toResponseDto(assessment);
        }
        catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public searchAssessments = async (filters: AssessmentSearchFilters): Promise<AssessmentSearchResults> => {
        try {
            var search = this.getSearchObject(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const repo: Repository<Assessment> = await this.getRepository(this._envProvider, Assessment);
            const [list, count] = await repo.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map((x) => AssessmentMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public updateAssessment = async (id: uuid, model: AssessmentUpdateModel): Promise<AssessmentResponseDto> => {
        try {
            const repo: Repository<Assessment> = await this.getRepository(this._envProvider, Assessment);
            const assessment = await repo.findOne({
                where : {
                    id : id,
                },
            });
            if (!assessment) {
                ErrorHandler.throwNotFoundError('Assessment not found!');
            }
            if (model.IsCompleted !== undefined && model.IsCompleted != null) {
                assessment.IsCompleted = model.IsCompleted;
            }
            if (model.ChannelUserId !== undefined && model.ChannelUserId != null) {
                assessment.ChannelUserId = model.ChannelUserId;
            }
            if (model.Channel !== undefined && model.Channel != null) {
                assessment.Channel = model.Channel;
            }
            if (model.CurrentQuestionId !== undefined && model.CurrentQuestionId != null) {
                assessment.CurrentQuestionId = model.CurrentQuestionId;
            }
            if (model.QuestionOptions !== undefined && model.QuestionOptions != null) {
                assessment.QuestionOptions = model.QuestionOptions;
            }
            if (model.CurrentQuestionType !== undefined && model.CurrentQuestionType != null) {
                assessment.CurrentQuestionType = model.CurrentQuestionType;
            }
            if (model.CurrentQuestion !== undefined && model.CurrentQuestion != null) {
                assessment.CurrentQuestion = model.CurrentQuestion;
            }
            var record = await repo.save(assessment);
            return AssessmentMapper.toResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public answerAssessmentQuestion = async (id: uuid, model: AssessmentQuestionUpdateModel)
        : Promise<AssessmentQuestionResponseDto> => {
        try {
            const repo: Repository<AssessmentQuestion> =
                await this.getRepository(this._envProvider, AssessmentQuestion);
            const assessmentQuestion = await repo.findOne({
                where : {
                    id : id,
                },
            });
            if (!assessmentQuestion) {
                ErrorHandler.throwNotFoundError('Assessment question not found!');
            }
            if (model.AnswerGiven !== undefined && model.AnswerGiven != null) {
                assessmentQuestion.AnswerGiven = model.AnswerGiven;
            }
            if (model.AnsweredTimestamp !== undefined && model.AnsweredTimestamp != null) {
                assessmentQuestion.AnsweredTimestamp = model.AnsweredTimestamp;
            }
            var record = await repo.save(assessmentQuestion);

            // Also update the assessment record timestamp
            const assessmentRepo: Repository<Assessment> = await this.getRepository(this._envProvider, Assessment);
            const assessment = await assessmentRepo.findOne({
                where : {
                    id : assessmentQuestion.AssessmentId,
                },
            });
            if (!assessment) {
                ErrorHandler.throwNotFoundError('Assessment not found!');
            }
            assessment.UpdatedAt = new Date();
            await assessmentRepo.save(assessment);

            return AssessmentMapper.toQuestionResponseDto(record);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    public getCurrentQuestion = async (assessmentId: uuid): Promise<AssessmentQuestionResponseDto> => {
        try {
            const repo: Repository<AssessmentQuestion> =
                await this.getRepository(this._envProvider, AssessmentQuestion);
            const assessmentQuestion = await repo.findOne({
                where : {
                    AssessmentId : assessmentId,
                },
            });
            if (!assessmentQuestion) {
                ErrorHandler.throwNotFoundError('Assessment question not found!');
            }
            return AssessmentMapper.toQuestionResponseDto(assessmentQuestion);
        } catch (error) {
            logger.error(error.message);
            ErrorHandler.throwInternalServerError(error.message, 500);
        }
    };

    //#region Privates

    private getSearchObject = (filters: AssessmentSearchFilters) => {
        var search: FindManyOptions<Assessment> = {
            where : {
            },
        };

        if (filters.UserId) {
            search.where['UserId'] = filters.UserId;
        }

        if (filters.Channel) {
            search.where['Channel'] = Like(`%${filters.Channel}%`);
        }

        // if (filters.TimestampAfter) {
        //     search.where['AnsweredTimestamp'] = MoreThanOrEqual(filters.AnsweredTimestamp);
        // }

        return search;
    };

    //#endregion

}
