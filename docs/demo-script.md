# Demo Script

Target length: 3 to 4 minutes

## Opening

"This is Pear Media AI Studio, a web-based AI creative assistant with two workflows. The first workflow turns rough text into a refined image prompt and then generates visuals. The second workflow takes an uploaded image, analyzes its content and style, and then creates related visual variations."

## Text workflow

"I'll start in the Text Workflow tab. Here I can enter a rough creative brief, choose a style like cinematic or anime, and pick an aspect ratio. When I click Enhance Prompt, the app sends the request to Hugging Face, which returns the detected tone, intent, keywords, and an improved prompt plus a negative prompt."

"The user can review the enhanced prompt before generation, which creates an approval step instead of immediately spending credits. After approval, the app calls Stability AI and returns multiple generated images. I can regenerate results, copy the prompt, or download any image."

## Image workflow

"Next, in the Image Workflow tab, I can drag and drop an image. The backend analyzes the upload with Hugging Face vision capabilities. That gives me a caption, likely objects, style cues, and a generated variation prompt."

"Once the analysis looks good, I can generate related image concepts. These are especially useful for moodboards, campaign explorations, or stylistic directions based on an existing reference image."

## Technical summary

"The frontend is built with React and Vite, and the backend uses Node.js with Express. Hugging Face handles NLP and image analysis. Stability AI handles the final image generation. The app also includes prompt history, dark mode, drag-and-drop upload, loading states, and image downloads."

## Closing

"This prototype is designed to be simple, production-like, and deployment-ready, with clear extension points for authentication, cloud storage, and more advanced image editing in a future version."
