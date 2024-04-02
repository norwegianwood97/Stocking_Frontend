import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import { useParams } from 'react-router-dom';

function Chart() {
  const [series, setSeries] = useState([
    {
      name: 'Price',
      data: [],
    },
  ]);
  const { companyId } = useParams(); // URL 파라미터에서 companyId 추출
  const [high, setHigh] = useState(null);
  const [low, setLow] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?companyId=${companyId}`);

    ws.onmessage = (event) => {
      // 서버로부터 받은 데이터 파싱
      const { currentPrice, initialPrice } = JSON.parse(event.data);
      const currentTime = new Date().getTime(); // 현재 시간을 milliseconds로 가져옴

      // 고가 및 저가 업데이트
      if (high === null || currentPrice > high) {
        setHigh(currentPrice);
      }
      if (low === null || currentPrice < low) {
        setLow(currentPrice);
      }

      // 데이터를 series 형식에 맞게 가공하여 업데이트
      setSeries((prevSeries) => {
        const newData = prevSeries[0].data.concat([[currentTime, initialPrice, currentPrice, low, high]]);
        return [{ ...prevSeries[0], data: newData }];
      });
    };

    return () => ws.close(); // 컴포넌트 언마운트 시 WebSocket 연결 닫기
  }, [companyId, high, low]);

  // 차트 옵션 설정
  const option = {
    title: {
      text: '주식 가격 차트',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    xAxis: {
      type: 'time',
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'candlestick',
        name: '주식 가격',
        data: series[0].data,
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      {/* ReactEcharts 컴포넌트를 사용하여 차트를 렌더링합니다. */}
      <ReactEcharts option={option} />
    </div>
  );
}

export default Chart;
