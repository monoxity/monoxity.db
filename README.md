# MonoxityDB

> A simple SQLite database wrapper designed for beginners - developed and maintained with ♥ by Host#1291

## Installation

```bash
npm i monoxity.db
```

## Dependancies

MonoxityDB has dependancies to ensure it is usable, you need to install the dependancies for the wrapper to work

```bash
npm i sqlite sqlite3
```

## Usage

```typescript
import { MonoxityDB } from "monoxity/monoxity.db";

const database = new MonoxityDB({
  table: "monoxity",
  fileName: "monoxity",
});

await database.connect(); // This is mandatory or else you will face errors

// Set value (insert / update) - returns data on success
const data = await database.set("key", "value");

// Return an array of objects containing the keys and values from the database
const data = await database.getAll();
const data = await database.getAll("key");

// Return an array of the first X number of objects containing the keys and values from the database
const data = await database.getFirst(10, "key");

// Return the value of a key from the database or return an optional default value
const data = await database.get("key", "defaultValue");

// Delete a key from the database
const success = await database.delete("key");

// Delete ALL keys from your database
const success = await database.destroy();

// Return a number of keys in the database
const rows = await database.rowCount();
```
