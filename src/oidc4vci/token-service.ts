import { v4 as uuidv4 } from 'uuid';

export class TokenService {
    constructor(private readonly validTokens: Set<string> = new Set<string>()) {
    }

    public provideToken(): string {
        const token = uuidv4();
        this.validTokens.add(token);
        return token;
    }

    public verifyToken(token: string): boolean {
        if (!token) return false;
        return this.validTokens.has(token);
    }

    public verifyAndRemoveToken(token: string): boolean {
        if (!token) return false;
        if (this.validTokens.has(token)) {
            this.validTokens.delete(token);
            return true;
        }
        return false;
    }
}