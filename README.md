# TypeScript Backed Enums

A strictly typed, runtime-safe alternative to TypeScript enums.

This package lets you define enums whose values are backed by real objects,
while preserving:

- Strong typing
- IDE autocomplete
- Runtime introspection
- Extensibility via traits

Built on top of `@daniloivk/ts-traits`.

---

## Installation

```bash
npm install github:daniloivk/ts-backed-enum
```

## Example usage

### Basic usage

```typescript
import { createBackedEnum } from '@daniloivk/ts-backed-enum';

export const Role = createBackedEnum({
  Admin: 1,
  User: 2,
  Guest: 3,
} as const);

// Access cases
Role.Admin.value; // 1
Role.User.name; // "User"

// Iterate
Role.cases.forEach((role) => {
  console.log(role.name, role.value);
});

// Reverse lookup
Role.from(1); // Role.Admin
Role.from(999); // undefined

// Get raw values
Role.values(); // [1, 2, 3]

// Get all cases
Role.cases; // [Role.Admin, Role.User, Role.Guest]
```

### Using traits

```typescript
import { createBackedEnum, createEnumCase } from '@daniloivk/ts-backed-enum';

// Best to extend EnumCase class from `@daniloivk/ts-backed-enum`
// to get native `value` property
// class Comparable extends EnumCase {
class Comparable {
  is(other: this) {
    return this.value === other.value;
  }
}

// Best to extend EnumCase class from `@daniloivk/ts-backed-enum`
// to get native `name` property
// class Stringable extends EnumCase {
class Stringable {
  toString() {
    return this.name;
  }
}

// `createEnumCase` already includes EnumCase as base class
const RoleCase = createEnumCase(Comparable, Stringable);

export const Role = createBackedEnum(
  {
    Admin: 1,
    User: 2,
  } as const,
  RoleCase
);

Role.Admin.is(Role.User); // false
String(Role.Admin); // 'Admin'
```
