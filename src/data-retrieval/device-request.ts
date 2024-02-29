import { CborConvertible } from "../cbor/cbor-convertible";
import { COSESign1 } from "../cose/cose-sign-1";
import { CborDataItem } from "../cbor/cbor-data-item";
import { CborEncodedDataItem } from "../cbor/types/cbor-encoded-data-item";
import { CborMap } from "../data-element/cbor-map";
import { MapKey } from "../data-element/map-key";
import { CborTextString } from "../cbor/types/cbor-text-string";
import { MobileDocumentRequest } from "../doc-request/mobile-document-request";
import { CborArray } from "../data-element/cbor-array";

export class DeviceRequest implements CborConvertible {

    constructor(public readonly mobileDocumentRequests: MobileDocumentRequest[], 
                public readonly version: string = '1.0') {
    }

    fromCborDataItem(dataItem: CborDataItem): DeviceRequest {
        const mapElement = <CborMap>dataItem;
        const docRequests = mapElement.get(new MapKey('docRequests'));
        const docRequests2: MobileDocumentRequest[] = [];
        if (docRequests) {
            for (const mdocRequest of docRequests.getValue()) {
                const itemsRequest = <CborEncodedDataItem>mdocRequest.get(new MapKey('itemsRequest'));
                const readerAuth = <CborArray>mdocRequest.get(new MapKey('readerAuth'));
                docRequests2.push(new MobileDocumentRequest(itemsRequest, readerAuth ? CborDataItem.to(COSESign1, readerAuth) : null));
            }
        }
        let version = mapElement.get(new MapKey('version'));
        if (!version) version = null;
        return new DeviceRequest(docRequests2, version.getValue());
    }

    toCborDataItem(): CborDataItem {
        const map = new Map<MapKey, CborDataItem>();
        const mdocRequests = new CborArray();
        for (const mdocRequest of this.mobileDocumentRequests) mdocRequests.push(mdocRequest.toMapElement());
        map.set(new MapKey('docRequests'), mdocRequests);
        map.set(new MapKey('version'), new CborTextString(this.version));
        return new CborMap(map);
    }

}