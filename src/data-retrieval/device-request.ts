import { COSESign1 } from "../cose/cose-sign-1";
import { DataElement } from "../data-element/data-element";
import { DataElementDeserializer } from "../data-element/data-element-deserializer";
import { DataElementSerializer } from "../data-element/data-element-serializer";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { ListElement } from "../data-element/list-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { StringElement } from "../data-element/string-element";
import { MobileDocumentRequest } from "../doc-request/mobile-document-request";
import { Hex } from "../utils/hex";

export class DeviceRequest {

    constructor(public readonly mobileDocumentRequests: MobileDocumentRequest[], 
                public readonly version: string = '1.0') {
    }

    toMapElement(): MapElement {
        const map = new Map<MapKey, DataElement>();
        const mdocRequests: MapElement[] = [];
        for (const mdocRequest of this.mobileDocumentRequests) mdocRequests.push(mdocRequest.toMapElement());
        map.set(new MapKey('docRequests'), new ListElement(mdocRequests));
        map.set(new MapKey('version'), new StringElement(this.version));
        return new MapElement(map);
    }

    static fromMapElement(mapElement: MapElement): DeviceRequest {
        const docRequests = mapElement.get(new MapKey('docRequests'));
        const docRequests2: MobileDocumentRequest[] = [];
        if (docRequests) {
            for (const mdocRequest of docRequests.value) {
                const itemsRequest = <EncodedCBORElement>mdocRequest.get(new MapKey('itemsRequest'));
                const readerAuth = <ListElement>mdocRequest.get(new MapKey('readerAuth'));
                docRequests2.push(new MobileDocumentRequest(itemsRequest, readerAuth ? COSESign1.fromDataElement(new ListElement(readerAuth.value)) : null));
            }
        }
        let version = mapElement.get(new MapKey('version'));
        if (!version) version = null;
        return new DeviceRequest(docRequests2, version.value);
    }

    toCBOR(): ArrayBuffer {
        return DataElementSerializer.toCBOR(this.toMapElement());
    }

    toCBORHex(): string {
        return Hex.encode(this.toCBOR());
    }

    static fromCBOR(value: ArrayBuffer): DeviceRequest {
        const mapElement = <MapElement>DataElementDeserializer.fromCBOR(value);
        return DeviceRequest.fromMapElement(mapElement);
    }

    static fromCBORHex(value: string): DeviceRequest {
        return DeviceRequest.fromCBOR(Hex.decode(value));
    }

}