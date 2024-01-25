import { AuthenticationRequestParameters } from "../oidc/authentication-request-parameters";
import { Iso, IssuedCredential, Issuer, VcJwt, VcSdJwt } from "../oidc/issuer";
import { OpenIdConstants } from "../oidc/openid-constants";
import { VcDataModelConstants } from "../oidc/vc-data-model-constants";
import { CredentialRepresentation } from "../oidc/vc/credential-representation.enum";
import { CredentialScheme, MobileDrivingLicence2023 } from "../oidc/vc/credential-scheme";
import { CodeService } from "./code-service";
import { CredentialFormatEnum } from "./credential-format.enum";
import { CredentialRequestParameters } from "./credential-request-parameters";
import { CredentialResponseParameters } from "./credential-response-parameters";
import { IssuerMetadata } from "./issuer-metadata";
import { RequestedCredentialClaimSpecification } from "./mdl/requested-credential-claim-specification";
import { NonceService } from "./nonce-service";
import { ProofType } from "./proof-type.enum";
import { SupportedCredentialFormat } from "./supported-credential-format";
import { TokenRequestParameters } from "./token-request-parameters";
import { TokenResponseParameters } from "./token-response-parameters";
import { TokenService } from "./token-service";

export interface IssuerServiceOptions {
    issuer: Issuer;
    credentialSchemes: CredentialScheme[];
    codeService: CodeService;
    tokenService: TokenService;
    clientNonceService: NonceService;
    authorizationServer: string;
    publicContext: string;
    authorizationEndpointPath: string;
    tokenEndpointPath: string;
    credentialEndpointPath: string;
    display: any[];
}

export class IssuerService {

    public readonly metadata: IssuerMetadata;

    private readonly issuer: Issuer;
    private readonly credentialSchemes: CredentialScheme[];
    private readonly codeService: CodeService = new CodeService();
    private readonly tokenService: TokenService = new TokenService();
    private readonly clientNonceService: NonceService = new NonceService();
    private readonly authorizationServer: string | null = null;
    private readonly publicContext: string = "https://wallet.a-sit.at";
    private readonly authorizationEndpointPath: string = '/authorize';
    private readonly tokenEndpointPath: string = '/token';
    private readonly credentialEndpointPath: string = '/credential';
    public readonly display: any[] = [];

    constructor(initializer?: Partial<IssuerServiceOptions>) {
        Object.assign(this, initializer);
        this.metadata = new IssuerMetadata(
            {
                issuer: this.publicContext, 
                credentialIssuer: this.publicContext,
                authorizationServer: this.authorizationServer,
                authorizationEndpointUrl: `${this.publicContext}${this.authorizationEndpointPath}`,
                tokenEndpointUrl: `${this.publicContext}${this.tokenEndpointPath}`,
                credentialEndpointUrl: `${this.publicContext}${this.credentialEndpointPath}`,
                supportedCredentialFormat: this.toSupportedCredentialFormat(this.credentialSchemes)
            }
        );
    }

    private toSupportedCredentialFormat(credentialSchemes: CredentialScheme[]): SupportedCredentialFormat[] {
        let supportedCredentialFormats: SupportedCredentialFormat[] = [];
        for (let credentialScheme of credentialSchemes) {
            supportedCredentialFormats.push(new SupportedCredentialFormat(
                {
                    format: CredentialFormatEnum.MSO_MDOC,
                    id: credentialScheme.vcType,
                    types: [credentialScheme.vcType],
                    docType: credentialScheme.isoDocType,
                    claims: this.buildIsoClaims(credentialScheme),
                    supportedBindingMethods: [OpenIdConstants.BINDING_METHOD_COSE_KEY],
                    supportedCryptographicSuites: ['ES256']
                }
            ));
            supportedCredentialFormats.push(new SupportedCredentialFormat(
                {
                    format: CredentialFormatEnum.JWT_VC,
                    id: credentialScheme.vcType,
                    types: [VcDataModelConstants.VERIFIABLE_CREDENTIAL, credentialScheme.vcType],
                    supportedBindingMethods: [OpenIdConstants.PREFIX_DID_KEY, OpenIdConstants.URN_TYPE_JWK_THUMBPRINT],
                    supportedCryptographicSuites: ['ES256']
                }
            ));
            supportedCredentialFormats.push(new SupportedCredentialFormat(
                {
                    format: CredentialFormatEnum.JWT_VC_SD,
                    id: credentialScheme.vcType,
                    types: [VcDataModelConstants.VERIFIABLE_CREDENTIAL, credentialScheme.vcType],
                    supportedBindingMethods: [OpenIdConstants.PREFIX_DID_KEY, OpenIdConstants.URN_TYPE_JWK_THUMBPRINT],
                    supportedCryptographicSuites: ['ES256']
                }
            ));
        }
        return supportedCredentialFormats;
    }

    private buildIsoClaims(credentialScheme: CredentialScheme): Map<string, Map<string, RequestedCredentialClaimSpecification>> {
        let result = new Map<string, Map<string, RequestedCredentialClaimSpecification>>();
        let mdl = new MobileDrivingLicence2023();
        let claims = new Map<string, RequestedCredentialClaimSpecification>();
        for (let claimName of mdl.claimNames) {
            claims.set(claimName, new RequestedCredentialClaimSpecification());
        }
        result.set(credentialScheme.isoNamespace, claims);
        return result;
    }

    /**
     * Send this result as HTTP Header `Location` in a 302 response to the client.
     * @return URL build from client's `redirect_uri` with a `code` query parameter containing a fresh authorization
     * code from [codeService].
     */
    public authorize(params: AuthenticationRequestParameters): string {
        if (!params.redirectUrl) return null;
        const redirectUrl = new URL(params.redirectUrl);
        redirectUrl.searchParams.append(OpenIdConstants.GRANT_TYPE_CODE, this.codeService.provideCode());
        console.log(redirectUrl.href);
        return redirectUrl.href;
    }

    public token(params: TokenRequestParameters): TokenResponseParameters {
        if (!this.codeService.verifyCode(params.code)) throw 'OAuth2Exception: invalid code';
        return new TokenResponseParameters(
            {
                accessToken: this.tokenService.provideToken(),
                tokenType: OpenIdConstants.TOKEN_TYPE_BEARER,
                expires: 3600,
                clientNonce: this.clientNonceService.provideNonce()
            }
        );
    }

    public credential(authorizationHeader: string, params: CredentialRequestParameters): CredentialResponseParameters {
        
        if (!this.tokenService.verifyToken(authorizationHeader.replace(OpenIdConstants.TOKEN_PREFIX_BEARER, ''))) throw 'OAuth2Exception: invalid token';
        
        const proof = params.proof;
        
        if (!proof) throw 'OAuth2Exception: invalid request';

        if (proof.proofType === ProofType.JWT) {

        }

        if (proof.proofType === ProofType.CWT) {
            
        }

//        const issuedCredentialResult = this.issuer.issueCredential(subjectPublicKey,
//            params.types,
//            this.convertCredentialFormatToRepresentation(params.format),
//            this.convertClaims(params.claims)
//        );
//        if (issuedCredentialResult.successful.length === 0) throw 'OAuth2Exception: invalid request';
//        return this.toCredentialResponseParameters(issuedCredentialResult.successful[0]);
        throw new Error('Not implemented');
    }

    private convertCredentialFormatToRepresentation(format: CredentialFormatEnum): CredentialRepresentation {
        switch (format) {
            case CredentialFormatEnum.JWT_VC_SD:
                return CredentialRepresentation.SD_JWT;
            case CredentialFormatEnum.MSO_MDOC:
                return CredentialRepresentation.ISO_MDOC;
            default:
                return CredentialRepresentation.PLAIN_JWT;
        }
    }

    private convertClaims(claims: Map<string, Map<string, RequestedCredentialClaimSpecification>>): string[] {
        let flattenedClaims: string[] = [];
        for (let [key, value] of claims) {
            for (let [key, value2] of value) {
                flattenedClaims.push(key);
            }
        }
        return flattenedClaims;
    }

    private toCredentialResponseParameters(issuedCredential: IssuedCredential): CredentialResponseParameters {
        if (issuedCredential instanceof VcJwt) {

        }
        if (issuedCredential instanceof VcSdJwt) {

        }
        if (issuedCredential instanceof Iso) {
            return new CredentialResponseParameters(
                {
                    format: CredentialFormatEnum.MSO_MDOC,
                    //credential: issuedCredential. // TODO: implement
                }
            );
        }
        throw new Error('Invalid credential type.');
    }

}