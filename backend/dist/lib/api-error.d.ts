declare class ApiError extends Error {
    statusCode: number;
    data: any;
    message: string;
    success: boolean;
    errors: any[];
    constructor(statusCode: number, message?: string, errors?: never[], stack?: string);
}
export { ApiError };
//# sourceMappingURL=api-error.d.ts.map