interface IObject {
    id: number;
    test(): void;
  }
  interface IObjectClass<T> {
    new(): T;
    table_name: string;
    test(): void;
  }
  function createObject<T extends IObject>(cls: IObjectClass<T>, data:Partial<T>):T {
    let obj:T = (<any>Object).assign({},
      data,
      {
        id: 1,
        table_name: cls.table_name,
      }
    )
    return obj;
  }

  interface IConstructor<T> {
    new (...args: any[]): T;

    // Or enforce default constructor
    // new (): T;
}

interface IActivatable {
    id: number;
    name: string;
}

export class ClassA implements IActivatable {
  constructor(value: number) {
      this.id = value;
  }
    public id: number;
    public name: string;
    public address: string;
}

class ClassB implements IActivatable {
    public id: number;
    public name: string;
    public age: number;
}

export function activator<T extends IActivatable>(type: IConstructor<T>): T {
    return new type();
}

const classA = activator(ClassA);

let instance = 1;
  
  //------------------------
  // Implementation
  //------------------------
  export class User implements IObject {
    test(): void {
        throw new Error("Method not implemented.");
    }
    static table_name: string = 'user';
    id: number;
    name: string;
    //static test(): void {}
  }

  //------------------------
// Application
//------------------------
//let user = createObject(User, {name: 'Jimmy'});
//console.log(user.name);


export function getInstance<T extends Object>(type: (new (...args: any[]) => T), ...args: any[]): T {
    return new type(...args);
}

export class Foo {
    private constructor() {
    }
    bar() {
      console.log("Hello World")
    }
  }


  export interface SerializableStatic {
    new (...args: any[]): any
    fromObject(data: Record<string, unknown>): InstanceType<this>
  }
  
  export interface Serializable {
    id: string
    toJSON(): string
  }

  class Person implements Serializable {
      id: string;
      toJSON(): string {
          throw new Error("Method not implemented.");
      }
    // ...
  }

  class Dese {
//    createObject<T extends IObject>(cls: IObjectClass<T>, data:Partial<T>):T {
 //   }
    //createObject2<S extends SerializableStatic, I extends Serializable = InstanceType<S>>(cls: IObjectClass<T>, data:Partial<T>):T {
    //}
  }

  class Database<S extends SerializableStatic, I extends Serializable = InstanceType<S>> {
    #dbPath: string
    #data: Map<string, I> = new Map()
    #entity: S
  
    constructor(entity: S) {
      //this.#dbPath = resolve(dirname(import.meta.url), `.data/${entity.name.toLowerCase()}.json`)
      this.#entity = entity
      this.#initialize()
    }
  
    #initialize() {
      //if (existsSync(this.#dbPath)) {
        const data: [string, Record<string, unknown>][] = null
        for (const [key, value] of data) {
          this.#data.set(key, this.#entity.fromObject(value))
        }
        return
//}
      //this.#updateFile()
    }
  }

  //const db = new Database(Person)

interface CborSerializableInstance {
    toCbor();
}

interface CborSerializable {
    new():CborSerializableInstance;
    fromCbor();
}

/* class decorator */
function staticImplements<T extends CborSerializable>() {
  return <U extends T>(constructor: U) => {constructor};
}

//@staticImplements<CborSerializable>()   /* this statement implements both normal interface & static interface */
//class MyTypeClass extends CborSerializable {
//  public static fromCbor() {}
//  toCbor() {}
//}

class Db2<T extends CborSerializable> {
  constructor(private type: T) {}
  public create() {
      return new this.type();
  }

}

//let test = new Db2(MyTypeClass);

type Test = number;
type Test2 = Test & CborSerializableInstance;

//let f: Test2 = 1;
//f.