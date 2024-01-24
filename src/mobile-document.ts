import { COSECryptoProvider } from "./cose/cose-crypto-provider";
import { COSEMac0 } from "./cose/cose-mac-0";
import { DataElement } from "./data-element/data-element";
import { DataElementDeserializer } from "./data-element/data-element-deserializer";
import { DataElementSerializer } from "./data-element/data-element-serializer";
import { EncodedCBORElement } from "./data-element/encoded-cbor-element";
import { MapElement } from "./data-element/map-element";
import { MapKey } from "./data-element/map-key";
import { NumberElement } from "./data-element/number-element";
import { StringElement } from "./data-element/string-element";
import { IssuerSignedItem } from "./issuer-signed/issuer-signed-item";
import { DeviceAuthentication } from "./mdoc-auth/device-authentication";
import { MDocRequest } from "./mdoc-request";
import { DeviceAuth } from "./mdoc/device-auth";
import { DeviceSigned } from "./mdoc/device-signed";
import { IssuerSigned } from "./issuer-signed/issuer-signed";
import { MDocVerificationParams } from "./mdoc/mdoc-verification-params";
import { MobileSecurityObject } from "./mdoc/mobile-security-object";
import { VerificationType } from "./mdoc/verification-type.enum";
import { Lazy } from "./utils/lazy";

export class MobileDocument {

    public readonly docType: string;
    public readonly issuerSigned: IssuerSigned;
    public readonly deviceSigned: DeviceSigned;
    public readonly errors: Map<string, Map<string, number>>;
    private readonly lazyMobileSecurityObject: Lazy<MobileSecurityObject>;
    private readonly lazyIssuerNamespaces: Lazy<Set<string>>;

    /**
     * 
     * @param docType 
     * @param issuerSigned 
     * @param deviceSigned 
     * @param errors The errors parameter is a map from namespaces where each value is a map from data elements in said namespace to an error code from ISO/IEC 18013-5:2021 Table 9.
     */
    constructor(docType: string, 
                issuerSigned: IssuerSigned, 
                deviceSigned: DeviceSigned, 
                errors: Map<string, Map<string, number>> | null = null) {
        this.docType = docType;
        this.issuerSigned = issuerSigned;
        this.deviceSigned = deviceSigned;
        this.errors = errors;
        this.lazyMobileSecurityObject = new Lazy<MobileSecurityObject>(() => this.initMobileSecurityObject());
        this.lazyIssuerNamespaces = new Lazy<Set<string>>(() => this.initIssuerNamespaces());
    }

    get mso(): MobileSecurityObject {
        return this.lazyMobileSecurityObject.value;
    }

    get issuerNamespaces(): Set<string> {
        return this.lazyIssuerNamespaces.value;
    }

    public getIssuerSignedItems(namespace: string): IssuerSignedItem[] {
//        const issuerSignedItems: IssuerSignedItem[] = [];
//        const encodedCBORElements: EncodedCBORElement[] = this.issuerSigned.namespaces.get(namespace);
//        for (const encodedCBORElement of encodedCBORElements) {
//            const dataElement = encodedCBORElement.decode();
//            IssuerSignedItem.fromMapElement(<MapElement>dataElement);
//            issuerSignedItems.push(IssuerSignedItem.fromMapElement(<MapElement>dataElement));
//        }
//        return issuerSignedItems;
        return this.issuerSigned.namespaces.get(namespace);
    }

    // TODO: Cette méthode ne devrait pas être publique.
    public async verifySignature(cryptoProvider: COSECryptoProvider, keyID: string | null = null): Promise<boolean> {
        return await cryptoProvider.verify1(this.issuerSigned.issuerAuth, keyID);
    }

    private async verifyDeviceMAC(deviceAuthentication: DeviceAuthentication, ephemeralMACKey: ArrayBuffer): Promise<boolean> {
        const deviceMac = this.deviceSigned?.deviceAuth?.deviceMac;
        if (!deviceMac) throw new Error("No device MAC found on MDoc.");
        return await deviceMac.attachPayload(this.getDeviceSignedPayload(deviceAuthentication)).verify(ephemeralMACKey);
    }

    private async verifyDeviceSignature(deviceAuthentication: DeviceAuthentication, cryptoProvider: COSECryptoProvider, keyID: string = null): Promise<boolean> {
        const deviceSignature = this.deviceSigned?.deviceAuth?.deviceSignature;
        if (!deviceSignature) throw new Error("No device signature found on MDoc.");
        return await cryptoProvider.verify1(deviceSignature.attachPayload(this.getDeviceSignedPayload(deviceAuthentication)), keyID);
    }

    private async verifyCertificateChain(cryptoProvider: COSECryptoProvider, keyID: string | null = null): Promise<boolean> {
        return await cryptoProvider.verifyX5Chain(this.issuerSigned.issuerAuth, keyID);
    }

    private verifyValidity(): boolean {
        const mso = this.mso;
        if (!mso) throw new Error("No MSO found on this mdoc.");
        const validityInfo = mso.validity;
        return validityInfo.validFrom.value <= new Date() && validityInfo.validUntil.value >= new Date();
    }

    private verifyDocType(): boolean {
        const mso = this.mso;
        if (!mso) throw new Error("No MSO found on this mdoc.");
        return mso.docType === this.docType;
    }

    private async verifyDeviceSigOrMac(verificationParams: MDocVerificationParams, cryptoProvider: COSECryptoProvider): Promise<boolean> {
        const mdocDeviceAuthentication = this.deviceSigned.deviceAuth;
        if (!mdocDeviceAuthentication) throw new Error("MDoc has no device authentication.");
        const deviceAuthenticationPayload = verificationParams.deviceAuthentication;
        if (!deviceAuthenticationPayload) throw new Error("No device authentication payload given, for check of device signature or MAC.");
        if (mdocDeviceAuthentication.deviceMac != null) {
            return await this.verifyDeviceMAC(deviceAuthenticationPayload, verificationParams.ephemeralMacKey);
        } else if (mdocDeviceAuthentication.deviceSignature != null) {
            return await this.verifyDeviceSignature(deviceAuthenticationPayload,
                                              cryptoProvider, 
                                              verificationParams.deviceKeyID);
        } else {
            throw new Error("MDoc device auth has neither MAC nor signature.");
        }
    }

    private async verifyIssuerSignedItems(): Promise<boolean> {
        const mso = this.mso;
        if (!mso) throw new Error("No MSO found on this mdoc.");
        for (const [nameSpace, issuerSignedItems] of this.issuerSigned.namespaces) {
            if (!await mso.verifySignedItems(nameSpace, issuerSignedItems)) return false;
        }
        return true;
    }

    async verify(verificationParams: MDocVerificationParams, cryptoProvider: COSECryptoProvider): Promise<boolean> {
        for (const verificationType of verificationParams.verificationTypes) {
            switch (verificationType) {
                case VerificationType.CERTIFICATE_CHAIN:
                    if (!await this.verifyCertificateChain(cryptoProvider, verificationParams.issuerKeyID)) return false;
                    break;
                case VerificationType.VALIDITY:
                    if (!this.verifyValidity()) return false;
                    break;
                case VerificationType.DOC_TYPE:
                    if (!this.verifyDocType()) return false;
                    break;
                case VerificationType.DEVICE_SIGNATURE:
                    if (!await this.verifyDeviceSigOrMac(verificationParams, cryptoProvider)) return false;
                    break;
                case VerificationType.ISSUER_SIGNATURE:
                    if (!await this.verifySignature(cryptoProvider, verificationParams.issuerKeyID)) return false;
                    break;
                case VerificationType.ITEMS_TAMPER_CHECK:
                    if (!await this.verifyIssuerSignedItems()) return false;
                    break;
                default:
                    throw new Error("Unknown verification type.");
            }
        }
        return true;
    }

    public async presentWithDeviceSignature(mDocRequest: MDocRequest, deviceAuthentication: DeviceAuthentication, cryptoProvider: COSECryptoProvider, keyID: string = null): Promise<MobileDocument> {
        const coseSign1 = (await cryptoProvider.sign1(this.getDeviceSignedPayload(deviceAuthentication), keyID)).detachPayload();
        const namespaces = EncodedCBORElement.encode(new MapElement(new Map<MapKey, DataElement>));
        const deviceAuth = new DeviceAuth(null, coseSign1);
        return new MobileDocument(this.docType, 
                                  this.selectDisclosures(mDocRequest),
                                  new DeviceSigned(namespaces, deviceAuth));
    }

    public async presentWithDeviceMAC(mobileDocumentRequest: MDocRequest, deviceAuthentication: DeviceAuthentication, ephemeralMACKey: ArrayBuffer): Promise<MobileDocument> {
        //const coseMac0 = COSEMac0.createWithHMAC256(this.getDeviceSignedPayload(deviceAuthentication), ephemeralMACKey).detachPayload();
        const coseMac0 = new COSEMac0();
        coseMac0.attachPayload(this.getDeviceSignedPayload(deviceAuthentication));
        await coseMac0.mac(ephemeralMACKey);
        coseMac0.detachPayload();
        return new MobileDocument(this.docType, 
                                  this.selectDisclosures(mobileDocumentRequest), 
                                  new DeviceSigned(new EncodedCBORElement(new MapElement(new Map<MapKey, DataElement>).toCBOR()), 
                                  new DeviceAuth(coseMac0)));
    }

    private selectDisclosures(mDocRequest: MDocRequest): IssuerSigned {
        const issuerNamespaces = new Map<string, IssuerSignedItem[]>();
        for (const [namespace, issuerSignedItems] of this.issuerSigned.namespaces) {
            const requestedItems = mDocRequest.getRequestedItemsFor(namespace);
            const list: IssuerSignedItem[] = [];
            for (const issuerSignedItem of issuerSignedItems) {
                if (requestedItems.get(issuerSignedItem.elementIdentifier.value)) list.push(issuerSignedItem);
            }
            issuerNamespaces.set(namespace, list);
        }
        return new IssuerSigned(issuerNamespaces, this.issuerSigned.issuerAuth);
    }

    private getDeviceSignedPayload(deviceAuthentication: DeviceAuthentication): ArrayBuffer {
        return DataElementSerializer.toCBOR(EncodedCBORElement.encode(deviceAuthentication.toDataElement()));
    }

    private initMobileSecurityObject(): MobileSecurityObject {
        const payload = this.issuerSigned.issuerAuth.payload;
        const encodedCBORElement = <EncodedCBORElement>DataElementDeserializer.fromCBOR(payload);
        const mapElement = <MapElement>encodedCBORElement.decode();
        return MobileSecurityObject.fromMapElement(mapElement);
    }

    private initIssuerNamespaces(): Set<string> {
        return new Set<string>([...this.issuerSigned.namespaces.keys()]);
    }

    toMapElement(): MapElement {
        const map = new Map<MapKey, DataElement>();
        map.set(new MapKey('docType'), new StringElement(this.docType));
        map.set(new MapKey('issuerSigned'), this.issuerSigned.toDataElement());
        if (this.deviceSigned) map.set(new MapKey('deviceSigned'), this.deviceSigned.toMapElement());
        if (this.errors) {
            const namespacesMap = new Map<MapKey, DataElement>();
            for (const [namespace, dataElements] of this.errors) {
                const dataElementsMap = new Map<MapKey, DataElement>();
                for(const [identifier, errorCode] of dataElements) {
                    dataElementsMap.set(new MapKey(identifier), new NumberElement(errorCode));
                }
                namespacesMap.set(new MapKey(namespace), new MapElement(dataElementsMap));
            }
            map.set(new MapKey('errors'), new MapElement(namespacesMap));
        }
        return new MapElement(map);
    }
}