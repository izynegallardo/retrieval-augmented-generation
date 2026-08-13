import { generateAndStoreEmbeddings } from './generate'
import { searchSimilarity } from './query'
import sampleData from '../data/sample_content'

export async function renderVectorEmbeddings() {
    const outputVectorEmbeddingContainer = document.getElementById('output-vector-embeddings')

    try {
        const embeddings = await generateAndStoreEmbeddings(sampleData)
        if (!embeddings) return

        outputVectorEmbeddingContainer.innerHTML = ''

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
                item.content.length > 45 ? `${item.content.slice(0, 45)}...` : item.content
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
                    <span class="key">content</span>: <span class="string">"${previewText}"</span>, 
                    <span class="key">embedding</span>: <span class="type">Array(${fullEmbedding.length})</span>
                    <span class="bracket">}</span>
                </summary>
                <div class="console-content">
                    <div class="property"><span class="key">content</span>: <span class="string">"${item.content}"</span></div>
                    
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

        outputVectorEmbeddingContainer.appendChild(masterDetails)
    } catch (error) {
        console.error(error)
        outputVectorEmbeddingContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`
    }
}

export async function renderSearchSimilarity() {
    const outputSearchSimilarityContainer = document.getElementById('output-search-similarity')

    try {
        const queryText = document.getElementById('user-input').value
        if (!queryText.trim()) return

        outputSearchSimilarityContainer.innerHTML = 'Searching...'

        const matches = await searchSimilarity(queryText)

        if (!matches || matches.length === 0) {
            outputSearchSimilarityContainer.innerHTML = '<div>No similar documents found.</div>'
            return
        }

        const htmlString = matches
            .map((match) => {
                const scorePercentage = (match.similarity * 100).toFixed(1)

                return `
                    <div class="similarity-item">
                        <span class="similarity-score">[${match.similarity} - ${scorePercentage}% Match]</span>
                        <p class="similarity-content">${match.content}</p>
                    </div>
                `
            })
            .join('')

        outputSearchSimilarityContainer.innerHTML = htmlString
    } catch (error) {
        console.error(error)
        outputSearchSimilarityContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`
    }
}
