import { ByteStringElement } from "../data-element/byte-string-element";
import { CborDataItem2 } from "../data-element/cbor-data-item2";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { NumberElement } from "../data-element/number-element";
import { StringElement } from "../data-element/string-element";
import { SecureRandom } from "../utils/secure-random";


export class IssuerSignedItem {

    private constructor(public readonly digestID: number, 
                        public readonly randomSalt: ArrayBuffer, 
                        public readonly elementIdentifier: string, 
                        public readonly elementValue: CborDataItem2) {
    }

    public static build(digestID: number, elementIdentifier: string, elementValue: CborDataItem2): IssuerSignedItem {
        return new IssuerSignedItem(digestID, 
                                    new Uint8Array(new TextEncoder().encode(SecureRandom.generate(16))).buffer, 
                                    elementIdentifier, 
                                    elementValue);
    }
    
    toMapElement(): MapElement {
        const map = new Map<MapKey, CborDataItem2>();
        map.set(new MapKey('digestID'), new NumberElement(this.digestID));
        map.set(new MapKey('random'), new ByteStringElement(this.randomSalt));
        map.set(new MapKey('elementIdentifier'), new StringElement(this.elementIdentifier));
        map.set(new MapKey('elementValue'), this.elementValue);
        return new MapElement(map);
    }

    static fromMapElement(element: MapElement): IssuerSignedItem {
        const digestID = element.get(new MapKey('digestID'));
        const random = element.get(new MapKey('random'));
        const elementIdentifier = element.get(new MapKey('elementIdentifier'));
        const elementValue = element.get(new MapKey('elementValue'));
        return new IssuerSignedItem(digestID.value, random.value, elementIdentifier.value, elementValue);
    }

}