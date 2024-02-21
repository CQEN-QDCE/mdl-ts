import { CborDataItem, CborNil, CborNumber } from "../../../src/cbor/cbor-types";

describe('testing CborXCodec', () => {
    test('Serialization', async () => {

        const cborNumber = new CborNumber(-5);
        const instanceOf = cborNumber instanceof CborDataItem;
        //let test: CborNumber = 5;
        //let test = 5 as CborNumber;
        let test2:CborNil = undefined ;

        //let test4 = new Number(6);
        //let number: number = test4.valueOf();
        //let test3 = new CborNumber2(6);
        //let number267: CborNumber3 = 5;

        //let cborMap = new CborMap();
        //cborMap.set('test', test);
        //cborMap.set('test2', test2);

        //let gh = CborNil2;

        //let t = typeof test2;
        //if (number267 instanceof CborNumber3) {


        
        let bla = 1;
    });
});