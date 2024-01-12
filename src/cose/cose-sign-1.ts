import { ByteStringElement } from "../data-element/byte-string-element";
import { DataElement } from "../data-element/data-element";
import { NullElement } from "../data-element/null-element";
import { COSEBase } from "./cose-base";

export class COSESign1 extends COSEBase<COSESign1> {
   
    constructor(dataElements: DataElement[]) {
        super(dataElements);
    }

    detachPayload(): COSESign1 {
        return new COSESign1(this.replacePayload(new NullElement()));
    }

    attachPayload(payload: ArrayBuffer): COSESign1 {
        return new COSESign1(this.replacePayload(new ByteStringElement(payload)));
    }

    get data(): DataElement[] {
        return this.dataElements;
    }

}