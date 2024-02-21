import { CborDataItem2 } from "./cbor-data-item2";

export class ListElement extends CborDataItem2<CborDataItem2[]> {
    
    constructor(value: CborDataItem2[] = []) {
        super(value, new CborDataItem2.Attribute(CborDataItem2.Type.list));
    }

}