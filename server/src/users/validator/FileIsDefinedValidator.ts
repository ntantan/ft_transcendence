import { FileValidator } from "@nestjs/common";

export class FileIsDefinedValidator extends FileValidator {
    constructor() {
        super({
            fileIsRequired: true,
        });
    }
    isValid(file?: unknown): boolean {
        return !!file;
    }
    buildErrorMessage(): string {
        return 'File is not defined';
    }
}