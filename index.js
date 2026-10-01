import { pipeline, env } from '@xenova/transformers'

// Disable local model lookup — fetch directly from HuggingFace
env.allowLocalModels = false

// Reference the HTML elements that we will need
const status = document.getElementById('status')
const image = document.getElementById('image')
const detectObjectsButton = document.getElementById('detect-objects')
const imageContainer = document.getElementById('image-container')
const uploadBtn = document.getElementById('upload-btn')
const fileInput = document.getElementById('file-input')
const dropArea = document.getElementById('drop-area')

// Create a new object detection pipeline
status.textContent = 'Loading model...'
const detector = await pipeline('object-detection', 'Xenova/yolos-tiny')

// Enable buttons once model is ready
uploadBtn.disabled = false
detectObjectsButton.disabled = false
status.textContent = 'Ready — upload an image or use the default'

// ── Upload from device ──────────────────────────────────────────────
uploadBtn.addEventListener('click', () => fileInput.click())

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]
    if (file) loadImageFile(file)
})

// ── Drag and Drop ───────────────────────────────────────────────────
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropArea.classList.add('drag-over')
})

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('drag-over')
})

dropArea.addEventListener('drop', (e) => {
    e.preventDefault()
    dropArea.classList.remove('drag-over')
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) loadImageFile(file)
})

// ── Load image into the <img> tag ───────────────────────────────────
function loadImageFile(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
        // Clear any previous bounding boxes
        clearBoxes()
        image.src = e.target.result
        status.textContent = 'Image loaded — click Detect Objects!'
    }
    reader.readAsDataURL(file)
}

// ── Detect on click ─────────────────────────────────────────────────
detectObjectsButton.addEventListener('click', detectAndDrawObjects)

async function detectAndDrawObjects() {
    clearBoxes()
    status.textContent = 'Detecting...'
    const detectedObjects = await detector(image.src, {
        threshold: 0.95,
        percentage: true
    })

    status.textContent = 'Drawing...'
    detectedObjects.forEach(obj => drawObjectBox(obj))

    status.textContent = `Done! Found ${detectedObjects.length} object${detectedObjects.length !== 1 ? 's' : ''}`
}

// ── Clear previous boxes ────────────────────────────────────────────
function clearBoxes() {
    const boxes = imageContainer.querySelectorAll('.bounding-box')
    boxes.forEach(b => b.remove())
}

// ── Draw a bounding box ─────────────────────────────────────────────
// ⚠️ This function requires box coordinates to be in percentages
function drawObjectBox(detectedObject) {
    const { label, score, box } = detectedObject
    const { xmax, xmin, ymax, ymin } = box

    const color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, 0)

    const boxElement = document.createElement('div')
    boxElement.className = 'bounding-box'
    Object.assign(boxElement.style, {
        borderColor: color,
        left: 100 * xmin + '%',
        top: 100 * ymin + '%',
        width: 100 * (xmax - xmin) + '%',
        height: 100 * (ymax - ymin) + '%',
    })

    const labelElement = document.createElement('span')
    labelElement.textContent = `${label}: ${Math.floor(score * 100)}%`
    labelElement.className = 'bounding-box-label'
    labelElement.style.backgroundColor = color

    boxElement.appendChild(labelElement)
    imageContainer.appendChild(boxElement)
}