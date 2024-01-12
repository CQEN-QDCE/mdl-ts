import { CredentialTypeRepository } from "../credential-type/credential-type-repository";
import { DrivingLicense } from "../credential-type/known-types/driving-license";
import { OidcServer } from "../oidc/oidc-server";
import { WebApiServer } from "../web-api/web-api-server";
import { TestKeysAndCertificates } from "./test-keys-and-certificates";
import { TransportLayer } from "./transport-layer";

export class MockTransportLayer implements TransportLayer {
    
    private readonly TAG = "MockTransportLayer";

    private credentialTypeRepository: CredentialTypeRepository;
    private oidcServer: OidcServer;
    private webApiServer: WebApiServer;

    constructor() {

    }

    public async init(): Promise<void> {
      this.credentialTypeRepository = new CredentialTypeRepository();
      this.credentialTypeRepository.addCredentialType(new DrivingLicense().getCredentialType());
//        this.oidcServer = new OidcServer("https://utopiadot.gov", 
  ///                                       TestKeysAndCertificates.jwtSignerPrivateKey,
     //                                    TestKeysAndCertificates.jwtCertificateChain,
       //                                  credentialTypeRepository)
      let testKeysAndCertificates = new TestKeysAndCertificates();
      await testKeysAndCertificates.init();
      
      this.webApiServer = new WebApiServer(testKeysAndCertificates.jwtSignerPrivateKey,
                                           testKeysAndCertificates.jwtSignerPublicKey,
                                           testKeysAndCertificates.jwtCertificateChain,
                                           this.credentialTypeRepository);
    }

    async doGet(url: string): Promise<string> {
        
        if (url.includes(".well-known/openid-configuration")) {
            return this.oidcServer.configuration;
        }

        if (url.includes("connect/authorize")) {
//            return this.oidcServer.authorization(ServerRetrievalUtil.urlToMap(
  //              url
    //        ));
        }

        if (url.includes(".well-known/jwks.json")) {
 //           return this.oidcServer.validateIdToken();
        }

        throw new Error("Bad request.");
    }

    async doPost(url: string, requestBody: any): Promise<string> {
      if (url.includes("/identity")) {
        return await this.webApiServer.serverRetrieval(requestBody);
      }

      if (url.includes("/connect/register")) {
//            return this.oidcServer.authorization(ServerRetrievalUtil.urlToMap(
//              url
//        ));
      }

      if (url.includes("/connect/token")) {
//           return this.oidcServer.validateIdToken();
      }

      throw new Error("Bad request.");
    }
    
}