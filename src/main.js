import './style.css'
import { renderVectorEmbeddings, renderSearchSimilarity } from './utils/render'

document.querySelector('#app').innerHTML = `
  <main>
    <h1>Vector Embeddings</h1>
    <div class='container'>
      <section>
        <button id='show'>Show vector embeddings</button>
        <div id='output-vector-embeddings' class='output'></div>
      </section>
      <section>
        <label>
            <input id='user-input' type='text' placeholder='Search similarity'/>
            <button id='query'>Search</button>
        </label>
        <div id='output-search-similarity' class='output'></div>
      </section>
    </div>
  </main>
`
document.getElementById('show').addEventListener('click', renderVectorEmbeddings)
document.getElementById('query').addEventListener('click', renderSearchSimilarity)
