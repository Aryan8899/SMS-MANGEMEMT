from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
from twilio.rest import Client
import subprocess
import mysql.connector
import telegram
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import signal
import platform
import psutil
from prometheus_client import Counter, Gauge, start_http_server
import asyncio
from rate_limiter import RateLimiter  # You'll need to implement this


load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="SMS Management System")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # You can specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Twilio credentials (replace with your actual credentials)
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

# Twilio client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Telegram Bot setup
bot = telegram.Bot(token= os.getenv('TELEGRAM_BOT_TOKEN') )

# MongoDB client for storing country-operator pairs
mongo_client = MongoClient(os.getenv('MONGO_URI') )
mongo_db = mongo_client.sms_management

# MySQL database connection for SMS metrics
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user=## provide it ,
        password=## provide it ,
        database=## provide it 
    )
@app.get("/test_db_connection/")
def test_db_connection():
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT DATABASE();")
        database_name = cursor.fetchone()
        return {"status": "success", "database": database_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Pydantic models
class SMSRequest(BaseModel):
    phone_number: str
    message: str

class ProgramControlRequest(BaseModel):
    session_name: str
    program_name: str = None

process_dict = {}

class CountryOperatorRequest(BaseModel):
    country: str
    operator: str
    is_high_priority: bool

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the SMS Management API"}

# ---------------------- Process Management ----------------------


def start_program(session_name: str, program_name:str):
    try:
         # Start the program using subprocess.Popen with shell=False for security
        if session_name in process_dict:
            raise Exception(f"Session '{session_name}' already exists")
        
        process = subprocess.Popen(
            ["python", program_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=False,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if platform.system() == "Windows" else 0,
            preexec_fn=os.setsid if platform.system() != "Windows" else None
        )
# Store both process object and PID
         # Get process details using psutil for additional information
        proc_info = psutil.Process(process.pid)
        process_info = {
            "process": process,
            "pid": process.pid,
            "program_name": program_name,
            "create_time": proc_info.create_time(),
            "status": "running"
        }
        
        process_dict[session_name] = process_info
        return {
            "pid": process.pid,
            "session_name": session_name,
            "program_name": program_name,
            "create_time": process_info["create_time"],
            "status": process_info["status"]
        }
    except Exception as e:
        raise Exception(f"Error starting program: {str(e)}")


    

def stop_program(session_name: str):
    try:
        if session_name not in process_dict:
            raise Exception(f"Session '{session_name}' not found")
        
        process_info = process_dict[session_name]
        pid = process_info["pid"]
        
        try:
            process = psutil.Process(pid)
            
            # Windows-specific handling
            if platform.system() == "Windows":
                # Try to terminate the process and its children
                for child in process.children(recursive=True):
                    child.terminate()
                process.terminate()
            else:
                # Unix-like systems
                os.killpg(os.getpgid(pid), signal.SIGTERM)
            
            # Wait for process to terminate
            process.wait(timeout=5)
            
        except psutil.NoSuchProcess:
            # Process already terminated
            pass
        except psutil.TimeoutExpired:
            # Force kill if process doesn't terminate
            if platform.system() == "Windows":
                process.kill()
            else:
                os.killpg(os.getpgid(pid), signal.SIGKILL)
                
        # Clean up process dictionary
        process_dict.pop(session_name, None)
        return {"status": "success", "message": f"Session '{session_name}' stopped successfully."}
    
    except Exception as e:
        raise Exception(f"Error stopping program: {str(e)}")


@app.post("/start_program/")
async def start_program_endpoint(request: ProgramControlRequest):
    try:
        if not request.program_name:
            raise HTTPException(status_code=400, detail="program_name is required")
        
        process_info = start_program(request.session_name, request.program_name)
        
        return {
            "status": "success",
            "process_info": {
                "pid": process_info["pid"],
                "session_name": process_info["session_name"],
                "program_name": process_info["program_name"],
                "create_time": process_info["create_time"],
                "status": process_info["status"]
            },
            "message": f"Started program {request.program_name} in session {request.session_name}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stop_program/")
async def stop_program_endpoint(request: ProgramControlRequest):
    try:
        stop_program(request.session_name)
        return {"status": "success", "message": f"Stopped session {request.session_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Restart program endpoint
@app.post("/restart_program/")
async def restart_program_endpoint(request: ProgramControlRequest):
    try:
        # Stop the program if it’s already running
        if stop_program(request.session_name):
            print(f"Stopped session {request.session_name}")

        # Start the program again
        pid = start_program(request.session_name, request.program_name)
        return {
            "status": "success",
            "message": f"Restarted session {request.session_name} with program {request.program_name}",
            "process_info": {"session_name": request.session_name, "pid": pid}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error restarting program: {str(e)}")

# ---------------------- Real-Time Metrics ----------------------

@app.get("/metrics/{country}")
def get_metrics(country: str):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute(f"SELECT * FROM metrics WHERE country='{country}'")
        metrics = cursor.fetchall()
        db.close()
        return {"status": "success", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------- Country-Operator Management ----------------------

@app.post("/add_country_operator/")
async def add_country_operator(country_operator: CountryOperatorRequest):
    try:
        mongo_db.country_operators.insert_one(country_operator.dict())
        return {"status": "success", "message": "Country-operator pair added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/country_operators/")
async def get_country_operators():
    try:
        operators = list(mongo_db.country_operators.find({}, {"_id": 0}))
        return {"status": "success", "country_operators": operators}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update_country_operator/")
async def update_country_operator(country_operator: CountryOperatorRequest):
    try:
        mongo_db.country_operators.update_one(
            {"country": country_operator.country, "operator": country_operator.operator},
            {"$set": country_operator.dict()}
        )
        return {"status": "success", "message": "Country-operator pair updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_country_operator/")
async def delete_country_operator(country_operator: CountryOperatorRequest):
    try:
        mongo_db.country_operators.delete_one({"country": country_operator.country, "operator": country_operator.operator})
        return {"status": "success", "message": "Country-operator pair deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------- SMS Management ----------------------

@app.post("/send_sms/")
async def send_sms(sms_request: SMSRequest):
    if not sms_request.phone_number or not sms_request.message:
        raise HTTPException(status_code=400, detail="Phone number and message are required")
    
    try:
        message = client.messages.create(
            body=sms_request.message,
            from_=TWILIO_PHONE_NUMBER,
            to=sms_request.phone_number
        )
        return {"status": "success", "message": f"SMS sent to {sms_request.phone_number}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------- Alerts and Notifications ----------------------

def send_telegram_alert(message):
    bot.send_message(chat_id="YOUR_CHAT_ID", text=message)

@app.post("/send_alert/")
async def send_alert(alert_message: str):
    try:
        send_telegram_alert(alert_message)
        return {"status": "success", "message": "Alert sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/verify_number/{phone_number}")
async def verify_number(phone_number: str):
    """Endpoint to initiate phone number verification"""
    try:
        if not phone_number.startswith('+'):
            phone_number = '+' + phone_number
            
        verification = client.validation_requests.create(
            friendly_name="SMS Recipient",
            phone_number=phone_number
        )
        
        return {
            "status": "success",
            "message": f"Verification code sent to {phone_number}",
            "next_steps": "Please check your phone for the verification code and verify at https://www.twilio.com/console/phone-numbers/verified"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initiate verification: {str(e)}"
        )

# Entry point for running the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
