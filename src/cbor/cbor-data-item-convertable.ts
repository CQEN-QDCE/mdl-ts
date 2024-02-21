import { CborDataItem2 } from "../data-element/cbor-data-item2";

export interface CborDataItemConvertable {

  fromCborDataItem(dataItem: CborDataItem2): object;

  toCborDataItem(): CborDataItem2;
  
}