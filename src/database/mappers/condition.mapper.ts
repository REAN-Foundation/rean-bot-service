import { Condition } from '../models/condition.model';
import {
    ConditionResponseDto
} from '../../domain.types/condition.types';

///////////////////////////////////////////////////////////////////////////////////

export class ConditionMapper {

    static toResponseDto = (condition: Condition): ConditionResponseDto => {
        if (condition == null) {
            return null;
        }
        const dto: ConditionResponseDto = {
            id                      : condition.id,
            Name                    : condition.Name,
            Description             : condition.Description,
            ParentRuleId            : condition.ParentRuleId,
            ParentConditionId       : condition.ParentConditionId,
            OperatorType            : condition.OperatorType,
            LogicalOperatorType     : condition.LogicalOperatorType,
            CompositionOperatorType : condition.CompositionOperatorType,
            FirstOperand            : condition.FirstOperand,
            SecondOperand           : condition.SecondOperand,
            ThirdOperand            : condition.ThirdOperand,
            CreatedAt               : condition.CreatedAt,
            UpdatedAt               : condition.UpdatedAt,
            ParentRule              : null,
            ParentCondition         : null,
        };
        return dto;
    };

}
