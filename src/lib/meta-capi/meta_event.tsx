"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import * as z from "zod/mini";
import { browser_event_schema, type browser_meta_event } from "./event_schema";
import { track_declared_meta_event } from "./track_meta_event";

const fire_key_schema = z.object({
  url: z.string(),
  declaration: browser_event_schema,
});

const sorted_keys = (_key: string, value: unknown) =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
      )
    : value;

const fire_key_of = (url: string, declaration: browser_meta_event) =>
  JSON.stringify({ url, declaration }, sorted_keys);

const declared_in = (fire_key: string) =>
  fire_key_schema.parse(JSON.parse(fire_key)).declaration;

const MetaEventLeaf = (declaration: browser_meta_event) => {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const fire_key = fire_key_of(`${pathname}?${search}`, declaration);
  useEffect(() => {
    let current = true;
    queueMicrotask(() => {
      if (current) void track_declared_meta_event(declared_in(fire_key));
    });
    return () => {
      current = false;
    };
  }, [fire_key]);
  return null;
};

export const MetaEvent = (declaration: browser_meta_event) => (
  <Suspense fallback={null}>
    <MetaEventLeaf {...declaration} />
  </Suspense>
);
