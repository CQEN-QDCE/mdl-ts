import { CborDataItem } from "../cbor/cbor-data-item";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { CborNumber } from "../cbor/types/cbor-number";
import { CborTextString } from "../cbor/types/cbor-text-string";
import { MobileDocument } from "../mobile-document";
import { DeviceResponseStatus } from "./device-response-status.enum";
import { CborConvertible } from "../cbor/cbor-convertible";
import { CborArray } from "../data-element/cbor-array";

export class DeviceResponse implements CborConvertible {

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
        const documentDataItems = <CborArray>mapElement.get(new MapKey('documents'));
        const mobileDocuments = [];
        
        for (const documentDataItem of documentDataItems) {
            mobileDocuments.push(CborDataItem.to(MobileDocument, documentDataItem));
        }

        return new DeviceResponse(mobileDocuments, 
                                  mapElement.get(new MapKey('version')).getValue(), 
                                  (<CborNumber>mapElement.get(new MapKey('status'))).getValue(), 
                                  <MapElement>mapElement.get(new MapKey('documentErrors')));
    }

    toCborDataItem(): CborDataItem {
        const map = new Map<MapKey, CborDataItem>();
        const documents = [];
        for (const document of this.documents) {
            documents.push(CborDataItem.from(document));
        }
        map.set(new MapKey('version'), new CborTextString(this.version));
        map.set(new MapKey('documents'), new CborArray(documents));
        map.set(new MapKey('status'), new CborNumber(this.status));
        if (this.documentErrors) map.set(new MapKey('documentErrors'), this.documentErrors);
        return new MapElement(map);
    }

}