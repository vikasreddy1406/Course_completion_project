import pandas as pd
import numpy as np
import requests
import random
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import csr_matrix

def fetch_employee_data(api_url):
    """Fetch employee course data from the API."""
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        rows = []
        for employee in data:
            user_id = employee["employee_id"]
            performance_score = employee["performanceScore"]

            for course in employee["courses"]:
                rows.append({
                    "user_id": user_id,
                    "name": employee["name"],
                    "designation": employee["designation"],
                    "course_id": course["course_id"],
                    "course_title": course["course_title"],
                    "course_tag": course["course_tag"],
                    "modules_completed": course["modulesCompleted"],
                    "total_modules": course["totalModules"],
                    "completion_percentage": course["completion_percentage"],
                    "course_score": random.randint(40, 100),  # Random score between 40 and 100
                    "performance_score": performance_score
                })

        return pd.DataFrame(rows)
    else:
        raise Exception(f"Failed to fetch data from API. Status code: {response.status_code}")

def preprocess_data(df):
    """Preprocess data to calculate normalized scores."""
    df['raw_score'] = df['completion_percentage'] * df['course_score']

    # Step 2: Normalize the score
    max_score = df['raw_score'].max()
    min_score = df['raw_score'].min()
    df['normalized_score'] = (df['raw_score'] - min_score) / (max_score - min_score)

    required_columns = [
        'user_id', 'name', 'course_id', 'course_title', 'normalized_score'
    ]
    return df[required_columns]

def recommend_courses(df_final, query_user_id):
    """Recommend courses for a given user based on normalized scores."""
    # Aggregate the data to get the mean normalized score for each user and course
    df_final_agg = df_final.groupby(['user_id', 'name', 'course_title', 'course_id'], as_index=False)['normalized_score'].mean()

    # Create a pivot table: user_id as rows, course_title as columns, and normalized_score as values
    df_pivot = df_final_agg.pivot(index='user_id', columns='course_title', values='normalized_score').fillna(0)

    # Convert the pivot table to a sparse matrix
    df_matrix = csr_matrix(df_pivot.values)

    # Fit the NearestNeighbors model
    model_knn = NearestNeighbors(metric='cosine', algorithm='brute')
    model_knn.fit(df_matrix)

    # Get recommendations
    query_index = df_pivot.index.get_loc(query_user_id)
    distances, indices = model_knn.kneighbors(df_pivot.iloc[query_index, :].values.reshape(1, -1), n_neighbors=6)

    # Gather courses from nearest employees
    recommended_ids = indices.flatten()[1:]  # Exclude self-match
    all_courses = set()

    for user_id in recommended_ids:
        courses_taken = df_final[df_final['user_id'] == user_id][['course_title', 'course_id']]
        for idx, row in courses_taken.iterrows():
            all_courses.add((row['course_title'], row['course_id']))  # Store as a tuple (course_title, course_id)

    # Determine courses to recommend
    user_courses = set(df_final[df_final['user_id'] == query_user_id]['course_title'])
    unique_courses = {(title, cid) for title, cid in all_courses if title not in user_courses}

    return list(unique_courses)[:3]  # Return up to 3 unique recommended courses

if __name__ == "__main__":
    # API endpoint
    api_url = "http://localhost:4000/api/admin/employee-courses"

    # Fetch and preprocess data
    df = fetch_employee_data(api_url)
    df_final = preprocess_data(df)

    # Example usage: Replace with the specific user ID for which you want recommendations
    query_user_id = "some_user_id"  # Replace this with the actual user ID
    recommended_courses = recommend_courses(df_final, query_user_id)

    print(f"Recommended courses for User ID {query_user_id}: {recommended_courses}")
