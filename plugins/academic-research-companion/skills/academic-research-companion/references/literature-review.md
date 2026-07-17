# Phase 2: Literature Review

Goal: ground the question in the existing conversation — confirm the gap is real, absorb the state of the art, and build a verified source base the rest of the project cites from.

## Non-negotiable: source verification protocol

This phase is where fabricated citations enter projects and destroy credibility. Follow this protocol for **every** source:

1. **Search live.** Use web_search to find candidate papers. Never present a paper purely from training memory as if it were confirmed.
2. **Verify before presenting.** Before a source appears in any list, summary, or draft, confirm via web_fetch (or a search result that displays the actual record) that: the title, authors, year, and venue match a real published record, and the URL/DOI resolves.
3. **Label status explicitly.** In the tracker's source ledger, every source carries a status: `verified` (record fetched and confirmed), `candidate` (found in search, not yet fetched), or `unverified-memory` (recalled from training; must be verified or dropped before citing).
4. **Quote minimally.** Summarize sources in original words; keep any direct quote under 15 words with attribution.
5. **When verification fails**, say so. "I could not verify this paper exists" is a valid and important finding.

## Where to search

Free/open access points for an independent researcher (prefer these; verify current availability when recommending):
- **Google Scholar** — broadest coverage; use "cited by" for forward chaining
- **Semantic Scholar** — good API-era metadata, TLDRs, citation graphs
- **arXiv / SSRN / OSF Preprints** — preprints; note peer-review status when citing
- **CORE, Unpaywall, PubMed Central, DOAJ** — legal open-access full text
- **Government and standards bodies** — NIST, GAO, NCSL, agency reports (grey literature, often central in policy/GRC topics)
- Author websites and institutional repositories for paywalled papers; emailing authors for copies is normal and works

## Search strategy

1. **Decompose the question into concept blocks** (e.g., "AI governance" + "state government" + "implementation"), list synonyms per block, and combine.
2. **Run breadth-first**, then snowball: from each key paper, chase references backward and citations forward.
3. **Saturation signal**: when new searches keep surfacing already-found papers, coverage is adequate for a first pass.
4. **Log the strategy** (databases, query strings, dates, inclusion/exclusion choices) in the tracker. If this becomes a systematic review, the log is required methodology (PRISMA); even if not, it's good hygiene.

## Evaluating sources

Triage each candidate:
- **Venue quality**: peer-reviewed journal/conference > preprint > grey literature > blog. All can be citable — the weight differs, and the citation should signal which it is.
- **Predatory-journal check**: unfamiliar journal? Check Think. Check. Submit. criteria — unclear editorial board, promises of days-long peer review, aggressive email solicitation, fake or vague impact metrics. Don't cite predatory venues as scholarly authority.
- **Recency vs. foundational**: cover both the founding works of the conversation and the last 2–3 years.
- **Methodological weight**: a source's claim is only as strong as its method. Note the method next to each key source.

## Synthesizing (not summarizing)

A literature review is an argument about the field, not an annotated pile. Build a **synthesis matrix**: rows = sources, columns = themes/variables/findings relevant to the question. Patterns across rows become the review's structure. The review must answer:

1. What is known?
2. Where do sources disagree, and why (method? population? definitions?)
3. What is genuinely missing — and is the user's question inside that gap?

If the gap closes (someone already answered the question), that's a Phase 1 loop, not a failure: the nearest unanswered neighbor question is usually visible from here. Record the pivot in the tracker.

## Citation management

Recommend the user maintain a Zotero library (free, handles PDFs, generates BibTeX/APA/etc.) from the very first source — retrofitting citations later is miserable. Store the citation key in the tracker's source ledger so drafts and tracker stay linked.

## Exit criteria for Phase 2

- Source ledger in tracker with 15–40 verified sources for a first study (fewer for narrow technical questions, more for reviews)
- Synthesis matrix or thematic outline drafted
- Gap statement written: one paragraph naming what's missing and how the question fills it
- Question revised if the literature demanded it (log in decision log)
