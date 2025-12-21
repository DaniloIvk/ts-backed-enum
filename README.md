# TypeScript Backed Enums

**Strictly typed, object-oriented enums for modern TypeScript.**

This library bridges the gap between TypeScript's static enums and runtime objects. It allows you to attach behavior (methods/traits) to your enum cases, effectively treating them as value objects while preserving the ease of use of standard enums.

Inspired by PHP 8.1 Backed Enums.

## Features

- ✅ **Runtime Safe**: `Role.from('invalid')` returns `undefined` instead of throwing or leaking.
- ✅ **Method Composition**: Attach behaviors (Traits) to your enums using a mixin pattern.
- ✅ **Strictly Typed**: Full IDE autocomplete for your custom methods.
- ✅ **Iteratable**: Built-in access to `.cases` and `.values()`.

## Installation

```bash
npm install github:daniloivk/ts-backed-enum

```

_(Requires `@daniloivk/ts-traits` as a peer dependency)_

---

## Usage

### 1. Basic Usage (No Traits)

The simplest way to upgrade a standard TypeScript enum to a Backed Enum.

```typescript
import { createBackedEnum } from '@daniloivk/ts-backed-enum';

// 1. Define your standard Enum
enum StatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

// 2. Wrap it
export const Status = createBackedEnum(StatusEnum);

// --- usage ---

// Access properties
console.log(Status.ACTIVE.value); // "active"
console.log(Status.ACTIVE.name); // "ACTIVE"

// Iteration
Status.cases.forEach((status) => {
  console.log(status.name);
});

// Safe Lookup (returns undefined if not found)
const status = Status.from('active'); // Status.ACTIVE
const invalid = Status.from('unknown'); // undefined
```

### 2. Advanced Usage (With Traits)

You can attach methods to your enums using Traits. This is perfect for shared logic like formatting, comparison, or derived state.

**Step 1: Define your Traits**
Extend `EnumCase` to access `this.name` and `this.value` with full type safety.

```typescript
import { EnumCase } from '@daniloivk/ts-backed-enum';

// Trait for comparison logic
class Comparable extends EnumCase {
  is(other: this) {
    return this.value === other.value;
  }

  isNot(other: this) {
    return !this.is(other);
  }
}

// Trait for formatting
class Labelable extends EnumCase {
  public getLabel(): string {
    // Capitalize the name: "ACTIVE" -> "Active"
    return this.name.charAt(0) + this.name.slice(1).toLowerCase();
  }
}
```

**Step 2: Compose and Create**

```typescript
import { createBackedEnum, createEnumCase } from '@daniloivk/ts-backed-enum';

enum RoleEnum {
  ADMIN = 1,
  EDITOR = 2,
  VIEWER = 3,
}

// 1. Create a composite Case Class with your traits
const RoleCase = createEnumCase(Comparable, Labelable);

// 2. Create the Backed Enum using the specific Case Class
export const Role = createBackedEnum(RoleEnum, RoleCase);
```

**Step 3: Enjoy Type-Safe Methods**

```typescript
const userRole = Role.from(1); // Role.ADMIN

if (userRole && userRole.is(Role.ADMIN)) {
  console.log(`Hello, ${userRole.getLabel()}`); // "Hello, Admin"
}
```

## API Reference

### `createBackedEnum(Enum, [CaseClass])`

Returns a singleton object containing your enum cases and helper methods.

| Property/Method |          Type          | Description                                                                   |
| :-------------: | :--------------------: | :---------------------------------------------------------------------------- |
|     `[Key]`     |      `CaseClass`       | Direct access to cases (e.g., `Role.ADMIN`).                                  |
|    `.cases`     |     `CaseClass[]`      | An array of all enum case instances.                                          |
|   `.values()`   |  `(string\|number)[]`  | Returns an array of all raw primitive values.                                 |
| `.from(value)`  | `CaseClass\|undefined` | Safely finds a case by its primitive value. Returns `undefined` if not found. |

---

## Tips

- **Idempotency**: `Role.from()` handles instances recursively. `Role.from(Role.ADMIN)` returns `Role.ADMIN`. This is useful for function arguments that accept `Role | number`.
- **Object Literals**: You don't have to use `enum`. You can pass `as const` objects:

```typescript
const Colors = createBackedEnum({
  Red: '#FF0000',
  Blue: '#0000FF',
} as const);
```

## Recommended Structure (Laravel Style)

For a clean, maintainable project, we recommend separating your **Traits** from your **Enum Definitions**. This mimics the structure of modern PHP/Laravel enums.

### 1. Define your shared Traits

Create a folder like `src/enums/traits` to store reusable behaviors.

```typescript
// src/enums/traits/Comparable.ts
import { EnumCase } from '@daniloivk/ts-backed-enum';

export default class Comparable extends EnumCase {
  public is(other: this | undefined): boolean {
    return !!other && this.value === other.value;
  }

  public isNot(other: this | undefined): boolean {
    return !this.is(other);
  }
}
```

### 2. Define your Backed Enum

Combine the native enum and traits in a single, clean file.

```typescript
// src/enums/Environment.ts
import { createBackedEnum, createEnumCase } from '@daniloivk/ts-backed-enum';
import Comparable from './traits/Comparable';

// 1. The Native Definition
enum EnvironmentEnum {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

// 2. The Case Composition (Mixin)
const CaseClass = createEnumCase(Comparable);

// 3. The Backed Enum Factory
const Environment = createBackedEnum(EnvironmentEnum, CaseClass);

// 4. Exports
export type Environment = InstanceType<typeof CaseClass>;
export default Environment;
```

### 3. Usage

Now you can use it throughout your application with strict typing.

```typescript
import Environment from './enums/Environment';

function boot(env: Environment) {
  if (env.is(Environment.PRODUCTION)) {
    console.log('🚀 Production Mode');
  }
}

// Works with values from .env
const currentEnv = Environment.from(process.env.NODE_ENV) || Environment.LOCAL;

boot(currentEnv);
```
