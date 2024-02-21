import { CborDataItem2 } from "./cbor-data-item2";

export class NullElement extends CborDataItem2<null> {

    constructor() {
        super(null, new CborDataItem2.Attribute(CborDataItem2.Type.nil));
    }
    
}