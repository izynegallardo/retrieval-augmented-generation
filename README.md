# Retrieval-Augmented Generation (RAG)

![Vite](https://img.shields.io/badge/Vite-8.2.0-9547fd?logo=vite&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1.5.9-7fc8ff?logo=langchain&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.112.3-3ecf8e?logo=supabase&logoColor=white)
![OpenAI API](https://img.shields.io/badge/OpenAI%20API-7.4.0-0aa37f?logo=openai&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-750013.svg)

A simple RAG (Retrieval-Augmented Generation) app built with Vite, LangChain, and Supabase. It embeds documents into a vector store and uses retrieved context to answer questions via a chat model.

## Tech Stack

- [Vite](https://vitejs.dev/) — dev server and build tool
- [LangChain](https://js.langchain.com/) — text splitting and RAG orchestration
- [Supabase](https://supabase.com/) — vector store (pgvector) for embeddings
- [OpenRouter](https://openrouter.ai/) — chat and embedding model API

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

| Variable                    | Description                       |
| --------------------------- | --------------------------------- |
| `VITE_API_BASE_URL`         | Base URL for the OpenRouter API   |
| `VITE_OPENROUTER_API_KEY`   | Your OpenRouter API key           |
| `VITE_TEXT_EMBEDDING_MODEL` | Embedding model to use            |
| `VITE_CHAT_MODEL`           | Chat model to use                 |
| `VITE_SUPABASE_PROJECT_URL` | Your Supabase project URL         |
| `VITE_SUPABASE_API_KEY`     | Your Supabase anon/public API key |

### 3. Set up Supabase

Run the SQL setup scripts found in `src/sql` against your Supabase project to create the vector store table and search function.

### 4. Run the dev server

```bash
npm run dev
```

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — build for production
- `npm run preview` — preview the production build locally

## Project Structure

```
├── src/
│   ├── configs/     # App configuration
│   ├── sql/         # Supabase/pgvector SQL setup
│   ├── utils/        # Helper utilities
│   ├── main.js       # App entry point
│   └── style.css
├── index.html
└── .env.example
```

## License

This project is licensed under the [MIT License](./LICENSE).
