import { ByteStringElement } from "../data-element/byte-string-element";
import { DataElement } from "../data-element/data-element";
import { DataElementDeserializer } from "../data-element/data-element-deserializer";
import { ListElement } from "../data-element/list-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { NumberElement } from "../data-element/number-element";
import { CoseHeaderLabel } from "./cose-header-label.enum";
import { CoseHeaders } from "./cose-headers";

export abstract class COSEObject<T> {

    protected dataElements: DataElement[] = [];

    protected readonly coseHeaders = new CoseHeaders();

    protected content: ArrayBuffer | null = null;

    constructor() {
    }

    get headers(): CoseHeaders {
        return this.coseHeaders;
    }

    public setContent(content: ArrayBuffer): void {
        this.content = content;
    }

    get payload(): ArrayBuffer | null {
//        if (this.dataElements.length !== 4) throw 'Invalid COSE_Sign1/COSE_Mac0 array.';
//        if (this.dataElements[2].type === DataElement.Type.nil) return null;
//        if (this.dataElements[2].type === DataElement.Type.byteString) return (<ByteStringElement>this.dataElements[2]).value
//        throw 'Invalid COSE_Sign1 payload.';
        return this.content;
    }

    get x5Chain(): ArrayBuffer | null {
//        if (this.dataElements.length !== 4) throw 'Invalid COSE_Sign1/COSE_Mac0 array.';
//        const unprotectedHeader = this.dataElements[1] as MapElement;
//        const x5Chain = unprotectedHeader.get(new MapKey(CoseHeaderLabel.X5_CHAIN)) as ByteStringElement;
//        return x5Chain.value;
        return this.headers.x5Chain.value;
    }

    get protectedHeader(): ArrayBuffer {
        if (this.dataElements.length !== 4) throw 'Invalid COSE_Sign1/COSE_Mac0 array.';
        return (<ByteStringElement>this.dataElements[0]).value;
    }

    get algorithm(): number {
        if (this.dataElements.length !== 4) throw 'Invalid COSE_Sign1/COSE_Mac0 array.';
        const protectedHeaderMapElement = <MapElement>DataElementDeserializer.fromCBOR(this.protectedHeader);
        const numberElement = <NumberElement>protectedHeaderMapElement.get(new MapKey(CoseHeaderLabel.ALG));
        return numberElement.value;
    }

    get signatureOrTag(): ArrayBuffer {
        if (this.dataElements.length !== 4) throw 'Invalid COSE_Sign1/COSE_Mac0 array.';
        return (<ByteStringElement>this.dataElements[3]).value;
    }

    protected replacePayload(payloadElement: DataElement): DataElement[] {
        const newData: DataElement[] = [];
        for (let i = 0; i < this.dataElements.length; i++) {
            if (i === 2) {
                newData.push(payloadElement);
            } else {
                newData.push(this.dataElements[i]);
            }
        }
        this.dataElements = newData;
        return newData;
    }

    abstract detachPayload(): T;

    abstract attachPayload(payload: Buffer): T

    abstract toDataElement(): ListElement;

    toCBOR(): ArrayBuffer {
        return this.toDataElement().toCBOR();
    }

    toCBORHex(): string {
        return this.toDataElement().toCBORHex();
    }
}