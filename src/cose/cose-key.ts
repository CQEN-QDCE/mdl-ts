import * as CBOR from 'cbor';
import { Crypto } from "@peculiar/webcrypto";
import { KeyKeys } from "../../key-keys.enum";
import { Base64 } from '../utils/base64';

export class COSEKey {

    private publicKey: CryptoKey | null;
    private privateKey: CryptoKey | null;
    private keyMap: Map<number, number | ArrayBuffer>;

    private constructor(publicKey: CryptoKey | null, privateKey: CryptoKey | null, keyMap: Map<number, number | ArrayBuffer>) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.keyMap = keyMap;
    }

    static async build(publicKey: CryptoKey | null = null, privateKey: CryptoKey | null = null): Promise<COSEKey> {
        
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

        return new COSEKey(publicKey, privateKey, keyMap);
    }

    toCBOR(): ArrayBuffer {
        return Uint8Array.from(CBOR.encode(this.keyMap)).buffer;
    }
}