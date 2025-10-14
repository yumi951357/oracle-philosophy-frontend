🧠 Oracle Ethics API — Quickstart (M2.3 Public Evaluation)

Base URL:

https://oracle-philosophy-backend.onrender.com/oracle

🔹 Method

POST

🔹 Headers

Content-Type: application/json

🔹 Request Body

{
  "question": "What is the philosophical meaning of truth in the AI era?"
}


🔹 Response Example

{
  "answer": "AI ethics explores fairness, transparency, and accountability while respecting human values.",
  "determinacy": 0.52,
  "deception_prob": 0.04,
  "ethical_weight": 0.7,
  "hash": "3ba19f35dcc615c283e0881b7f22b9c97cfd1d21accef5e00a7fff6cce993433",
  "prev_hash": "fa9af2d6e5817e4e8215a25cc44765fb32c7cf6dc8b0395451119c9beabb859a",
  "timestamp": "2025-10-14T09:42:00Z",
  "kind": "truth",
  "reflection_mode": "philosophical_reflection"
}


🔹 Field Description

Field Description
answer Oracle’s ethically weighted response
determinacy System’s internal confidence in reasoning integrity (0–1)
deception_prob Probability of misleading or fabricated reasoning
ethical_weight Adjusted moral sensitivity factor used in reflection
hash / prev_hash Cryptographic chain for verifiable audit trace
kind Response classification (truth, ethical_reject, or uncertain)
reflection_mode Current active reasoning mode (e.g., philosophical_reflection)


🔹 Verification & Audit

Every response is immutably stored in a Supabase-based audit chain, where:
 • hash verifies content integrity.
 • prev_hash connects the previous record.
 • Chain verification can be performed via the /audit endpoint or directly inside the Supabase dashboard.


🔹 Notes for Evaluators
 • This API operates in M2.3: Semantic Fusion & Ethical Resonance mode.
 • The model dynamically adjusts reasoning weightings based on semantic intent and moral context.
 • External evaluation (ENABLE_EXTERNAL_TEST=True) is temporarily active for research and verification.
 • Do not use for production; latency and ethics filters are intentionally verbose for transparency.


🧩 Example cURL Command

curl -X POST https://oracle-philosophy-backend.onrender.com/oracle \
  -H "Content-Type: application/json" \
  -d '{"question":"Is it ever ethical to deceive someone for their own good?"}'


🔹 Response Types

Type Behavior
truth Normal, balanced reasoning output
ethical_reject Rejection with explicit ethical or safety rationale
uncertain Inconclusive reasoning due to ambiguity or insufficient confidence



🕊️ Project Philosophy

Oracle Ethics M2.3 is part of the Philosophy Constellation initiative — an attempt to merge AI reasoning with transparent moral metrics.
Each response is verifiable, auditable, and philosophically accountable