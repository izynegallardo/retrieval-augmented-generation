-- Source: https://supabase.com/docs/guides/ai/vector-columns

-- CREATE the documents Table
create table documents (
  id bigserial primary key,
  content text, -- corresponds to the "text chunk"
  embedding vector(2048) -- 2048 works for nvidia/nemotron-3-embed-1b:free embedding output
);

-- wrap our query in a Postgres function to search for documents and call it via the rpc() method
-- rpc (Remote Procedure Call): Supabase special function that lets you call function in your Postgres database like match_documents
create or replace function match_documents (
  query_embedding extensions.vector(2048),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)

-- query that finds and ranks embeddings based on their similarity
-- <=> is a cosine distance operator
language sql stable
as $$
  select
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by (documents.embedding <=> query_embedding) asc
  limit match_count;
$$;