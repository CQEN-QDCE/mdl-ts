import { ByteStringElement } from "../data-element/byte-string-element";
import { DataElement } from "../data-element/data-element";
import { NullElement } from "../data-element/null-element";
import { COSEObject } from "./cose-object";
import { CoseHeaders } from "./cose-headers";
import { ListElement } from "../data-element/list-element";

export class COSESign1 extends COSEObject<COSESign1> {
   
    private readonly context = 'Signature1';

    public readonly protectedHeaders = new CoseHeaders();

    private readonly unprotectedHeaders = new CoseHeaders();

    constructor() {
        super();
    }

    detachPayload(): COSESign1 {
        return COSESign1.fromDataElement(new ListElement(this.replacePayload(new NullElement())));
    }

    attachPayload(payload: ArrayBuffer): COSESign1 {
        return COSESign1.fromDataElement(new ListElement(this.replacePayload(new ByteStringElement(payload))));
    }

    public static fromDataElement(dataElement: ListElement): COSESign1 {
        const coseMac0 = new COSESign1();
        coseMac0.dataElements = dataElement.value;
        return coseMac0;
    }

}