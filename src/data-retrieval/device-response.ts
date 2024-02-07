import { CborDataItem } from "../data-element/cbor-data-item";
import { ListElement } from "../data-element/list-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { NumberElement } from "../data-element/number-element";
import { StringElement } from "../data-element/string-element";
import { MobileDocument } from "../mobile-document";
import { DeviceResponseStatus } from "./device-response-status.enum";
import { CborDataItemConvertable } from "../cbor/cbor-data-item-convertable";
import { Cbor } from "../cbor/cbor";

export class DeviceResponse implements CborDataItemConvertable {

    public readonly documents: MobileDocument[] = [];
    private readonly version: string;
    private readonly status: DeviceResponseStatus;
    private readonly documentErrors: MapElement;

    constructor(documents: MobileDocument[], 
                version: string = "1.0", 
                status: DeviceResponseStatus = DeviceResponseStatus.OK, 
                documentErrors: MapElement = null) {
        this.documents = documents;
        this.version = version;
        this.status = status;
        this.documentErrors = documentErrors;
    }

    fromCborDataItem(dataItem: CborDataItem): DeviceResponse {
        const mapElement = <MapElement>dataItem;
        const documents = mapElement.get(new MapKey('documents'));
        const mobileDocuments = [];
        
        for (const documentDataItem of (<ListElement>documents).value) {
            mobileDocuments.push(Cbor.fromDataItem(documentDataItem, MobileDocument));
        }

        return new DeviceResponse(mobileDocuments, 
                                  mapElement.get(new MapKey('version')).value, 
                                  (<NumberElement>mapElement.get(new MapKey('status'))).value, 
                                  <MapElement>mapElement.get(new MapKey('documentErrors')));
    }

    toCborDataItem(): CborDataItem<any> {
        const map = new Map<MapKey, CborDataItem>();
        const documents = [];
        for (const document of this.documents) {
            documents.push(Cbor.asDataItem(document));
        }
        map.set(new MapKey('version'), new StringElement(this.version));
        map.set(new MapKey('documents'), new ListElement(documents));
        map.set(new MapKey('status'), new NumberElement(this.status));
        if (this.documentErrors) map.set(new MapKey('documentErrors'), this.documentErrors);
        return new MapElement(map);
    }

}