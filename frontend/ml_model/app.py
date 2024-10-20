from flask import Flask, jsonify, request
from recommendation_model import fetch_employee_data, preprocess_data, recommend_courses
from flask_cors import CORS

# Create a Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/', methods=['GET'])
def welcome():
    print("test")
    return jsonify("test")


@app.route("/api/recommend-courses/<string:user_id>", methods=["GET"])
def get_recommendations(user_id):
    print(f"Received request for user_id: {user_id}")  # Debug print
    try:
        api_url = "http://localhost:4000/api/admin/employee-courses"
        df = fetch_employee_data(api_url)

        recommended_courses = recommend_courses(df, user_id)  # Pass df and user_id
        print(
            f"Recommended courses for User ID {user_id}: {recommended_courses}"
        )  # Debug print

        if recommended_courses.empty:
            return jsonify({"message": "No new course recommendations found."}), 200

        return jsonify(recommended_courses.to_dict(orient="records")), 200
    except Exception as e:
        print(f"Error: {str(e)}")  # Print the error message for debugging
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
