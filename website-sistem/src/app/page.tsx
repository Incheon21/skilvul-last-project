"use client"
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Data {
  temperature: string;
  humidity: string;
}

const Home = () => {
  const [data, setData] = useState<Data>({ temperature: '', humidity: '' });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data from the server
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/data');
      setData(response.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  }, []);

  // Function to send data for anomaly detection
  const predictAnomaly = useCallback(async () => {
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        temperature: parseFloat(data.temperature),
        humidity: parseFloat(data.humidity),
      });
      setResult(response.data.anomaly ? 'Ada anomali!' : 'Normal');
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setResult(null);
    }
  }, [data]);

  // Fetch data and predict anomaly at regular intervals
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 10000); // Fetch data every 10 seconds

    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (data.temperature && data.humidity) {
      predictAnomaly();
    }
  }, [data, predictAnomaly]);

  return (
    <div className="bg-white h-screen w-screen justify-center items-center"  style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 className='font-bold text-3xl'>Anomaly Detection</h1>
      <div className='font-semibold text-lg'>
        <p>Suhu: {data.temperature} °C</p>
        <p>Kelembaban: {data.humidity} %</p>
        {result && <p>Hasil: {result}</p>}
        {error && <p>Error: {error}</p>}
      </div>
    </div>
  );
};

export default Home;
