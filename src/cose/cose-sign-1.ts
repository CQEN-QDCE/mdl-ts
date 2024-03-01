import { Crypto } from "@peculiar/webcrypto";
import { CryptoKey } from "@peculiar/webcrypto";
import { CborByteString } from "../cbor/types/cbor-byte-string";
import { COSEObject } from "./cose-object";
import { CoseAlgorithm } from "./cose-algorithm.enum";
import { CborMap } from "../cbor/types/cbor-map";
import { CborEncoder } from "../cbor/cbor-encoder";
import { CborDataItem } from "../cbor/cbor-data-item";
import { CborTextString } from "../cbor/types/cbor-text-string";
import { CborConvertible } from "../cbor/cbor-convertible";
import { CborArray } from "../cbor/types/cbor-array";

export class COSESign1 extends COSEObject<COSESign1> implements CborConvertible {
   
    private readonly crypto = new Crypto();

    private readonly context = 'Signature1';

    private signature: ArrayBuffer | null = null;

    constructor() {
        super();
    }

    public detachPayload(): COSESign1 {
        this.content = null;
        return this;
    }

    public attachPayload(payload: ArrayBuffer): COSESign1 {
        this.content = payload;
        return this;
    }

    public async sign(privateKey: CryptoKey): Promise<void> {

        const cborArray = new CborArray();

        cborArray.push(new CborTextString(this.context));
        cborArray.push(new CborByteString(this.encodeProtectedHeaders()));
        cborArray.push(new CborByteString());
        cborArray.push(new CborByteString(this.content));

        this.signature = await this.crypto.subtle.sign(this.getAlgorithm(), privateKey, CborEncoder.encode(cborArray));
    }

    public async verify(publicKey: CryptoKey): Promise<boolean> {

        const cborArray = new CborArray();

        cborArray.push(new CborTextString(this.context));
        cborArray.push(new CborByteString(this.encodeProtectedHeaders()));
        cborArray.push(new CborByteString());
        cborArray.push(new CborByteString(this.content));

        return await this.crypto.subtle.verify(this.getAlgorithm(), 
                                               publicKey, 
                                               this.signature, 
                                               CborEncoder.encode(cborArray));
    }

    private getAlgorithm(): AlgorithmIdentifier | RsaPssParams | EcdsaParams {
        return CoseAlgorithm.toSubtleCryptoAlgorithm(this.headers.algorithm.value);
    }

    public fromCborDataItem(dataItem: CborDataItem): COSESign1 {
        const cborArray = dataItem as CborArray;
        const message = new COSESign1();
        message.decodeProtectedHeaders(cborArray[0] as CborByteString);
        message.decodeUnprotectedHeaders(cborArray[1] as CborMap);
        message.dataElements = cborArray.getValue();
        message.content = cborArray[2].getValue();
        message.signature = cborArray[3].getValue();
        return message;
    }

    public toCborDataItem(): CborDataItem {
        const cborArray = new CborArray();
        cborArray.push(new CborByteString(this.encodeProtectedHeaders()));
        cborArray.push(this.encodeUnprotectedHeaders());
        cborArray.push(new CborByteString(this.content));
        cborArray.push(new CborByteString(this.signature));
        return cborArray;
    }
}