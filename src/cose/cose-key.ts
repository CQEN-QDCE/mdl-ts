import { Crypto } from "@peculiar/webcrypto";
import { KeyKeys } from "../../key-keys.enum";
import { Base64 } from '../utils/base64';
import { MapElement } from '../data-element/map-element';
import { DataElement } from '../data-element/data-element';
import { MapKey } from '../data-element/map-key';
import { NumberElement } from '../data-element/number-element';
import { ByteStringElement } from '../data-element/byte-string-element';

export class CoseKey {

    private keyMap: Map<number, number | ArrayBuffer>;

    private constructor(keyMap: Map<number, number | ArrayBuffer>) {
        this.keyMap = keyMap;
    }

    static async new(publicKey: CryptoKey | null = null, privateKey: CryptoKey | null = null): Promise<CoseKey> {
        
        const keyMap = new Map<number, number | ArrayBuffer>();

        const crypto = new Crypto();

        if (publicKey) {
            const jsonWebPublicKey = await crypto.subtle.exportKey('jwk', publicKey);
            const x = Base64.decode(jsonWebPublicKey.x); // EC2_X -2
            const y = Base64.decode(jsonWebPublicKey.y); // EC2_Y -3
            keyMap.set(KeyKeys.KeyType, KeyKeys.KeyType_EC2);
            keyMap.set(KeyKeys.EC2Curve, KeyKeys.EC2_P256);
            keyMap.set(KeyKeys.EC2X, x);
            keyMap.set(KeyKeys.EC2Y, y);
        }

        return new CoseKey(keyMap);
    }
    
    static fromDataElement(element: MapElement): CoseKey {
        const keyMap = new Map<number, number | ArrayBuffer>();
        element.value.forEach((value, key) => {
            keyMap.set(key.int, value.value);
        });
        return new CoseKey(keyMap);
    }

    toDataElement(): MapElement {
        const keyMap = new Map<MapKey, DataElement>();
        for (const [key, value] of this.keyMap) {
            keyMap.set(new MapKey(key), typeof value === 'number' ? new NumberElement(value) : new ByteStringElement(value));
        }
        return new MapElement(keyMap);
    }
}