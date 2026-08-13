import './style.css'
import { render } from './utils/render'

document.querySelector('#app').innerHTML = `
  <main>
    <section>
      <h1>Vector Embeddings</h1>
      <div id='output'></div>
      <button onClick=${render()}>Test</button>
    </section>
  </main>
`
