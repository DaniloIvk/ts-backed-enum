type Constructor<T = {}> = new (...args: any[]) => T;
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
type InstanceIntersection<T extends readonly Constructor[]> = UnionToIntersection<InstanceType<T[number]>>;
type EnumLike = Readonly<Record<string, string | number>>;
type EnumValue<E extends EnumLike> = E[keyof E];
type EnumKey<E extends EnumLike> = Exclude<keyof E, number>;
export declare class EnumCase<K extends string = string, V extends string | number = string | number> {
    readonly name: K;
    readonly value: V;
    constructor(name: K, value: V);
    toString(): string;
}
export declare function createEnumCase<T extends readonly Constructor[]>(...traits: T): {
    new <K extends string, V extends string | number>(name: K, value: V): EnumCase<K, V> & InstanceIntersection<T>;
};
export type EnumContract<E extends EnumLike, C> = {
    readonly [K in EnumKey<E>]: C;
};
export type EnumHelpers<E extends EnumLike, C> = {
    readonly cases: readonly C[];
    from(value: unknown): C | undefined;
    values(): readonly EnumValue<E>[];
};
export declare function createBackedEnum<E extends EnumLike, C extends EnumCase<EnumKey<E> & string, EnumValue<E>>>(baseEnum: E, CaseClass: new (name: EnumKey<E>, value: EnumValue<E>) => C): EnumContract<E, C> & EnumHelpers<E, C>;
export declare function createBackedEnum<E extends EnumLike>(baseEnum: E): EnumContract<E, EnumCase<EnumKey<E> & string, EnumValue<E>>> & EnumHelpers<E, EnumCase<EnumKey<E> & string, EnumValue<E>>>;
export {};
//# sourceMappingURL=index.d.ts.map