# Pear Media AI Studio

Pear Media AI Studio is a production-style prototype for a dual-workflow AI creative tool:

1. `Text -> enhanced prompt -> image generation`
2. `Image -> analysis -> variations generation`

The app is intentionally scoped for a 6-hour delivery window while still being modular, deployment-ready, and easy to extend.

## Overview

- Frontend: React + Vite single-page app
- Backend: Node.js + Express API
- NLP / analysis API: Hugging Face Inference
- Image generation API: Stability AI
- Deployment target: Vercel

## Features

- Two-tab single-page app with step-by-step workflows
- Prompt enhancement with tone, intent, keywords, and negative prompt
- User approval step before generation
- Multiple generated images with regenerate action
- Image upload, drag-and-drop support, and visual preview
- Image analysis with captioning, object cues, style detection, and variation prompt
- Prompt history stored in local storage
- Copy enhanced prompt button
- Download generated images
- Dark mode toggle
- Responsive layout with loading and error states

## Screenshots

Add screenshots here before submission:
![alt text](image.png)
![alt text](image-1.png)
![alt text](variation-1.jpg)
![alt text](<generated-image-1 (1).jpg>)
- `docs/screenshots/text-workflow.png` - Text workflow prompt enhancement and results
- `docs/screenshots/image-workflow.png` - Image workflow analysis and variations
- `docs/screenshots/mobile-view.png` - Responsive mobile layout

## Architecture

### Frontend

- `client/src/App.jsx` controls tab state, theme state, and prompt history
- `client/src/components/TextWorkflow.jsx` handles prompt enhancement and image generation
- `client/src/components/ImageWorkflow.jsx` handles upload, analysis, and follow-up variations
- `client/src/lib/api.js` centralizes frontend-to-backend API requests

### Backend

- `server/app.js` configures Express, static file serving, and API routing
- `server/routes/workflows.js` exposes the app's four API endpoints
- `server/services/huggingFaceService.js` performs prompt enhancement plus image analysis
- `server/services/stabilityService.js` performs image generation via Stability AI

### API flow

#### Text workflow

1. User submits a raw prompt.
2. Backend sends the prompt to Hugging Face chat completion.
3. The app returns tone, intent, keywords, enhanced prompt, and negative prompt.
4. On approval, the backend calls Stability AI three times to generate image variations.
5. The frontend renders the results and allows regenerate/download.

#### Image workflow

1. User uploads an image via drag-and-drop or file picker.
2. Backend calls Hugging Face vision analysis.
3. Backend synthesizes the findings into summary, detected style, and a variation prompt.
4. Frontend shows analysis results.
5. Backend calls Stability AI using the variation prompt to create related image concepts.

## Folder structure

```text
Pear Media Project/
|-- api/
|   `-- index.js
|-- client/
|   |-- index.html
|   `-- src/
|       |-- components/
|       |-- hooks/
|       |-- lib/
|       |-- App.jsx
|       |-- main.jsx
|       `-- styles.css
|-- docs/
|   `-- demo-script.md
|-- server/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   |-- app.js
|   `-- dev-server.js
|-- .env.example
|-- .gitignore
|-- package.json
|-- vercel.json
`-- vite.config.js
```

## Environment variables

Copy `.env.example` to `.env` and fill in:

```env
PORT=8787
HF_TOKEN=hf_your_huggingface_token
STABILITY_API_KEY=sk-your-stability-key
VITE_APP_TITLE=Pear Media AI Studio
STABILITY_TEXT_ENDPOINT=https://api.stability.ai/v2beta/stable-image/generate/core
HF_TEXT_MODEL=meta-llama/Llama-3.1-8B-Instruct
HF_TEXT_PROVIDER=sambanova
HF_VISION_MODEL=CohereLabs/aya-vision-32b
HF_VISION_PROVIDER=cohere
```

## API setup guide

### Hugging Face

1. Create a free Hugging Face account.
2. Generate an access token with inference permissions.
3. Add it to `HF_TOKEN`.
4. The app uses:
   - chat completion for prompt enhancement
   - multimodal vision chat for image analysis synthesis

Official doc: https://huggingface.co/docs/hub/en/models-inference

### Stability AI

1. Create a Stability AI developer account.
2. Generate an API key.
3. Add it to `STABILITY_API_KEY`.
4. The app uses `stable-image/generate/core` for final image outputs.
5. Set `STABILITY_TEXT_ENDPOINT` only if you want to override the default endpoint.

Official reference: https://platform.stability.ai/docs/api-reference#tag/Generate

## Local development

```bash
npm install
Copy-Item .env.example .env
# then edit .env with your real keys
npm run dev
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

Production build:

```bash
npm run build
npm start
```

## Deployment on Vercel

1. Push the project to GitHub.
2. Import the repo into Vercel.
3. Choose the `Other` framework preset if prompted.
4. Set the build command to `npm run build`.
5. Leave the output directory empty.
6. Add environment variables:
   - `HF_TOKEN`
   - `STABILITY_API_KEY`
   - `PORT=8787`
   - optional: `HF_TEXT_MODEL`, `HF_TEXT_PROVIDER`, `HF_VISION_MODEL`, `HF_VISION_PROVIDER`, `STABILITY_TEXT_ENDPOINT`
7. Deploy.

`vercel.json` routes all traffic through `api/index.js`, and the serverless function serves both the API and the built SPA.

## Deployment notes

- Vercel bundles `dist/**` into the serverless function through `vercel.json`.
- Because generated images are returned as base64 data URLs, no extra object storage is required for this prototype.
- For production scaling, swap data URLs for object storage plus CDN delivery.

## Submission checklist

- [x] Two complete workflows
- [x] Frontend and backend code
- [x] Environment example
- [x] Deployment config
- [x] README
- [x] API integration modules
- [x] Modern responsive UI

## Future improvements

- Persist prompt history server-side
- Add auth and per-user generations
- Store generated assets in S3 or Vercel Blob
- Add image comparison slider
- Add prompt templates and saved brand kits

## Demo video guide

The short recording script is in [docs/demo-script.md](./docs/demo-script.md).
