import { DataElement } from "../data-element/data-element";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { ListElement } from "../data-element/list-element";
import { StringElement } from "../data-element/string-element";

export class DeviceAuthentication {

    public dataElements: DataElement[] = [];

    constructor(sessionTranscript: ListElement, docType: string, deviceNameSpaces: EncodedCBORElement) {
        this.dataElements.push(new StringElement("DeviceAuthentication"));
        this.dataElements.push(sessionTranscript);
        this.dataElements.push(new StringElement(docType));
        this.dataElements.push(deviceNameSpaces);
    }

    static fromListElement(listElement: ListElement): DeviceAuthentication {
        const elements = <DataElement[]>listElement.value;
        return new DeviceAuthentication(<ListElement>elements[1],(<StringElement>elements[2]).value,<EncodedCBORElement>elements[3]);
    }

    toDataElement(): DataElement {  
        return new ListElement(this.dataElements);
    }
}