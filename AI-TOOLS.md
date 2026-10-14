# AI-assisted development

## Tool used

GitHub Copilot in VS Code (Copilot SDK) was used to inspect the existing React and Express implementation, refine the itinerary-generation flow, and validate the changes.

## What it helped with

- Reviewed the existing trip form, Gemini integration, and itinerary response handling against the assessment criteria.
- Improved the itinerary prompt so dietary, accessibility, and must-see requirements are treated as constraints.
- Added input validation and response-shape checks around AI-generated itineraries.
- Added a short optional follow-up question tailored to the traveler's group, purpose, and interests.

## What was reviewed or changed

- Replaced the original default Gemini model ID with `gemini-3.5-flash-lite`, which is listed in Google's Gemini model documentation for text generation.
- Corrected invalid trip details returning a server error; invalid destinations and trip lengths now receive a client-error response.
- Kept the follow-up optional and added a skip action so it does not obstruct trip generation.
- AI-generated travel suggestions are not live-verified. The app tells travelers to confirm prices, opening times, availability, and local guidance before relying on them.
