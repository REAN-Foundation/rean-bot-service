import { BaseSearchFilters, BaseSearchResults } from '../miscellaneous/base.search.types';
import { JsonString, uuid } from '../miscellaneous/system.types';
import {
    ChannelType
} from '../enums';

//////////////////////////////////////////////////////////////////////////////

export interface AssessmentQuestionCreateModel {
    id                 : uuid;
    UserId             : uuid;
    AssessmentId       : uuid;
    SessionId          : uuid;
    Question           : string;
    QuestionType       : string;
    QuestionOptions   ?: JsonString;
}

export interface AssessmentQuestionUpdateModel {
    AnswerGiven       ?: string;
    AnsweredTimestamp ?: Date;
}

export interface AssessmentQuestionResponseDto {
    id                 : uuid;
    UserId             : uuid;
    AssessmentId       : uuid;
    SessionId          : uuid;
    Question           : string;
    QuestionType       : string;
    QuestionOptions   ?: JsonString;
    AnswerGiven       ?: string;
    AnsweredTimestamp ?: Date;
    CreatedAt          : Date;
    UpdatedAt          : Date;
}

//////////////////////////////////////////////////////////////////////////////

export interface AssessmentCreateModel {
    id                      : uuid;
    TenantId               ?: uuid;
    UserId                  : uuid;
    SessionId               : uuid;
    Channel                ?: ChannelType;
    ChannelUserId          ?: string;
    AssessmentName         ?: string;
    CurrentQuestionId      ?: uuid;
    CurrentQuestion        ?: string;
    CurrentQuestionType    ?: string;
    CurrentQuestionOptions ?: JsonString;
    FirstQuestion          ?: AssessmentQuestionCreateModel;
}

export interface AssessmentUpdateModel {
    Channel                ?: ChannelType;
    ChannelUserId          ?: string;
    CurrentQuestionId      ?: uuid;
    CurrentQuestionOptions ?: JsonString;
    SupportChannelTaskId   ?: string;
    CurrentQuestionType    ?: string;
    CurrentQuestion        ?: string;
    IsCompleted            ?: boolean;
}

export interface AssessmentResponseDto {
    id                      : uuid;
    TenantId               ?: uuid;
    UserId                  : uuid;
    SessionId               : uuid;
    Channel                ?: ChannelType;
    ChannelUserId          ?: string;
    AssessmentName         ?: string;
    CurrentQuestionId      ?: uuid;
    CurrentQuestion        ?: string;
    CurrentQuestionType    ?: string;
    CurrentQuestionOptions ?: JsonString;
    IsCompleted             : boolean;
    CreatedAt               : Date;
    UpdatedAt               : Date;
}

export interface AssessmentSearchFilters extends BaseSearchFilters {
    TenantId       ?: uuid;
    UserId         ?: uuid;
    ChannelUserId  ?: string;
    SessionId      ?: uuid;
    Channel        ?: ChannelType;
    IsCompleted    ?: boolean;
    TimestampAfter ?: Date;
}

export interface AssessmentSearchResults extends BaseSearchResults {
    Items: AssessmentResponseDto[];
}
