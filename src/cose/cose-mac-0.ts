import { Crypto } from "@peculiar/webcrypto";
import { ByteStringElement } from "../data-element/byte-string-element";
import { DataElement } from "../data-element/data-element";
import { DataElementSerializer } from "../data-element/data-element-serializer";
import { ListElement } from "../data-element/list-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { NumberElement } from "../data-element/number-element";
import { StringElement } from "../data-element/string-element";
import { ArrayBufferComparer } from "../utils/array-buffer-comparer";
import { CoseHeaderLabel } from "./cose-header-label.enum";
import { COSEObject } from "./cose-object";
import { CoseAlgorithm } from "./cose-algorithm.enum";
import { DataElementDeserializer } from "../data-element/data-element-deserializer";

export class COSEMac0 extends COSEObject<COSEMac0> {
   
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
        const data = DataElementSerializer.toCBOR(new ListElement(cborArray));

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
        const data = DataElementSerializer.toCBOR(new ListElement(cborArray));

        const tag = await crypto.subtle.sign(algorithm, key, data);
        return ArrayBufferComparer.equals(this.tag, tag);
    }

    private encodeProtectedHeaders(): ArrayBuffer {
        let map = new Map<MapKey, DataElement>();
        map.set(new MapKey(CoseHeaderLabel.ALG), new NumberElement(this.headers.algorithm.value));
        return DataElementSerializer.toCBOR(new MapElement(map));
    }

    private static decodeProtectedHeaders(protectedHeaders: ByteStringElement, message: COSEMac0): void {
        for(const [key, value] of DataElementDeserializer.fromCBOR(protectedHeaders.value).value) {
            switch(key.int) {
                case CoseHeaderLabel.ALG:
                    message.headers.algorithm.value = <CoseAlgorithm>value.value;
                    break;
            }
        };
    }

    private static decodeUnprotectedHeaders(unprotectedHeaders: MapElement, message: COSEMac0): void {
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

    public static fromDataElement(dataElement: ListElement): COSEMac0 {
        const message = new COSEMac0();
        COSEMac0.decodeProtectedHeaders(dataElement.value[0], message);
        COSEMac0.decodeUnprotectedHeaders(<MapElement>dataElement.value[1], message);
        message.dataElements = dataElement.value;
        message.content = dataElement.value[2].value;
        message.digest = dataElement.value[3].value;
        return message;
    }
    
    toDataElement(): ListElement {
        let list: DataElement[] = [];
        list.push(new ByteStringElement(this.encodeProtectedHeaders()));
        let map = new Map<MapKey, DataElement>();
        if (this.headers.x5Chain.value) {
            map.set(new MapKey(CoseHeaderLabel.X5_CHAIN), new ByteStringElement(this.headers.x5Chain.value));
        }
        list.push(new MapElement(new Map<MapKey, DataElement>()));
        list.push(new ByteStringElement(this.content));
        list.push(new ByteStringElement(this.tag));
        return new ListElement(list);
    }
}