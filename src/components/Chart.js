import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';

function Chart() {
  const [series, setSeries] = useState([
    {
      name: 'Random Number',
      data: [],
    },
  ]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      // 새로운 데이터(랜덤 수)를 기존 시리즈 데이터에 추가
      const updatedSeries = [
        {
          ...series[0],
          data: [...series[0].data, parseInt(event.data)],
        },
      ];
      setSeries(updatedSeries);
    };

    return () => {
      ws.close();
    };
  }, [series]);

  const options = {
    chart: {
      type: 'line', // 또는 'bar', 'area', 'candlestick' 등 다른 차트 유형
      height: 350,
    },
    xaxis: {
      type: 'numeric', // 또는 'datetime' 등, 데이터에 맞게 설정
    },
    yaxis: {
      title: {
        text: 'Values',
      },
    },
  };

  return (
    <div>
      <ApexCharts options={options} series={series} type="line" height={550} width={650} />
    </div>
  );
}

export default Chart;
