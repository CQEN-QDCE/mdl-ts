import { CborDataItem } from "./cbor/cbor-data-item";
import { CborEncodedDataItem } from "./cbor/types/cbor-encoded-data-item";
import { CborTextString } from "./cbor/types/cbor-text-string";
import { CborEncoder } from './cbor/cbor-encoder';
import { ItemsRequest } from "./doc-request/items-request";
import { CborArray } from "./data-element/cbor-array";

export class ReaderAuthentication {

    dataItems: CborDataItem[] = [];
   
    constructor(sessionTranscript: CborArray, itemsRequest: ItemsRequest) {
        this.dataItems.push(new CborTextString('ReaderAuthentication'));
        this.dataItems.push(sessionTranscript);
        const encodedItemsRequest = new CborEncodedDataItem(CborEncoder.encode(itemsRequest.toMapElement()));
        this.dataItems.push(encodedItemsRequest);
    }

    toListElement(): CborArray {
        return new CborArray(this.dataItems);
    }
}