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
    print("hi")

    # Aggregate data and create the pivot table
    df_final_agg = df_final.groupby(['user_id', 'course_id', 'course_title'], as_index=False)['normalized_score'].mean()
    df_pivot = df_final_agg.pivot(index='user_id', columns='course_title', values='normalized_score').fillna(0)

    # Convert to sparse matrix
    df_matrix = csr_matrix(df_pivot.values)

    # Fit the NearestNeighbors model
    model_knn = NearestNeighbors(metric='cosine', algorithm='brute')
    model_knn.fit(df_matrix)

    # Locate the query user's index
    try:
        query_index = df_pivot.index.get_loc(query_user_id)
    except KeyError:
        print(f"User ID {query_user_id} not found in the dataset.")
        return []

    # Get nearest neighbors
    distances, indices = model_knn.kneighbors(df_pivot.iloc[query_index, :].values.reshape(1, -1), n_neighbors=6)

    # Display nearest employees
    print(f'\nNearest Employees for User ID {query_user_id}:\n')
    recommended_ids = indices.flatten()[1:]  # Exclude self-match
    all_courses = set()

    # Gather all courses from nearest neighbors
    for user_id in recommended_ids:
        courses_taken = df_final[df_final['user_id'] == df_pivot.index[user_id]][['course_id', 'course_title']].drop_duplicates()
        for _, row in courses_taken.iterrows():
            all_courses.add((row['course_id'], row['course_title']))

    # Get the courses the user has already taken
    user_courses = set(df_final[df_final['user_id'] == query_user_id][['course_id', 'course_title']].itertuples(index=False))

    # Determine unique courses to recommend
    unique_courses = {course for course in all_courses if course not in user_courses}

    if unique_courses:
        print(f'\nRecommended Courses for User ID {query_user_id} (not previously taken):\n')
        recommended_list = list(unique_courses)[:3]  # Get top 3 unique courses
        recommended_list = [{'course_id': course_id, 'course_title': course_title} for course_id, course_title in unique_courses]
        for course_id, course_title in recommended_list:
            print(f'Course ID: {course_id}, Course Title: {course_title}')
        return recommended_list
    else:
        # Suggest any course from nearest employees if all have been taken
        print(f'\nAll courses have been taken by User ID {query_user_id}. Suggesting any course from nearest employees:\n')
        suggested_courses = list(all_courses)[:3]  # Get top 3 courses
        suggested_courses = [{'course_id': course_id, 'course_title': course_title} for course_id, course_title in all_courses]
        for course_id, course_title in suggested_courses:
            print(f'Course ID: {course_id}, Course Title: {course_title}')
        return suggested_courses

