CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "handle" TEXT NOT NULL,
  "pinHash" TEXT NOT NULL
);
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

CREATE TABLE "Season" (
  "number" INTEGER NOT NULL PRIMARY KEY,
  "start" TEXT NOT NULL,
  "end" TEXT NOT NULL
);
CREATE UNIQUE INDEX "Season_start_key" ON "Season"("start");

CREATE TABLE "RunRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "seasonNumber" INTEGER NOT NULL,
  "day" TEXT NOT NULL,
  "metres" INTEGER NOT NULL,
  "distanceBucket" INTEGER NOT NULL,
  "seconds" INTEGER NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("seasonNumber") REFERENCES "Season" ("number") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "RunRecord_userId_day_distanceBucket_key" ON "RunRecord" ("userId", "day", "distanceBucket");
CREATE INDEX "RunRecord_seasonNumber_day_idx" ON "RunRecord" ("seasonNumber", "day");

CREATE TABLE "Session" (
  "digest" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "admin" BOOLEAN NOT NULL DEFAULT false,
  "expires" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
