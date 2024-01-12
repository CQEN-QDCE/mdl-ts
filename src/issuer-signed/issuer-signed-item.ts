import { ByteStringElement } from "../data-element/byte-string-element";
import { DataElement } from "../data-element/data-element";
import { MapElement } from "../data-element/map-element";
import { MapKey } from "../data-element/map-key";
import { NumberElement } from "../data-element/number-element";
import { StringElement } from "../data-element/string-element";
import { SecureRandom } from "../utils/secure-random";


export class IssuerSignedItem {

    digestID: NumberElement;
    random: ByteStringElement;
    elementIdentifier: StringElement;
    elementValue: DataElement;

    constructor(digestID: NumberElement, 
                random: ByteStringElement, 
                elementIdentifier: StringElement, 
                elementValue: DataElement) {
        this.digestID = digestID;
        this.random = random;
        this.elementIdentifier = elementIdentifier;
        this.elementValue = elementValue;
    }
    
    toMapElement(): MapElement {
        const map = new Map<MapKey, DataElement>();
        map.set(new MapKey('digestID'), this.digestID);
        map.set(new MapKey('random'), this.random);
        map.set(new MapKey('elementIdentifier'), this.elementIdentifier);
        map.set(new MapKey('elementValue'), this.elementValue);
        return new MapElement(map);
    }

    static fromMapElement(element: MapElement): IssuerSignedItem {
        const digestID = element.get(new MapKey('digestID'));
        const random = element.get(new MapKey('random'));
        const elementIdentifier = element.get(new MapKey('elementIdentifier'));
        const elementValue = element.get(new MapKey('elementValue'));
        return new IssuerSignedItem(digestID, random, elementIdentifier, elementValue);
    }

    static createWithRandomSalt(digestID: number, elementIdentifier: string, elementValue: DataElement): IssuerSignedItem {
        return new IssuerSignedItem(new NumberElement(digestID), 
                                    new ByteStringElement(new Uint8Array(new TextEncoder().encode(SecureRandom.generate(16))).buffer), 
                                    new StringElement(elementIdentifier), 
                                    elementValue);
    }
}