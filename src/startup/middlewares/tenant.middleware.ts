import express from 'express';
import { TenantRepository } from '../../database/repositories/tenant.repository';
import { logger } from '../../logger/logger';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tenantMiddleware = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
): Promise<void> => {
    try {
        const tenantId = request.params.tenantId || request.headers['x-tenant-id'] as string;

        if (!tenantId) {
            response.status(400).json({ error: 'Tenant ID required' });
            return;
        }

        // Validate tenant exists and is active
        const tenantRepo = new TenantRepository({ tenantId });
        const tenant = await tenantRepo.findOne({ where: { id: tenantId, isActive: true } });

        if (!tenant) {
            response.status(404).json({ error: 'Tenant not found or inactive' });
            return;
        }

        request.tenantId = tenantId;
        request.tenantSchema = `tenant_${tenantId}`;
        request.tenant = tenant;

        next();
    } catch (error) {
        logger.error(`Tenant middleware error: ${error}`);
        response.status(500).json({ error: 'Internal server error' });
    }

};
