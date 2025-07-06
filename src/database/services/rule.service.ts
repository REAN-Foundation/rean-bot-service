import { Rule } from '../models/rule.entity';
import { Condition } from '../models/condition.entity';
import { logger } from '../../logger/logger';
import { ErrorHandler } from '../../common/error.handling/error.handler';
import { Source } from '../database.connector';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { RuleMapper } from '../mappers/rule.mapper';
import { BaseService } from './base.service';
import { uuid } from '../../domain.types/miscellaneous/system.types';
import {
    RuleCreateModel,
    RuleResponseDto,
    RuleSearchFilters,
    RuleSearchResults,
    RuleUpdateModel } from '../../domain.types/rule.domain.types';
import { ConditionMapper } from '../mappers/condition.mapper';
import { ConditionResponseDto } from '../../domain.types/condition.types';

///////////////////////////////////////////////////////////////////////

export class RuleService extends BaseService {

    //#region Repositories

    _ruleRepository: Repository<Rule> = Source.getRepository(Rule);

    _conditionRepository: Repository<Condition> = Source.getRepository(Condition);

    //#endregion

    public create = async (createModel: RuleCreateModel)
        : Promise<RuleResponseDto> => {

        const rule = this._ruleRepository.create({
            Name        : createModel.Name,
            Description : createModel.Description,
        });
        var record = await this._ruleRepository.save(rule);

        return RuleMapper.toResponseDto(record);
    };

    public getById = async (id: uuid): Promise<RuleResponseDto> => {
        try {
            var rule = await this._ruleRepository.findOne({
                where : {
                    id : id
                }
            });
            var conditionDto: ConditionResponseDto = null;
            if (rule.ConditionId) {
                var condition = await this._conditionRepository.findOne({
                    where : {
                        id : rule.ConditionId
                    }
                });
                conditionDto = ConditionMapper.toResponseDto(condition);
            }
            return RuleMapper.toResponseDto(rule, conditionDto);
        } catch (error) {
            logger.error(`❌ Error getting rule by id: ${error.message}`);
            ErrorHandler.throwInternalServerError(error.message, error);
        }
    };

    public search = async (filters: RuleSearchFilters)
        : Promise<RuleSearchResults> => {
        try {
            var search = this.getSearchModel(filters);
            var { search, pageIndex, limit, order, orderByColumn } = this.addSortingAndPagination(search, filters);
            const [list, count] = await this._ruleRepository.findAndCount(search);
            const searchResults = {
                TotalCount     : count,
                RetrievedCount : list.length,
                PageIndex      : pageIndex,
                ItemsPerPage   : limit,
                Order          : order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy      : orderByColumn,
                Items          : list.map(x => RuleMapper.toResponseDto(x)),
            };
            return searchResults;
        } catch (error) {
            logger.error(`❌ Error searching rules: ${error.message}`);
            ErrorHandler.throwDbAccessError('DB Error: Unable to search records!', error);
        }
    };

    public update = async (id: uuid, model: RuleUpdateModel)
        : Promise<RuleResponseDto> => {
        try {
            const rule = await this._ruleRepository.findOne({
                where : {
                    id : id
                }
            });
            if (!rule) {
                ErrorHandler.throwNotFoundError('Rule not found!');
            }
            if (model.Name != null) {
                rule.Name = model.Name;
            }
            if (model.Description != null) {
                rule.Description = model.Description;
            }
            var record = await this._ruleRepository.save(rule);
            var conditionDto: ConditionResponseDto = null;
            if (rule.ConditionId) {
                var condition = await this._conditionRepository.findOne({
                    where : {
                        id : rule.ConditionId
                    }
                });
                conditionDto = ConditionMapper.toResponseDto(condition);
            }
            return RuleMapper.toResponseDto(record, conditionDto);
        } catch (error) {
            logger.error(`❌ Error updating rule: ${error.message}`);
            ErrorHandler.throwInternalServerError(error.message, error);
        }
    };

    public delete = async (id: string): Promise<boolean> => {
        try {
            var record = await this._ruleRepository.findOne({
                where : {
                    id : id
                }
            });
            var result = await this._ruleRepository.remove(record);
            return result != null;
        } catch (error) {
            logger.error(`❌ Error deleting rule: ${error.message}`);
            ErrorHandler.throwInternalServerError(error.message, error);
        }
    };

    public setBaseConditionToRule = async (ruleId: uuid, conditionId: uuid): Promise<boolean> => {
        try {
            var rule = await this._ruleRepository.findOne({
                where : {
                    id : ruleId
                }
            });
            if (!rule) {
                ErrorHandler.throwNotFoundError('Rule not found!');
            }
            var condition = await this._conditionRepository.findOne({
                where : {
                    id : conditionId
                }
            });
            if (!condition) {
                ErrorHandler.throwNotFoundError('Condition not found!');
            }
            rule.ConditionId = condition.id;
            var result = await this._ruleRepository.save(rule);
            return result != null;
        } catch (error) {
            logger.error(`❌ Error setting base condition to rule: ${error.message}`);
            ErrorHandler.throwInternalServerError(error.message, error);
        }
    };

    //#region Privates

    private getSearchModel = (filters: RuleSearchFilters) => {

        var search : FindManyOptions<Rule> = {
            relations : {
            },
            where : {
            }
        };

        if (filters.ParentNodeId) {
            search.where['ParentNode'].id = filters.ParentNodeId;
        }
        if (filters.ConditionId) {
            search.where['Condition'].id = filters.ConditionId;
        }
        if (filters.Name) {
            search.where['Name'] = Like(`%${filters.Name}%`);
        }

        return search;
    };

    //#endregion

}
