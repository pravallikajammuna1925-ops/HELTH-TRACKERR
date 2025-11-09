import sqlite3
from datetime import date, datetime
import time

# --- Configuration ---
DATABASE_NAME = "health_data.db"
USER_ID = "default_user_123" # In a real app, this would be the authenticated user's ID

class DailyTrackerDB:
    """
    Manages the daily persistent storage for the health tracker using SQLite.
    The daily reset logic is handled automatically by fetching or creating a record
    based on the current calendar date (YYYY-MM-DD).
    """

    def __init__(self):
        """Initializes the database connection and ensures the daily_logs table exists."""
        self.conn = sqlite3.connect(DATABASE_NAME)
        self.cursor = self.conn.cursor()
        self._create_table()

    def _create_table(self):
        """Creates the necessary table if it does not already exist."""
        # Note: calories_consumed is used instead of calories_burnt for tracking food intake
        # which is easier to log manually.
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL UNIQUE, 
                steps_taken INTEGER DEFAULT 0,
                calories_consumed INTEGER DEFAULT 0,
                water_intake_ml INTEGER DEFAULT 0
            )
        """)
        self.conn.commit()
        print(f"Database initialized: {DATABASE_NAME}")

    def _get_current_date_str(self):
        """Returns the current date in YYYY-MM-DD format."""
        return date.today().strftime('%Y-%m-%d')

    def get_or_create_daily_record(self):
        """
        Fetches the user's health data for today. 
        If no record exists for today, a new one is created (the daily reset).
        """
        today = self._get_current_date_str()
        
        self.cursor.execute("""
            SELECT steps_taken, calories_consumed, water_intake_ml
            FROM daily_logs
            WHERE user_id = ? AND date = ?
        """, (USER_ID, today))
        
        record = self.cursor.fetchone()
        
        if record is None:
            # Daily reset logic: Insert a new record for today, starting values at 0.
            self.cursor.execute("""
                INSERT INTO daily_logs (user_id, date, steps_taken, calories_consumed, water_intake_ml)
                VALUES (?, ?, 0, 0, 0)
            """, (USER_ID, today))
            self.conn.commit()
            print(f"--- New Day Started! Daily data reset for {today}. ---")
            return (0, 0, 0) # Return default zeros for the new day
        else:
            # Existing data for today is loaded
            return record

    def log_data(self, steps_delta=0, calories_delta=0, water_ml_delta=0):
        """
        Updates the current day's cumulative logs by adding the delta values.
        """
        today = self._get_current_date_str()
        
        # 1. Fetch current totals
        current_steps, current_calories, current_water = self.get_or_create_daily_record()
        
        # 2. Calculate new totals
        new_steps = max(0, current_steps + steps_delta)
        new_calories = max(0, current_calories + calories_delta)
        new_water_ml = max(0, current_water + water_ml_delta)
        
        # 3. Update the database record for today
        self.cursor.execute("""
            UPDATE daily_logs
            SET steps_taken = ?, calories_consumed = ?, water_intake_ml = ?
            WHERE user_id = ? AND date = ?
        """, (new_steps, new_calories, new_water_ml, USER_ID, today))
        
        self.conn.commit()
        
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Logged: Steps+{steps_delta}, Calories+{calories_delta}, Water+{water_ml_delta}ml")
        return self.get_daily_summary()

    def get_daily_summary(self):
        """Retrieves and prints the complete summary for the current day."""
        steps, calories, water_ml = self.get_or_create_daily_record()
        water_liters = water_ml / 1000.0
        
        summary = {
            "date": self._get_current_date_str(),
            "steps_walked": steps,
            "calories_consumed": calories,
            "water_drank_L": water_liters
        }
        return summary
    
    def close(self):
        """Closes the database connection."""
        self.conn.close()
        print("\nDatabase connection closed.")


# --- Simulation Block ---

if __name__ == "__main__":
    
    tracker_db = DailyTrackerDB()
    
    try:
        # Load the initial state for today
        print("\n--- 1. Initial Load for Today ---")
        initial_summary = tracker_db.get_daily_summary()
        print(f"Current Data ({initial_summary['date']}): {initial_summary}")
        
        # Simulate Morning Activity
        print("\n--- 2. Morning Activity: Logging Data ---")
        
        # Log 3000 steps
        summary_a = tracker_db.log_data(steps_delta=3000)
        
        # Log 400 calories (Breakfast)
        summary_b = tracker_db.log_data(calories_delta=400)
        
        # Log 500 ml of water
        summary_c = tracker_db.log_data(water_ml_delta=500)
        
        # Show status
        print("\n--- 3. Mid-Day Summary ---")
        mid_day_summary = tracker_db.get_daily_summary()
        print(f"Current Data ({mid_day_summary['date']}): {mid_day_summary}")

        # Simulate Afternoon Activity
        print("\n--- 4. Afternoon Activity: Logging More Data ---")
        
        # Log 1200 calories (Lunch + Snack)
        tracker_db.log_data(calories_delta=1200) 
        
        # Log 5000 steps
        tracker_db.log_data(steps_delta=5000) 
        
        # Log 1 liter of water
        tracker_db.log_data(water_ml_delta=1000) 

        # Final Status
        print("\n--- 5. End-of-Day Final Summary ---")
        final_summary = tracker_db.get_daily_summary()
        print(f"Final Data ({final_summary['date']}): {final_summary}")


    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        tracker_db.close()
