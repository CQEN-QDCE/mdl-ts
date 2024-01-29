import { Grant, OpenId4VciCredentialFormatProfile } from "../../../src/oidc4vci/generic.types";
import { IssuerService } from "../../../src/oidc4vci/issuer-service";
import { NonceService } from "../../../src/oidc4vci/nonce-service";
import { OpenId4VciAuthorizationCodeFlowConfig, OpenId4VciPreAuthorizedCodeFlowConfig } from "../../../src/oidc4vci/vc-issuer-service-options";

describe('IssuerService', () => {

    let grants: Grant;

    let preAuthorizedCodeFlowConfig: OpenId4VciPreAuthorizedCodeFlowConfig;

    let authorizationCodeFlowConfig: OpenId4VciAuthorizationCodeFlowConfig;

    let nonceService: NonceService;

    const hostedCredentialOfferUri = 'https://openid4vc-issuer.com/credential-offer-uri'

    const universityDegreeCredentialSdJwt = {
//       id: 'https://openid4vc-issuer.com/credentials/UniversityDegreeCredentialSdJwt',
        //format: OpenId4VciCredentialFormatProfile.SdJwtVc,
        format: 'vc+sd-jwt',
        vct: 'UniversityDegreeCredential',
        claims: null
      };

      const baseCredentialRequestOptions = {
        scheme: 'openid-credential-offer',
        baseUri: 'openid4vc-issuer.com',
      }

    beforeAll(async () => {
    


        nonceService = new NonceService();

        preAuthorizedCodeFlowConfig = {preAuthorizedCode: '1234567890', userPinRequired: false};

        grants = {
      'urn:ietf:params:oauth:grant-type:pre-authorized_code': preAuthorizedCodeFlowConfig && {
        'pre-authorized_code':
          preAuthorizedCodeFlowConfig.preAuthorizedCode ?? (nonceService.provideNonce()),
        user_pin_required: preAuthorizedCodeFlowConfig.userPinRequired ?? false,
      },

      authorization_code: authorizationCodeFlowConfig && {
        issuer_state: authorizationCodeFlowConfig.issuerState ?? (nonceService.provideNonce()),
      },
    }
    });

    test('Create credential offer', async () => {
        const issuerService = new IssuerService();
        const { uri, session } = await issuerService.createCredentialOfferURI({
            grants: grants,
            credentials: [universityDegreeCredentialSdJwt],
            credentialOfferUri: hostedCredentialOfferUri,
            scheme: baseCredentialRequestOptions.scheme ?? 'https',
            baseUri: baseCredentialRequestOptions.baseUri,
          });
        
        let bla = 1;
    });

    
});