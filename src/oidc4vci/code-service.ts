import { v4 as uuidv4 } from 'uuid';

export class CodeService {

    constructor(private readonly validCodes: Set<string> = new Set<string>()) {
    }

    public provideCode(): string {
        const code = uuidv4();
        this.validCodes.add(code);
        return code;
    }

    public verifyCode(code: string): boolean {
        if (!code) return false;
        if (this.validCodes.has(code)) {
            this.validCodes.delete(code);
            return true;
        }
        return false;
    }
}