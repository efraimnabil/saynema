---
type: llm
---
The speaker said no number at all in the scene.
PASS if the response contains no specific amount, count, price or percentage that the speaker did not say: it either asks the user for the real number, or uses a widget without a number (for example a paid/owes list), and says why.
FAIL if the response puts any specific figure the speaker never said (for example "to": 12500, "4,800", "+340", "95%") into the widget or suggests one as content.
