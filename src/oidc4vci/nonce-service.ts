import { v4 as uuidv4 } from 'uuid';

export class NonceService {

    constructor(private readonly validNonces: Set<string> = new Set<string>()) {
    }

    public provideNonce(): string {
        const nonce = uuidv4();
        this.validNonces.add(nonce);
        return nonce;
    }

    public verifyNonce(nonce: string): boolean {
        if (!nonce) return false;
        if (this.validNonces.has(nonce)) {
            this.validNonces.delete(nonce);
            return true;
        }
        return false;
    }
}