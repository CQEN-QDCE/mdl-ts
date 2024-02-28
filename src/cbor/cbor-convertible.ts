import { CborDataItem } from "../data-element/cbor-data-item";

export interface CborConvertible {

  fromCborDataItem(dataItem: CborDataItem): object;

  toCborDataItem(): CborDataItem;
  
}