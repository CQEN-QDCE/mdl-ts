import { Crypto } from "@peculiar/webcrypto";
import { ByteStringElement } from "../data-element/byte-string-element";
import { CborDataItem } from "../data-element/cbor-data-item";
import { CborEncoder } from "../data-element/cbor-encoder";
import { ListElement } from "../data-element/list-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { NumberElement } from "../data-element/number-element";
import { StringElement } from "../data-element/string-element";
import { ArrayBufferComparer } from "../utils/array-buffer-comparer";
import { CoseHeaderLabel } from "./cose-header-label.enum";
import { COSEObject } from "./cose-object";
import { CoseAlgorithm } from "./cose-algorithm.enum";
import { CborDecoder } from "../data-element/cbor-decoder";
import { CborDataItemConvertable } from "../cbor/cbor-data-item-convertable";

export class COSEMac0 extends COSEObject<COSEMac0> implements CborDataItemConvertable {
   
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

        const cborArray = [];
        cborArray.push(new StringElement(this.context));
        cborArray.push(new ByteStringElement(this.encodeProtectedHeaders()));
        cborArray.push(new ByteStringElement(externalData));
        cborArray.push(new ByteStringElement(this.content));
        //cborArray.push(new StringElement(Buffer.from(this.content).toString("base64")));
        const data = CborEncoder.encode(new ListElement(cborArray));

        this.digest = await crypto.subtle.sign(algorithm, key, data);
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

        const cborArray = [];
        cborArray.push(new StringElement(this.context));
        cborArray.push(new ByteStringElement(this.encodeProtectedHeaders()));
        cborArray.push(new ByteStringElement(externalData));
        cborArray.push(new ByteStringElement(this.content));
        const data = CborEncoder.encode(new ListElement(cborArray));

        const tag = await crypto.subtle.sign(algorithm, key, data);
        return ArrayBufferComparer.equals(this.tag, tag);
    }

    private encodeProtectedHeaders(): ArrayBuffer {
        let map = new Map<MapKey, CborDataItem>();
        map.set(new MapKey(CoseHeaderLabel.ALG), new NumberElement(this.headers.algorithm.value));
        return CborEncoder.encode(new MapElement(map));
    }

    private decodeProtectedHeaders(protectedHeaders: ByteStringElement, message: COSEMac0): void {
        for(const [key, value] of CborDecoder.decode(protectedHeaders.value).value) {
            switch(key.int) {
                case CoseHeaderLabel.ALG:
                    message.headers.algorithm.value = <CoseAlgorithm>value.value;
                    break;
            }
        };
    }

    private decodeUnprotectedHeaders(unprotectedHeaders: MapElement, message: COSEMac0): void {
        for(const [key, value] of unprotectedHeaders.value) {
            switch(key.int) {
                case CoseHeaderLabel.ALG:
                    throw new Error('Algorithm must be in protected headers');
                 case CoseHeaderLabel.X5_CHAIN:
                    message.headers.x5Chain.value = value.value;
                    break;
                }
        };
    }

    fromCborDataItem(dataItem: CborDataItem): COSEMac0 {
        const cborArray = <ListElement>dataItem;
        const message = new COSEMac0();
        this.decodeProtectedHeaders(cborArray.value[0], message);
        this.decodeUnprotectedHeaders(<MapElement>cborArray.value[1], message);
        message.dataElements = cborArray.value;
        message.content = cborArray.value[2].value;
        message.digest = cborArray.value[3].value;
        return message;
    }

    toCborDataItem(): CborDataItem {
        let list: CborDataItem[] = [];
        list.push(new ByteStringElement(this.encodeProtectedHeaders()));
        let map = new Map<MapKey, CborDataItem>();
        if (this.headers.x5Chain.value) {
            map.set(new MapKey(CoseHeaderLabel.X5_CHAIN), new ByteStringElement(this.headers.x5Chain.value));
        }
        list.push(new MapElement(new Map<MapKey, CborDataItem>()));
        list.push(new ByteStringElement(this.content));
        list.push(new ByteStringElement(this.tag));
        return new ListElement(list);
    }
}