import React, { useEffect, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { useParams } from 'react-router-dom';

function Chart() {
  const { companyId } = useParams();
  const echartRef = useRef(null); // ECharts 인스턴스에 접근하기 위한 ref

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?companyId=${companyId}`);

    ws.onmessage = (event) => {
      const { currentPrice, initialPrice } = JSON.parse(event.data);
      const currentTime = new Date().getTime();

      // 새로운 데이터 포인트 생성
      const newData = [currentTime, initialPrice, currentPrice, currentPrice, currentPrice];

      // 차트 인스턴스에 접근하여 setOption 메서드로 데이터 업데이트
      const echartInstance = echartRef.current.getEchartsInstance();
      const option = echartInstance.getOption();
      option.series[0].data.push(newData);

      echartInstance.setOption(
        {
          series: [{ data: option.series[0].data }],
        },
        false
      ); // notMerge를 false로 설정하여 기존 옵션에 데이터만 병합
    };

    return () => ws.close();
  }, [companyId]);

  // 차트 초기 옵션 설정
  const initialOption = {
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
        name: `회사${companyId}`,
        data: [],
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
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactEcharts ref={echartRef} option={initialOption} />
    </div>
  );
}

export default Chart;
