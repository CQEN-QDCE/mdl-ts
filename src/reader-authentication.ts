import { CborDataItem } from "./data-element/cbor-data-item";
import { EncodedCBORElement } from "./data-element/encoded-cbor-element";
import { ListElement } from "./data-element/list-element";
import { StringElement } from "./data-element/string-element";
import { CborEncoder } from './data-element/cbor-encoder';
import { ItemsRequest } from "./doc-request/items-request";

export class ReaderAuthentication {

    dataElements: CborDataItem[] = [];
   
    constructor(sessionTranscript: ListElement, itemsRequest: ItemsRequest) {
        this.dataElements.push(new StringElement('ReaderAuthentication'));
        this.dataElements.push(sessionTranscript);
        const encodedItemsRequest = new EncodedCBORElement(CborEncoder.encode(itemsRequest.toMapElement()));
        this.dataElements.push(encodedItemsRequest);
    }

    toCBOR(): ArrayBuffer {
        return CborEncoder.encode(new ListElement(this.dataElements));
    }

    toListElement(): ListElement {
        return new ListElement(this.dataElements);
    }
}