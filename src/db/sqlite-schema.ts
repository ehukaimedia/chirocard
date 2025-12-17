export const SQL_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    data TEXT  -- JSON blob for complex objects
);

CREATE TABLE IF NOT EXISTS practitioners (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,
    clinicName TEXT,
    data TEXT, -- JSON blob for other fields
    "order" INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    date INTEGER,
    practitionerId TEXT,
    data TEXT -- Huge JSON blob for heavy session data
);

CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    date INTEGER,
    practitionerId TEXT,
    status TEXT,
    data TEXT
);

CREATE TABLE IF NOT EXISTS routines (
    id TEXT PRIMARY KEY,
    status TEXT,
    isCompletedToday BOOLEAN,
    data TEXT
);

CREATE TABLE IF NOT EXISTS routine_completions (
    id TEXT PRIMARY KEY,
    routineId TEXT,
    date TEXT,
    completedAt INTEGER,
    data TEXT
);

CREATE TABLE IF NOT EXISTS journal (
    id TEXT PRIMARY KEY,
    date INTEGER,
    data TEXT
);
`;
