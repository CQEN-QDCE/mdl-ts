import { Crypto } from "@peculiar/webcrypto";
import { ByteStringElement } from "../data-element/byte-string-element";
import { COSEObject } from "./cose-object";
import { ListElement } from "../data-element/list-element";
import { CborDecoder } from "../data-element/cbor-decoder";
import { CoseHeaderLabel } from "./cose-header-label.enum";
import { CoseAlgorithm } from "./cose-algorithm.enum";
import { MapElement } from "../data-element/map-element";
import { CborEncoder } from "../data-element/cbor-encoder";
import { MapKey } from "../data-element/map-key";
import { CborDataItem } from "../data-element/cbor-data-item";
import { NumberElement } from "../data-element/number-element";
import { StringElement } from "../data-element/string-element";
import { CborDataItemConvertable } from "../cbor/cbor-data-item-convertable";

export class COSESign1 extends COSEObject<COSESign1> implements CborDataItemConvertable {
   
    private readonly context = 'Signature1';

    private signature: ArrayBuffer  | null = null;

    constructor() {
        super();
    }

    detachPayload(): COSESign1 {
        this.content = null;
        return this;
    }

    attachPayload(payload: ArrayBuffer): COSESign1 {
        this.content = payload;
        return this;
    }

    public async sign(privateKey: CryptoKey): Promise<void> {
        const crypto = new Crypto();
        // TODO: Faire une mappage avec this.headers.algorithm.value
        const algo =   {
            name: "ECDSA",
            hash: { name: "SHA-256" },
        };
        const cborArray = [];
        cborArray.push(new StringElement(this.context));
        cborArray.push(new ByteStringElement(this.encodeProtectedHeaders()));
        cborArray.push(new ByteStringElement(new ArrayBuffer(0)));
        cborArray.push(new ByteStringElement(this.content));
        const data = CborEncoder.encode(new ListElement(cborArray));
        this.signature = await crypto.subtle.sign(algo, privateKey, data);
    }

    public async verify(publicKey: CryptoKey): Promise<boolean> {
        const crypto = new Crypto();
        // TODO: Faire une mappage avec this.headers.algorithm.value
        const algo =   {
            name: "ECDSA",
            hash: { name: "SHA-256" },
        };
        const cborArray = [];
        cborArray.push(new StringElement(this.context));
        cborArray.push(new ByteStringElement(this.encodeProtectedHeaders()));
        cborArray.push(new ByteStringElement(new ArrayBuffer(0)));
        cborArray.push(new ByteStringElement(this.content));
        const data = CborEncoder.encode(new ListElement(cborArray));
        return await crypto.subtle.verify(algo, publicKey, this.signature, data);
    }

    private encodeProtectedHeaders(): ArrayBuffer {
        let map = new Map<MapKey, CborDataItem>();
        map.set(new MapKey(CoseHeaderLabel.ALG), new NumberElement(this.headers.algorithm.value));
        return CborEncoder.encode(new MapElement(map));
    }

    private decodeProtectedHeaders(protectedHeaders: ByteStringElement, message: COSESign1): void {
        for(const [key, value] of CborDecoder.decode(protectedHeaders.value).value) {
            switch(key.int) {
                case CoseHeaderLabel.ALG:
                    message.headers.algorithm.value = <CoseAlgorithm>value.value;
                    break;
            }
        };
    }

    private decodeUnprotectedHeaders(unprotectedHeaders: MapElement, message: COSESign1): void {
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

    fromCborDataItem(dataItem: CborDataItem): COSESign1 {
        const dataElement = <ListElement>dataItem;
        const message = new COSESign1();
        this.decodeProtectedHeaders(dataElement.value[0], message);
        this.decodeUnprotectedHeaders(<MapElement>dataElement.value[1], message);
        message.dataElements = dataElement.value;
        message.content = dataElement.value[2].value;
        message.signature = dataElement.value[3].value;
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
        list.push(new ByteStringElement(this.signature));
        return new ListElement(list);
    }
}