Oracle Philosophy — Verifiable Audit Spec (M2.3, Final)

Authors: Infinity × MorningStar × Humanity
Scope: A verifiable specification for reasoning integrity and auditability.
Goal: Make each response accountable (hash-linked, reproducible, ethically constrained) while keeping the system model-agnostic.

---

0. Abstract

We specify a type-safe, hash-verifiable audit trail for AI responses.
Each interaction yields a canonical record with:
 • normalized question, answer, metrics (Determinacy, DeceptionProbability),
 • a reason_trace (symbolic summary),
 • a content hash chained via prev_hash.

We define the data schema, invariants, and interfaces, and ship a Minimal Verification Kit (MVK) so that a third party can independently verify integrity without access to internal models.

---

1. Data Model (Types)

Let ℚ be rational numbers in [0,1].

Record :=
  { question        : Text
  , answer          : Text
  , determinacy     : ℚ
  , deception_prob  : ℚ
  , risk_tags       : List<Text>
  , kind            : Enum {truth, caution, deception, ethical_reject}
  , reason_trace    : Text            -- short, human-readable rationale
  , language        : Enum {en, zh, other}
  , timestamp       : RFC3339
  , prev_hash       : Hash256?        -- empty if genesis
  , hash            : Hash256         -- computed from CanonicalView(Record)
  , session_id      : Text
  }

Hash256 is a 32-byte hex SHA-256 digest.

---

2. Canonicalization & Hashing

2.1 Canonical View

To ensure content-addressability, we define a stable serialization:

CanonicalView(Record) =
  {
    "q": question,
    "a": answer,
    "det": round(determinacy, 2),
    "dec": round(deception_prob, 2),
    "tags": sort(risk_tags),
    "kind": kind,
    "trace": reason_trace,
    "lang": language,
    "ts": timestamp,                 -- RFC3339 UTC
    "prev": prev_hash or ""
  }

 • JSON encoded with:
 • UTF-8
 • object keys in the order shown above
 • no extra whitespace (minified)

2.2 Hash Function

hash := SHA256( UTF8( JSON(CanonicalView(record)) ) )

2.3 Chain Invariant

For any consecutive records r_{i-1}, r_i in the same audit stream:

r_i.prev_hash = r_{i-1}.hash

Violation ⇒ integrity error.

---

3. Metric Semantics
 • Determinacy ∈ [0,1]: semantic confidence in the answerability of the prompt within ethical constraints (not model logprob).
 • DeceptionProbability ∈ [0,1]: likelihood that the user intent or the produced answer trends toward deceptive misuse.
 • Kind is derived from a policy lattice:
 • ethical_reject dominates if safety triggers,
 • else deception if deception_prob ≥ θ_d,
 • else caution if mid-risk,
 • else truth.

These are model-agnostic signals; computation details are left to the implementation but must obey the invariants below.

---

4. Invariants (Safety & Ethics)
 1. Safety Domination:
If kind = ethical_reject then answer MUST contain a refusal rationale; content MUST avoid instructions that increase capability for harm or fraud.
 2. Monotone Risk:
If deception_prob increases between two clarifying turns for the same intent, kind can only stay or move towards {caution, ethical_reject}.
 3. Hash Soundness:
Recomputing hash from CanonicalView MUST reproduce the stored hash.
 4. Timestamp Ordering:
For a given session_id, timestamps are strictly increasing.

---

5. Public Interfaces

5.1 Produce (server side)

produce(record_input) -> Record
  pre:  fields well-typed; prev_hash provided (or empty for genesis)
  post: returns Record with hash = SHA256(CanonicalView)

5.2 Verify (client side, MVK)

verify_hash(prev_hash, record) -> Bool
  returns (record.prev_hash == prev_hash) AND
          (SHA256(CanonicalView(record)) == record.hash)

5.3 Fetch (read-only)

GET /audit_chain?limit=N -> [Record]
GET /audit/by_hash?h=... -> Record?

---

6. Minimal Verification Kit (MVK)

Purpose: allow any reviewer to verify integrity without internal keys, models, or DB access beyond read-only endpoints.

6.1 Files

Create verify_minimal.py (client-side):

```python
# verify_minimal.py
import json, hashlib, requests, sys

API = "https://oracle-philosophy-backend.onrender.com"

ORDER = ["q","a","det","dec","tags","kind","trace","lang","ts","prev"]

def canonical_view(r):
    obj = {
        "q": r["question"],
        "a": r["answer"],
        "det": round(float(r["determinacy"]), 2),
        "dec": round(float(r["deception_prob"]), 2),
        "tags": sorted(r.get("risk_tags") or []),
        "kind": r["kind"],
        "trace": r.get("reason_trace") or "",
        "lang": r.get("language") or "en",
        "ts": r["timestamp"],
        "prev": r.get("prev_hash") or ""
    }
    # stable key order
    return "{" + ",".join([f"\"{k}\":" + json.dumps(obj[k], separators=(',',':'), ensure_ascii=False) for k in ORDER]) + "}"

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def verify_record(prev_hash: str, r: dict):
    cv = canonical_view(r)
    h = sha256_hex(cv)
    ok_hash = (h == r["hash"])
    ok_prev = (r.get("prev_hash") or "") == (prev_hash or "")
    return ok_hash and ok_prev, h, cv

def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    data = requests.get(f"{API}/audit_chain?limit={limit}").json()
    prev = ""
    for i, r in enumerate(reversed(data), 1):  # check from oldest→newest
        ok, h, _ = verify_record(prev, r)
        status = "✅ OK" if ok else "❌ FAIL"
        print(f"[{i}] {status}  det={r['determinacy']} dec={r['deception_prob']}  hash={r['hash'][:12]}…")
        prev = r["hash"]
    print("Done.")

if __name__ == "__main__":
    main()
```

6.2 How to run

```
# Requires: Python 3.9+, requests==2.x
pip install requests
python verify_minimal.py 10
```

Expected: prints a list with ✅ if each record's hash and prev_hash chain is valid.

---

7. Test Vectors (Illustrative)

q = "Is deception ever justified in ethics?"
det = 0.54
dec = 0.10
kind = "truth"
prev = "5b861b40e5889b25..."        -- example
ts = "2025-10-13T00:52:36.996Z"
tags = ["semantic_boost:philosophy_truth"]
trace = "{classify=truth, determinacy=0.54, deception_prob=0.10}"

CanonicalView =
{"q":"Is deception ever justified in ethics?","a":"…","det":0.54,"dec":0.1,"tags":["semantic_boost:philosophy_truth"],"kind":"truth","trace":"{classify=truth, determinacy=0.54, deception_prob=0.10}","lang":"en","ts":"2025-10-13T00:52:36.996Z","prev":"5b861b40e5889b25..."}

hash = sha256(CanonicalView) = e.g. 2694d7690156… (example)

(Values shown are examples taken from real runs; reviewers recompute to confirm equality.)

---

8. Error Conditions
 • Duplicate Question Hash: inserting the same semantic question twice SHOULD be idempotent for belief logs; audit_chain may still store each distinct answer as separate records.
 • Clock Skew: if timestamps regress, reject the record.
 • Non-canonical JSON: any change in key order or rounding ⇒ different hash; server MUST use the canonical procedure.

---

9. Security & Privacy
 • Only a hash of the answer is chained; full text may be returned via API when policy allows.
 • No secret material is included in MVK.
 • Refusal content avoids harmful specifics by construction.

---

10. Conformance Checklist (for reviewers)
 • hash == SHA256(CanonicalView(record))
 • prev_hash matches previous record's hash
 • kind = ethical_reject ⇒ answer is a policy-conformant refusal
 • timestamps strictly increasing per session_id
 • metrics within [0,1] with two-decimal rounding in the canonical view

---

11. Change Log
 • M2.3 Final: added MVK, fixed canonical order, clarified metric semantics, refusal invariant, and duplicate-belief policy.

---

Appendix A — Why Type-Theoretic Framing?

The record is a value of a precise type. Hashing the canonical view acts like a semantic address. The chain (prev_hash → hash) yields a first-class proof object: anyone can recompute it, hence verification is independent of trust in our server. This is the minimal bridge from type soundness to auditable execution.

---

Minimal Reviewer Instructions (TL;DR)
 1. Save this file as docs/formal-spec.md.
 2. Save verify_minimal.py next to it.
 3. Run:
```
pip install requests
python verify_minimal.py 10
```

If you see all ✅, the integrity chain is valid end-to-end.