import { CborByteString } from "../cbor/types/cbor-byte-string";
import { CborDataItem } from "../cbor/cbor-data-item";
import { CborEncodedDataItem } from "../cbor/types/cbor-encoded-data-item";
import { CborMap } from "../cbor/types/cbor-map";
import { CborTextString } from "../cbor/types/cbor-text-string";
import { DeviceKeyInfo } from "../mso/device-key-info";
import { IssuerSignedItem } from "../issuer-signed/issuer-signed-item";
import { ValidityInfo } from "../mso/validity-info";
import { DigestAlgorithm } from "./digest-algorithm.enum";
import { CborEncoder } from "../cbor/cbor-encoder";
import { ArrayBufferComparer } from "../utils/array-buffer-comparer";
import { CborConvertible } from "../cbor/cbor-convertible";
import rs from "jsrsasign";
import { Hex } from "../utils/hex";

// Mobile security object (MSO), representing the payload of the issuer signature, for the issuer signed part of the mdoc.
export class MobileSecurityObject implements CborConvertible {

    public readonly version: string;
    public readonly digestAlgorithm: DigestAlgorithm;

    // Digests of all data elements per namespace
    public readonly valueDigests: Map<string, Map<number, ArrayBuffer>>;
    
    public readonly docType: string;
    public readonly validity: ValidityInfo;
    private readonly deviceKeyInfo: DeviceKeyInfo;

    public constructor(version: string, 
                        digestAlgorithm: DigestAlgorithm,
                        valueDigests: Map<string, Map<number, ArrayBuffer>>,
                        deviceKeyInfo: DeviceKeyInfo,
                        docType: string,
                        validityInfo: ValidityInfo) {
        this.version = version;
        this.digestAlgorithm = digestAlgorithm;
        this.valueDigests = valueDigests;
        this.deviceKeyInfo = deviceKeyInfo;
        this.docType = docType;
        this.validity = validityInfo;
    }

    public static async build(issuerNamespaces: Map<string, IssuerSignedItem[]>,
                              deviceKeyInfo: DeviceKeyInfo,
                              docType: string,
                              validityInfo: ValidityInfo,
                              digestAlgorithm: DigestAlgorithm = DigestAlgorithm.SHA256): Promise<MobileSecurityObject> {

        const valueDigests = new Map<string, Map<number, ArrayBuffer>>();
        
        for (const [namespace, issuerSignedItems] of issuerNamespaces) {
            valueDigests.set(namespace, await this.digestItems(issuerSignedItems, digestAlgorithm));
        }

        const mso = new MobileSecurityObject('1.0', 
                                             digestAlgorithm, 
                                             valueDigests, 
                                             deviceKeyInfo, 
                                             docType, 
                                             validityInfo);
        return mso;
    }

    fromCborDataItem(dataItem: CborDataItem): MobileSecurityObject {
        const cborMap = dataItem as CborMap;
        const version = cborMap.get('version') as CborTextString;
        const digestAlgorithm = cborMap.get('digestAlgorithm') as CborTextString;
        const valueDigests = cborMap.get('valueDigests') as CborMap;
        const deviceKeyInfo = CborDataItem.to(DeviceKeyInfo, cborMap.get('deviceKeyInfo') as CborMap);
        const docType = cborMap.get('docType') as CborTextString;
        const validityInfo = CborDataItem.to(ValidityInfo, cborMap.get('validityInfo') as CborMap);

        // TODO: Nettoyer ce code.
        let valueDigests2 = new Map<string, Map<number, ArrayBuffer>>;
        for(const [namespace, value] of valueDigests.getValue()) {
            const digestMap = new Map<number, ArrayBuffer>();
            for (const [key2, value2] of (<CborMap>value).getValue()) {
                if (value2 instanceof CborByteString) {
                    digestMap.set(key2 as number, value2.getValue());
                }
            }
            valueDigests2.set(namespace as string, digestMap);
        }

        return new MobileSecurityObject(version.getValue(), 
                                        digestAlgorithm.getValue() as DigestAlgorithm, 
                                        valueDigests2, 
                                        deviceKeyInfo, 
                                        docType.getValue(), 
                                        validityInfo);
    }

    toCborDataItem(): CborDataItem {
        const valueDigestNamespaces = new Map<string | number, CborDataItem>();
        for (const [namespace, valueDigests2] of this.valueDigests) {
            const nameSpaceDigests = new Map<string | number, CborDataItem>();
            for (const [digestID, valueDigest] of valueDigests2) {
                nameSpaceDigests.set(digestID, new CborByteString(valueDigest));
            }
            valueDigestNamespaces.set(namespace, new CborMap(nameSpaceDigests));
        }
        const cborMap = new CborMap();
        cborMap.set('version', new CborTextString(this.version));
        cborMap.set('digestAlgorithm', new CborTextString(this.digestAlgorithm));
        cborMap.set('valueDigests', new CborMap(valueDigestNamespaces));
        cborMap.set('deviceKeyInfo', CborDataItem.from(this.deviceKeyInfo));
        cborMap.set('docType', new CborTextString(this.docType));
        cborMap.set('validityInfo', CborDataItem.from(this.validity));
        return cborMap;
    }

    public async verifySignedItems(namespace: string, issuerSignedItems: IssuerSignedItem[]): Promise<boolean> {
        
        const valueDigests = this.valueDigests.get(namespace);
        
        for (const issuerSignedItem of issuerSignedItems) {
            const digestID = issuerSignedItem.digestID;
            if (!valueDigests.has(digestID)) return false;
            const valueDigest = valueDigests.get(digestID);
            const itemDigest = await MobileSecurityObject.digestItem(issuerSignedItem, this.digestAlgorithm);
            if (!ArrayBufferComparer.equals(valueDigest, itemDigest)) return false;
        }
        
        return true;
    }

    private static async digestItems(issuerSignedItems: IssuerSignedItem[], digestAlgorithm: DigestAlgorithm): Promise<Map<number, ArrayBuffer>> {
        const digestIDs = new Map<number, ArrayBuffer>();
        for (const issuerSignedItem of issuerSignedItems) {
            const digest = await this.digestItem(issuerSignedItem, digestAlgorithm);
            digestIDs.set(issuerSignedItem.digestID, digest);
        }
        return digestIDs;
    }

    private static async digestItem(issuerSignedItem: IssuerSignedItem, digestAlgorithm: DigestAlgorithm): Promise<ArrayBuffer> {
        const encodedItem = new CborEncodedDataItem(CborEncoder.encode(issuerSignedItem.toMapElement()));
        
        const md = new rs.KJUR.crypto.MessageDigest({"alg": "sha256"});
        md.updateHex(Hex.encode(CborEncoder.encode(encodedItem)));
        const hashValueHex = md.digest();
        return Hex.decode(hashValueHex);
     }
}