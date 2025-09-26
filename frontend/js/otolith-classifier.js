// Otolith Classifier Module
class OtolithClassifier {
    constructor() {
        this.currentImage = null;
        this.isClassifying = false;
        this.sampleSpecies = [
            { scientific: "Rastrelliger kanagurta", common: "Indian Mackerel", confidence: 96.7, length: 15.2, width: 12.8, circularity: 0.847, age: 3 },
            { scientific: "Sardinella longiceps", common: "Indian Oil Sardine", confidence: 92.3, length: 12.8, width: 9.6, circularity: 0.782, age: 2 },
            { scientific: "Scomberomorus commerson", common: "Spanish Mackerel", confidence: 89.4, length: 18.5, width: 15.2, circularity: 0.698, age: 4 }
        ];

        this.init();
    }

    init() {
        this.setupImageUpload();
        this.setupClassificationControls();
    }

    setupImageUpload() {
        const fileInput = document.getElementById('otolith-file');
        const uploadBtn = document.getElementById('upload-btn');
        const sampleBtn = document.getElementById('sample-btn');
        const imagePreview = document.getElementById('image-preview');

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => fileInput?.click());
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file);
                }
            });
        }

        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => this.loadSampleImage());
        }

        // Drag and drop
        if (imagePreview) {
            imagePreview.addEventListener('dragover', (e) => {
                e.preventDefault();
                imagePreview.style.border = '3px dashed #0277bd';
            });

            imagePreview.addEventListener('dragleave', () => {
                imagePreview.style.border = '';
            });

            imagePreview.addEventListener('drop', (e) => {
                e.preventDefault();
                imagePreview.style.border = '';
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleImageUpload(files[0]);
                }
            });
        }
    }

    setupClassificationControls() {
        const classifyBtn = document.getElementById('classify-btn');

        if (classifyBtn) {
            classifyBtn.addEventListener('click', () => this.classifyImage());
        }
    }

    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            window.bluePulseApp.showAlert('Please upload a valid image file', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayImage(e.target.result);
            this.currentImage = file;
        };
        reader.readAsDataURL(file);
    }

    loadSampleImage() {
        // Create a sample SVG otolith image
        const svgData = `
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="otolithGrad" cx="50%" cy="50%">
                        <stop offset="0%" style="stop-color:#e8f4f8;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#b3d9e8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#0277bd;stop-opacity:0.8" />
                    </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="#f0f8ff"/>
                <ellipse cx="150" cy="100" rx="80" ry="60" fill="url(#otolithGrad)" stroke="#01579b" stroke-width="2"/>
                <ellipse cx="150" cy="100" rx="50" ry="35" fill="rgba(1,87,155,0.3)"/>
                <path d="M120,100 Q150,80 180,100 Q150,120 120,100" fill="rgba(1,87,155,0.5)"/>
                <text x="150" y="180" text-anchor="middle" fill="#0277bd" font-size="12" font-weight="bold">Sample Otolith</text>
            </svg>
        `;

        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);

        this.displayImage(svgUrl);
        this.currentImage = { name: 'sample_otolith.svg', type: 'image/svg+xml' };
    }

    displayImage(imageSrc) {
        const placeholder = document.querySelector('.preview-placeholder');
        const uploadedImage = document.getElementById('uploaded-image');

        if (placeholder) placeholder.style.display = 'none';
        if (uploadedImage) {
            uploadedImage.src = imageSrc;
            uploadedImage.style.display = 'block';
            uploadedImage.style.maxWidth = '100%';
            uploadedImage.style.maxHeight = '100%';
            uploadedImage.style.objectFit = 'contain';
        }

        // Enable classify button
        const classifyBtn = document.getElementById('classify-btn');
        if (classifyBtn) {
            classifyBtn.disabled = false;
            classifyBtn.style.opacity = '1';
        }
    }

    async classifyImage() {
        if (!this.currentImage || this.isClassifying) return;

        this.isClassifying = true;
        const classifyBtn = document.getElementById('classify-btn');

        if (classifyBtn) {
            classifyBtn.disabled = true;
            classifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }

        try {
            window.bluePulseApp.showLoading();

            // Simulate API call to backend
            const result = await this.performClassification();

            this.displayResults(result);
            window.bluePulseApp.showAlert('Otolith classification completed!', 'success');

        } catch (error) {
            console.error('Classification failed:', error);
            window.bluePulseApp.showAlert('Classification failed. Please try again.', 'danger');
        } finally {
            this.isClassifying = false;
            window.bluePulseApp.hideLoading();

            if (classifyBtn) {
                classifyBtn.disabled = false;
                classifyBtn.innerHTML = '<i class="fas fa-brain"></i> Classify Specimen';
            }
        }
    }

    async performClassification() {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Return random species from sample data
        const randomSpecies = this.sampleSpecies[Math.floor(Math.random() * this.sampleSpecies.length)];

        // Add some variation to the results
        const variation = (Math.random() - 0.5) * 0.2;

        return {
            species: {
                scientific: randomSpecies.scientific,
                common: randomSpecies.common
            },
            confidence: Math.max(75, Math.min(98, randomSpecies.confidence + variation * 10)),
            morphometric: {
                length: (randomSpecies.length + variation).toFixed(1),
                width: (randomSpecies.width + variation * 0.8).toFixed(1),
                circularity: (randomSpecies.circularity + variation * 0.1).toFixed(3),
                age: Math.max(1, Math.round(randomSpecies.age + variation))
            },
            processing: {
                features_extracted: 2048,
                inference_time_ms: 247 + Math.floor(Math.random() * 100),
                model: "ResNet-50",
                accuracy: "94.2%",
                timestamp: new Date().toISOString()
            }
        };
    }

    displayResults(result) {
        const resultsContainer = document.getElementById('classification-results');
        if (!resultsContainer) return;

        // Update species information
        const speciesName = document.getElementById('predicted-species');
        const commonName = document.getElementById('common-name');
        const confidence = document.getElementById('confidence');

        if (speciesName) speciesName.textContent = result.species.scientific;
        if (commonName) commonName.textContent = result.species.common;
        if (confidence) confidence.textContent = `${result.confidence.toFixed(1)}%`;

        // Update morphometric data
        const length = document.getElementById('length');
        const width = document.getElementById('width');
        const circularity = document.getElementById('circularity');
        const age = document.getElementById('age');

        if (length) length.textContent = `${result.morphometric.length} ± 0.1 mm`;
        if (width) width.textContent = `${result.morphometric.width} ± 0.1 mm`;
        if (circularity) circularity.textContent = result.morphometric.circularity;
        if (age) age.textContent = `${result.morphometric.age} ± 0.5 years`;

        // Show results panel
        resultsContainer.style.display = 'block';

        // Add animation
        resultsContainer.style.opacity = '0';
        resultsContainer.style.transform = 'translateY(20px)';

        setTimeout(() => {
            resultsContainer.style.transition = 'all 0.5s ease';
            resultsContainer.style.opacity = '1';
            resultsContainer.style.transform = 'translateY(0)';
        }, 100);

        // Log processing details
        console.log('Classification completed:', {
            species: result.species.scientific,
            confidence: result.confidence,
            processing_time: result.processing.inference_time_ms + 'ms'
        });
    }
}