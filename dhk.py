"""
DhakaPath - Road Fare Calculator CLI
Estimated road fare helper function
"""

def calculate_road_fare(distance_km, passengers=1):
    base_fare = 50.0  # Base starting charge
    per_km_rate = 15.0  # Cost per kilometer
    per_passenger_fee = 20.0  # Extra fee per additional passenger

    total_fare = base_fare + (distance_km * per_km_rate) + (max(0, passengers - 1) * per_passenger_fee)
    return round(total_fare, 2)


if __name__ == "__main__":
    print("=== DhakaPath Road Transit Fare Estimator ===")
    try:
        dist_input = input("Enter travel distance in km (e.g. 8.5): ")
        pax_input = input("Enter number of passengers (default 1): ")
        
        dist = float(dist_input) if dist_input.strip() else 5.0
        pax = int(pax_input) if pax_input.strip() else 1

        fare = calculate_road_fare(dist, pax)
        print(f"\nEstimated Road Fare: BDT {fare:.2f}")
    except ValueError:
        print("Invalid input. Please provide valid numeric values.")
