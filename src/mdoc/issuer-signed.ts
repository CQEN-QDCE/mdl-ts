import { COSESign1 } from "../cose/cose-sign-1";
import { DataElement } from "../data-element/data-element";
import { EncodedCBORElement } from "../data-element/encoded-cbor-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";

export class IssuerSigned {

    nameSpaces: Map<string, EncodedCBORElement[]>;
    issuerAuth: COSESign1;
    
    constructor(nameSpaces: Map<string, EncodedCBORElement[]>, issuerAuth: COSESign1) {
        this.nameSpaces = nameSpaces;
        this.issuerAuth = issuerAuth;
    }

    toMapElement(): MapElement {
        const map = new Map<MapKey, DataElement>();
        map.set(new MapKey('issuerAuth'), this.issuerAuth.toDataElement());
        return new MapElement(map);
    }

    static fromMapElement(mapElement: MapElement): IssuerSigned {
        const nameSpaces = mapElement.get(new MapKey('nameSpaces'));
        const issuerAuth = mapElement.get(new MapKey('issuerAuth'));
        const nameSpaces2 = new Map<string, EncodedCBORElement[]>();
        for (const [key, value] of (<MapElement>nameSpaces).value) {
            nameSpaces2.set(key.str, <EncodedCBORElement[]>value.value);
        }
        return new IssuerSigned(nameSpaces2, new COSESign1(issuerAuth.value));
    }
}