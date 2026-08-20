// node test/binary-forensics.test.mjs — loads the production BinaryForensics
// class (constants + class sliced from the content script, no DOM code
// executed) and verifies its verdicts on synthesized containers.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.join(here, "..", "src", "content-agent-orange.js"), "utf8");
const classStart = source.indexOf("class BinaryForensics");
const classEnd = source.indexOf("\nclass ", classStart + 1);
assert.ok(classStart > 0 && classEnd > classStart, "BinaryForensics class located");
const constantsEnd = source.indexOf("\nclass ");
const snippet = source.slice(0, constantsEnd) + "\n" + source.slice(classStart, classEnd)
  + "\nglobalThis.__BF = BinaryForensics;";
const fakeWindow = { top: undefined, location: { href: "https://test.local/" }, addEventListener() {} };
fakeWindow.top = fakeWindow;
const ctx = { console, TextDecoder, window: fakeWindow, document: { addEventListener() {} }, navigator: { userAgent: "test" }, chrome: { runtime: { sendMessage() {}, onMessage: { addListener() {} } }, storage: { sync: { get(_k, cb) { cb({}); } }, local: { get(_k, cb) { cb({}); } } } } };
vm.createContext(ctx);
vm.runInContext(snippet, ctx);
const bf = new ctx.__BF();

function pngChunk(type, body) {
  const len = [(body.length >>> 24) & 255, (body.length >>> 16) & 255, (body.length >>> 8) & 255, body.length & 255];
  return [...len, ...[...type].map(c => c.charCodeAt(0)), ...body, 0, 0, 0, 0];
}
const T = s => [...s].map(c => c.charCodeAt(0));
const jpegWith = segs => new Uint8Array([0xFF, 0xD8, ...segs.flat(), 0xFF, 0xD9]);
const app1 = body => [0xFF, 0xE1, (body.length + 2) >> 8, (body.length + 2) & 255, ...body];

// 1. PNG with Stable Diffusion parameters chunk flags high.
{
  const png = new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    ...pngChunk("IHDR", new Array(13).fill(0)),
    ...pngChunk("tEXt", [...T("parameters"), 0, ...T("Steps: 20, Sampler: Euler, CFG scale: 7")]),
    ...pngChunk("IEND", [])
  ]);
  const r = await bf.analyze(png.buffer);
  assert.ok(r.confidence >= 0.8, `SD parameters chunk must score high (got ${r.confidence})`);
}

// 2. Camera EXIF is human provenance: reduces confidence, sets flag.
{
  const jpeg = jpegWith([app1(T("Exif\0\0II*\0 Canon EOS R5 f/2.8"))]);
  const r = await bf.analyze(jpeg.buffer);
  assert.strictEqual(r.forensics.hasCameraExif, true, "camera EXIF flag set");
  assert.ok(r.indicators.some(i => i.indicator.includes("human provenance")), "human-provenance indicator present");
}

// 3. C2PA presence alone is provenance, not an AI verdict.
{
  const jpeg = jpegWith([app1(T("http://ns.adobe.com/xap/1.0/\0<xpacket XMP c2pa contentcredentials/>"))]);
  const r = await bf.analyze(jpeg.buffer);
  assert.strictEqual(r.forensics.hasC2PA, true);
  assert.strictEqual(r.forensics.c2paAIAsserted, false, "signed != AI");
}

// 4. trainedAlgorithmicMedia inside credentials IS an AI verdict.
{
  const jpeg = jpegWith([app1(T("http://ns.adobe.com/xap/1.0/\0<xpacket XMP c2pa digitalsourcetype trainedAlgorithmicMedia/>"))]);
  const r = await bf.analyze(jpeg.buffer);
  assert.strictEqual(r.forensics.c2paAIAsserted, true);
  assert.ok(r.confidence >= 0.85);
}

console.log("binary-forensics: all tests passed");
