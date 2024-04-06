import React, { useState, useEffect, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios'; // Ensure axios is imported

function Chart() {
  const { companyId } = useParams();
  const echartRef = useRef(null);
  const [companyName, setCompanyName] = useState('');

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
    const ws = new WebSocket(`wss://api.stockingchallenge/ws/chartData/${companyId}`);

    ws.onmessage = (event) => {
      const { currentPrice, initialPrice, highPrice, lowPrice } = JSON.parse(event.data);
      const currentTime = new Date().getTime();
      const newData = [currentTime, initialPrice, highPrice, lowPrice, currentPrice];
      if (echartRef.current) {
        const echartInstance = echartRef.current.getEchartsInstance();
        const option = echartInstance.getOption();
        option.series[0].data.push(newData);
        // 10초 이상된 데이터를 필터링합니다.
        const tenSecondsAgo = currentTime - 8000; // 현재시간에서 10초를 빼서 계산합니다.
        option.series[0].data = option.series[0].data.filter((data) => data[0] > tenSecondsAgo);

        // 옵션을 업데이트합니다.
        echartInstance.setOption(option, false);
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

    grid: {
      containLabel: true, // 라벨이 차트 영역 내에 있도록 합니다.
    },
    xAxis: { type: 'time' },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: true,
        inside: false, // 라벨을 차트 영역 바깥에 놓습니다.
        formatter: '{value}', // y축 라벨의 표시 방식을 변경하고 싶으면 수정합니다.
      },
    },
    series: [{ type: 'candlestick', name: companyName, data: [] }],
    dataZoom: [{ type: 'inside', start: 0, end: 100, xAxisIndex: [0] }],
  };
  return (
    <div style={{ width: '100%', maxWidth: '2000px', height: '1000px', marginLeft: '-100px' }} id="charts">
      <ReactEcharts ref={echartRef} option={initialOption} />
    </div>
  );
}

export default Chart;
