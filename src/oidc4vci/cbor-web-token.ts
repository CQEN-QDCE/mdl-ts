export class CborWebToken {
  
    /**
     * Tag for CWT
     */
    private static CWT_TAG = Buffer.from('d83d', 'hex');

    /**
     * @see https://tools.ietf.org/html/draft-ietf-ace-cbor-web-token-08#section-4
     */
        private claims = { iss: 1, sub: 2, aud: 3, exp: 4, nbf: 5, iat: 6, cti: 7 };

    public async mac(payload: any, secret: string | Buffer): Promise<string> {
//        const mappedPayload = cbor.encode(this.translateClaims(payload));
//        const buf = await cose.mac.create(
//            { p: { alg: "SHA-256_64" } },
//            mappedPayload,
//            { key: secret });
//        return Buffer.concat([Cborwebtoken.CWT_TAG, buf]).toString("base64");
        throw 'Not implemented';
    }
}