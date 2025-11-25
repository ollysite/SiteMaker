/**
 * 애플리케이션 전반에서 사용하는 커스텀 에러 클래스
 */

export class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class ScrapingError extends AppError {
    constructor(message, originalError = null) {
        super(message, 500, 'SCRAPING_ERROR');
        this.originalError = originalError;
    }
}

export class AiEditError extends AppError {
    constructor(message) {
        super(message, 500, 'AI_EDIT_ERROR');
    }
}
