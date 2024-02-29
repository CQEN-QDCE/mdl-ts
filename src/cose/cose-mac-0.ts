import { Crypto } from "@peculiar/webcrypto";
import { CborByteString } from "../cbor/types/cbor-byte-string";
import { CborDataItem } from "../cbor/cbor-data-item";
import { CborEncoder } from "../cbor/cbor-encoder";
import { CborMap } from "../data-element/cbor-map";
import { MapKey } from "../data-element/map-key";
import { CborNumber } from "../cbor/types/cbor-number";
import { CborTextString } from "../cbor/types/cbor-text-string";
import { ArrayBufferComparer } from "../utils/array-buffer-comparer";
import { CoseHeaderLabel } from "./cose-header-label.enum";
import { COSEObject } from "./cose-object";
import { CoseAlgorithm } from "./cose-algorithm.enum";
import { CborDecoder } from "../cbor/cbor-decoder";
import { CborConvertible } from "../cbor/cbor-convertible";
import { CborArray } from "../data-element/cbor-array";

export class COSEMac0 extends COSEObject<COSEMac0> implements CborConvertible {
   
    private readonly context = 'MAC0';

    private digest: ArrayBuffer | null = null;

    constructor() {
        super();
        this.headers.algorithm.value = CoseAlgorithm.HMAC256;
    }

    detachPayload(): COSEMac0 {
        this.content = null;
        return this;
    }

    attachPayload(payload: ArrayBuffer): COSEMac0 {
        this.content = payload;
        return this;
    }

    public async mac(secret: ArrayBuffer, externalData: ArrayBuffer = new ArrayBuffer(0)): Promise<void> {
        
        const crypto = new Crypto();
        
        const algorithm = CoseAlgorithm.toSubtleCryptoAlgorithm(this.headers.algorithm.value);

        const key = await crypto.subtle.importKey('raw', secret, algorithm, false, ["sign", "verify"]);

        const cborArray = new CborArray();

        cborArray.push(new CborTextString(this.context));
        cborArray.push(new CborByteString(this.encodeProtectedHeaders()));
        cborArray.push(new CborByteString(externalData));
        cborArray.push(new CborByteString(this.content));

        this.digest = await crypto.subtle.sign(algorithm, key, CborEncoder.encode(cborArray));
    }

    get tag(): ArrayBuffer {
        return this.digest;
    }

    public async verify(sharedSecret: ArrayBuffer, externalData: ArrayBuffer = new ArrayBuffer(0)): Promise<boolean> {
        
        if (!this.payload) throw 'No payload given.';
        
        if (this.headers.algorithm.value !== CoseAlgorithm.HMAC256_64 && 
            this.headers.algorithm.value !== CoseAlgorithm.HMAC256) throw 'Algorithm currently not supported, only supported algorithm is HMAC256.';
        
        const crypto = new Crypto();

        const algorithm = CoseAlgorithm.toSubtleCryptoAlgorithm(this.headers.algorithm.value);

        const key = await crypto.subtle.importKey('raw', sharedSecret, algorithm, false, ["sign", "verify"]);

        const cborArray = new CborArray();

        cborArray.push(new CborTextString(this.context));
        cborArray.push(new CborByteString(this.encodeProtectedHeaders()));
        cborArray.push(new CborByteString(externalData));
        cborArray.push(new CborByteString(this.content));

        const data = CborEncoder.encode(cborArray);

        const tag = await crypto.subtle.sign(algorithm, key, data);
        return ArrayBufferComparer.equals(this.tag, tag);
    }

    private encodeProtectedHeaders(): ArrayBuffer {
        let map = new Map<MapKey, CborDataItem>();
        map.set(new MapKey(CoseHeaderLabel.ALG), new CborNumber(this.headers.algorithm.value));
        return CborEncoder.encode(new CborMap(map));
    }

    private decodeProtectedHeaders(protectedHeaders: CborByteString, message: COSEMac0): void {
        for(const [key, value] of CborDecoder.decode(protectedHeaders.getValue()).getValue()) {
            switch(key.int) {
                case CoseHeaderLabel.ALG:
                    message.headers.algorithm.value = <CoseAlgorithm>value.getValue();
                    break;
            }
        };
    }

    private decodeUnprotectedHeaders(unprotectedHeaders: CborMap, message: COSEMac0): void {
        for(const [key, value] of unprotectedHeaders.getValue()) {
            switch(key.int) {
                case CoseHeaderLabel.ALG:
                    throw new Error('Algorithm must be in protected headers');
                 case CoseHeaderLabel.X5_CHAIN:
                    message.headers.x5Chain.value = value.getValue();
                    break;
                }
        };
    }

    fromCborDataItem(dataItem: CborDataItem): COSEMac0 {
        const cborArray = <CborArray>dataItem;
        const message = new COSEMac0();
        this.decodeProtectedHeaders(cborArray[0] as CborByteString, message);
        this.decodeUnprotectedHeaders(<CborMap>cborArray[1], message);
        message.dataElements = cborArray.getValue();
        message.content = cborArray[2].getValue();
        message.digest = cborArray[3].getValue();
        return message;
    }

    toCborDataItem(): CborDataItem {
        const cborArray = new CborArray();
        cborArray.push(new CborByteString(this.encodeProtectedHeaders()));
        let map = new Map<MapKey, CborDataItem>();
        if (this.headers.x5Chain.value) {
            map.set(new MapKey(CoseHeaderLabel.X5_CHAIN), new CborByteString(this.headers.x5Chain.value));
        }
        cborArray.push(new CborMap(new Map<MapKey, CborDataItem>()));
        cborArray.push(new CborByteString(this.content));
        cborArray.push(new CborByteString(this.tag));
        return cborArray;
    }
}