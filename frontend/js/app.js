// BluePulse ML Platform - Main Application
class BluePulseApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.apiBaseUrl = 'http://localhost:8000/api';
        this.isTraining = false;
        this.models = new Map();
        this.charts = new Map();

        this.init();
    }

    init() {
        this.initNavigation();
        this.initNotifications();
        this.initGlobalHandlers();
        this.loadInitialData();

        console.log('BluePulse ML Platform initialized');
    }

    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const actionCards = document.querySelectorAll('.action-card');

        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const section = button.dataset.section;
                this.navigateToSection(section);
            });
        });

        actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const section = card.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });
    }

    navigateToSection(sectionId) {
        // Update navigation state
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Update content visibility
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        this.currentSection = sectionId;

        // Trigger section-specific initialization
        this.initializeSection(sectionId);
    }

    initializeSection(sectionId) {
        switch(sectionId) {
            case 'species-map':
                if (typeof SpeciesMap !== 'undefined') {
                    window.speciesMapModule = new SpeciesMap();
                }
                break;
            case 'oceanographic':
                if (typeof OceanographicModule !== 'undefined') {
                    window.oceanographicModule = new OceanographicModule();
                }
                break;
            case 'edna-analysis':
                if (typeof EDNAAnalysis !== 'undefined') {
                    window.ednaModule = new EDNAAnalysis();
                }
                break;
            case 'otolith-classifier':
                if (typeof OtolithClassifier !== 'undefined') {
                    window.otolithModule = new OtolithClassifier();
                }
                break;
            case 'ml-training':
                if (typeof MLTraining !== 'undefined') {
                    window.mlTrainingModule = new MLTraining();
                }
                break;
            case 'ai-assistant':
                if (typeof AIAssistant !== 'undefined') {
                    window.aiAssistantModule = new AIAssistant();
                }
                break;
        }
    }

    initNotifications() {
        const notificationBtn = document.getElementById('notifications-btn');
        const notificationPanel = document.getElementById('notification-panel');
        const closeBtn = document.getElementById('close-notifications');

        notificationBtn.addEventListener('click', () => {
            notificationPanel.classList.add('open');
        });

        closeBtn.addEventListener('click', () => {
            notificationPanel.classList.remove('open');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationPanel.classList.remove('open');
            }
        });
    }

    initGlobalHandlers() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showAlert('An error occurred. Please refresh the page if issues persist.', 'danger');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateToSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateToSection('species-map');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateToSection('oceanographic');
                        break;
                }
            }
        });
    }

    async loadInitialData() {
        try {
            this.showLoading();

            // Load dashboard data
            await this.updateDashboardKPIs();

            this.hideLoading();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.hideLoading();
        }
    }

    async updateDashboardKPIs() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/dashboard/stats`);
            if (!response.ok) {
                // Use mock data if API is not available
                this.updateKPIsWithMockData();
                return;
            }

            const data = await response.json();
            this.updateKPIsWithData(data);
        } catch (error) {
            console.warn('API not available, using mock data');
            this.updateKPIsWithMockData();
        }
    }

    updateKPIsWithMockData() {
        const mockData = {
            totalSpecies: 5247,
            aiModels: 8,
            monitoringStations: 15,
            predictionsToday: 1847
        };
        this.updateKPIsWithData(mockData);
    }

    updateKPIsWithData(data) {
        const elements = {
            'total-species': data.totalSpecies,
            'ai-models': data.aiModels,
            'monitoring-stations': data.monitoringStations,
            'predictions-today': data.predictionsToday
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateValue(element, 0, value, 2000);
            }
        });
    }

    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const diff = end - start;

        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.floor(start + (diff * this.easeOutCubic(progress)));
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };

        requestAnimationFrame(updateValue);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type}`;
        alertContainer.innerHTML = `
            <div class="alert-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div>${message}</div>
            <button class="alert-close">&times;</button>
        `;

        document.body.appendChild(alertContainer);

        // Position alert
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.right = '20px';
        alertContainer.style.zIndex = '2000';
        alertContainer.style.minWidth = '300px';
        alertContainer.style.maxWidth = '500px';

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertContainer.parentNode) {
                alertContainer.remove();
            }
        }, 5000);

        // Manual close
        alertContainer.querySelector('.alert-close').addEventListener('click', () => {
            alertContainer.remove();
        });
    }

    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw error;
        }
    }
}

// Utility functions
const utils = {
    formatNumber: (num) => {
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    },

    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bluePulseApp = new BluePulseApp();
});