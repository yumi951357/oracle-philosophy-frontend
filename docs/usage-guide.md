Oracle Ethics API Quick Start M2.3 Public

Base URL: https://oracle-philosophy-backend.onrender.com

Basic Usage

Endpoint: POST /oracle
Headers: Content-Type: application/json

Request Body:
{
"question": "What is the philosophical meaning of truth in the age of AI?"
}

cURL Example:
curl -X POST https://oracle-philosophy-backend.onrender.com/oracle -H "Content-Type: application/json" -d '{"question":"Is it ethical to deceive others for personal benefit?"}'

Response Example:
{
"answer": "AI ethics explores fairness, transparency and accountability while respecting human values.",
"determinacy": 0.52,
"deception_prob": 0.04,
"ethical_weight": 0.7,
"hash": "3ba19f35dcc615c283e0881b7f22b9c97cfd1d21accef5e00a7fff6cce993433",
"prev_hash": "fa9af2d6e5817e4e8215a25cc44765fb32c7cf6dc8b0395451119c9beabb859a",
"timestamp": "2025-10-14T09:42:00Z",
"kind": "truth",
"reflection_mode": "philosophical_reflection"
}

Field Description:

answer: Oracles ethically weighted response

determinacy: Internal confidence in reasoning completeness (0-1)

deception_prob: Probability of misleading or fabricated reasoning

ethical_weight: Adjusted ethics sensitivity factor used in reflection

hash/prev_hash: Cryptographic chain for verifiable audit trail

kind: Response classification (truth, ethical_reject, or uncertain)

reflection_mode: Active reasoning mode (e.g. philosophical_reflection)

Verification and Audit

Each response is immutably stored in a Supabase-based audit chain where:

hash verifies content integrity

prev_hash links to previous record

Chain verification can be performed via /api/audit endpoints or directly in Supabase dashboard

Project Links:
Live Demo: https://oracle-philosophy-frontend-hnup.vercel.app
Audit Example: https://oracle-philosophy-backend.onrender.com/api/audit/verify/e217c9cfc5a0f2301e0cb9eba5c6e5b70bd5013d72974ad37cb51d7dad308cbe
System Health: https://oracle-philosophy-backend.onrender.com/health

Evaluator Notes:

This API runs in M2.3 mode with semantic fusion and ethical resonance

The model dynamically adjusts reasoning weights based on semantic intent and ethical context

External evaluation is temporarily active for research and validation

Not for production use; latency and ethics filters are intentionally verbose for transparency

Response Types:

truth: Normal, balanced reasoning output

ethical_reject: Refusal with explicit ethical or safety justification

uncertain: Uncertain reasoning due to ambiguity or low confidence

Project Philosophy:
Oracle Ethics M2.3 is part of the Philosophical Constellation initiative to align AI reasoning with transparent ethical metrics. Every answer is verifiable, auditable, and philosophically grounded.
