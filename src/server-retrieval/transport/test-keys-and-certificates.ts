import * as x509 from "@peculiar/x509";
import { Crypto } from "@peculiar/webcrypto";

export class TestKeysAndCertificates {

    public jwtSignerPrivateKey: CryptoKey;

    public jwtSignerCertificate: x509.X509Certificate;

    public caCertificate: x509.X509Certificate;

    public jwtCertificateChain: x509.X509Certificate[] = [];

    public clientPrivateKey: CryptoKey;

    constructor() {

    }

    public async init(): Promise<void> {  

        const crypto = new Crypto();

        x509.cryptoProvider.set(crypto);
        
        const algorithm = {
            name: 'ECDSA',
            namedCurve: 'P-256',
            hash: 'SHA-256'
        };
        
        const caKeyPair = await crypto.subtle.generateKey(algorithm, true, ["sign", "verify"]);
        const jwtSignerkeyPair = await crypto.subtle.generateKey(algorithm, true, ["sign", "verify"]);
        this.jwtSignerPrivateKey = jwtSignerkeyPair.privateKey;

        this.caCertificate = await x509.X509CertificateGenerator.createSelfSigned(
            {
                serialNumber: "01",
                name: "CN=MDOC Test CA",
                notBefore: new Date("2023/01/01"),
                notAfter: new Date("2025/01/01"),
                signingAlgorithm: algorithm,
                keys: caKeyPair,
                extensions: [
                    new x509.BasicConstraintsExtension(false, 2, true),
                    new x509.KeyUsagesExtension(x509.KeyUsageFlags.digitalSignature, true),
                    await x509.SubjectKeyIdentifierExtension.create(caKeyPair.publicKey),
                ]
        });

        this.jwtSignerCertificate = await x509.X509CertificateGenerator.createSelfSigned(
            {
                serialNumber: "02",
                name: "CN=MDOC Test Issuer",
                notBefore: new Date("2023/01/01"),
                    notAfter: new Date("2025/01/01"),
                    signingAlgorithm: algorithm,
                    keys: jwtSignerkeyPair,
                    extensions: [
                        new x509.BasicConstraintsExtension(true, 2, true),
                        new x509.ExtendedKeyUsageExtension(["1.2.3.4.5.6.7", "2.3.4.5.6.7.8"], true),
                        new x509.KeyUsagesExtension(x509.KeyUsageFlags.keyCertSign | x509.KeyUsageFlags.cRLSign, true),
                        await x509.SubjectKeyIdentifierExtension.create(jwtSignerkeyPair.publicKey),
                    ]
            }
        );

        this.jwtCertificateChain.push(this.jwtSignerCertificate);
        this.jwtCertificateChain.push(this.caCertificate);

        const clientKeyPair = await crypto.subtle.generateKey(algorithm, true, ["sign", "verify"]);
        this.clientPrivateKey = clientKeyPair.privateKey;
    }

}