import { Assessment } from '../models/assessment.entity';
import { AssessmentQuestion } from '../models/assessment.question.entity';
import { AssessmentCreateModel, AssessmentQuestionCreateModel, AssessmentQuestionResponseDto, AssessmentResponseDto } from '../../../types/domain.models/assessment.domain.models';
import { ChannelType } from '../../../types/enums';

///////////////////////////////////////////////////////////////////////////////////

export class AssessmentMapper {

    static toEntity = (model: AssessmentCreateModel): any => {
        if (model == null) {
            return null;
        }
        const entity: any = {
            id                     : model.id,
            TenantId               : model.TenantId,
            UserId                 : model.UserId,
            SessionId              : model.SessionId,
            Channel                : model.Channel,
            ChannelUserId          : model.ChannelUserId,
            AssessmentName         : model.AssessmentName ?? null,
            CurrentQuestionId      : model.CurrentQuestionId ?? null,
            CurrentQuestion        : model.CurrentQuestion ?? null,
            CurrentQuestionType    : model.CurrentQuestionType ?? null,
            CurrentQuestionOptions : model.CurrentQuestionOptions ? JSON.stringify(model.CurrentQuestionOptions) : null,
        };
        return entity;
    };

    static toResponseDto = (m: Assessment): AssessmentResponseDto => {
        if (m == null) {
            return null;
        }
        const dto: AssessmentResponseDto = {
            id                     : m.id,
            TenantId               : m.TenantId,
            UserId                 : m.UserId,
            SessionId              : m.SessionId,
            Channel                : m.Channel as ChannelType,
            ChannelUserId          : m.ChannelUserId,
            AssessmentName         : m.AssessmentName,
            CurrentQuestionId      : m.CurrentQuestionId,
            CurrentQuestion        : m.CurrentQuestion,
            CurrentQuestionType    : m.CurrentQuestionType,
            CurrentQuestionOptions : m.CurrentQuestionOptions ? JSON.parse(m.CurrentQuestionOptions) : null,
            IsCompleted            : m.IsCompleted,
            CreatedAt              : m.CreatedAt,
            UpdatedAt              : m.UpdatedAt,
        };
        return dto;
    };

    static toQuestionEntity = (model: AssessmentQuestionCreateModel): any => {
        if (model == null) {
            return null;
        }
        const entity: any = {
            id              : model.id,
            UserId          : model.UserId,
            SessionId       : model.SessionId,
            AssessmentId    : model.id,
            Question        : model.Question ?? null,
            QuestionType    : model.QuestionType ?? null,
            QuestionOptions : model.QuestionOptions ? JSON.stringify(model.QuestionOptions) : null,
        };
        return entity;
    };

    static toQuestionResponseDto = (m: AssessmentQuestion): AssessmentQuestionResponseDto => {
        if (m == null) {
            return null;
        }
        const dto: AssessmentQuestionResponseDto = {
            id                : m.id,
            UserId            : m.UserId,
            SessionId         : m.SessionId,
            AssessmentId      : m.AssessmentId,
            Question          : m.Question,
            QuestionType      : m.QuestionType,
            QuestionOptions   : m.QuestionOptions ? JSON.parse(m.QuestionOptions) : null,
            AnswerGiven       : m.AnswerGiven,
            AnsweredTimestamp : m.AnsweredTimestamp,
            CreatedAt         : m.CreatedAt,
            UpdatedAt         : m.UpdatedAt,
        };
        return dto;
    };

}
