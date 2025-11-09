import sqlite3
import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

# --- Database Service Class ---

class HealthDBService:
    def __init__(self, db_name='health_data.db'):
        self.db_name = db_name
        self.init_db()

    def get_current_date(self):
        return datetime.date.today().strftime('%Y-%m-%d')

    def init_db(self):
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS daily_data (
                    date TEXT PRIMARY KEY,
                    steps_walked INTEGER,
                    calories_consumed INTEGER,
                    water_drank_ml INTEGER
                )
            """)
            conn.commit()

    def get_or_create_daily_record(self):
        today = self.get_current_date()
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT steps_walked, calories_consumed, water_drank_ml FROM daily_data WHERE date = ?",
                (today,)
            )
            row = cursor.fetchone()

            if row:
                return row[0], row[1], row[2], today

            cursor.execute(
                "INSERT INTO daily_data VALUES (?, 0, 0, 0)",
                (today,)
            )
            conn.commit()
            return 0, 0, 0, today

    def update_daily_record(self, steps_delta=0, calories_delta=0, water_ml_delta=0):
        steps, calories, water_ml, today = self.get_or_create_daily_record()

        steps = max(0, steps + steps_delta)
        calories = max(0, calories + calories_delta)
        water_ml = max(0, water_ml + water_ml_delta)

        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE daily_data
                SET steps_walked = ?, calories_consumed = ?, water_drank_ml = ?
                WHERE date = ?
            """, (steps, calories, water_ml, today))
            conn.commit()

        return steps, calories, water_ml, today

    def reset_today(self):
        today = self.get_current_date()
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE daily_data
                SET steps_walked = 0, calories_consumed = 0, water_drank_ml = 0
                WHERE date = ?
            """, (today,))
            if cursor.rowcount == 0:
                cursor.execute(
                    "INSERT INTO daily_data VALUES (?, 0, 0, 0)",
                    (today,)
                )
            conn.commit()

# --- Flask App Setup ---

app = Flask(__name__)
CORS(app)
db_service = HealthDBService()

# --- API Endpoints ---

@app.route('/summary', methods=['GET'])
def get_summary():
    try:
        data = db_service.get_or_create_daily_record()
        steps, calories, water_ml, date = data
        return jsonify({
            "success": True,
            "data": {
                "date": date,
                "steps_walked": steps,
                "calories_consumed": calories,
                "water_drank_ml": water_ml
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/log', methods=['POST'])
def log_data():
    try:
        data = request.get_json()
        steps_delta = int(data.get("steps_delta", 0))
        calories_delta = int(data.get("calories_delta", 0))
        water_ml_delta = int(data.get("water_ml_delta", 0))

        steps, calories, water_ml, date = db_service.update_daily_record(
            steps_delta, calories_delta, water_ml_delta
        )

        return jsonify({
            "success": True,
            "updated_data": {
                "date": date,
                "steps_walked": steps,
                "calories_consumed": calories,
                "water_drank_ml": water_ml
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ NEW Working Reset Endpoint (for Reset All Data button)
@app.route('/reset', methods=['POST'])
def reset():
    try:
        db_service.reset_today()
        steps, calories, water_ml, date = db_service.get_or_create_daily_record()

        return jsonify({
            "success": True,
            "data": {
                "date": date,
                "steps_walked": steps,
                "calories_consumed": calories,
                "water_drank_ml": water_ml
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# --- Run Server ---
if __name__ == '__main__':
    print("\n✅ Flask Server Running at: http://127.0.0.1:5000\n")
    app.run(debug=True)
