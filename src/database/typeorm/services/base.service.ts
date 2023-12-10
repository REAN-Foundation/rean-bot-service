import { BaseSearchFilters } from '../../../domain.types/miscellaneous/base.search.types';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { DatabaseConnector } from '../../database.connector';

///////////////////////////////////////////////////////////////////////////////////////////

export class BaseService {

    protected getRepository = async <T>(envProvider: any, T): Promise<Repository<T>> => {
        const source: DataSource = await DatabaseConnector.getDataSource(envProvider);
        if (!source) {
            throw new Error('Database connection not found');
        }
        var repository = source.getRepository<T>(T);
        return repository;
    };

    protected addSortingAndPagination = <T>(search: FindManyOptions<T>, filters: BaseSearchFilters) => {
        //Sorting
        let orderByColumn = 'CreatedAt';
        if (filters.OrderBy) {
            orderByColumn = filters.OrderBy;
        }
        let order = 'ASC';
        if (filters.Order === 'descending') {
            order = 'DESC';
        }
        search['order'] = {};
        search['order'][orderByColumn] = order;

        //Pagination
        let limit = 25;
        if (filters.ItemsPerPage) {
            limit = filters.ItemsPerPage;
        }
        let offset = 0;
        let pageIndex = 0;
        if (filters.PageIndex) {
            pageIndex = filters.PageIndex < 0 ? 0 : filters.PageIndex;
            offset = pageIndex * limit;
        }
        search['take'] = limit;
        search['skip'] = offset;

        return { search, pageIndex, limit, order, orderByColumn };
    };

}
