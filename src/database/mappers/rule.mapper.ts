import { Rule } from '../models/rule.model';
import {
    RuleResponseDto
} from '../../domain.types/rule.domain.types';
import { ConditionResponseDto } from '../../domain.types/condition.types';

///////////////////////////////////////////////////////////////////////////////////

export class RuleMapper {

    static toResponseDto = (rule: Rule, condition?: ConditionResponseDto): RuleResponseDto => {
        if (rule == null) {
            return null;
        }
        const dto: RuleResponseDto = {
            id          : rule.id,
            Name        : rule.Name,
            Description : rule.Description,
            ConditionId : rule.ConditionId,
            Condition   : condition ?? null,
            CreatedAt   : rule.CreatedAt,
            UpdatedAt   : rule.UpdatedAt,
            ParentRule  : null,
        };
        return dto;
    };

}
