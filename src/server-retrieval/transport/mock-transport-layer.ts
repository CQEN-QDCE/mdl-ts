import { CredentialTypeRepository } from "../credential-type/credential-type-repository";
import { DrivingLicense } from "../credential-type/known-types/driving-license";
import { OidcServer } from "../oidc/oidc-server";
import { WebApiServer } from "../web-api/web-api-server";
import { TestKeysAndCertificates } from "./test-keys-and-certificates";
import { TransportLayer } from "./transport-layer";

export class MockTransportLayer implements TransportLayer {
    
    private readonly TAG = "MockTransportLayer";

    private readonly credentialTypeRepository: CredentialTypeRepository;
    private readonly oidcServer: OidcServer;
    private readonly webApiServer: WebApiServer;

    constructor() {
      this.credentialTypeRepository = new CredentialTypeRepository();
      this.credentialTypeRepository.addCredentialType(new DrivingLicense().getCredentialType());
//        this.oidcServer = new OidcServer("https://utopiadot.gov", 
  ///                                       TestKeysAndCertificates.jwtSignerPrivateKey,
     //                                    TestKeysAndCertificates.jwtCertificateChain,
       //                                  credentialTypeRepository)
      let testKeysAndCertificates = new TestKeysAndCertificates();
      testKeysAndCertificates.init();
      
      this.webApiServer = new WebApiServer(testKeysAndCertificates.jwtSignerPrivateKey,
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
        return this.webApiServer.serverRetrieval(requestBody);
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