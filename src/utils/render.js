import { createStoreEmbedding, getEmbeddings, searchSimilarity, processChat, processChunk } from '.'

const documents = ['movies.txt', 'podcasts.txt']

export async function renderCreatedEmbeddings() {
    const outputVectorEmbeddingContainer = document.getElementById('output-vector-embeddings')

    try {
        outputVectorEmbeddingContainer.innerHTML = 'Creating and storing...'
        const embeddings = await createStoreEmbedding(documents)
        console.log(embeddings)
        outputVectorEmbeddingContainer.innerHTML = `<div class="success">${embeddings.message}</div>`
    } catch (error) {
        console.error(error)
        outputVectorEmbeddingContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`
    }
}

export async function renderVectorEmbeddings() {
    const outputVectorEmbeddingContainer = document.getElementById('output-vector-embeddings')

    try {
        outputVectorEmbeddingContainer.innerHTML = 'Processing...'

        const vectorEmbeddings = await getEmbeddings()
        if (!vectorEmbeddings.length) {
            outputVectorEmbeddingContainer.innerHTML = '<div>No embeddings found.</div>'
            return
        }

        outputVectorEmbeddingContainer.innerHTML = ''

        // 1. Create a Master Details wrapper for the entire Array
        const masterDetails = document.createElement('details')
        masterDetails.className = 'console-master'

        // The master summary acts as the root line: (10) [{...}, {...}]
        masterDetails.innerHTML = `
            <summary class="console-root">
                (${vectorEmbeddings.length}) [<span>{...}</span>, <span>{...}</span>]
            </summary>
            <div class="master-content"></div>
        `

        const contentContainer = masterDetails.querySelector('.master-content')

        // 2. Process each item inside the array
        vectorEmbeddings.forEach((item, index) => {
            const itemDetails = document.createElement('details')
            itemDetails.className = 'console-item'

            const previewText =
                item.content.length > 45 ? `${item.content.slice(0, 45)}...` : item.content

            const fullEmbedding =
                typeof item.embedding === 'string'
                    ? JSON.parse(item.embedding)
                    : item.embedding || []

            let chunksHTML = ''
            const chunkSize = 100

            for (let i = 0; i < fullEmbedding.length; i += chunkSize) {
                const end = Math.min(i + chunkSize - 1, fullEmbedding.length - 1)

                const sliceData = fullEmbedding.slice(i, end + 1)

                chunksHTML += `
                    <details class="console-chunk">
                        <summary class="chunk-title">
                            [${i} … ${end}]
                        </summary>

                        <div class="chunk-values">
                            ${sliceData
                                .map(
                                    (val, chunkIdx) => `
                                        <div class="property">
                                            <span class="index">
                                                ${i + chunkIdx}:
                                            </span>

                                            <span class="number">
                                                ${val}
                                            </span>
                                        </div>
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
        console.log(matches)

        if (!matches?.length) {
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

export async function renderChunks() {
    const outputChunkContainer = document.getElementById('output-chunk')

    try {
        outputChunkContainer.innerHTML = 'Processing...'

        const chunks = await processChunk(documents)
        console.log(chunks)

        if (!chunks.length) {
            outputChunkContainer.innerHTML = '<div>No chunks found.</div>'
            return
        }

        outputChunkContainer.innerHTML = ''

        // Master wrapper: (41) [{...}, {...}]
        const masterDetails = document.createElement('details')
        masterDetails.className = 'console-master'

        masterDetails.innerHTML = `
            <summary class="console-root">
                (${chunks.length}) [
                <span>{...}</span>,
                <span>{...}</span>
                ]
            </summary>

            <div class="master-content"></div>
        `

        const contentContainer = masterDetails.querySelector('.master-content')

        chunks.forEach((chunk, index) => {
            const itemDetails = document.createElement('details')
            itemDetails.className = 'console-item'

            const content = chunk.pageContent || ''

            const previewText = content.length > 60 ? `${content.slice(0, 60)}...` : content

            itemDetails.innerHTML = `
        <summary>
            <span class="index">${index}:</span>

            <span class="bracket">{</span>

            <span class="key">content</span>:
            <span class="string">
                "${escapeHTML(previewText)}"
            </span>,

            <span class="key">metadata</span>:
            <span class="type">Object</span>

            <span class="bracket">}</span>
        </summary>

        <div class="console-content">

            <div class="property">
                <span class="key">content</span>:
                <span class="string">
                    "${escapeHTML(content)}"
                </span>
            </div>

            ${
                chunk.metadata
                    ? `
                        <details class="console-array">
                            <summary>
                                <span class="key">metadata</span>:
                                <span class="type">Object</span>
                            </summary>

                            <div class="array-chunks">
                                ${Object.entries(chunk.metadata)
                                    .map(
                                        ([key, value]) => `
                                            <div class="property">
                                                <span class="key">
                                                    ${escapeHTML(key)}
                                                </span>:

                                                <span class="string">
                                                    ${escapeHTML(
                                                        typeof value === 'object'
                                                            ? JSON.stringify(value)
                                                            : value,
                                                    )}
                                                </span>
                                            </div>
                                        `,
                                    )
                                    .join('')}
                            </div>
                        </details>
                    `
                    : ''
            }

        </div>
    `

            contentContainer.appendChild(itemDetails)
        })

        outputChunkContainer.appendChild(masterDetails)
    } catch (error) {
        console.error(error)

        outputChunkContainer.innerHTML = `
            <div class="error">
                Error: ${error.message}
            </div>
        `
    }
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

const messagesHistory = []

export async function renderChat() {
    const userInputEl = document.getElementById('chat-input')
    const chatMessagesEl = document.getElementById('chat-messages')
    const openingMessageEl = document.getElementById('opening-message')

    const userMessage = userInputEl.value.trim()

    if (!userMessage) return

    const userMessageEl = document.createElement('div')
    userMessageEl.classList.add('user-chat')
    userMessageEl.textContent = userMessage

    chatMessagesEl.appendChild(userMessageEl)

    const aiMessageEl = document.createElement('div')
    aiMessageEl.classList.add('ai-reply', 'typing')
    aiMessageEl.innerHTML = `
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
    `

    chatMessagesEl.appendChild(aiMessageEl)

    openingMessageEl.classList.add('hidden')

    userInputEl.value = ''

    messagesHistory.push({
        role: 'user',
        content: userMessage,
    })

    try {
        const response = await processChat(userMessage, messagesHistory)

        if (!response) throw new Error('No response received')

        aiMessageEl.textContent = response

        messagesHistory.push({
            role: 'assistant',
            content: response,
        })
    } catch (error) {
        console.error(error)
        aiMessageEl.classList.add('ai-reply')
        aiMessageEl.textContent = `Error: ${error.message}`
    } finally {
        chatMessagesEl.appendChild(userMessageEl)
        chatMessagesEl.appendChild(aiMessageEl)
        aiMessageEl.classList.remove('typing')
    }
}
