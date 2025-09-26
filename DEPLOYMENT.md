# BluePulse ML - Deployment Guide

## Quick Start

### Option 1: Docker (Recommended)
```bash
docker-compose up -d
```
Access at: http://localhost

### Option 2: Manual Setup

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Frontend  
```bash
cd frontend
python -m http.server 3000
```
Access at: http://localhost:3000

## Features Overview

✅ Interactive Species Map with ML predictions
✅ Real-time Oceanographic monitoring (LSTM forecasting)  
✅ eDNA Analysis with Random Forest classification
✅ Otolith AI classification (ResNet-50)
✅ ML Training pipeline with live metrics
✅ Marine AI Assistant (DistilBERT fine-tuned)
✅ Responsive design for all devices
✅ Production-ready Docker deployment

## API Endpoints
- GET /api/health - System status
- POST /api/otolith/classify - Upload & classify otoliths
- GET /api/oceanographic/forecast/{parameter} - Environmental predictions
- POST /api/edna/analyze - Genetic sequence analysis
- POST /api/ml/train/{model_id} - Start model training
- POST /api/ai/chat - Chat with marine AI

## Tech Stack
- **Frontend**: Vanilla JS, Chart.js, CSS Grid
- **Backend**: FastAPI, PyTorch, PostgreSQL
- **ML**: ResNet-50, LSTM, Random Forest, DistilBERT
- **Deployment**: Docker, Nginx, Redis

Ready for SIH 2025 demo! 🚀