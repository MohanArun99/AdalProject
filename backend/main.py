import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uuid
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("results", exist_ok=True)
app.mount("/results", StaticFiles(directory="results"), name="results")

@app.post("/api/compare")
async def compare_images(image_a: UploadFile = File(...), image_b: UploadFile = File(...)):
    contents_a = await image_a.read()
    contents_b = await image_b.read()

    img_a = cv2.imdecode(np.frombuffer(contents_a, np.uint8), cv2.IMREAD_COLOR)
    img_b = cv2.imdecode(np.frombuffer(contents_b, np.uint8), cv2.IMREAD_COLOR)

    # Normalize to same width for DPI-independent comparison
    target_width = 800
    h = int(img_a.shape[0] * target_width / img_a.shape[1])
    img_a = cv2.resize(img_a, (target_width, h), interpolation=cv2.INTER_AREA)
    img_b = cv2.resize(img_b, (target_width, h), interpolation=cv2.INTER_AREA)

    # Compute per-pixel absolute difference
    diff_color = cv2.absdiff(img_a, img_b)
    diff_gray = cv2.cvtColor(diff_color, cv2.COLOR_BGR2GRAY)

    # Similarity = 1 - mean normalized difference
    similarity = round((1.0 - diff_gray.mean() / 255.0) * 100, 2)

    # Threshold + contours to find changed regions
    _, thresh = cv2.threshold(diff_gray, 25, 255, cv2.THRESH_BINARY)
    # Dilate slightly to merge nearby small differences into clean bounding boxes
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    thresh = cv2.dilate(thresh, kernel, iterations=2)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    result_img = img_b.copy()
    for c in contours:
        x, y, w, h_box = cv2.boundingRect(c)
        if w > 10 and h_box > 10:
            cv2.rectangle(result_img, (x, y), (x + w, y + h_box), (0, 0, 255), 2)

    filename = f"{uuid.uuid4()}.jpg"
    cv2.imwrite(os.path.join("results", filename), result_img)

    print(f"DEBUG: similarity={similarity}%, contours={len(contours)}")

    return {
        "similarity": similarity,
        "diff_image_url": f"http://localhost:8000/results/{filename}"
    }
