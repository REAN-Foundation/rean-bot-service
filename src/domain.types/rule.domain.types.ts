import {
    BaseSearchFilters,
    BaseSearchResults
} from "./miscellaneous/base.search.types";
import {
    uuid
} from "./miscellaneous/system.types";
import { ConditionResponseDto } from "./condition.types";

//////////////////////////////////////////////////////////////

export interface RuleCreateModel {
    Name        : string;
    Description?: string;
    ParentNodeId: uuid;
    SchemaId    : uuid;
    ConditionId : uuid;
    NodePathId ?: uuid;
}

export interface RuleUpdateModel {
    Name         ?: string;
    Description  ?: string;
    ParentNodeId ?: uuid;
    SchemaId     ?: uuid;
    ConditionId  ?: uuid;
    NodePathId   ?: uuid;
}

export interface RuleResponseDto {
    id         : uuid;
    Name       : string;
    Description: string;
    Condition  : ConditionResponseDto;
    ConditionId: uuid;
    ParentRule : RuleResponseDto;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface RuleSearchFilters extends BaseSearchFilters {
    Name         ?: string;
    ParentNodeId ?: uuid;
    ConditionId  ?: uuid;
    NodePathId   ?: uuid;
}

export interface RuleSearchResults extends BaseSearchResults {
    Items: RuleResponseDto[];
}
