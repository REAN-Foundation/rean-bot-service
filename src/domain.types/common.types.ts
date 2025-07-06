
////////////////////////////////////////////////////////////////////////

// Core Common Types
export interface Location {
    Name     ?: string;
    Latitude ?: number;
    Longitude?: number;
}

export type DistanceUnit = 'km' | 'mi' | 'm';
export type TimestampUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'mo' | 'y';

export interface ProcessorResult {
    Success: boolean;
    Tag    : string;
    Data   : any[] | any;
}

export enum DataSamplingMethod {
    Any     = "Any",
    All     = "All",
    Average = "Average",
}

export const DataSamplingMethodList: DataSamplingMethod[] = [
    DataSamplingMethod.Any,
    DataSamplingMethod.All,
    DataSamplingMethod.Average,
];

////////////////////////////////////////////////////////////////////////

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    metadata?: ResponseMetadata;
    timestamp: Date;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    stackTrace?: string;
}

export interface ResponseMetadata {
    requestId: string;
    processingTime: number;
    version: string;
    pagination?: PaginationMetadata;
}

export interface PaginationMetadata {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

////////////////////////////////////////////////////////////////////////

// Pagination and Search Types
export interface PaginationOptions {
    page?: number;
    limit?: number;
    offset?: number;
    sort?: SortOption[];
}

export interface SortOption {
    field: string;
    direction: 'asc' | 'desc';
}

export interface SearchOptions {
    query?: string;
    filters?: Record<string, any>;
    pagination?: PaginationOptions;
    includeTotal?: boolean;
}

export interface SearchResult<T> {
    items: T[];
    total: number;
    pagination: PaginationMetadata;
    filters: Record<string, any>;
}

////////////////////////////////////////////////////////////////////////

// Date and Time Types
export interface DateRange {
    from: Date;
    to: Date;
}

export interface TimeWindow {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone?: string;
}

export interface Duration {
    value: number;
    unit: TimestampUnit;
}

////////////////////////////////////////////////////////////////////////

// Validation Types
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings?: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    code: string;
    message: string;
    value?: any;
}

export interface ValidationWarning {
    field: string;
    code: string;
    message: string;
    value?: any;
}

export interface ValidationRule {
    field: string;
    type: 'required' | 'format' | 'range' | 'custom';
    parameters?: Record<string, any>;
    message?: string;
}

////////////////////////////////////////////////////////////////////////

// Audit and Tracking Types
export interface AuditLog {
    id: string;
    entityType: string;
    entityId: string;
    action: AuditAction;
    userId?: string;
    timestamp: Date;
    changes?: Record<string, ChangeRecord>;
    metadata?: Record<string, any>;
}

export enum AuditAction {
    Create = 'create',
    Update = 'update',
    Delete = 'delete',
    Read = 'read',
    Login = 'login',
    Logout = 'logout',
    Export = 'export',
    Import = 'import'
}

export interface ChangeRecord {
    oldValue: any;
    newValue: any;
    timestamp: Date;
}

////////////////////////////////////////////////////////////////////////

// Configuration Types
export interface ConfigurationOption {
    key: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description?: string;
    required?: boolean;
    defaultValue?: any;
    validation?: ValidationRule[];
}

export interface ConfigurationGroup {
    name: string;
    description?: string;
    options: ConfigurationOption[];
    dependencies?: string[];
}

////////////////////////////////////////////////////////////////////////

// Event and Queue Types
export interface QueueJob<T = any> {
    id: string;
    type: string;
    data: T;
    priority?: number;
    attempts?: number;
    maxAttempts?: number;
    delay?: number;
    createdAt: Date;
    processedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    error?: string;
}

export interface EventPayload<T = any> {
    eventType: string;
    data: T;
    metadata?: Record<string, any>;
    timestamp: Date;
    source: string;
    correlationId?: string;
}

////////////////////////////////////////////////////////////////////////

// Health Check Types
export interface HealthCheck {
    status: HealthStatus;
    checks: HealthCheckDetail[];
    timestamp: Date;
    uptime: number;
    version: string;
}

export enum HealthStatus {
    Healthy = 'healthy',
    Degraded = 'degraded',
    Unhealthy = 'unhealthy'
}

export interface HealthCheckDetail {
    name: string;
    status: HealthStatus;
    responseTime?: number;
    error?: string;
    metadata?: Record<string, any>;
}

////////////////////////////////////////////////////////////////////////

// File and Media Types
export interface FileInfo {
    filename: string;
    size: number;
    mimeType: string;
    path: string;
    url?: string;
    metadata?: FileMetadata;
    createdAt: Date;
}

export interface FileMetadata {
    width?: number;
    height?: number;
    duration?: number;
    bitrate?: number;
    quality?: string;
    format?: string;
    encoding?: string;
}

////////////////////////////////////////////////////////////////////////

// Tenant and Multi-tenancy Types
export interface TenantInfo {
    id: string;
    code: string;
    name: string;
    domain?: string;
    isActive: boolean;
    configuration: TenantConfiguration;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface TenantConfiguration {
    features: string[];
    limits: TenantLimits;
    integrations: TenantIntegration[];
    customSettings: Record<string, any>;
}

export interface TenantLimits {
    maxUsers?: number;
    maxConversations?: number;
    maxMessagesPerDay?: number;
    maxStorageSize?: number;
    maxApiCalls?: number;
}

export interface TenantIntegration {
    service: string;
    enabled: boolean;
    configuration: Record<string, any>;
    credentials?: Record<string, any>;
}

////////////////////////////////////////////////////////////////////////

// Rate Limiting Types
export interface RateLimit {
    limit: number;
    window: Duration;
    remaining: number;
    resetTime: Date;
    blocked: boolean;
}

export interface RateLimitRule {
    identifier: string;
    limit: number;
    window: Duration;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: string;
}

////////////////////////////////////////////////////////////////////////

// Cache Types
export interface CacheOptions {
    ttl?: number; // time to live in seconds
    maxSize?: number;
    compress?: boolean;
    tags?: string[];
}

export interface CacheStats {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    maxSize: number;
    evictions: number;
}

////////////////////////////////////////////////////////////////////////

// Base Entity Types
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    version?: number;
}

export interface TenantEntity extends BaseEntity {
    tenantId: string;
}

////////////////////////////////////////////////////////////////////////
