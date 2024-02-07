import { CborDataItemConvertable } from "../cbor/cbor-data-item-convertable";
import { CborDataItem } from "../data-element/cbor-data-item";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { ListElement } from "../data-element/list-element";
import { StringElement } from "../data-element/string-element";

export class DeviceAuthentication implements CborDataItemConvertable {

    public dataItems: CborDataItem[] = [];

    constructor(sessionTranscript: ListElement, docType: string, deviceNameSpaces: EncodedCBORElement) {
        this.dataItems.push(new StringElement("DeviceAuthentication"));
        this.dataItems.push(sessionTranscript);
        this.dataItems.push(new StringElement(docType));
        this.dataItems.push(deviceNameSpaces);
    }

    fromCborDataItem(dataItem: CborDataItem): DeviceAuthentication {
        const cborArray = <ListElement>dataItem;
        const elements = <CborDataItem[]>cborArray.value;
        return new DeviceAuthentication(<ListElement>elements[1],(<StringElement>elements[2]).value,<EncodedCBORElement>elements[3]);
    }

    toCborDataItem(): CborDataItem {
        return new ListElement(this.dataItems);
    }
}