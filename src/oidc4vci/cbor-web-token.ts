export class CborWebToken {
  
    /**
     * Tag for CWT
     */
    private static CWT_TAG = Buffer.from("d83d", "hex");

    /**
     * @see https://tools.ietf.org/html/draft-ietf-ace-cbor-web-token-08#section-4
     */
        private claims = { iss: 1, sub: 2, aud: 3, exp: 4, nbf: 5, iat: 6, cti: 7 };
 
}