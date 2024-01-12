import { DataElement } from "./data-element/data-element";
import { EncodedCBORElement } from "./data-element/encoded-cbor-element";
import { ListElement } from "./data-element/list-element";
import { StringElement } from "./data-element/string-element";
import { DataElementSerializer } from './data-element/data-element-serializer';
import { ItemsRequest } from "./items-request";

export class ReaderAuthentication {

    dataElements: DataElement[] = [];
   
    constructor(sessionTranscript: ListElement, itemsRequest: ItemsRequest) {
        this.dataElements.push(new StringElement('ReaderAuthentication'));
        this.dataElements.push(sessionTranscript);
        const encodedItemsRequest = new EncodedCBORElement(DataElementSerializer.toCBOR(itemsRequest.toMapElement()));
        this.dataElements.push(encodedItemsRequest);
    }

    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(new ListElement(this.dataElements));
    }

    toListElement(): ListElement {
        return new ListElement(this.dataElements);
    }
}