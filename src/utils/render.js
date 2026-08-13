import { main } from './index'
import sampleData from '../data/sample_content'

export async function render() {
    try {
        const embeddings = await main(sampleData)
        if (!embeddings) return

        const outputContainer = document.getElementById('output')
        outputContainer.innerHTML = ''

        // 1. Create a Master Details wrapper for the entire Array
        const masterDetails = document.createElement('details')
        masterDetails.className = 'console-master'

        // The master summary acts as the root line: (10) [{...}, {...}]
        masterDetails.innerHTML = `
            <summary class="console-root">
                (${embeddings.length}) [<span>{...}</span>, <span>{...}</span>]
            </summary>
            <div class="master-content"></div>
        `

        const contentContainer = masterDetails.querySelector('.master-content')

        // 2. Process each item inside the array
        embeddings.forEach((item, index) => {
            const itemDetails = document.createElement('details')
            itemDetails.className = 'console-item'

            const previewText =
                item.context.length > 45 ? `${item.context.slice(0, 45)}...` : item.context
            const fullEmbedding = item.embedding || []

            // 3. Dynamically slice embedding arrays into interactive 100-item chunks
            let chunksHTML = ''
            const chunkSize = 100
            for (let i = 0; i < fullEmbedding.length; i += chunkSize) {
                const end = Math.min(i + chunkSize - 1, fullEmbedding.length - 1)

                // Get slice values for inner display
                const sliceData = fullEmbedding.slice(i, end + 1)
                const valuesPreview =
                    sliceData.slice(0, 3).join(', ') + (sliceData.length > 3 ? ', ...' : '')

                chunksHTML += `
                    <details class="console-chunk">
                        <summary class="chunk-title">[${i} … ${end}]</summary>
                        <div class="chunk-values">
                            ${sliceData
                                .map(
                                    (val, chunkIdx) => `
                                <div class="property"><span class="index">${i + chunkIdx}:</span> <span class="number">${val}</span></div>
                            `,
                                )
                                .join('')}
                        </div>
                    </details>
                `
            }

            // Assemble the object tree layout
            itemDetails.innerHTML = `
                <summary>
                    <span class="index">${index}:</span> 
                    <span class="bracket">{</span>
                    <span class="key">context</span>: <span class="string">"${previewText}"</span>, 
                    <span class="key">embedding</span>: <span class="type">Array(${fullEmbedding.length})</span>
                    <span class="bracket">}</span>
                </summary>
                <div class="console-content">
                    <div class="property"><span class="key">context</span>: <span class="string">"${item.context}"</span></div>
                    
                    <details class="console-array">
                        <summary><span class="key">embedding</span>: <span class="type">Array(${fullEmbedding.length})</span></summary>
                        <div class="array-chunks">
                            ${chunksHTML}
                            <div class="property-length"><span class="key">length</span>: <span class="number">${fullEmbedding.length}</span></div>
                        </div>
                    </details>
                </div>
            `
            contentContainer.appendChild(itemDetails)
        })

        outputContainer.appendChild(masterDetails)
    } catch (error) {
        console.error(error)
        document.getElementById('output').innerHTML =
            `<div class="error">Error: ${error.message}</div>`
    }
}
