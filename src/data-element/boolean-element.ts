import { CborDataItem2 } from "./cbor-data-item2";

export class BooleanElement extends CborDataItem2<boolean> {

    constructor(value: boolean) {
        super(value, new CborDataItem2.Attribute(CborDataItem2.Type.boolean));
    }
    
}