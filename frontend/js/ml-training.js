// ML Training Module
class MLTraining {
    constructor() {
        this.currentModel = 'otolith';
        this.isTraining = false;
        this.trainingInterval = null;
        this.currentEpoch = 0;
        this.totalEpochs = 100;
        this.charts = new Map();

        this.modelData = {
            otolith: {
                name: 'ResNet Otolith Classifier',
                type: 'CNN',
                accuracy: [0.2, 0.4, 0.6, 0.75, 0.82, 0.88, 0.91, 0.942],
                loss: [2.1, 1.8, 1.4, 1.1, 0.8, 0.6, 0.4, 0.32],
                dataset_size: 2500,
                status: 'ready'
            },
            lstm: {
                name: 'LSTM Environmental Predictor',
                type: 'RNN',
                accuracy: [0.3, 0.5, 0.65, 0.75, 0.82, 0.86, 0.89, 0.913],
                loss: [1.9, 1.5, 1.2, 0.9, 0.7, 0.5, 0.4, 0.35],
                dataset_size: 720,
                status: 'training'
            },
            edna: {
                name: 'Random Forest eDNA Classifier',
                type: 'Ensemble',
                accuracy: [0.4, 0.6, 0.75, 0.83, 0.89, 0.92, 0.95, 0.961],
                loss: [1.6, 1.2, 0.9, 0.7, 0.5, 0.4, 0.3, 0.25],
                dataset_size: 500,
                status: 'deployed'
            },
            nlp: {
                name: 'DistilBERT Marine NLP',
                type: 'Transformer',
                accuracy: [0.4, 0.55, 0.68, 0.75, 0.81, 0.85, 0.88, 0.89],
                loss: [1.8, 1.4, 1.1, 0.9, 0.7, 0.6, 0.5, 0.45],
                dataset_size: 5000,
                status: 'fine-tuning'
            }
        };

        this.init();
    }

    init() {
        this.setupModelSelection();
        this.setupTrainingControls();
        this.createTrainingCharts();
        this.updateCurrentMetrics();
        this.initTrainingLogs();
    }

    setupModelSelection() {
        const modelCards = document.querySelectorAll('.model-card');

        modelCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active class from all cards
                modelCards.forEach(c => c.classList.remove('active'));

                // Add active class to clicked card
                card.classList.add('active');

                // Update current model
                this.currentModel = card.dataset.model;
                this.updateChartsForModel();
                this.updateCurrentMetrics();
            });
        });
    }

    setupTrainingControls() {
        const startBtn = document.getElementById('start-training');
        const pauseBtn = document.getElementById('pause-training');
        const stopBtn = document.getElementById('stop-training');
        const evaluateBtn = document.getElementById('evaluate-model');
        const deployBtn = document.getElementById('deploy-model');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTraining());
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseTraining());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopTraining());
        }

        if (evaluateBtn) {
            evaluateBtn.addEventListener('click', () => this.evaluateModel());
        }

        if (deployBtn) {
            deployBtn.addEventListener('click', () => this.deployModel());
        }

        // Configuration controls
        const batchSize = document.getElementById('batch-size');
        const learningRate = document.getElementById('learning-rate');
        const epochs = document.getElementById('epochs');

        if (epochs) {
            epochs.addEventListener('change', (e) => {
                this.totalEpochs = parseInt(e.target.value);
            });
        }
    }

    createTrainingCharts() {
        this.createLossChart();
        this.createAccuracyChart();
    }

    createLossChart() {
        const canvas = document.getElementById('loss-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const modelData = this.modelData[this.currentModel];

        this.charts.set('loss', new Chart(ctx, {
            type: 'line',
            data: {
                labels: modelData.loss.map((_, i) => `Epoch ${i + 1}`),
                datasets: [{
                    label: 'Training Loss',
                    data: modelData.loss,
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { 
                        title: { display: true, text: 'Training Epoch' }
                    },
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'Loss' }
                    }
                }
            }
        }));
    }

    createAccuracyChart() {
        const canvas = document.getElementById('accuracy-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const modelData = this.modelData[this.currentModel];

        this.charts.set('accuracy', new Chart(ctx, {
            type: 'line',
            data: {
                labels: modelData.accuracy.map((_, i) => `Epoch ${i + 1}`),
                datasets: [{
                    label: 'Validation Accuracy',
                    data: modelData.accuracy,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { 
                        title: { display: true, text: 'Training Epoch' }
                    },
                    y: { 
                        min: 0,
                        max: 1,
                        title: { display: true, text: 'Accuracy' }
                    }
                }
            }
        }));
    }

    updateChartsForModel() {
        const modelData = this.modelData[this.currentModel];

        // Update loss chart
        const lossChart = this.charts.get('loss');
        if (lossChart) {
            lossChart.data.datasets[0].data = modelData.loss;
            lossChart.data.labels = modelData.loss.map((_, i) => `Epoch ${i + 1}`);
            lossChart.update();
        }

        // Update accuracy chart
        const accuracyChart = this.charts.get('accuracy');
        if (accuracyChart) {
            accuracyChart.data.datasets[0].data = modelData.accuracy;
            accuracyChart.data.labels = modelData.accuracy.map((_, i) => `Epoch ${i + 1}`);
            accuracyChart.update();
        }
    }

    updateCurrentMetrics() {
        const modelData = this.modelData[this.currentModel];
        const latestAccuracy = modelData.accuracy[modelData.accuracy.length - 1];
        const latestLoss = modelData.loss[modelData.loss.length - 1];

        // Update metric displays
        const currentEpoch = document.getElementById('current-epoch');
        const currentLoss = document.getElementById('current-loss');
        const currentAccuracy = document.getElementById('current-accuracy');

        if (currentEpoch) currentEpoch.textContent = modelData.accuracy.length;
        if (currentLoss) currentLoss.textContent = latestLoss.toFixed(3);
        if (currentAccuracy) currentAccuracy.textContent = (latestAccuracy * 100).toFixed(1) + '%';
    }

    startTraining() {
        if (this.isTraining) return;

        this.isTraining = true;
        this.currentEpoch = 0;

        // Update button states
        this.updateButtonStates();

        // Add initial log
        this.addTrainingLog(`Starting ${this.modelData[this.currentModel].name} training...`);

        // Start training simulation
        this.trainingInterval = setInterval(() => {
            this.simulateTrainingEpoch();
        }, 1000); // 1 second per epoch for demo
    }

    pauseTraining() {
        if (!this.isTraining) return;

        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
            this.trainingInterval = null;
        }

        this.addTrainingLog('Training paused');
        this.updateButtonStates();
    }

    stopTraining() {
        this.isTraining = false;

        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
            this.trainingInterval = null;
        }

        this.addTrainingLog('Training stopped');
        this.updateButtonStates();
    }

    simulateTrainingEpoch() {
        this.currentEpoch++;

        const modelData = this.modelData[this.currentModel];

        // Generate new metrics
        const baseAccuracy = modelData.accuracy[modelData.accuracy.length - 1];
        const baseLoss = modelData.loss[modelData.loss.length - 1];

        const newAccuracy = Math.min(0.98, baseAccuracy + (Math.random() - 0.3) * 0.01);
        const newLoss = Math.max(0.1, baseLoss + (Math.random() - 0.7) * 0.05);

        // Update data
        modelData.accuracy.push(newAccuracy);
        modelData.loss.push(newLoss);

        // Update charts
        this.updateChartsForModel();
        this.updateCurrentMetrics();

        // Update training time
        const trainingTime = document.getElementById('training-time');
        if (trainingTime) {
            const minutes = Math.floor(this.currentEpoch / 60);
            const seconds = this.currentEpoch % 60;
            trainingTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        // Log progress every 10 epochs
        if (this.currentEpoch % 10 === 0) {
            this.addTrainingLog(`Epoch ${this.currentEpoch}/${this.totalEpochs} - Loss: ${newLoss.toFixed(3)}, Accuracy: ${(newAccuracy * 100).toFixed(1)}%`);
        }

        // Check if training is complete
        if (this.currentEpoch >= this.totalEpochs) {
            this.completeTraining();
        }
    }

    completeTraining() {
        this.isTraining = false;

        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
            this.trainingInterval = null;
        }

        const finalAccuracy = this.modelData[this.currentModel].accuracy.slice(-1)[0];
        this.addTrainingLog(`Training completed! Final accuracy: ${(finalAccuracy * 100).toFixed(1)}%`);

        this.updateButtonStates();
        window.bluePulseApp.showAlert('Model training completed successfully!', 'success');
    }

    evaluateModel() {
        this.addTrainingLog(`Evaluating ${this.modelData[this.currentModel].name}...`);

        setTimeout(() => {
            const modelData = this.modelData[this.currentModel];
            const accuracy = modelData.accuracy[modelData.accuracy.length - 1];

            this.addTrainingLog(`Evaluation complete - Accuracy: ${(accuracy * 100).toFixed(1)}%, Dataset size: ${modelData.dataset_size}`);
            window.bluePulseApp.showAlert('Model evaluation completed!', 'info');
        }, 2000);
    }

    deployModel() {
        this.addTrainingLog(`Deploying ${this.modelData[this.currentModel].name} to production...`);

        setTimeout(() => {
            this.modelData[this.currentModel].status = 'deployed';
            this.addTrainingLog(`Model successfully deployed! Endpoint: /api/predict/${this.currentModel}`);
            window.bluePulseApp.showAlert('Model deployed successfully!', 'success');
        }, 3000);
    }

    updateButtonStates() {
        const startBtn = document.getElementById('start-training');
        const pauseBtn = document.getElementById('pause-training');
        const stopBtn = document.getElementById('stop-training');

        if (startBtn) startBtn.disabled = this.isTraining;
        if (pauseBtn) pauseBtn.disabled = !this.isTraining;
        if (stopBtn) stopBtn.disabled = !this.isTraining;
    }

    addTrainingLog(message) {
        const logsContainer = document.getElementById('training-logs');
        if (!logsContainer) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-message">${message}</span>
        `;

        logsContainer.insertBefore(logEntry, logsContainer.firstChild);

        // Keep only last 20 logs
        while (logsContainer.children.length > 20) {
            logsContainer.removeChild(logsContainer.lastChild);
        }

        // Scroll to top
        logsContainer.scrollTop = 0;
    }

    initTrainingLogs() {
        // Add some initial logs
        const initialLogs = [
            'Training system initialized',
            'GPU available: NVIDIA RTX 4090',
            'Datasets loaded and preprocessed',
            'Models ready for training'
        ];

        initialLogs.forEach((log, index) => {
            setTimeout(() => {
                this.addTrainingLog(log);
            }, index * 500);
        });
    }
}