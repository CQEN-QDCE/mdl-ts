import { CborDataItem2 } from "./cbor-data-item2";

export class StringElement extends CborDataItem2<string> {

    constructor(value: string) {
        super(value, new CborDataItem2.Attribute(CborDataItem2.Type.textString));
    }
    
}