import { CborDataItem } from "./data-element/cbor-data-item";
import { CborEncodedDataItem } from "./data-element/cbor-encoded-data-item";
import { CborTextString } from "./data-element/cbor-text-string";
import { CborEncoder } from './cbor/cbor-encoder';
import { ItemsRequest } from "./doc-request/items-request";
import { CborArray } from "./data-element/cbor-array";

export class ReaderAuthentication {

    dataElements: CborDataItem[] = [];
   
    constructor(sessionTranscript: CborArray, itemsRequest: ItemsRequest) {
        this.dataElements.push(new CborTextString('ReaderAuthentication'));
        this.dataElements.push(sessionTranscript);
        const encodedItemsRequest = new CborEncodedDataItem(CborEncoder.encode(itemsRequest.toMapElement()));
        this.dataElements.push(encodedItemsRequest);
    }

    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(new CborArray(this.dataElements));
    }

    toListElement(): CborArray {
        return new CborArray(this.dataElements);
    }
}