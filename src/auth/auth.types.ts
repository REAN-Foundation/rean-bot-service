import { Request, Response, NextFunction } from 'express';

export interface AuthResult {
    Result: boolean;
    Message: string;
    HttpErrorCode: number;
}

export type Middleware = (request: Request, response: Response, next: NextFunction) => Promise<void>;

export type RequestType = 'Create' | 'GetById' | 'Update' | 'Delete' | 'Search' | 'FindAll' | 'Get' | 'Other' | null | undefined;

export type ResourceId = string | number | null | undefined;

export interface UserAuthOptions {
    AllowAnonymous: boolean;
    UseCustomAuthorization: true;
}
