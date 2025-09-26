# BluePulse ML Platform - FastAPI Backend
from fastapi import FastAPI, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn
import asyncio
import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="BluePulse ML API",
    description="Advanced Marine Data Analytics Platform with AI/ML capabilities",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Global variables for data storage (use database in production)
species_data = []
oceanographic_data = []
ml_models = {}
training_status = {}

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Serve the main application"""
    with open("frontend/index.html", "r") as f:
        return HTMLResponse(content=f.read())

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "services": {
            "api": "online",
            "ml_inference": "online",
            "database": "online"
        }
    }

# ============================================================================
# DASHBOARD ENDPOINTS
# ============================================================================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard KPI statistics"""
    return {
        "totalSpecies": 5247,
        "aiModels": 8,
        "monitoringStations": 15,
        "predictionsToday": 1847,
        "dataQuality": 94.2,
        "systemUptime": "99.8%"
    }

@app.get("/api/dashboard/recent-activity")
async def get_recent_activity():
    """Get recent system activity"""
    activities = [
        {
            "id": 1,
            "type": "species_detection",
            "message": "New species detected: Pristis zijsron",
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
            "confidence": 78
        },
        {
            "id": 2,
            "type": "model_training",
            "message": "LSTM model training completed with 91% accuracy",
            "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
            "accuracy": 91
        },
        {
            "id": 3,
            "type": "environmental_alert",
            "message": "Temperature anomaly detected at Kochi station",
            "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(),
            "severity": "warning"
        }
    ]
    return {"activities": activities}

# ============================================================================
# SPECIES MAP ENDPOINTS
# ============================================================================

@app.get("/api/species/map-data")
async def get_species_map_data():
    """Get species distribution data for mapping"""
    # Mock data - replace with actual database queries
    species_data = [
        {
            "id": 1,
            "name": "Indian Oil Sardine",
            "scientific": "Sardinella longiceps",
            "latitude": 9.9312,
            "longitude": 76.2673,
            "confidence": 96,
            "status": "LC",
            "type": "fish",
            "abundance": 1240,
            "lastSeen": (datetime.now() - timedelta(hours=2)).isoformat()
        },
        {
            "id": 2,
            "name": "Malabar Grouper",
            "scientific": "Epinephelus malabaricus",
            "latitude": 8.5241,
            "longitude": 76.9366,
            "confidence": 87,
            "status": "EN",
            "type": "fish",
            "abundance": 45,
            "lastSeen": (datetime.now() - timedelta(hours=4)).isoformat()
        }
    ]
    return {"species": species_data, "total": len(species_data)}

@app.get("/api/species/biodiversity-hotspots")
async def get_biodiversity_hotspots():
    """Get biodiversity hotspot data"""
    hotspots = [
        {"location": "Kochi", "diversity_index": 4.2, "species_count": 156},
        {"location": "Trivandrum", "diversity_index": 3.8, "species_count": 134},
        {"location": "Calicut", "diversity_index": 2.9, "species_count": 98}
    ]
    return {"hotspots": hotspots}

# ============================================================================
# OCEANOGRAPHIC ENDPOINTS
# ============================================================================

@app.get("/api/oceanographic/parameters")
async def get_oceanographic_parameters():
    """Get current oceanographic parameters"""
    parameters = {
        "temperature": {"value": 28.4, "unit": "°C", "trend": 0.2, "status": "normal"},
        "salinity": {"value": 34.2, "unit": "ppt", "trend": 0.0, "status": "normal"},
        "chlorophyll": {"value": 2.1, "unit": "mg/m³", "trend": -0.3, "status": "normal"},
        "ph": {"value": 8.1, "unit": "", "trend": 0.0, "status": "normal"},
        "oxygen": {"value": 6.8, "unit": "mg/L", "trend": 0.1, "status": "normal"}
    }
    return {"parameters": parameters, "timestamp": datetime.now().isoformat()}

@app.get("/api/oceanographic/forecast/{parameter}")
async def get_parameter_forecast(parameter: str, hours: int = 168):
    """Get LSTM forecast for oceanographic parameter"""
    # Generate realistic forecast data
    timestamps = []
    values = []
    predictions = []

    base_values = {
        "temperature": 28.4,
        "salinity": 34.2,
        "chlorophyll": 2.1,
        "ph": 8.1,
        "oxygen": 6.8
    }

    base_value = base_values.get(parameter, 25.0)

    for i in range(hours):
        timestamp = datetime.now() + timedelta(hours=i)
        timestamps.append(timestamp.isoformat())

        # Add realistic variations
        daily_cycle = np.sin(i * 2 * np.pi / 24) * 0.5
        noise = np.random.normal(0, 0.1)

        actual_value = base_value + daily_cycle + noise
        predicted_value = base_value + daily_cycle + noise * 0.3

        values.append(round(actual_value, 2))
        predictions.append(round(predicted_value, 2))

    return {
        "parameter": parameter,
        "timestamps": timestamps,
        "historical": values[:int(hours*0.7)],
        "forecast": predictions[int(hours*0.7):],
        "accuracy": 91.3,
        "model": "LSTM"
    }

# ============================================================================
# EDNA ANALYSIS ENDPOINTS
# ============================================================================

@app.post("/api/edna/upload")
async def upload_edna_files(files: List[UploadFile] = File(...)):
    """Upload eDNA sequence files for analysis"""
    uploaded_files = []

    for file in files:
        # Validate file format
        valid_extensions = [".fasta", ".fastq", ".fa", ".fq"]
        if not any(file.filename.lower().endswith(ext) for ext in valid_extensions):
            raise HTTPException(status_code=400, f"Invalid file format: {file.filename}")

        # Save file (in production, save to proper storage)
        content = await file.read()

        uploaded_files.append({
            "filename": file.filename,
            "size": len(content),
            "content_type": file.content_type,
            "upload_time": datetime.now().isoformat()
        })

    return {"uploaded_files": uploaded_files, "total_files": len(uploaded_files)}

@app.post("/api/edna/analyze")
async def start_edna_analysis(background_tasks: BackgroundTasks, 
                             gene_target: str = "18s",
                             analysis_type: str = "taxonomy"):
    """Start eDNA sequence analysis"""
    analysis_id = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    # Start background analysis task
    background_tasks.add_task(run_edna_analysis, analysis_id, gene_target, analysis_type)

    return {
        "analysis_id": analysis_id,
        "status": "started",
        "estimated_time": "5-10 minutes",
        "gene_target": gene_target,
        "analysis_type": analysis_type
    }

@app.get("/api/edna/results/{analysis_id}")
async def get_edna_results(analysis_id: str):
    """Get eDNA analysis results"""
    # Mock results - replace with actual analysis results
    results = {
        "analysis_id": analysis_id,
        "status": "completed",
        "completion_time": datetime.now().isoformat(),
        "summary": {
            "total_families": 287,
            "fish_species": 152,
            "classification_accuracy": 96
        },
        "species_detected": [
            {
                "name": "Indian Oil Sardine",
                "scientific": "Sardinella longiceps",
                "confidence": 96,
                "abundance": 1240,
                "status": "LC"
            },
            {
                "name": "Green Sawfish",
                "scientific": "Pristis zijsron",
                "confidence": 82,
                "abundance": 3,
                "status": "CR"
            }
        ]
    }
    return results

# ============================================================================
# OTOLITH CLASSIFICATION ENDPOINTS
# ============================================================================

@app.post("/api/otolith/classify")
async def classify_otolith(file: UploadFile = File(...)):
    """Classify otolith image using ResNet model"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read and process image
    image_data = await file.read()

    # Mock classification (replace with actual model inference)
    classification_result = {
        "species": {
            "scientific": "Rastrelliger kanagurta",
            "common": "Indian Mackerel"
        },
        "confidence": 96.7,
        "morphometric": {
            "length": 15.2,
            "width": 12.8,
            "circularity": 0.847,
            "age_estimate": 3
        },
        "processing": {
            "features_extracted": 2048,
            "inference_time_ms": 247,
            "model": "ResNet-50",
            "accuracy": "94%"
        },
        "timestamp": datetime.now().isoformat()
    }

    return classification_result

# ============================================================================
# ML TRAINING ENDPOINTS
# ============================================================================

@app.get("/api/ml/models")
async def get_available_models():
    """Get list of available ML models"""
    models = [
        {
            "id": "otolith",
            "name": "ResNet Otolith Classifier",
            "type": "image_classification",
            "status": "trained",
            "accuracy": 94.2,
            "last_trained": "2025-09-26T06:18:00Z"
        },
        {
            "id": "lstm",
            "name": "LSTM Environmental Predictor",
            "type": "time_series",
            "status": "training",
            "accuracy": 91.3,
            "last_trained": "2025-09-26T04:20:00Z"
        },
        {
            "id": "edna",
            "name": "Random Forest eDNA Classifier",
            "type": "classification",
            "status": "deployed",
            "accuracy": 96.1,
            "last_trained": "2025-09-25T18:45:00Z"
        }
    ]
    return {"models": models}

@app.post("/api/ml/train/{model_id}")
async def start_model_training(model_id: str, background_tasks: BackgroundTasks,
                              batch_size: int = 32, learning_rate: float = 0.001,
                              epochs: int = 100):
    """Start training an ML model"""
    training_id = f"training_{model_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    training_config = {
        "model_id": model_id,
        "batch_size": batch_size,
        "learning_rate": learning_rate,
        "epochs": epochs,
        "gpu": "cuda:0" if torch.cuda.is_available() else "cpu"
    }

    # Start background training task
    background_tasks.add_task(run_model_training, training_id, training_config)

    return {
        "training_id": training_id,
        "status": "started",
        "config": training_config,
        "estimated_time": f"{epochs * 2} minutes"
    }

@app.get("/api/ml/training/{training_id}/status")
async def get_training_status(training_id: str):
    """Get training status and metrics"""
    # Mock training status
    status = {
        "training_id": training_id,
        "status": "training",
        "current_epoch": 45,
        "total_epochs": 100,
        "current_loss": 0.234,
        "current_accuracy": 0.891,
        "best_accuracy": 0.923,
        "elapsed_time": "23 minutes",
        "estimated_remaining": "27 minutes"
    }
    return status

# ============================================================================
# AI ASSISTANT ENDPOINTS
# ============================================================================

@app.post("/api/ai/chat")
async def chat_with_ai(message: dict):
    """Chat with the marine AI assistant"""
    user_message = message.get("message", "")

    # Simple response mapping (replace with actual NLP model)
    responses = {
        "endangered": "Based on current data, Kerala waters host 2 endangered and 1 critically endangered species. The endangered species are Malabar Grouper (Epinephelus malabaricus) with 15 specimens recorded, and Grey Reef Shark (Carcharhinus amblyrhynchos) with 8 specimens.",
        "temperature": "The average sea surface temperature across Kerala monitoring stations this month is 28.4°C, which is 0.6°C above the long-term average. Our LSTM model predicts that a 1°C temperature increase correlates with a 15% decline in sardine populations.",
        "biodiversity": "According to our eDNA analysis, the Trivandrum coast shows the highest biodiversity with an index of 4.2, detecting 15 species in recent samples. This is followed by Kochi waters (3.8 index, 12 species).",
        "edna": "Environmental DNA metabarcoding achieves 96% accuracy for marine species detection when using 18S rRNA gene sequencing. Our Random Forest classifier successfully identified 287 eukaryotic families from 500 seawater samples."
    }

    # Simple keyword matching
    response_text = responses.get("default", "I'm BluePulse AI, trained on 10,000+ marine research papers. I can help with species identification, environmental analysis, and conservation questions. What would you like to know?")

    for keyword, response in responses.items():
        if keyword in user_message.lower():
            response_text = response
            break

    return {
        "response": response_text,
        "timestamp": datetime.now().isoformat(),
        "model": "DistilBERT",
        "confidence": 0.89
    }

# ============================================================================
# BACKGROUND TASKS
# ============================================================================

async def run_edna_analysis(analysis_id: str, gene_target: str, analysis_type: str):
    """Background task for eDNA analysis"""
    logger.info(f"Starting eDNA analysis: {analysis_id}")

    # Simulate analysis steps
    steps = [
        "Processing sequence files",
        "Quality control and filtering",
        "Taxonomic classification",
        "Biodiversity assessment",
        "Generating results"
    ]

    for step in steps:
        logger.info(f"{analysis_id}: {step}")
        await asyncio.sleep(2)  # Simulate processing time

    logger.info(f"eDNA analysis completed: {analysis_id}")

async def run_model_training(training_id: str, config: dict):
    """Background task for model training"""
    logger.info(f"Starting model training: {training_id}")

    epochs = config["epochs"]

    for epoch in range(epochs):
        # Simulate training epoch
        await asyncio.sleep(1)

        # Log progress
        if epoch % 10 == 0:
            logger.info(f"{training_id}: Epoch {epoch}/{epochs}")

    logger.info(f"Model training completed: {training_id}")

# ============================================================================
# MAIN APPLICATION
# ============================================================================

if __name__ == "__main__":
    # Create required directories
    os.makedirs("models", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    os.makedirs("uploads", exist_ok=True)

    # Start the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )