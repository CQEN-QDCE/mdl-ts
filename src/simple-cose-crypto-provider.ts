import * as CBOR from 'cbor';
import * as x509 from "@peculiar/x509";
import { COSECryptoProvider } from "./cose/cose-crypto-provider";
import { COSESign1 } from "./cose/cose-sign-1";
import { SimpleCOSECryptoProviderKeyInfo } from "./simple-cose-crypto-provider-key-info";
import { Crypto } from "@peculiar/webcrypto";
import { ByteStringElement } from "./data-element/byte-string-element";
import { MapElement } from "./data-element/map-element";
import { DataElement } from "./data-element/data-element";
import { MapKey } from "./data-element/map-key";
import { ArrayBufferComparer } from './utils/array-buffer-comparer';
import { ListElement } from './data-element/list-element';

export class SimpleCOSECryptoProvider implements COSECryptoProvider {

    private _keyMap: Map<string, SimpleCOSECryptoProviderKeyInfo>;

    constructor(keys: SimpleCOSECryptoProviderKeyInfo[]) {
        this._keyMap = new Map<string, SimpleCOSECryptoProviderKeyInfo>();
        for (const key of keys) {
            this._keyMap.set(key.keyID, key);
        }
    }

    async sign1(payload: ArrayBuffer, keyID: string): Promise<COSESign1> {
        const keyInfo = this._keyMap.get(keyID);
        if (!keyInfo) throw new Error('No key ID given, or key with given ID not found');
        const cborArray = [];
        cborArray.push('Signature1');
        cborArray.push(new Int8Array([-95, 1, 38]).buffer); // TODO: This is the protected header, but it's not clear what it should be
        cborArray.push(new ArrayBuffer(0));
        cborArray.push(payload);
        const payload2 = CBOR.encode(cborArray);
        const crypto = new Crypto();
        x509.cryptoProvider.set(crypto);
        const algo =   {
            name: "ECDSA",
            hash: { name: "SHA-256" },
          };
        const signature = await crypto.subtle.sign(algo, keyInfo.privateKey, payload2);
        const f1 = new ByteStringElement(new Int8Array([-95, 1, 38]).buffer);
        const map = new Map<MapKey, DataElement>();
        let acc = Uint8Array.from([]).buffer;
        for (const x5c of keyInfo.x5Chain) {
            acc = this.concatenateArrayBuffers(acc, x5c.rawData);
        }

        const certs = new x509.X509Certificates(keyInfo.x5Chain);
        //certs.import()
        //x509.X509Certificates.
        let bla = certs.export('raw');

        map.set(new MapKey(33), new ByteStringElement(bla));
        const f2 = new MapElement(map);
        const f3 = new ByteStringElement(payload);
        const f4 = new ByteStringElement(signature);
        return COSESign1.fromDataElement(new ListElement([f1, f2, f3, f4]));
    }

    private concatenateArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp.buffer;
    }

    async verify1(coseSign1: COSESign1, keyID: string): Promise<boolean> {
        const cborArray = [];
        cborArray.push('Signature1');
        cborArray.push(coseSign1.protectedHeader);
        cborArray.push(new ArrayBuffer(0));
        cborArray.push(coseSign1.payload);
        const payload = CBOR.encode(cborArray);
        const keyInfo = this._keyMap.get(keyID);
        const crypto = new Crypto();
        x509.cryptoProvider.set(crypto);
        const algo =   {
            name: "ECDSA",
            hash: { name: "SHA-256" },
        };
        return await crypto.subtle.verify(algo, keyInfo.publicKey, coseSign1.signatureOrTag, payload);
    }
    
    async verifyX5Chain(coseSign1: COSESign1, keyID: string): Promise<boolean> {
        const crypto = new Crypto();
        x509.cryptoProvider.set(crypto);
        const keyInfo = this._keyMap.get(keyID);
        if (!keyInfo) throw new Error("No key ID given, or key with given ID not found");
        const test = coseSign1.x5Chain;
        const certificateChain = new x509.X509Certificates();
        certificateChain.import(test);
        let lastCertificate = certificateChain[certificateChain.length - 1];
        let bla = lastCertificate.publicKey.rawData;
        let bla3 = await lastCertificate.publicKey.export();
        let bla4 = <Uint8Array>await crypto.subtle.exportKey('raw', bla3);
        let bla2 = <Uint8Array>await crypto.subtle.exportKey('raw', keyInfo.publicKey);

        let equals = ArrayBufferComparer.equals(bla2.buffer, bla4.buffer);
        return certificateChain.length > 0  && 
               ArrayBufferComparer.equals(bla2.buffer, bla4.buffer) && 
               this.validateCertificateChain(certificateChain, keyInfo);
        throw new Error("Method not implemented.");
    }

    private validateCertificateChain(certChain: x509.X509Certificate[], keyInfo: SimpleCOSECryptoProviderKeyInfo): boolean {
        // TODO: Implement
        return true;
    }
}