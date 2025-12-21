import withTraits from '@daniloivk/ts-traits';

type Constructor<T = {}> = new (...args: any[]) => T;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I
) => void
  ? I
  : never;

type InstanceIntersection<T extends readonly Constructor[]> =
  UnionToIntersection<InstanceType<T[number]>>;

type EnumLike = Readonly<Record<string, string | number>>;

type EnumValue<E extends EnumLike> = E[keyof E];
type EnumKey<E extends EnumLike> = Exclude<keyof E, number>;

export class EnumCase<
  K extends string = string,
  V extends string | number = string | number
> {
  constructor(public readonly name: K, public readonly value: V) {}

  toString(): string {
    return String(this.value);
  }
}

export function createEnumCase<T extends readonly Constructor[]>(...traits: T) {
  return withTraits(EnumCase, ...traits) as unknown as {
    new <K extends string, V extends string | number>(
      name: K,
      value: V
    ): EnumCase<K, V> & InstanceIntersection<T>;
  };
}

export type EnumContract<E extends EnumLike, C> = {
  readonly [K in EnumKey<E>]: C;
};

export type EnumHelpers<E extends EnumLike, C> = {
  readonly cases: readonly C[];
  from(value: unknown): C | undefined;
  values(): readonly EnumValue<E>[];
};

// With custom case class
export function createBackedEnum<
  E extends EnumLike,
  C extends EnumCase<EnumKey<E> & string, EnumValue<E>>
>(
  baseEnum: E,
  CaseClass: new (name: EnumKey<E>, value: EnumValue<E>) => C
): EnumContract<E, C> & EnumHelpers<E, C>;

// Default case
export function createBackedEnum<E extends EnumLike>(
  baseEnum: E
): EnumContract<E, EnumCase<EnumKey<E> & string, EnumValue<E>>> &
  EnumHelpers<E, EnumCase<EnumKey<E> & string, EnumValue<E>>>;

export function createBackedEnum(
  baseEnum: EnumLike,
  CaseClass: Constructor<EnumCase> = EnumCase
) {
  const keys = Object.keys(baseEnum).filter((key) => isNaN(Number(key)));

  class BackedEnum {
    readonly cases = [] as InstanceType<typeof CaseClass>[];
    private readonly map = new Map<
      EnumValue<typeof baseEnum>,
      InstanceType<typeof CaseClass>
    >();

    constructor() {
      for (const key of keys) {
        const value = baseEnum[key];
        const instance = new CaseClass(key, value);

        this.cases.push(instance);
        this.map.set(value, instance);

        Object.defineProperty(this, key, {
          value: instance,
          enumerable: true,
        });
      }
    }

    from(value: unknown): InstanceType<typeof CaseClass> | undefined {
      const valueType = typeof value;

      if (value instanceof CaseClass) {
        return this.from(value.value);
      }

      if (valueType !== 'string' && valueType !== 'number') {
        return undefined;
      }

      return this.map.get(value as string | number);
    }

    values() {
      return this.cases.map((_case) => _case.value);
    }
  }

  return new BackedEnum() as any;
}
