import React, { useState, useEffect, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios'; // Ensure axios is imported

function Chart() {
  const { companyId } = useParams();
  const echartRef = useRef(null);
  const [companyName, setCompanyName] = useState('');
  let highPrice = null;
  let lowPrice = null;

  // Fetch the company name
  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await axios.post('/api/companyName', { companyId: companyId });
        setCompanyName(response.data[0].name); // Assuming the response structure
      } catch (error) {
        console.error('Failed to fetch company name', error);
      }
    };
    fetchCompanyName();
  }, [companyId]);

  // WebSocket connection for real-time data
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?companyId=${companyId}`);

    ws.onmessage = (event) => {
      const { currentPrice, initialPrice } = JSON.parse(event.data);
      const currentTime = new Date().getTime();
      highPrice = highPrice === null ? currentPrice : Math.max(highPrice, currentPrice);
      lowPrice = lowPrice === null ? currentPrice : Math.min(lowPrice, currentPrice);
      const newData = [currentTime, initialPrice, highPrice, lowPrice, currentPrice]; 
      if (echartRef.current) {
        const echartInstance = echartRef.current.getEchartsInstance();
        const option = echartInstance.getOption();
        option.series[0].data.push(newData);
        echartInstance.setOption({ series: [{ data: option.series[0].data }] }, false);
      }
    };

    return () => ws.close();
  }, [companyId]);

  // Initial chart options
  const initialOption = {
    title: {
      // Dynamically set the title
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: null, // 기본 포맷을 사용하도록 설정
    },

    xAxis: { type: 'time' },
    yAxis: { type: 'value' },
    series: [{ type: 'candlestick', name: companyName, data: [] }],
    dataZoom: [{ type: 'inside', start: 0, end: 100, xAxisIndex: [0] }],
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactEcharts ref={echartRef} option={initialOption} />
    </div>
  );
}

export default Chart;
