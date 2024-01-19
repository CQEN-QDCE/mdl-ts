import { ByteStringElement } from "../data-element/byte-string-element";
import { DataElement } from "../data-element/data-element";
import { NullElement } from "../data-element/null-element";
import { COSEObject } from "./cose-object";
import { CoseHeaders } from "./cose-headers";

export class COSESign1 extends COSEObject<COSESign1> {
   
    private readonly context = 'Signature1';

    public readonly protectedHeaders = new CoseHeaders();

    private readonly unprotectedHeaders = new CoseHeaders();

    constructor(dataElements: DataElement[]) {
        super(dataElements);
    }

    detachPayload(): COSESign1 {
        return new COSESign1(this.replacePayload(new NullElement()));
    }

    attachPayload(payload: ArrayBuffer): COSESign1 {
        return new COSESign1(this.replacePayload(new ByteStringElement(payload)));
    }

}