import arcjet, { tokenBucket, detectBot } from "@arcjet/next";

const key = process.env.ARCJET_KEY;
const mode = process.env.NODE_ENV === "production" ? "LIVE" as const : "DRY_RUN" as const;

export const ajScrape = key
  ? arcjet({
      key,
      rules: [
        tokenBucket({
          mode,
          refillRate: 5,
          interval: 60,
          capacity: 5,
        }),
        detectBot({
          mode,
          allow: [],
        }),
      ],
    })
  : null;

export const ajReserve = key
  ? arcjet({
      key,
      rules: [
        tokenBucket({
          mode,
          refillRate: 10,
          interval: 60,
          capacity: 10,
        }),
      ],
    })
  : null;

export const ajAuth = key
  ? arcjet({
      key,
      rules: [
        tokenBucket({
          mode,
          refillRate: 5,
          interval: 60,
          capacity: 10,
        }),
        detectBot({
          mode,
          allow: ["CATEGORY:SEARCH_ENGINE"],
        }),
      ],
    })
  : null;
