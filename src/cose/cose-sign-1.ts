import { Crypto } from "@peculiar/webcrypto";
import { CborByteString } from "../data-element/cbor-byte-string";
import { COSEObject } from "./cose-object";
import { CborDecoder } from "../cbor/cbor-decoder";
import { CoseHeaderLabel } from "./cose-header-label.enum";
import { CoseAlgorithm } from "./cose-algorithm.enum";
import { MapElement } from "../data-element/map-element";
import { CborEncoder } from "../cbor/cbor-encoder";
import { MapKey } from "../data-element/map-key";
import { CborDataItem } from "../data-element/cbor-data-item";
import { CborNumber } from "../data-element/cbor-number";
import { CborTextString } from "../data-element/cbor-text-string";
import { CborConvertible } from "../cbor/cbor-convertible";
import { CborArray } from "../data-element/cbor-array";

export class COSESign1 extends COSEObject<COSESign1> implements CborConvertible {
   
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
        // Maybe const algorithm = CoseAlgorithm.toSubtleCryptoAlgorithm(this.headers.algorithm.value);
        const algo =   {
            name: "ECDSA",
            hash: { name: "SHA-256" },
        };

        const cborArray = new CborArray();

        cborArray.add(new CborTextString(this.context));
        cborArray.add(new CborByteString(this.encodeProtectedHeaders()));
        cborArray.add(new CborByteString(new ArrayBuffer(0)));
        cborArray.add(new CborByteString(this.content));

        this.signature = await crypto.subtle.sign(algo, privateKey, CborEncoder.encode(cborArray));
    }

    public async verify(publicKey: CryptoKey): Promise<boolean> {
        const crypto = new Crypto();
        // TODO: Faire une mappage avec this.headers.algorithm.value
        // Maybe const algorithm = CoseAlgorithm.toSubtleCryptoAlgorithm(this.headers.algorithm.value);
        const algo =   {
            name: "ECDSA",
            hash: { name: "SHA-256" },
        };

        const cborArray = new CborArray();

        cborArray.add(new CborTextString(this.context));
        cborArray.add(new CborByteString(this.encodeProtectedHeaders()));
        cborArray.add(new CborByteString(new ArrayBuffer(0)));
        cborArray.add(new CborByteString(this.content));

        return await crypto.subtle.verify(algo, publicKey, this.signature, CborEncoder.encode(cborArray));
    }

    private encodeProtectedHeaders(): ArrayBuffer {
        let map = new Map<MapKey, CborDataItem>();
        map.set(new MapKey(CoseHeaderLabel.ALG), new CborNumber(this.headers.algorithm.value));
        return CborEncoder.encode(new MapElement(map));
    }

    private decodeProtectedHeaders(protectedHeaders: CborByteString, message: COSESign1): void {
        for(const [key, value] of CborDecoder.decode(protectedHeaders.getValue()).getValue()) {
            switch(key.int) {
                case CoseHeaderLabel.ALG:
                    message.headers.algorithm.value = <CoseAlgorithm>value.getValue();
                    break;
            }
        };
    }

    private decodeUnprotectedHeaders(unprotectedHeaders: MapElement, message: COSESign1): void {
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

    fromCborDataItem(dataItem: CborDataItem): COSESign1 {
        const cborArray = <CborArray>dataItem;
        const message = new COSESign1();
        this.decodeProtectedHeaders(cborArray.getValue()[0] as CborByteString, message);
        this.decodeUnprotectedHeaders(<MapElement>cborArray.getValue()[1], message);
        message.dataElements = cborArray.getValue();
        message.content = cborArray.getValue()[2].getValue();
        message.signature = cborArray.getValue()[3].getValue();
        return message;
    }

    toCborDataItem(): CborDataItem {
        let list: CborDataItem[] = [];
        list.push(new CborByteString(this.encodeProtectedHeaders()));
        let map = new Map<MapKey, CborDataItem>();
        if (this.headers.x5Chain.value) {
            map.set(new MapKey(CoseHeaderLabel.X5_CHAIN), new CborByteString(this.headers.x5Chain.value));
        }
        list.push(new MapElement(new Map<MapKey, CborDataItem>()));
        list.push(new CborByteString(this.content));
        list.push(new CborByteString(this.signature));
        return new CborArray(list);
    }
}