import { CoseAlgorithm } from "../cose/cose-algorithm.enum";
import { COSEMac0 } from "../cose/cose-mac-0";
import { ByteStringElement } from "../data-element/byte-string-element";
import { DataElement } from "../data-element/data-element";
import { DataElementDeserializer } from "../data-element/data-element-deserializer";
import { DataElementSerializer } from "../data-element/data-element-serializer";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { NumberElement } from "../data-element/number-element";
import { StringElement } from "../data-element/string-element";
import { Base64 } from "../utils/base64";

export class CborWebToken {
  
    // @SerialName("iss")
    public issuer: string | null = null;

    // @SerialName("sub")
    public subject: string | null = null;

    // @SerialName("aud")
    public audience: string | null = null;

    // @SerialName("exp")
    public expiration: number | null = null;

    // @SerialName("nbf")
    public notBefore: number | null = null;

    // @SerialName("iat")
    public issuedAt: number | null = null;

    // @SerialName("cti")
    public cwtId: ArrayBuffer | null = null;

    // @SerialName("nonce")
    public nonce: ArrayBuffer | null = null;

    private coseMessage = new COSEMac0();

    private static readonly ISS_KEY = 1;
    private static readonly SUB_KEY = 2;
    private static readonly AUD_KEY = 3;
    private static readonly EXP_KEY = 4;
    private static readonly NBF_KEY = 5;
    private static readonly IAT_KEY = 6;
    private static readonly CTI_KEY = 7;
    private static readonly NONCE_KEY = 10;

    /**
     * Tag for CWT
     */
    private static CWT_TAG = Buffer.from('d83d', 'hex');

    /**
     * @see https://tools.ietf.org/html/draft-ietf-ace-cbor-web-token-08#section-4
     */
        private claims = { iss: 1, sub: 2, aud: 3, exp: 4, nbf: 5, iat: 6, cti: 7 };

    constructor() {
    }

    public async mac(secret: ArrayBuffer): Promise<void> {
        const payload = DataElementSerializer.toCBOR(this.serializeClaims());
        this.coseMessage.headers.algorithm.value = CoseAlgorithm.HMAC256_64; // TODO: Permettre de changer ceci.
        this.coseMessage.attachPayload(payload);
        await this.coseMessage.mac(secret);
    }

    public async verify(secret: ArrayBuffer): Promise<boolean> {
        const payload = DataElementSerializer.toCBOR(this.serializeClaims());
        this.coseMessage.headers.algorithm.value = CoseAlgorithm.HMAC256_64; // TODO: Permettre de changer ceci.
        this.coseMessage.attachPayload(payload);
       return await this.coseMessage.verify(secret);
    }

    public static fromListElement(listElement: DataElement): CborWebToken {
        const cwt = new CborWebToken();
        const coseMessage = COSEMac0.fromDataElement(listElement);
        cwt.coseMessage = coseMessage;
        const payload = coseMessage.payload;
        cwt.deserializeClaims(<MapElement>DataElementDeserializer.fromCBOR(payload));
        return cwt;
    }

    public serialize(): string {
        return Buffer.concat([CborWebToken.CWT_TAG, Buffer.from(DataElementSerializer.toCBOR(this.coseMessage.toDataElement()))]).toString("base64");
    }

    public static parse(value: string): CborWebToken {
        const test = DataElementDeserializer.fromCBOR(Base64.decode(value));
        return CborWebToken.fromListElement(test);
    } 

    private serializeClaims(): MapElement {
        const payload = new Map<MapKey, DataElement>();

        if (this.issuer) {
            payload.set(new MapKey(CborWebToken.ISS_KEY), new StringElement(this.issuer));
        }

        if (!this.subject) {
            throw new Error('sub is mandatory');
        }
        payload.set(new MapKey(CborWebToken.SUB_KEY), new StringElement(this.subject));

        if (!this.audience) {
            throw new Error('aud is mandatory');
        }
        payload.set(new MapKey(CborWebToken.AUD_KEY), new StringElement(this.audience));


        if (!this.expiration) {
            throw new Error('exp is mandatory');
        }
        payload.set(new MapKey(CborWebToken.EXP_KEY), new NumberElement(this.expiration));

        if (!this.notBefore) {
            throw new Error('nbf is mandatory');
        }
        payload.set(new MapKey(CborWebToken.NBF_KEY), new NumberElement(this.notBefore));

        if (!this.issuedAt) {
            throw new Error('iat is mandatory');
        }
        payload.set(new MapKey(CborWebToken.IAT_KEY), new NumberElement(this.issuedAt));
        
        if (this.cwtId) {
            payload.set(new MapKey(CborWebToken.CTI_KEY), new ByteStringElement(this.cwtId));
        }

        if (this.nonce) {
            payload.set(new MapKey(CborWebToken.NONCE_KEY), new ByteStringElement(this.nonce));
        }
        return new MapElement(payload);
    }

    private deserializeClaims(payload: MapElement): void {
        const issStringElement = payload.get(new MapKey(CborWebToken.ISS_KEY));
        if (issStringElement) this.issuer = issStringElement.value;

        const subStringElement = payload.get(new MapKey(CborWebToken.SUB_KEY));
        if (subStringElement) this.subject = subStringElement.value;

        const audStringElement = payload.get(new MapKey(CborWebToken.AUD_KEY));
        if (audStringElement) this.audience = audStringElement.value;

        const expNumberElement = payload.get(new MapKey(CborWebToken.EXP_KEY));
        if (expNumberElement) this.expiration = expNumberElement.value;

        const nbfNumberElement = payload.get(new MapKey(CborWebToken.NBF_KEY));
        if (nbfNumberElement) this.notBefore = nbfNumberElement.value;

        const iatNumberElement = payload.get(new MapKey(CborWebToken.IAT_KEY));
        if (iatNumberElement) this.issuedAt = iatNumberElement.value;
       
        const ctiByteStringElement = payload.get(new MapKey(CborWebToken.CTI_KEY));
        if (ctiByteStringElement) this.cwtId = ctiByteStringElement.value;

        const nonceByteStringElement = payload.get(new MapKey(CborWebToken.NONCE_KEY));
        if (nonceByteStringElement) this.nonce = nonceByteStringElement.value;
    }
}