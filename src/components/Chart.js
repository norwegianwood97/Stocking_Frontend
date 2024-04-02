import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';
import { useParams } from 'react-router-dom';

function Chart() {
  const [series, setSeries] = useState([
    {
      name: 'Random Number',
      data: [],
    },
  ]);
  const { companyId } = useParams(); // URL 파라미터에서 companyId 추출

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?companyId=${companyId}`);

    ws.onmessage = (event) => {
      // 새로운 데이터(랜덤 수)를 기존 시리즈 데이터에 추가
      setSeries((prevSeries) => {
        const message = JSON.parse(event.data);
        let { currentPrice } = message;
        currentPrice = parseInt(currentPrice);
        const updatedSeries = [
          {
            ...prevSeries[0],
            data: [...prevSeries[0].data, currentPrice],
          },
        ];
        return updatedSeries;
      });
    };

    return () => {
      ws.close();
    };
    // 의존성 배열에서 series를 제거
  }, [companyId]);

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
