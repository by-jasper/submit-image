# Submit Image Wall (Online Deployment)

This project is ready to run online with one server:
- serves `index.html`
- exposes `POST /api/analyze-images`
- calls OpenAI securely using environment variables

## 1) Get API key
1. Create/Open your OpenAI account.
2. Create an API key.
3. Keep the key private (server env only, never in HTML).

## 2) Local run
```bash
npm install
cp .env.example .env
# edit .env and add your real OPENAI_API_KEY
npm start
```
Open `http://localhost:3000`.

## 3) Deploy online (Render easiest)
1. Push this repo to GitHub.
2. Go to Render -> New -> Web Service.
3. Connect this repo.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional, default `gpt-4.1-mini`)
   - `PORT` (Render usually sets this automatically)
7. Deploy.

Your site URL will now run fully online, with AI analysis enabled.

## 4) Use other LLM providers
You can keep frontend unchanged. Only replace logic in `server.js` route `/api/analyze-images` to call another provider and return:
```json
{ "analysis": "..." }
```
