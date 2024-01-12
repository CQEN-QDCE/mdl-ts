import { COSESign1 } from "../cose/cose-sign-1";
import { DataElement } from "../data-element/data-element";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";

export class IssuerSigned {
    private nameSpaces: Map<string, EncodedCBORElement[]>;
    private issuerAuth: COSESign1;
    constructor(nameSpaces: Map<string, EncodedCBORElement[]>, issuerAuth: COSESign1) {
        this.nameSpaces = nameSpaces;
        this.issuerAuth = issuerAuth;
    }

    toMapElement(): MapElement {
        const map = new Map<MapKey, DataElement>();
        //map.set(new MapKey('nameSpaces'), this.nameSpaces);
        //map.set(new MapKey('issuerAuth'), this.issuerAuth.data.toDataElement());
        return new MapElement(map);
    }

    static fromMapElement(mapElement: MapElement): IssuerSigned {
        //let nameSpaces = mapElement.value.get(new MapKey('nameSpaces')) as EncodedCBORElement;
        //let deviceAuth = DeviceAuth.fromMapElement(mapElement.value.get(new MapKey('deviceAuth')));
        return new IssuerSigned(null, null);
    }
}