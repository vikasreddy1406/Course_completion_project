from flask import Flask, jsonify, request
from recommendation_model import fetch_employee_data, preprocess_data, recommend_courses

app = Flask(__name__)

@app.route('/api/recommend-courses/<string:user_id>', methods=['GET'])
def get_recommendations(user_id):
    print(f"Received request for user_id: {user_id}")  # Debug print
    try:
        api_url = "http://localhost:4000/api/admin/employee-courses"
        df = fetch_employee_data(api_url)
        df_final = preprocess_data(df)

        recommended_courses = recommend_courses(df_final, user_id)
        return jsonify(recommended_courses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)

from flask_cors import CORS
CORS(app)