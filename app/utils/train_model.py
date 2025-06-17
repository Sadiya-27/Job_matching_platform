# train_model.py
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load dataset
df = pd.read_csv("naukri_com-job_sample.csv")

# Drop rows missing core fields
df = df.dropna(subset=['jobtitle', 'jobdescription'])

# Combine relevant text fields
df['combined'] = (
    df['jobtitle'].astype(str) + ' ' +
    df['jobdescription'].astype(str) + ' ' +
    df['skills'].fillna('').astype(str)
)

# Vectorize combined field
vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
job_vectors = vectorizer.fit_transform(df['combined'])

# Save vectorizer and job vectors
joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')
joblib.dump(job_vectors, 'job_vectors.pkl')

# Save job index (for lookup)
df[['uniq_id', 'jobtitle']].to_csv('job_index.csv', index=False)
