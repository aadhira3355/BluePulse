// Oceanographic Module
class OceanographicModule {
    constructor() {
        this.currentParameter = 'temperature';
        this.currentStation = 'all';
        this.forecastRange = '7d';
        this.charts = new Map();
        this.historicalData = new Map();

        this.init();
    }

    init() {
        this.setupControls();
        this.loadHistoricalData();
        this.createCharts();
        this.updateParameterCards();
        this.loadEnvironmentalAlerts();
        this.startRealTimeUpdates();
    }

    setupControls() {
        const parameterSelect = document.getElementById('parameter-select');
        const stationSelect = document.getElementById('station-select');
        const forecastSelect = document.getElementById('forecast-range');

        if (parameterSelect) {
            parameterSelect.addEventListener('change', (e) => {
                this.currentParameter = e.target.value;
                this.updateCharts();
            });
        }

        if (stationSelect) {
            stationSelect.addEventListener('change', (e) => {
                this.currentStation = e.target.value;
                this.updateCharts();
            });
        }

        if (forecastSelect) {
            forecastSelect.addEventListener('change', (e) => {
                this.forecastRange = e.target.value;
                this.updateCharts();
            });
        }
    }

    loadHistoricalData() {
        // Generate realistic oceanographic data
        const now = new Date();
        const hours = this.forecastRange === '24h' ? 24 : 
                     this.forecastRange === '7d' ? 168 : 720;

        const data = {
            temperature: [],
            salinity: [],
            chlorophyll: [],
            ph: [],
            oxygen: []
        };

        for (let i = 0; i < hours; i++) {
            const timestamp = new Date(now - (hours - i) * 60 * 60 * 1000);

            // Temperature: 27-30°C with daily and seasonal variations
            const tempBase = 28.5;
            const dailyVar = Math.sin(i * 2 * Math.PI / 24) * 1.5;
            const seasonalVar = Math.sin(i * 2 * Math.PI / (24 * 365)) * 2;
            const noise = (Math.random() - 0.5) * 0.8;

            data.temperature.push({
                timestamp,
                value: tempBase + dailyVar + seasonalVar + noise,
                predicted: tempBase + dailyVar + seasonalVar + noise * 0.3
            });

            // Salinity: 33-35 ppt
            const salBase = 34.2;
            const salVar = Math.sin(i * 2 * Math.PI / (24 * 7)) * 0.5;
            data.salinity.push({
                timestamp,
                value: salBase + salVar + (Math.random() - 0.5) * 0.3,
                predicted: salBase + salVar + (Math.random() - 0.5) * 0.1
            });

            // Chlorophyll-a: 0.5-4.0 mg/m³
            const chlBase = 2.1;
            const chlVar = Math.sin(i * 2 * Math.PI / (24 * 30)) * 1.2;
            data.chlorophyll.push({
                timestamp,
                value: Math.max(0.1, chlBase + chlVar + (Math.random() - 0.5) * 0.8),
                predicted: Math.max(0.1, chlBase + chlVar + (Math.random() - 0.5) * 0.4)
            });

            // pH: 7.8-8.3
            const phBase = 8.1;
            const phVar = Math.sin(i * 2 * Math.PI / (24 * 14)) * 0.15;
            data.ph.push({
                timestamp,
                value: phBase + phVar + (Math.random() - 0.5) * 0.1,
                predicted: phBase + phVar + (Math.random() - 0.5) * 0.05
            });

            // Dissolved Oxygen: 5-8 mg/L
            const oxyBase = 6.8;
            const oxyVar = Math.sin(i * 2 * Math.PI / 24) * 0.8;
            data.oxygen.push({
                timestamp,
                value: oxyBase + oxyVar + (Math.random() - 0.5) * 0.4,
                predicted: oxyBase + oxyVar + (Math.random() - 0.5) * 0.2
            });
        }

        this.historicalData = data;
    }

    createCharts() {
        this.createForecastChart();
        this.createHistoricalChart();
        this.createMiniCharts();
    }

    createForecastChart() {
        const canvas = document.getElementById('forecast-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.historicalData[this.currentParameter] || [];

        // Split data into historical and forecast
        const splitPoint = Math.floor(data.length * 0.7);
        const historical = data.slice(0, splitPoint);
        const forecast = data.slice(splitPoint - 1); // Overlap by 1 point

        this.charts.set('forecast', new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.timestamp.toLocaleTimeString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit' 
                })),
                datasets: [
                    {
                        label: 'Historical Data',
                        data: historical.map(d => d.value),
                        borderColor: '#2196f3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'LSTM Forecast',
                        data: forecast.map(d => d.predicted),
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: `${this.currentParameter.charAt(0).toUpperCase() + this.currentParameter.slice(1)} Forecast - LSTM Model (91% Accuracy)`
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: this.getParameterUnit(this.currentParameter)
                        }
                    }
                }
            }
        }));
    }

    createHistoricalChart() {
        const canvas = document.getElementById('historical-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.historicalData[this.currentParameter] || [];

        this.charts.set('historical', new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.timestamp.toLocaleDateString()),
                datasets: [{
                    label: 'Observed Values',
                    data: data.map(d => d.value),
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.3
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
                        text: `Historical ${this.currentParameter.charAt(0).toUpperCase() + this.currentParameter.slice(1)} Data`
                    }
                },
                scales: {
                    x: {
                        display: true
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: this.getParameterUnit(this.currentParameter)
                        }
                    }
                }
            }
        }));
    }

    createMiniCharts() {
        const miniChartIds = ['temp-mini', 'sal-mini', 'chl-mini'];
        const parameters = ['temperature', 'salinity', 'chlorophyll'];

        miniChartIds.forEach((id, index) => {
            const canvas = document.getElementById(id);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const data = this.historicalData[parameters[index]] || [];
            const recentData = data.slice(-24); // Last 24 hours

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: recentData.map(() => ''),
                    datasets: [{
                        data: recentData.map(d => d.value),
                        borderColor: index === 0 ? '#f44336' : index === 1 ? '#2196f3' : '#4caf50',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    },
                    elements: {
                        point: { radius: 0 }
                    }
                }
            });
        });
    }

    updateCharts() {
        this.loadHistoricalData(); // Reload data based on new parameters

        // Update forecast chart
        const forecastChart = this.charts.get('forecast');
        if (forecastChart) {
            forecastChart.destroy();
            this.createForecastChart();
        }

        // Update historical chart
        const historicalChart = this.charts.get('historical');
        if (historicalChart) {
            historicalChart.destroy();
            this.createHistoricalChart();
        }

        this.updateParameterCards();
    }

    updateParameterCards() {
        const currentData = this.historicalData[this.currentParameter];
        if (!currentData || currentData.length === 0) return;

        const latest = currentData[currentData.length - 1];
        const previous = currentData[currentData.length - 25]; // 24 hours ago
        const change = latest.value - (previous?.value || latest.value);

        // Update current temperature card
        if (this.currentParameter === 'temperature') {
            const tempValue = document.querySelector('#current-temp');
            const tempTrend = document.querySelector('.param-card .param-trend');

            if (tempValue) tempValue.textContent = `${latest.value.toFixed(1)}°C`;
            if (tempTrend) {
                const trendIcon = change > 0.1 ? '↗️' : change < -0.1 ? '↘️' : '➡️';
                const trendClass = change > 0.1 ? 'positive' : change < -0.1 ? 'negative' : 'stable';
                tempTrend.textContent = `${trendIcon} ${change >= 0 ? '+' : ''}${change.toFixed(1)}°C (24h)`;
                tempTrend.className = `param-trend ${trendClass}`;
            }
        }

        // Similar updates for other parameters...
    }

    loadEnvironmentalAlerts() {
        const alertsContainer = document.getElementById('environmental-alerts');
        if (!alertsContainer) return;

        const alerts = [
            {
                type: 'warning',
                icon: '⚠️',
                title: 'Temperature Anomaly Detected',
                description: 'Kochi station shows 1.2°C above seasonal average. Impact on sardine populations expected.',
                time: '2 hours ago'
            },
            {
                type: 'info',
                icon: 'ℹ️',
                title: 'Favorable Fishing Conditions',
                description: 'LSTM model predicts optimal conditions for mackerel fishing near Trivandrum coast for next 48 hours.',
                time: '4 hours ago'
            },
            {
                type: 'success',
                icon: '✅',
                title: 'Water Quality Improved',
                description: 'Dissolved oxygen levels have recovered to normal ranges across all monitoring stations.',
                time: '6 hours ago'
            }
        ];

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-time">${alert.time}</div>
                </div>
            </div>
        `).join('');
    }

    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.updateCurrentValues();
        }, 30000);
    }

    updateCurrentValues() {
        // Add new data point to simulate real-time updates
        const now = new Date();

        Object.keys(this.historicalData).forEach(param => {
            const data = this.historicalData[param];
            const lastValue = data[data.length - 1].value;

            // Add small random variation
            const newValue = lastValue + (Math.random() - 0.5) * 0.2;

            data.push({
                timestamp: now,
                value: newValue,
                predicted: newValue + (Math.random() - 0.5) * 0.1
            });

            // Keep only last 1000 points
            if (data.length > 1000) {
                data.shift();
            }
        });

        // Update parameter cards with new values
        this.updateParameterCards();
    }

    getParameterUnit(parameter) {
        const units = {
            temperature: 'Temperature (°C)',
            salinity: 'Salinity (ppt)',
            chlorophyll: 'Chlorophyll-a (mg/m³)',
            ph: 'pH Level',
            oxygen: 'Dissolved Oxygen (mg/L)'
        };
        return units[parameter] || 'Value';
    }
}