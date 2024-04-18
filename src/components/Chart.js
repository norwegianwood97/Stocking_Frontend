import React, { useState, useEffect, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';

function Chart() {
  const { companyId } = useParams();
  const echartRef = useRef(null);
  const [companyName, setCompanyName] = useState('');
  const ws = useRef(null);

  // 회사 이름을 가져옵니다.
  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await axios.post('/api/companyName', { companyId: companyId });
        setCompanyName(response.data[0].name); // 응답 구조를 가정합니다.
      } catch (error) {
        console.error('Failed to fetch company name', error);
      }
    };
    fetchCompanyName();
  }, [companyId]);

  // 실시간 차트 데이터를 위한 WebSocket 연결
  useEffect(() => {
    ws.current = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/ws/chartData/${companyId}`);

    ws.current.onopen = () => {
      console.log('Connected to WS server for chart data');
    };

    ws.current.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      console.log('차트데이터로 받은 데이터: ', receivedData);
      console.log('차트 데이터의 타입: ', receivedData.type);

      if (receivedData.type === 'chartData') {
        const { currentPrice, initialPrice } = receivedData.data; // 수정된 부분

        if (currentPrice !== undefined && initialPrice !== undefined) {
          const currentTime = new Date().getTime(); // 현재 시간
          const newData = [currentTime, currentPrice]; // 새 데이터 배열 구성

          if (echartRef.current) {
            const echartInstance = echartRef.current.getEchartsInstance();
            const option = echartInstance.getOption();
            option.series[0].data.push(newData);

            // 10초 이상된 데이터를 필터링
            const tenSecondsAgo = currentTime - 10000;
            option.series[0].data = option.series[0].data.filter((item) => item[0] > tenSecondsAgo);

            echartInstance.setOption(option, false);
          }
        }
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WS server for chart data');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [companyId]);

  // 초기 차트 옵션 설정
  const initialOption = {
    title: { text: companyName || 'Current Price' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    grid: { containLabel: true },
    xAxis: { type: 'time' },
    yAxis: {
      type: 'value',
      axisLabel: { show: true, interval: 'auto', formatter: '{value}' },
    },
    series: [{ type: 'line', data: [], smooth: true }],
    dataZoom: [{ type: 'inside', start: 0, end: 100 }],
  };

  return (
    <div style={{ width: '100%', maxWidth: '2000px', height: '1000px', marginLeft: '-100px' }}>
      <ReactEcharts ref={echartRef} option={initialOption} />
    </div>
  );
}

export default Chart;
  