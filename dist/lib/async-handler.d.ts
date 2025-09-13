import { Request, Response, NextFunction } from "express";
declare const asyncHandler: (requestHandler: (req: Request, res: Response, next: NextFunction) => any) => (req: Request, res: Response, next: NextFunction) => void;
export { asyncHandler };
//# sourceMappingURL=async-handler.d.ts.map