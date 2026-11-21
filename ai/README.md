# AI-generated restoration plans

## Problem

A restoration expert cannot visit every plot. Generic recommendations are often ignored because they do not match the family's resources, crops or livestock.

**Goal:** give every participant, during a 3-hour field session, a restoration plan that is personal, technically sound and written in their own language.

## Approach: expert-grounded generation

The model does not decide the restoration strategy. Experts defined it; the model adapts it.

```
Expert base plan (domain knowledge, fixed)  ─┐
Landholder questionnaire (38 items)          ├─► Prompt ─► GPT-4 ─► Personalized plan ─► WhatsApp
Station readings + geospatial context        ─┘                                (reviewed against expert plan)
```

| Element | File | Role |
|---|---|---|
| Expert base plan | [`expert-base-plan.md`](expert-base-plan.md) | Allowed practices: water protection, soil recovery, native species by altitude band, sustainable farming, community monitoring. It is the "knowledge boundary" of the model. |
| Prompt design | [`restoration-plan-prompt-design.md`](restoration-plan-prompt-design.md) | Role, inputs, constraints and output template. |
| Input schema | [`../data/questionnaire_data_dictionary.json`](../data/questionnaire_data_dictionary.json) | 38 questions in 6 sections, with types, options and privacy flags. |

## Prompt engineering decisions

1. **Role and scope.** The model acts as an expert in high-mountain restoration. It is limited to the Rabanal páramo and to the practices in the expert base plan.
2. **Hard constraints** that every plan must meet:
   - viable with the landholder's own resources;
   - low cost and sustainable over time;
   - compatible with current production, so it does not hurt the family's income;
   - organized in progressive, adaptive steps.
3. **Plain-language rule.** Each technical practice must come with a concrete example. Instead of "live barrier", the plan says "plant shrubs such as chusque along the slope so the water doesn't wash the soil away". Many participants have limited formal schooling.
4. **Fixed output template:**
   - personal greeting;
   - plot diagnosis;
   - prioritized actions (water, soil, native species, farming practices, monitoring);
   - final recommendations.
5. **Respectful tone.** The plan is warm and motivating, and recognizes local knowledge. Participants already know the páramo well; they asked for content without technical jargon.

## Human-in-the-loop validation

During the pilot, each generated plan was checked against the expert base plan for two things:
- whether it stayed inside the expert's technical framework;
- whether it was actually personalized to the participant's answers.

92% of participants said the plan fit their reality (mean 4.6/5).

## Cost and feasibility

- The pilot was funded with a USD 50 API credit.
- Measured cost per generated plan: **about USD 0.01**.
- For reference, the pilot budget allowed COP 90,000 (about USD 22) for transport and per diem on each field visit. At USD 0.01 per plan, a personalized first plan for every household in a territory costs less than a single visit.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| The model recommends practices that are wrong for the ecosystem | Expert base plan as the knowledge boundary; review of plans against it |
| Generic output that ignores the plot | Structured 38-item input; diagnosis section required in the output |
| Unreadable technical language | Plain-language rule with mandatory examples |
| Exposure of personal data | Minimal identifying data; name used only for the greeting; no personal data published |
| Cost escalation | Single call per plan; measured unit cost about USD 0.01 |

## Next steps

- Measure plan quality systematically with an expert rubric (accuracy, feasibility, personalization) on a larger sample.
- Make the expert plan content an explicit retrieval context, so the model cites the exact practice it adapts.
- Offline-first delivery: generate plans when connectivity is available and cache them on the phone.
