def calculate_carbon_savings(category: str, weight_kg: float):
    """
    Simplified logic to estimate CO2 saved by NOT buying new.
    In a real app, you'd use an environmental impact API.
    """
    factors = {
        "electronics": 25.0, # kg CO2 per kg of product
        "furniture": 1.5,
        "clothing": 15.0,
        "tools": 4.0
    }
    factor = factors.get(category.lower(), 2.0)
    return round(weight_kg * factor, 2)