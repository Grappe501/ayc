# BUILD RETURN — Phase 1M / Upgrade #5 (Preferred contact / text-ready)

**Date:** 2026-07-31  
**Slice:** `AYC-PHASE-1M-TEXT-READY-FLAGS-1.0`

## Done

- Domain flags: `textReady`, `needsPreferred` from preferred method + phone (+ consent)
- Roster fields + filters: preferred method, text-ready only, needs preferred
- Leader Board attention cards for needs-preferred and text-ready counts
- Gap fill + contact form: preferred select + “Text-ready (OK to text)”
- API: `PATCH /api/contact-flags` for preferred + text-ready consent
- Contact detail shows text-ready status
- Unit tests for flag computation

## Text-ready rule

A person is **text-ready** when they have a phone, preferred contact is `TEXT` or `EITHER`, and phone consent is not `DENIED`. Marking text-ready sets phone consent to `GRANTED`.
