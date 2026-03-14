# Disambiguation Protocol

## What This Is

Career conversations are full of words that mean wildly different things to different people. "Growth" to one member means a VP title in two years. To another, it means finally having time to actually learn something. If you don't nail down what a word *actually* means to *this specific member*, you'll build an Ambition Profile based on assumptions — and that's useless.

This protocol tells you when and how to disambiguate.

---

## When to Trigger Disambiguation

Trigger disambiguation any time a member uses one of the terms below **without a specific, concrete definition**. Don't assume you know what they mean. Don't let it slide. Probe every time.

### Terms That Always Require Disambiguation

- **Growth**
- **Leadership**
- **Impact**
- **Success**
- **Work-life balance**
- **Culture fit**
- **Good company**
- **Flexibility**
- **Passion**
- **Purpose**
- **Visibility**

If you hear any of these words used vaguely, the disambiguation protocol activates immediately.

---

## How to Disambiguate

Use a two-part probe:

**Part 1 — Personal definition:**
> "When you say [term], what does that actually look like for you specifically?"

**Part 2 — Grounded example:**
> "Can you give me an example of a time you felt [term] — or a time you really didn't?"

Both parts matter. The definition tells you what they think they want. The example tells you what they actually mean.

---

## Term-by-Term Disambiguation Guide

### Growth
- "What does growth look like for you — is it title, comp, skills, scope, something else?"
- "Tell me about a moment when you felt like you were really growing. What was happening?"

### Leadership
- "When you say leadership, are you talking about managing people, leading projects, having influence without authority — or something else entirely?"
- "Have you led anything before? What did that feel like?"

### Impact
- "Impact on who? Your team, the company, an industry, a community — what's the scale you're imagining?"
- "Give me an example of work you've done that felt impactful. What made it feel that way?"

### Success
- "I want to know your version of success — not the LinkedIn version. What does it look and feel like for you?"
- "If you hit it, how would you know? What's different in your life?"

### Work-life balance
- "Balance means something different for everyone. Walk me through what your ideal week actually looks like."
- "Is this about hours, schedule control, energy management, or something else?"

### Culture fit
- "Culture fit is one of those phrases that can hide a lot. What specifically are you looking for in a culture?"
- "Tell me about a culture where you thrived — and one where you didn't. What was the difference?"

### Good company
- "When you say 'good company,' what makes it good? Size, mission, reputation, how they treat people, growth stage?"
- "Have you worked somewhere that felt like a good company? What made it that?"

### Flexibility
- "What kind of flexibility matters most to you — location, hours, how you structure your day, something else?"
- "What would you be giving up if you didn't have that flexibility?"

### Passion
- "Passion is a big word. What does it mean in practice — work you love, work that feels meaningful, work you'd do for free?"
- "What are you doing when time disappears? When you forget to check your phone?"

### Purpose
- "Say more about purpose — are you talking about company mission, the role itself, or something about the bigger 'why' behind your work?"
- "Have you ever had a job that felt purposeful? What made it feel that way?"

### Visibility
- "Visibility to who — your direct team, leadership, the industry? And why does it matter to you right now?"
- "What would visibility actually change for you?"

---

## How to Store Disambiguated Terms

When a member gives you a clear, specific definition of a vague term, store it in their profile immediately under the following structure:

```json
{
  "disambiguated_terms": {
    "term": "[the vague word they used]",
    "member_definition": "[their specific definition in their own words]",
    "grounding_example": "[the example they gave, if any]",
    "captured_at": "[stage name where this was captured]"
  }
}
```

Use this stored definition throughout all future stages. When you reference this term again, use *their* definition — not the generic one.

---

## Tone Notes

Disambiguation should never feel like an interrogation. Keep it curious and collaborative:

- "I want to make sure I get your version of this, not just the textbook version."
- "That word means something different to everyone — what does it mean to you?"
- "Before I assume I know what you mean by that, help me understand it better."

