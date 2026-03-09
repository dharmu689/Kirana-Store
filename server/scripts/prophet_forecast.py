import sys
import json
import logging
import warnings
import pandas as pd
from prophet import Prophet

warnings.filterwarnings("ignore")
logging.getLogger('cmdstanpy').setLevel(logging.ERROR)
logging.getLogger('prophet').setLevel(logging.ERROR)

def main():
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        
        history_records = data.get("history", [])
        periods = data.get("periods", 7)
        
        if not history_records:
            print(json.dumps({"error": "No history records provided"}))
            sys.exit(1)
            
        # Convert to pandas DataFrame
        df = pd.DataFrame(history_records)
        
        # Ensure correct column names for Prophet
        if 'ds' not in df.columns or 'y' not in df.columns:
            print(json.dumps({"error": "History records must contain 'ds' (date) and 'y' (value) keys"}))
            sys.exit(1)
            
        # Ensure dates are datetime objects and convert values to numeric
        df['ds'] = pd.to_datetime(df['ds'])
        df['y'] = pd.to_numeric(df['y'])
        
        # Initialize and fit Prophet model
        # We suppress yearly seasonality if we only have < 365 days of data
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=True,
            daily_seasonality=False
        )
        model.fit(df)
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=periods)
        
        # Predict
        forecast = model.predict(future)
        
        # We only want the predicted future periods
        future_forecast = forecast.tail(periods)
        
        # Build response
        results = []
        for index, row in future_forecast.iterrows():
            # Ensure no negative predictions for demand
            predicted_value = max(0, row['yhat'])
            
            # Extract date string
            date_str = row['ds'].strftime('%Y-%m-%d')
            
            results.append({
                "date": date_str,
                "predictedDemand": round(predicted_value, 2)
            })
            
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
