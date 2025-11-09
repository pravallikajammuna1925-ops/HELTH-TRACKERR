import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
public class HealthTracker {

    // --- State Variables ---
    private int caloriesConsumed;
    private int stepsTaken;
    private double waterIntakeLiters; // in liters
    
    // --- Goals ---
    private final int calorieGoal = 2000;
    private final int stepGoal = 10000;
    private final double waterGoalLiters = 2.5; // 2.5 Liters

    // --- Hydration Alarm Logic ---
    private final double waterIncrementGoal = 0.25; // Target amount to drink per interval (250ml)
    private LocalTime lastWaterLogTime;

    // --- Data Storage (for a more detailed tracking history) ---
    private final List<String> mealLog;
    
    /**
     * Constructor initializes daily state.
     */
    public HealthTracker() {
        this.caloriesConsumed = 0;
        this.stepsTaken = 0;
        this.waterIntakeLiters = 0.0;
        this.lastWaterLogTime = LocalTime.now();
        this.mealLog = new ArrayList<>();
    }

    // --- Calorie Tracking Methods ---

    /**
     * Logs a meal and updates the consumed calories.
     * @param mealDescription Name and size of the meal (e.g., "Lunch - Chicken Salad")
     * @param calories The estimated calorie count of the meal.
     */
    public void logMeal(String mealDescription, int calories) {
        if (calories < 0) {
            System.err.println("Calorie input cannot be negative.");
            return;
        }
        this.caloriesConsumed += calories;
        this.mealLog.add(String.format("%s: %d kcal", mealDescription, calories));
        System.out.printf("Calorie Log: Added %d kcal. Total: %d kcal.\n", calories, this.caloriesConsumed);
    }
    
    // --- Step Counting Methods (Self-Counting Simulation) ---
    
    /**
     * Simulates the logging of steps, which would normally come from a mobile sensor.
     * @param steps The number of steps taken.
     */
    public void logSteps(int steps) {
        if (steps < 0) {
            System.err.println("Step count cannot be negative.");
            return;
        }
        this.stepsTaken += steps;
        System.out.printf("Step Log: Added %d steps. Total: %d steps.\n", steps, this.stepsTaken);
    }

    // --- Hydration Tracking and Alarm Methods ---

    /**
     * Logs water intake and updates the total hydration.
     * @param amountLiters The amount of water consumed in liters (e.g., 0.5 for 500ml).
     */
    public void logWater(double amountLiters) {
        if (amountLiters <= 0) {
            System.err.println("Water amount must be positive.");
            return;
        }
        this.waterIntakeLiters += amountLiters;
        this.lastWaterLogTime = LocalTime.now(); // Reset the time for the alarm logic
        System.out.printf("Hydration Log: Added %.2f L. Total: %.2f L.\n", amountLiters, this.waterIntakeLiters);
    }

    /**
     * @param hoursSinceLastDrink The number of hours to simulate since the last drink.
     * @return true if an alarm should trigger, false otherwise.
     */
    public boolean checkHydrationAlarm(long hoursSinceLastDrink) {
        // Stop alarming if the goal is met
        if (this.waterIntakeLiters >= this.waterGoalLiters) {
            return false;
        }

        // Logic: Alarm if it's been more than 2 hours AND they haven't met the target for that time frame
        if (hoursSinceLastDrink >= 2) {
            double remainingWater = this.waterGoalLiters - this.waterIntakeLiters;
            
            // Check if they are significantly behind schedule
            if (remainingWater > this.waterIncrementGoal) {
                System.out.printf("\n--- ALARM TRIGGERED: Time Check ---\n");
                System.out.printf("It's been %d hours! Drink at least %.2f L.\n", hoursSinceLastDrink, this.waterIncrementGoal);
                System.out.printf("Remaining Goal: %.2f L\n", remainingWater);
                System.out.println("----------------------------------\n");
                return true;
            }
        }
        return false;
    }
    
    // --- Reporting Methods ---

    /**
     * Generates a comprehensive status report (the "meter" views).
     */
    public void generateReport() {
        System.out.println("\n=============================================");
        System.out.println("            DAILY FITNESS SUMMARY            ");
        System.out.println("=============================================");

        // Calorie Meter
        double caloriePercent = (double) caloriesConsumed / calorieGoal * 100;
        String calorieStatus = caloriesConsumed <= calorieGoal ? "GOOD" : "OVER LIMIT";
        System.out.printf("[CALORIES] Consumed: %d / %d kcal (%.1f%%) - Status: %s\n", 
                          caloriesConsumed, calorieGoal, caloriePercent, calorieStatus);

        // Step Meter
        double stepPercent = (double) stepsTaken / stepGoal * 100;
        String stepStatus = stepsTaken >= stepGoal ? "GOAL MET" : "Keep Moving!";
        System.out.printf("[STEPS]    Taken: %d / %d steps (%.1f%%) - Status: %s\n", 
                          stepsTaken, stepGoal, stepPercent, stepStatus);

        // Hydration Meter
        double waterPercent = waterIntakeLiters / waterGoalLiters * 100;
        String waterStatus = waterIntakeLiters >= waterGoalLiters ? "GOAL MET" : "Need more water.";
        System.out.printf("[WATER]    Intake: %.2f / %.2f L (%.1f%%) - Status: %s\n", 
                          waterIntakeLiters, waterGoalLiters, waterPercent, waterStatus);

        System.out.println("---------------------------------------------");
        System.out.println("Last Water Intake Logged At: " + lastWaterLogTime.toString());
        System.out.println("---------------------------------------------");
    }

    // --- Main Simulation ---
    public static void main(String[] args) {
        System.out.println("--- Starting Mobile Health Tracker Simulation ---");
        HealthTracker tracker = new HealthTracker();

        // 1. Log Breakfast and Steps
        System.out.println("\n--- Morning Activity ---");
        tracker.logMeal("Breakfast (Oatmeal & Fruit)", 350);
        tracker.logSteps(2500);
        tracker.generateReport();
        
        // Simulate 1 hour passing
        long hoursPassed1 = 1;
        System.out.printf("\n(Simulating %d hour passing...)\n", hoursPassed1);
        tracker.checkHydrationAlarm(hoursPassed1); // Alarm should not trigger yet
        
        // 2. Log Water Intake
        System.out.println("\n--- Mid-Morning Intake ---");
        tracker.logWater(0.5); // 500 ml
        tracker.generateReport();

        // Simulate 3 hours passing (time for an alarm check)
        long hoursPassed2 = 3;
        System.out.printf("\n(Simulating %d hours passing...)\n", hoursPassed2);
        tracker.checkHydrationAlarm(hoursPassed2); // Alarm should trigger

        // 3. Log Lunch, More Steps, and Water to meet the alarm's request
        System.out.println("\n--- Afternoon Activity ---");
        tracker.logMeal("Lunch (Sandwich)", 600);
        tracker.logSteps(3000); // Total steps: 5500
        tracker.logWater(0.25); // 250 ml
        
        // 4. Final Report
        tracker.generateReport();

        // Simulate the alarm check one last time (should be reset/off)
        System.out.printf("\n(Simulating %d hours passing again...)\n", hoursPassed2);
        tracker.checkHydrationAlarm(hoursPassed2);
        
        // 5. Push goals close to the limit
        System.out.println("\n--- End of Day Final Push ---");
        tracker.logMeal("Dinner & Dessert", 1200); // Total Calories: 2150 (OVER)
        tracker.logSteps(4500); // Total Steps: 10000 (GOAL MET)
        tracker.logWater(1.75); // Total Water: 2.5 L (GOAL MET)
        
        tracker.generateReport();

        System.out.println("\n--- Simulation Complete ---");
    }
}
