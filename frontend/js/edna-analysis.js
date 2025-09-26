// eDNA Analysis Module  
class EDNAAnalysis {
    constructor() {
        this.analysisResults = [];
        this.isAnalyzing = false;
        this.charts = new Map();

        this.init();
    }

    init() {
        this.setupFileUpload();
        this.setupAnalysisControls();
        this.loadSampleData();
    }

    setupFileUpload() {
        const fileInput = document.getElementById('edna-files');
        const uploadBtn = document.querySelector('.upload-btn');
        const uploadArea = document.querySelector('.upload-area');

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => fileInput?.click());
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleFileUpload(files);
            });
        }

        // Drag and drop functionality
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.background = '#e3f2fd';
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.background = '';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.background = '';
                const files = Array.from(e.dataTransfer.files);
                this.handleFileUpload(files);
            });
        }
    }

    setupAnalysisControls() {
        const startBtn = document.getElementById('start-analysis');
        const geneSelect = document.getElementById('gene-target');
        const analysisSelect = document.getElementById('analysis-type');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startAnalysis());
        }
    }

    handleFileUpload(files) {
        const validExtensions = ['.fasta', '.fastq', '.fa', '.fq'];
        const validFiles = files.filter(file => {
            return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        });

        if (validFiles.length === 0) {
            window.bluePulseApp.showAlert('Please upload valid sequence files (.fasta, .fastq, .fa, .fq)', 'warning');
            return;
        }

        // Update upload area to show uploaded files
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.innerHTML = `
            <div class="upload-icon">✅</div>
            <h3>${validFiles.length} Files Uploaded</h3>
            <div class="file-list">
                ${validFiles.map(file => `
                    <div class="file-item">
                        <span>📄 ${file.name}</span>
                        <span class="file-size">(${this.formatFileSize(file.size)})</span>
                    </div>
                `).join('')}
            </div>
            <button class="upload-btn">Upload More Files</button>
        `;

        // Re-attach upload functionality
        uploadArea.querySelector('.upload-btn').addEventListener('click', () => {
            document.getElementById('edna-files').click();
        });

        window.bluePulseApp.showAlert(`${validFiles.length} sequence files ready for analysis`, 'success');
    }

    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    async startAnalysis() {
        if (this.isAnalyzing) return;

        this.isAnalyzing = true;
        const startBtn = document.getElementById('start-analysis');

        if (startBtn) {
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }

        try {
            window.bluePulseApp.showLoading();

            // Simulate analysis steps
            await this.simulateAnalysis();

            // Update results
            this.displayResults();
            this.createResultCharts();

            window.bluePulseApp.showAlert('eDNA analysis completed successfully!', 'success');
        } catch (error) {
            console.error('Analysis failed:', error);
            window.bluePulseApp.showAlert('Analysis failed. Please try again.', 'danger');
        } finally {
            this.isAnalyzing = false;
            window.bluePulseApp.hideLoading();

            if (startBtn) {
                startBtn.disabled = false;
                startBtn.innerHTML = '<i class="fas fa-microscope"></i> Start Analysis';
            }
        }
    }

    async simulateAnalysis() {
        const steps = [
            'Processing sequence files...',
            'Quality control and filtering...',
            'Taxonomic classification (Random Forest)...',
            'Biodiversity assessment...',
            'Generating phylogenetic relationships...',
            'Compiling results...'
        ];

        for (let i = 0; i < steps.length; i++) {
            console.log(steps[i]);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Generate mock results
        this.analysisResults = this.generateMockResults();
    }

    generateMockResults() {
        const marineSpecies = [
            { name: 'Indian Oil Sardine', scientific: 'Sardinella longiceps', type: 'Fish', status: 'LC' },
            { name: 'Green Sawfish', scientific: 'Pristis zijsron', type: 'Fish', status: 'CR' },
            { name: 'Malabar Grouper', scientific: 'Epinephelus malabaricus', type: 'Fish', status: 'EN' },
            { name: 'Indian Mackerel', scientific: 'Rastrelliger kanagurta', type: 'Fish', status: 'LC' },
            { name: 'Mud Crab', scientific: 'Scylla serrata', type: 'Crustacean', status: 'LC' },
            { name: 'Indian Prawn', scientific: 'Fenneropenaeus indicus', type: 'Crustacean', status: 'LC' },
            { name: 'Pearl Oyster', scientific: 'Pinctada radiata', type: 'Mollusk', status: 'NT' },
            { name: 'Green Mussel', scientific: 'Perna viridis', type: 'Mollusk', status: 'LC' },
            { name: 'Sea Cucumber', scientific: 'Holothuria scabra', type: 'Echinoderm', status: 'EN' },
            { name: 'Coral Polyp', scientific: 'Acropora cervicornis', type: 'Cnidarian', status: 'CR' }
        ];

        return marineSpecies.map((species, index) => ({
            ...species,
            confidence: Math.floor(75 + Math.random() * 24), // 75-98%
            abundance: Math.floor(Math.random() * 500) + 10,
            readCount: Math.floor(Math.random() * 10000) + 100,
            occurrence: Math.random() * 100
        })).sort((a, b) => b.confidence - a.confidence);
    }

    displayResults() {
        // Update summary cards
        const summaryCards = document.querySelectorAll('.summary-card .summary-number');
        if (summaryCards.length >= 3) {
            summaryCards[0].textContent = '287'; // Families
            summaryCards[1].textContent = this.analysisResults.filter(r => r.type === 'Fish').length;
            summaryCards[2].textContent = '96%'; // Accuracy
        }

        // Update results table
        const tbody = document.getElementById('species-tbody');
        if (tbody) {
            tbody.innerHTML = this.analysisResults.map(species => `
                <tr>
                    <td style="font-weight: 500;">${species.name}</td>
                    <td style="font-style: italic; color: #666;">${species.scientific}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div class="progress" style="width: 60px; height: 6px;">
                                <div class="progress-bar" style="width: ${species.confidence}%;"></div>
                            </div>
                            <span style="font-weight: 600;">${species.confidence}%</span>
                        </div>
                    </td>
                    <td style="font-weight: 500;">${species.abundance}</td>
                    <td>
                        <span class="status-badge ${species.status.toLowerCase()}">${species.status}</span>
                    </td>
                </tr>
            `).join('');
        }
    }

    createResultCharts() {
        this.createTaxonomyChart();
        this.createBiodiversityChart();
    }

    createTaxonomyChart() {
        const canvas = document.getElementById('taxonomy-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Group by type
        const typeCount = this.analysisResults.reduce((acc, species) => {
            acc[species.type] = (acc[species.type] || 0) + 1;
            return acc;
        }, {});

        this.charts.set('taxonomy', new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCount),
                datasets: [{
                    data: Object.values(typeCount),
                    backgroundColor: [
                        '#4caf50', '#2196f3', '#ff9800', 
                        '#9c27b0', '#00bcd4', '#795548'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    title: {
                        display: true,
                        text: 'Species Distribution by Taxonomic Group'
                    }
                }
            }
        }));
    }

    createBiodiversityChart() {
        const canvas = document.getElementById('biodiversity-index-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Generate biodiversity index over time (Shannon diversity)
        const timePoints = [];
        const diversityIndex = [];

        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - i));
            timePoints.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));

            // Simulate diversity index (2.0-4.5)
            const baseIndex = 3.2;
            const seasonal = Math.sin(i * Math.PI / 6) * 0.8;
            const noise = (Math.random() - 0.5) * 0.4;
            diversityIndex.push(baseIndex + seasonal + noise);
        }

        this.charts.set('biodiversity', new Chart(ctx, {
            type: 'line',
            data: {
                labels: timePoints,
                datasets: [{
                    label: 'Shannon Diversity Index',
                    data: diversityIndex,
                    borderColor: '#00bcd4',
                    backgroundColor: 'rgba(0, 188, 212, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Biodiversity Index Trend (12 months)'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time Period'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Shannon Index'
                        },
                        min: 1.5,
                        max: 4.5
                    }
                }
            }
        }));
    }

    loadSampleData() {
        // Add button to load sample data
        const sampleBtn = document.createElement('button');
        sampleBtn.className = 'btn btn-secondary';
        sampleBtn.innerHTML = '<i class="fas fa-database"></i> Load Sample Data';
        sampleBtn.style.marginLeft = '10px';

        sampleBtn.addEventListener('click', () => {
            this.analysisResults = this.generateMockResults();
            this.displayResults();
            this.createResultCharts();
            window.bluePulseApp.showAlert('Sample eDNA data loaded successfully!', 'info');
        });

        const analysisOptions = document.querySelector('.analysis-options');
        if (analysisOptions) {
            analysisOptions.appendChild(sampleBtn);
        }
    }
}