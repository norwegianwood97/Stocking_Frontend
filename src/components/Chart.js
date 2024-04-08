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
    const ws = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/ws/chartData/${companyId}`);

    ws.onmessage = (event) => {
      const { currentPrice } = JSON.parse(event.data); // 현재 가격만 추출
      const currentTime = new Date().getTime(); // 현재 시간
      const newData = [currentTime, currentPrice]; // 데이터 배열은 시간과 현재 가격만 포함

      if (echartRef.current) {
        const echartInstance = echartRef.current.getEchartsInstance();
        const option = echartInstance.getOption();

        // 데이터 배열에 새로운 데이터 추가
        option.series[0].data.push(newData);

        // 10초 이상 된 데이터를 필터링합니다.
        // 주의: 여기서 8000ms (8초)가 아닌 10000ms (10초)를 사용해야 정확합니다.
        const tenSecondsAgo = currentTime - 8000; // 현재 시간에서 10초를 빼서 계산
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
      // 차트의 제목을 동적으로 설정할 수 있습니다.
      // 예: text: '실시간 가격 추적'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: null, // 기본 포맷을 사용하도록 설정
    },
    grid: {
      containLabel: true, // 라벨이 차트 영역 내에 있도록 합니다.
    },
    xAxis: {
      type: 'time',
      // x축의 추가 설정이 필요할 경우 여기에 추가
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: true,
        interval: 50000,
        inside: false, // 라벨을 차트 영역 바깥에 놓습니다.
        formatter: '{value}', // y축 라벨의 표시 방식을 변경하고 싶으면 수정합니다.
      },
      // y축의 추가 설정이 필요할 경우 여기에 추가
    },
    series: [
      {
        type: 'line', // 'candlestick' 대신 'line' 유형을 사용
        name: 'Current Price', // 이 부분은 필요에 따라 `companyName`으로 대체하거나 수정할 수 있습니다.
        data: [], // 데이터는 실시간으로 업데이트될 예정
        smooth: true, // 라인 그래프를 부드럽게 표시
        // 선의 색상, 두께 등 라인 그래프의 스타일을 여기에 설정할 수 있습니다.
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        xAxisIndex: [0],
      },
    ],
    // 기타 차트 설정이 필요할 경우 여기에 추가
  };

  return (
    <div style={{ width: '100%', maxWidth: '2000px', height: '1000px', marginLeft: '-100px' }} id="charts">
      <ReactEcharts ref={echartRef} option={initialOption} />
    </div>
  );
}

export default Chart;
