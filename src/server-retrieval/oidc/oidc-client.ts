export class OidcClient {

    private openIdConfiguration: any = null

    constructor(private readonly baseUrl: string,
                private readonly transportLayer: TransportLayer) {

    }

    get configuration(): string {
        const response = this.transportLayer.doGet(`${this.baseUrl}/.well-known/jwks.json`);
        this.openIdConfiguration = JSON.parse(response);
        return JSON.stringify(this.openIdConfiguration);
    }

    public clientRegistration(registrationRequest: string): string {
        return this.transportLayer.doPost(getUrl('registration_endpoint'), registrationRequest);
    }

    public authorization(authorizationRequest: Map<string, string>): string {
//        return this.transportLayer.doGet(
//            "${getUrl("authorization_endpoint")}?${
//                ServerRetrievalUtil.mapToUrlQuery(
//                    authorizationRequest
//                )
//            }"
//        )
        throw new Error('Not implemented');
    }
}