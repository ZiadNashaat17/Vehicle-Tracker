import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { pino } from "pino";
import pretty from "pino-pretty";

const __dirname = import.meta.dirname;
config({ path: path.join(__dirname, "../../", ".env") });

const streams = [
  process.env.NODE_ENV === "production" ? process.stdout : pretty(),
  fs.createWriteStream(path.join(process.cwd(), "..", "process.log")),
];

const LOGGER = pino(
  {
    redact: {
      paths: ["body.password"],
      remove: true,
    },
    formatters: {
      bindings: () => ({}),
    },
  },
  pino.multistream(streams)
);

export { LOGGER };
