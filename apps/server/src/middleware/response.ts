import { Request, Response, NextFunction } from 'express';

export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
    const oldJson = res.json;
    res.json = function (data: any): Response {
        // Only format for success status codes
        if (res.statusCode >= 400) {
            // But ensure it has code and msg if it doesn't
            if (data && typeof data === 'object' && !('code' in data)) {
                data.code = -1;
                data.msg = data.message || 'Error';
            }
            return oldJson.call(this, data);
        }

        // If data is already in the format {code, data, msg}, don't re-format
        if (data && typeof data === 'object' && ('code' in data && 'msg' in data)) {
            return oldJson.call(this, data);
        }
        
        return oldJson.call(this, {
            code: 0,
            data: data,
            msg: 'ok'
        });
    };

    res.error = function (message: string, code: number = -1): any {
        return oldJson.call(this, {
            code: code,
            msg: message
        });
    };

    next();
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({
        code: -1,
        msg: err.message || 'Internal Server Error',
        stack: err.stack
    });
};
