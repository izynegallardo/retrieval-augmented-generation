import './style.css'
import {
    renderCreatedEmbeddings,
    renderVectorEmbeddings,
    renderSearchSimilarity,
    renderChunks,
    renderChat,
} from './utils/render'

document.querySelector('#app').innerHTML = `
  <main>
    <h1>Retrieval-augmented Generation <div>(RAG)</div></h1>
    <div class='container'>
      <section>
        <h2>Create and store vector embeddings</h2>
        <button id='store-btn' class='embedding-btn'>Create and Store vector embeddings</button>
        <button id='embedding-btn' class='embedding-btn'>Show vector embeddings</button>
        <div id='output-vector-embeddings' class='output'></div>
      </section>
      <section>
        <h2>Similarity Search</h2>
        <label>
            <input id='user-input' type='text' placeholder='Search similarity'/>
            <button id='query'>Search</button>
        </label>
        <div id='output-search-similarity' class='output'></div>
      </section>
      <section>
        <h2>Text Chunking</h2>
        <button id='chunk-btn'>Get chunk</button>
        <div id='output-chunk' class='output'>
        </div>
      </section>
      <section>
        <h2>Chat</h2>
        <div id='output-chat' class='output chat'>
        <div id='opening-message' class='opening-message'>What's your mood today?</div>
          <div id='chat-messages' class='chat-messages'></div>
          <div class='send-container'>
              <input id='chat-input' class='chat-input' type='text' placeholder='Ask anything...'/>
              <button id='message-btn' class='message-btn'>➤</button>
          </div>
        </div>
      </section>
    </div>
  </main>
`
document.getElementById('store-btn').addEventListener('click', renderCreatedEmbeddings)
document.getElementById('embedding-btn').addEventListener('click', renderVectorEmbeddings)
document.getElementById('query').addEventListener('click', renderSearchSimilarity)
document.getElementById('message-btn').addEventListener('click', renderChat)
document.getElementById('chunk-btn').addEventListener('click', renderChunks)
