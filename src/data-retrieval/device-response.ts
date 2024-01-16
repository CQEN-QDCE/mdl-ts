import { DataElement } from "../data-element/data-element";
import { DataElementDeserializer } from "../data-element/data-element-deserializer";
import { ListElement } from "../data-element/list-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { NumberElement } from "../data-element/number-element";
import { StringElement } from "../data-element/string-element";
import { MobileDocument } from "../mobile-document";
import { DeviceSigned } from "../mdoc/device-signed";
import { IssuerSigned } from "../issuer-signed/issuer-signed";
import { Hex } from "../utils/hex";
import { DeviceResponseStatus } from "./device-response-status.enum";

export class DeviceResponse {

    public documents: MobileDocument[];
    private version: string;
    private status: NumberElement;
    private documentErrors: MapElement;

    constructor(documents: MobileDocument[], 
                version: string = "1.0", 
                status: NumberElement = new NumberElement(DeviceResponseStatus.OK), 
                documentErrors: MapElement = null) {
        this.documents = documents;
        this.version = version;
        this.status = status;
        this.documentErrors = documentErrors;
    }

    public toMapElement(): MapElement {
        const map = new Map<MapKey, DataElement>();
        for (const document of this.documents) {
            document.toMapElement();
            // TODO: Manque du code ici.
            throw new Error("Manque du code ici.");
        }
        map.set(new MapKey('documents'), null);
        map.set(new MapKey('version'), new StringElement(this.version));
        map.set(new MapKey('status'), this.status);
        if (this.documentErrors) map.set(new MapKey('documentErrors'), this.documentErrors);
        return new MapElement(map);
    }

    public static fromMapElement(mapElement: MapElement): DeviceResponse {
        const documents = mapElement.get(new MapKey('documents'));
        const documents2: MobileDocument[] = [];
        for (const document of (<ListElement>documents).value) {
            if (document instanceof MapElement) {
                const mapElement2 = <MapElement>document;
                const docType = mapElement2.get(new MapKey('docType'));
                const issuerSigned = mapElement2.get(new MapKey('issuerSigned'));
                const deviceSigned = mapElement2.get(new MapKey('deviceSigned'));
                const mdoc = new MobileDocument((<StringElement>docType).value, 
                                                 IssuerSigned.fromMapElement(<MapElement>issuerSigned), DeviceSigned.fromMapElement(<MapElement>deviceSigned));
                documents2.push(mdoc);
            }
        }
        const version = mapElement.get(new MapKey('version'));
        const status = mapElement.get(new MapKey('status'));
        const documentErrors = mapElement.get(new MapKey('documentErrors'));
        return new DeviceResponse(documents2, version.value, <NumberElement>status, <MapElement>documentErrors);
    }

    public static fromCBOR(value: ArrayBuffer): DeviceResponse {
        const mapElement = <MapElement>DataElementDeserializer.fromCBOR(value);
        return DeviceResponse.fromMapElement(mapElement);
    }

    public static fromCBORHex(value: string): DeviceResponse {
        return DeviceResponse.fromCBOR(Hex.decode(value));
    }

}