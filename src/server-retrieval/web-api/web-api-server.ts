import * as x509 from "@peculiar/x509";
import { CredentialTypeRepository } from "../credential-type/credential-type-repository";
import { ServerRequest2 } from "./server-request2";

export class WebApiServer {
    
    constructor(private readonly privateKey: CryptoKey,
                private readonly certificateChain: x509.X509Certificate[] = [],
                private readonly credentialTypeRepository: CredentialTypeRepository) {
    }

    public serverRetrieval(serverRequest: ServerRequest2): string {
        //const serverRequestJson = JSON.parse(serverRequest);
        const docRequests = serverRequest['docRequests'];
        let filteredDocRequests: any[] = [];
        for (const docRequest of docRequests) {
            if (this.credentialTypeRepository.getMdocCredentialType(docRequest['docType'])) {
                filteredDocRequests.push(docRequest);
            }
        }
        let claimsSets: any[] = [];
        for (const docRequest of filteredDocRequests) {
            let newDocRequest: any = {};
            newDocRequest['docType'] = docRequest['docType'];
            const unknownElements = new Map<string, string[]>();
            this.getDataElementsPerNamespace(serverRequest['token'], docRequest, unknownElements);
            if (unknownElements.size > 0) {
                let errors: any = {};
                for(const [namespace, dataElements] of unknownElements) {
                    errors[namespace.toString()] = unknownElements.get(namespace);
                }
                newDocRequest['errors'] = errors;
            }
            claimsSets.push(docRequest);
        }
        
        filteredDocRequests = [];
        for (const docRequest of docRequests) {
            if (!this.credentialTypeRepository.getMdocCredentialType(docRequest['docType'])) {
                filteredDocRequests.push(docRequest);
            }
        }
        let unknownDocuments: any[] = [];
        for (const docRequest of filteredDocRequests) {
            unknownDocuments.push(docRequest['docType']);
        }

        //this.credentialTypeRepository.getMdocCredentialType();
        //const claimsSet
        return "serverResponse";
    }

    private getDataElementsPerNamespace(token: string, docRequest: any, unknownElements: Map<string, string[]>): any {
        
        const docType = docRequest['docType'].toString();
        
        const mdocCredentialType = this.credentialTypeRepository.getMdocCredentialType(docType);
        
        if (!mdocCredentialType) throw 'Unknown doctype';

        const nameSpacedData = this.getNameSpacedDataByToken(token, docType);

        const namespaces = docRequest["nameSpaces"] as any;

        for (const [namespace, dataElements] of namespaces) {
          //  if (!mdocCredentialType.namespaces.has(namespace)) {
          //      unknownElements.set(namespace, dataElements);
          //  }
        }
    }

    private getNameSpacedDataByToken(token: string, docType: string): any {

    }
}