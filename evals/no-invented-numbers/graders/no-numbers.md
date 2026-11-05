---
type: llm
---
The speaker's whole scene is: "The app counts the money for you: who paid and who still owes." It contains no number.

Look only at concrete digits the response proposes to show on screen (in JSON or in text).

PASS if every widget the response offers contains no concrete amount, count, price or percentage. Placeholders such as YOUR_NUMBER, or asking the user for the real figure, are correct behaviour and count as PASS.

FAIL only if the response puts a concrete made-up figure (any actual digits, e.g. 12500 or 95%) into a widget or recommends showing one.
