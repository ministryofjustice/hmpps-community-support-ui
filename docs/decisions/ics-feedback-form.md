# Design: Initial Contact Session (ICS) Appointment Feedback Form

**Status:** This document is a work in progress.  Current understanding reflects what was agreed in refinement, 16 November 2026. 

**Audience:** Developers (and AI agents) about to build the ICS feedback journey

## Summary

ICS feedback is a multi-page form with one entry point but many valid journeys. Which screens a user sees depends on their earlier answers. We'll build it the same way as our other multi-page forms (a single session object, Post/Redirect/Get, check your answers, submit), plus three additions:

1. **Hand-written mutations** that clear now-invalid answers when a user changes a branching answer.
2. **A dynamic back link** worked out from which answers are in the session.
3. **Zod validation** of both individual pages and the whole object at the end of the journey.

The mutations carry most of the risk, so they need the most test coverage.

## The problem

### Terms

-**ICS:** is the Initial Contact Session, an in-person session between a Provider and a Person on Probation, where information about needs and requirements are discussed.
- **Journey:** an ordered sequence of screens and questions.
- **Branching point:** a question whose answer decides which screens come next. The first question, "Did the session happen?", is one. Yes and no lead to completely different journeys.
- **Side street:** a short detour of extra questions that rejoins the main journey afterwards. In ICS feedback this happens when the session didn't take place at the planned location: the user is asked where it did happen, then returns to the main journey.

### Why it's complex

Different branches collect very different data. If the session went ahead as planned, the user gives a large amount of feedback about it. If the session didn't happen because someone didn't turn up, we never ask for session feedback.  If the session didn't happen in the expected location we will (pending on designs at time of writing) request information about where the session *did* take place.

Users can also go back to an earlier branching point, change their answer, and continue down a different journey. Answers from the old journey are then still sitting in the session.

So we need to:

1. **Route:** decide which screen the user sees next.
2. **Shape data:** hold data whose shape depends on the answers given.
3. **Validate:** check that the data matches one valid journey, in both the UI and the API.
4. **Handle backwards navigation:** when a branching answer changes, show the right screens and clear out answers to questions the user would no longer see.

## Decision

### 1. Follow existing multi-page form conventions

Most of this is conventional. Follow the patterns already in the codebase:

- Keep one object in the session, `req.session.icsFeedbackSubmission`, and build it up page by page.
- Use Post/Redirect/Get. On POST, validate the page with its Zod schema from `server/validation`, save it to the session, then redirect.
- Finish with check your answers, then submit, then redirect to the index page with a success banner.

We chose a single session object over a different storage model so this flow can use the same tools as our other flows.

### 2. Clear invalid answers with hand-written mutations

When a user changes their answer to a branching question, we run an explicit, hand-written mutation on the session object. It removes answers that belong to the branch the user has left.

Example: answering yes to Q1 leads to Q2–Q4, and answering no leads to Q5–Q7.

```text
                    ┌── yes ──> Q2 ──> Q3 ──> Q4 ──┐
Q1 (branching) ─────┤                              ├──> Check your answers
                    └── no ───> Q5 ──> Q6 ──> Q7 ──┘

User answered:        { q1: yes, q2, q3, q4 }
User returns to Q1 and changes the answer to no
After the mutation:   { q1: no }              <- q2, q3 and q4 cleared
User continues:       { q1: no, q5, q6, q7 }
```

These mutations are written by hand on purpose. Because the data has a tree shape, someone needs to think through each case deliberately: a changed branching answer, a side street that's entered or skipped, and so on. Automating this risks keeping or deleting the wrong data without anyone noticing. The idea is similar to "actions" or "thunks" in Redux: named, testable functions that move state from one valid shape to another.

**Every mutation needs unit tests** covering each branch change and each side street being entered or left.

The sketch below shows the intended API. Field names are only examples.

```ts
// Illustrative only — names and location TBD (see DEV TODO below)
type IcsFeedbackRecord = {
  didSessionHappen?: 'yes' | 'no'
  // "no" branch
  whyDidSessionNotHappen?: string
  // "yes" branch
  wasAtPlannedLocation?: 'yes' | 'no'
  actualLocation?: string // side street: only when wasAtPlannedLocation === 'no'
  sessionFeedback?: string
}

// A mutation is a pure function from one record to the next
type IcsFeedbackMutation<Input> = (record: IcsFeedbackRecord, input: Input) => IcsFeedbackRecord

export const setDidSessionHappen: IcsFeedbackMutation<'yes' | 'no'> = (record, answer) => {
  if (record.didSessionHappen === answer) return record // unchanged, so keep downstream answers

  if (answer === 'yes') {
    const { whyDidSessionNotHappen, ...rest } = record
    return { ...rest, didSessionHappen: 'yes' }
  }

  const { wasAtPlannedLocation, actualLocation, sessionFeedback, ...rest } = record
  return { ...rest, didSessionHappen: 'no' }
}

export const setWasAtPlannedLocation: IcsFeedbackMutation<'yes' | 'no'> = (record, answer) => {
  if (answer === 'yes') {
    const { actualLocation, ...rest } = record // leaving the side street
    return { ...rest, wasAtPlannedLocation: 'yes' }
  }
  return { ...record, wasAtPlannedLocation: 'no' }
}

// In the controller (POST handler), after page-level validation passes:
req.session.icsFeedbackSubmission.record = setDidSessionHappen(
  req.session.icsFeedbackSubmission.record,
  validated.didSessionHappen,
)
```

```ts
// Tests target the mutations directly, with no Express needed
it('clears the "yes" branch when the answer changes to "no"', () => {
  const before = { didSessionHappen: 'yes', wasAtPlannedLocation: 'no', actualLocation: 'X', sessionFeedback: 'Y' }
  expect(setDidSessionHappen(before, 'no')).toEqual({ didSessionHappen: 'no' })
})
```

DEV TODO: we need to decide what we will call these kinds of actions or mutations and where they will live in the current code base architecture.  Although they are similar to controllers, and validator, they probably need to be separated out so that they can be tested independently.

### 3. Work out the back link from session state

Some screens can be reached from more than one previous screen, so the back link can't be fixed. Work it out from which answers are present or missing in the session object.

```text
Did the session happen? ── yes ──> Was it at the planned location?
                                     │                │
                                    yes               no
                                     │                ▼
                                     │      Where did it take place?  (side street)
                                     │                │
                                     ▼                ▼
                                  Session feedback  <─┘

Back link on "Session feedback":
  wasAtPlannedLocation === 'no'  -> "Where did it take place?"
  wasAtPlannedLocation === 'yes' -> "Was it at the planned location?"
```

Use the same answers-based logic to decide the next screen after a POST. Routing and back links then come from one source of truth.

### 4. Validate with Zod

Use Zod schemas, including custom refinements such as `superRefine` and discriminated unions, to:

- validate each page and show users GOV.UK-style error messages, using the existing schema-to-flash-errors adapter in `server/validation`;
- check that the final object matches exactly one valid journey before submission. The API must apply the same check.

DEV TODO: we should consider if having one schema would possibly overload the code with multiple responsibilities, for example validating fields to present to use with error messages versus validating a data object at the end of the flow to make sure that it is in the right state.

## Rules for implementers

Use this as a checklist when building or reviewing, and as context for AI agents working on parts of this feature.

- Keep all journey state in `req.session.icsFeedbackSubmission`. Don't add parallel session keys.
- Only change branching answers through a named mutation. Don't spread `req.body` straight into the record on branching pages.
- When a branching answer stays the same, keep downstream answers so the user doesn't lose work.
- Work out the back link and next page from session answers, not from the referrer or query strings.
- Every mutation, and every branch and side-street transition, needs a unit test.
- Validate the whole object against the end-of-journey schema before showing check your answers or submitting.

## Open questions

1. Feedback for other contact sessions is similar to ICS feedback but not identical. We need to know whether those journeys will happen and how. If they will, the mutation and schema approach should be designed so it can be reused.

## Known TODOs

- Decide on routes and URLs for each page.
- Decide on the data structure in the API and database.
