import axios, { AxiosResponse, AxiosInstance } from 'axios';
import { CborDecoder } from '../src/data-element/cbor-decoder';
import { Cbor } from '../src/cbor/cbor';
import { IssuerSigned } from '../src/issuer-signed/issuer-signed';
describe("ACA-py OID4VC Tests", () => {
    
    let client: AxiosInstance;
    
    beforeAll(async () => {
        client = axios.create();
    });

    test("Credential Issuance", async () => {
        let createDidRequest: any = {
            "method": "key"
        };

        const didCreateResponse: AxiosResponse = await client.post(`http://localhost:3001/wallet/did/create`, createDidRequest);
        
        const did = didCreateResponse.data.result;

        let exchangeCreateRequest: any = {
            "did": did.did,
            "supported_cred_id": "58d1a40d-4acf-4b5e-adfd-8885e696e6e7",
            "credential_subject": { "name": "firstName", "lastname": "lastName", "email" : null }
        };
        
        const exchangeCreateResponse: AxiosResponse = await client.post(`http://localhost:3001/oid4vci/exchange/create`, exchangeCreateRequest);
        const exchange = exchangeCreateResponse.data;

        const credentialOfferResponse: AxiosResponse = await client.get(`http://localhost:3001/oid4vci/credential-offer?exchange_id=${exchange.exchange_id}`);
        const credentialOffer = credentialOfferResponse.data;
        const credentialIssuerUrl = credentialOffer.credential_issuer;
        const credentials = credentialOffer.credentials;
        const grants = credentialOffer.grants;
        let pre: string = ''; 
        for (const property in grants) {
            console.log(`${property}: ${grants[property]}`);
            if (property === 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
                pre = grants[property]['pre-authorized_code'];
                let test = 1;
            }
        }
        let accessTokenRequest: any = {
            "grant_type": "urn:ietf:params:oauth:grant-type:pre-authorized_code",
            "pre-authorized_code": pre
        };

        const params = {
            format: 'json',
            option: 'value'
          };
          
        const data = Object.keys(accessTokenRequest)
            .map((key) => `${key}=${encodeURIComponent(accessTokenRequest[key])}`)
            .join('&');
          
        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data,
            url: 'http://localhost:8081/token',
        };
          
        const accessTokenResponse: AxiosResponse = await client(options);
        const accessToken = accessTokenResponse.data;

        let credentialRequest: any = {
            "format": "mso_mdoc",
//            "doctype": "org.iso.18013.5.1.mDL",
            "proof": 
            { 
                "proof_type": "cwt", 
                "cwt" : null 
            }
        };

        const credentialResponse: AxiosResponse = await client.post(`http://localhost:8081/credential`, credentialRequest, { headers: { 'Authorization': 'BEARER ' + accessToken.access_token } });  

        //const exchange2 = credentialResponse.data;

        //const parsedList = DataElementDeserializer.fromCBORHex(exchange2.credential);
        const issuerSigned = Cbor.decode(IssuerSigned, credentialResponse.data.credential);
        let bla = 1;
    });
});