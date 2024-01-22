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
import { Hex } from "../utils/hex";
import { CoseHeaderLabel } from "./cose-header-label.enum";
import { COSEObject } from "./cose-object";
import { sha256 } from 'js-sha256';
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
        //return COSESign1.fromDataElement(new ListElement(this.replacePayload(new NullElement())));
        this.content = null;
        return this;
    }

    attachPayload(payload: ArrayBuffer): COSEMac0 {
        //return COSESign1.fromDataElement(new ListElement(this.replacePayload(new ByteStringElement(payload))));
        this.content = payload;
        return this;
    }

    public async mac(sharedSecret: ArrayBuffer, externalData: ArrayBuffer = new ArrayBuffer(0)): Promise<void> {
        const crypto = new Crypto();
        // TODO: Faire une mappage avec this.headers.algorithm.value
        const algo =   {
            name: "HMAC",
            hash: { name: "SHA-256" },
        };
        const key = await crypto.subtle.importKey(
            'raw',
            sharedSecret,
            algo,
            false,
            ["sign", "verify"]
        );
        const cborArray = [];
        cborArray.push(new StringElement(this.context));
        cborArray.push(new ByteStringElement(this.encodeProtectedHeaders()));
        cborArray.push(new ByteStringElement(externalData));
        cborArray.push(new ByteStringElement(this.content));
        const data = DataElementSerializer.toCBOR(new ListElement(cborArray));
        this.digest = await crypto.subtle.sign(algo, key, data);
    }

    get tag(): ArrayBuffer {
        return this.digest;
    }

    async verify(sharedSecret: ArrayBuffer, externalData: ArrayBuffer = new ArrayBuffer(0)): Promise<boolean> {
        if (!this.payload) throw 'No payload given.';
        if (this.headers.algorithm.value !== CoseAlgorithm.HMAC256) throw 'Algorithm currently not supported, only supported algorithm is HMAC256.';
        
        const crypto = new Crypto();
        // TODO: Faire une mappage avec this.headers.algorithm.value
        const algo =   {
            name: "HMAC",
            hash: { name: "SHA-256" },
        };
        const key = await crypto.subtle.importKey(
            'raw',
            sharedSecret,
            algo,
            false,
            ["sign", "verify"]
        );
        const cborArray = [];
        cborArray.push(new StringElement(this.context));
        cborArray.push(new ByteStringElement(this.encodeProtectedHeaders()));
        cborArray.push(new ByteStringElement(externalData));
        cborArray.push(new ByteStringElement(this.content));
        const data = DataElementSerializer.toCBOR(new ListElement(cborArray));
        const digest = await crypto.subtle.sign(algo, key, data);
//        const macStructure = COSEMac0.createMacStructure(this.protectedHeader, this.payload, externalData);
//        const mac0Content = DataElementSerializer.toCBOR(macStructure);
//        const tag = Hex.decode(sha256.hmac(sharedSecret, mac0Content));
        return ArrayBufferComparer.equals(this.tag, digest);
    }
/*
    static createWithHMAC256(payload: ArrayBuffer, sharedSecret: ArrayBuffer, externalData: ArrayBuffer = new Uint8Array([]).buffer): COSEMac0 {
        const protectedHeaderMap = new Map<MapKey, NumberElement>();
        protectedHeaderMap.set(new MapKey(CoseHeaderLabel.ALG), new NumberElement(CoseAlgorithm.HMAC256));
        const protectedHeaderData = new MapElement(protectedHeaderMap).toCBOR();
        const mac0Content = DataElementSerializer.toCBOR(COSEMac0.createMacStructure(protectedHeaderData, payload, externalData));
        const tag5 = sha256.hmac(sharedSecret, mac0Content);
        const g = Hex.decode(tag5);
        const hash = sha256.hmac.create(sharedSecret);
        hash.update(mac0Content);
        const dataElements: DataElement[] = [];
        dataElements.push(new ByteStringElement(protectedHeaderData));
        dataElements.push(new MapElement(new Map<MapKey, DataElement>()))
        dataElements.push(new ByteStringElement(payload))
        dataElements.push(new ByteStringElement(g))
        return COSEMac0.fromDataElement(new ListElement(dataElements));
    }
*/
    private static createMacStructure(protectedHeaderData: ArrayBuffer, payload: ArrayBuffer, externalData: ArrayBuffer): ListElement {
        const dataElements: DataElement[] = [];
        dataElements.push(new StringElement('MAC0'));
        dataElements.push(new ByteStringElement(protectedHeaderData));
        dataElements.push(new ByteStringElement(externalData));
        dataElements.push(new ByteStringElement(payload));
        return new ListElement(dataElements);
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

    toDataElement(): ListElement {
        return new ListElement(this.dataElements);
    }
}