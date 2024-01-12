import { ByteStringElement } from "../data-element/byte-string-element";
import { DataElement } from "../data-element/data-element";
import { DataElementSerializer } from "../data-element/data-element-serializer";
import { ListElement } from "../data-element/list-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { NullElement } from "../data-element/null-element";
import { NumberElement } from "../data-element/number-element";
import { StringElement } from "../data-element/string-element";
import { ArrayBufferComparer } from "../utils/array-buffer-comparer";
import { Hex } from "../utils/hex";
import { COSEHeaders } from "./cose-headers.enum";
import { COSEBase } from "./cose-base";
import { sha256 } from 'js-sha256';

export class COSEMac0 extends COSEBase<COSEMac0> {
   
    constructor(dataElements: DataElement[]) {
        super(dataElements);
    }

    detachPayload(): COSEMac0 {
        return new COSEMac0(this.replacePayload(new NullElement()));
    }

    attachPayload(payload: ArrayBuffer): COSEMac0 {
        return new COSEMac0(this.replacePayload(new ByteStringElement(payload)));
    }

    verify(sharedSecret: ArrayBuffer, externalData: ArrayBuffer = new Uint8Array([]).buffer): boolean {
        if (!this.payload) throw 'No payload given.';
        if (this.algorithm !== COSEHeaders.HMAC256) throw 'Algorithm currently not supported, only supported algorithm is HMAC256.';
        const macStructure = COSEMac0.createMacStructure(this.protectedHeader, this.payload, externalData);
        const mac0Content = DataElementSerializer.toCBOR(macStructure);
        const tag = Hex.decode(sha256.hmac(sharedSecret, mac0Content));
        return ArrayBufferComparer.equals(this.signatureOrTag, tag);
    }

    static createWithHMAC256(payload: ArrayBuffer, sharedSecret: ArrayBuffer, externalData: ArrayBuffer = new Uint8Array([]).buffer): COSEMac0 {
        const protectedHeaderMap = new Map<MapKey, NumberElement>();
        protectedHeaderMap.set(new MapKey(COSEHeaders.ALG), new NumberElement(COSEHeaders.HMAC256));
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
        return new COSEMac0(dataElements);
    }

    private static createMacStructure(protectedHeaderData: ArrayBuffer, payload: ArrayBuffer, externalData: ArrayBuffer): ListElement {
        const dataElements: DataElement[] = [];
        dataElements.push(new StringElement('MAC0'));
        dataElements.push(new ByteStringElement(protectedHeaderData));
        dataElements.push(new ByteStringElement(externalData));
        dataElements.push(new ByteStringElement(payload));
        return new ListElement(dataElements);
    }
}