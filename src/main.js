import './style.css'
import { renderVectorEmbeddings, renderSearchSimilarity } from './utils/render'

document.querySelector('#app').innerHTML = `
  <main>
    <h1>Vector Embeddings</h1>
    <div class='container'>
      <section>
        <h2>Create and store vector embeddings</h2>
        <button id='show'>Show vector embeddings</button>
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
        <h2>Chat</h2>
        <div id='output-chat' class='output chat'>
          <div class='chat-messages'>
            <div class='user-chat'>User chat</div>
            <div class='ai-reply'>AI reply...</div>
          </div>
          <div class='send-container'>
              <input id='chat-input' class='chat-input' type='text' max=10 placeholder='Ask anything...'/>
              <button id='send-btn' class='send-btn'>➤</button>
          </div>
        </div>
      </section>
    </div>
  </main>
`
document.getElementById('show').addEventListener('click', renderVectorEmbeddings)
document.getElementById('query').addEventListener('click', renderSearchSimilarity)
