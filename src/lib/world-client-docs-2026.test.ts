import test from "node:test";
import assert from "node:assert/strict";
import { CLIENT_DOCS, buildClientDocRequest } from "./world-client-docs-2026.ts";

test("six countries, each with jobs and a local request text", () => {
  assert.deepEqual(Object.keys(CLIENT_DOCS), ["jp", "us", "uk", "de", "fr", "es"]);
  const de = buildClientDocRequest({ country: "de", job: "employee", client: "Frau Müller", office: "Kanzlei X", due: "2027-03-31" });
  assert.ok(de.first.startsWith("Guten Tag Frau Müller,"));
  assert.ok(de.first.includes("- Lohnsteuerbescheinigung"));
  assert.ok(de.first.includes("bis 2027-03-31"));
  assert.equal(buildClientDocRequest({ country: "de", job: "employee" }).first.split("\n")[0], "Guten Tag,");
});

test("reminder lists only missing items", () => {
  const all = buildClientDocRequest({ country: "jp", job: "salary" }).docs;
  const r = buildClientDocRequest({ country: "jp", job: "salary", received: all.slice(1) });
  assert.deepEqual(r.missing, [all[0]]);
  assert.ok(r.reminder.includes("1点"));
  assert.equal(buildClientDocRequest({ country: "us", job: "wage", received: all.length ? buildClientDocRequest({ country: "us", job: "wage" }).docs : [] }).reminder, "We have everything we need.");
});
