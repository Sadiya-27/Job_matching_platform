# recommend_api.py
from fastapi import FastAPI, Request
import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()
vectorizer = joblib.load('tfidf_vectorizer.pkl')
job_vectors = joblib.load('job_vectors.pkl')
jobs_df = pd.read_csv('job_index.csv')

@app.post("/recommend")
async def recommend(request: Request):
    profile = await request.json()

    profile_text = (
        profile.get("professionalTitle", "") + ' ' +
        profile.get("summary", "") + ' ' +
        ' '.join(profile.get("skills", [])) + ' ' +
        ' '.join(profile.get("industryPreference", []))
    )

    profile_vector = vectorizer.transform([profile_text])
    similarities = cosine_similarity(profile_vector, job_vectors).flatten()
    top_indices = similarities.argsort()[::-1][:5]

    results = jobs_df.iloc[top_indices].to_dict(orient="records")
    return {"recommendations": results}
