
import pandas as pd
import numpy as np
import requests
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity


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
                rows.append(
                    {
                        "user_id": user_id,
                        "name": employee["name"],
                        "designation": employee["designation"],
                        "course_id": course["course_id"],
                        "course_title": course["course_title"],
                        "course_tag": course["course_tag"],
                        "modules_completed": course["modulesCompleted"],
                        "total_modules": course["totalModules"],
                        "completion_percentage": course["completion_percentage"],
                        "course_score": course["quiz_score"],
                        "performance_score": performance_score,
                    }
                )

        return pd.DataFrame(rows)
    else:
        raise Exception(
            f"Failed to fetch data from API. Status code: {response.status_code}"
        )


def preprocess_data(data):
    """Preprocess data to prepare for recommendations."""
    # Encode course tags
    label_encoder = LabelEncoder()
    data["course_tag_encoded"] = label_encoder.fit_transform(data["course_tag"])

    # Create a pivot table of employees and courses, using course_score as values
    pivot_table = data.pivot_table(
        index="user_id", columns="course_id", values="course_score"
    ).fillna(0)

    return pivot_table


def get_top_similar_employees(employee_id, employee_similarity_df, top_n=3):
    """Get top N similar employees based on cosine similarity."""
    similar_scores = employee_similarity_df[employee_id]
    top_similar_employees = (
        similar_scores.sort_values(ascending=False).iloc[1 : top_n + 1].index
    )
    return top_similar_employees


def recommend_courses(data, employee_id, top_n=3):
    """Get course recommendations for a specific employee."""
    # Prepare the pivot table
    pivot_table = preprocess_data(data)

    # Calculate cosine similarity
    employee_similarity = cosine_similarity(pivot_table)
    employee_similarity_df = pd.DataFrame(
        employee_similarity, index=pivot_table.index, columns=pivot_table.index
    )

    # Get similar employees
    similar_employees = get_top_similar_employees(
        employee_id, employee_similarity_df, top_n
    )

    # Get courses completed by similar employees that the current employee hasn't completed
    employee_courses = set(data[data["user_id"] == employee_id]["course_id"])
    similar_employee_courses = data[data["user_id"].isin(similar_employees)][
        "course_id"
    ].unique()

    # Filter out courses already completed by the current employee
    recommended_courses = [
        course for course in similar_employee_courses if course not in employee_courses
    ]

    # Fetch course titles and IDs for recommendations
    recommended_course_details = data[data["course_id"].isin(recommended_courses)][
        ["course_title", "course_id"]
    ].drop_duplicates()

    return recommended_course_details
