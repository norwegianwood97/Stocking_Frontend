import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './OrderPage.css';
import axios from '../api/axios.js';

const SortButton = ({ text, sortKey, onSort, sortOrder }) => {
  const handleClick = () => onSort(sortKey);

  return (
    <button className={`sort-button ${sortOrder[sortKey]}`} onClick={handleClick}>
      {text}
    </button>
  );
};

function OrderPage() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedConcludedStockDetails, setSelectedConcludedStockDetails] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [stocks2, setStocks2] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [leftSearchResults, setLeftSearchResults] = useState([]);
  const [rightSearchResults, setRightSearchResults] = useState([]);

  useEffect(() => {
    // 검색어가 비어 있을 때에만 모든 주식 목록을 불러옴
    if (!searchTerm) {
      axios
        .get('http://localhost:3000/api/order')
        .then((response) => response.data)
        .then((data) => {
          setStocks(
            // 여기서 setStocks 대신 setSearchResults를 호출해야 함
            data.map((order) => ({
              name: order.Company.name,
              symbol: order.Company.companyId,
              price: order.Company.currentPrice,
              quantity: order.quantity,
              date: order.updatedAt,
              details: order,
            }))
          );
        })
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!searchTerm2) {
      axios
        .get('http://localhost:3000/api/concluded')
        .then((response) => response.data)
        .then((data) => {
          setStocks2(
            data.map((order) => ({
              name: order.Company.name,
              symbol: order.Company.companyId,
              price: order.Company.currentPrice,
              quantity: order.quantity,
              date: order.createdAt,
              details: order,
            }))
          );
        })
        .catch((error) => console.error('Error fetching concluded data:', error));
    }
  }, [searchTerm2]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3000/api/order/?name=${searchTerm}`);
      const data = response.data;
      console.log(data); // 응답 데이터 로깅으로 구조 확인
      const formattedData = data.map((order) => ({
        name: order.Company ? order.Company.name : order.name,
        symbol: order.Company ? order.Company.companyId : order.symbol,
        price: order.Company ? order.Company.currentPrice : order.price,
        quantity: order.quantity,
        date: order.updatedAt || order.createdAt,
        details: order,
      }));
      setLeftSearchResults(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleSubmit2 = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3000/api/concluded/?name=${searchTerm2}`);
      const data = response.data;
      const formattedData = data.map((order) => ({
        name: order.Company ? order.Company.name : '회사 정보 없음', // 여기에서 Company 객체의 존재 여부를 확인합니다.
        symbol: order.Company ? order.Company.companyId : 'ID 정보 없음',
        price: order.Company ? order.Company.currentPrice : order.price,
        quantity: order.quantity,
        date: order.createdAt,
        details: order,
      }));
      setRightSearchResults(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange2 = (event) => {
    setSearchTerm2(event.target.value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음';

    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Intl.DateTimeFormat('ko-KR', options).format(new Date(dateString));
    } catch (error) {
      console.error('formatDate 오류:', error);
      return '유효하지 않은 날짜';
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });
  };

  const getTransactionType = (details) => {
    return details.type === 'buy' ? '매수중' : '매도중';
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    fetch('http://localhost:3000/api/order', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editingStock.name,
        quantity: editingStock.quantity,
        price: editingStock.price,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        setEditingStock(null);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  //왼쪽 박스에서 주식을 선택했을 때
  const handleSelectStock = (stock) => {
    // 주식 객체에 Company 객체가 있는 경우와 없는 경우를 구분합니다.
    const hasCompanyObject = stock.Company !== undefined;

    // 날짜 정보를 설정합니다. Company 객체가 있으면 updatedAt을 사용하고, 없으면 createdAt 또는 date를 사용합니다.
    const dateValue = hasCompanyObject ? stock.updatedAt : stock.createdAt || stock.date;

    setSelectedStock({
      ...stock,
      details: {
        name: hasCompanyObject ? stock.Company.name : stock.name,
        companyId: hasCompanyObject ? stock.Company.companyId : stock.symbol,
        price: hasCompanyObject ? stock.Company.currentPrice : stock.price,
        quantity: stock.quantity,
        date: formatDate(dateValue), // formatDate 함수를 사용하여 날짜를 포맷팅합니다.
        type: stock.type,
        Company: hasCompanyObject
          ? {
              ...stock.Company,
            }
          : {
              name: stock.name,
              companyId: stock.symbol,
              currentPrice: stock.price,
              initialPrice: stock.price,
            },
      },
    });
  };

  // 오른쪽 박스에서 주식을 선택했을 때 호출할 함수
  const handleSelectConcludedStock = (stock) => {
    // Company 객체가 있는지 확인하고, 그에 따라 이름과 기타 속성 접근
    const hasCompanyObject = stock.Company !== undefined;

    setSelectedConcludedStockDetails({
      name: hasCompanyObject ? stock.Company.name : stock.name,
      symbol: hasCompanyObject ? stock.Company.companyId : stock.symbol,
      price: hasCompanyObject ? stock.Company.currentPrice : stock.price,
      quantity: stock.quantity,
      date: formatDate(hasCompanyObject ? stock.createdAt : stock.date),
      details: stock,
    });
  };

  return (
    <div className="order-page">
      <div className="main-content">
        <form onSubmit={handleSubmit} className="mb-3">
          <input type="text" placeholder="Search by company name..." value={searchTerm} onChange={handleChange} className="form-control" />
          <button type="submit" className="btn btn-primary mt-2">
            Search
          </button>
        <p className="box-label">체결 전</p> {/* 왼쪽 박스에 체결 전 문구 추가 */}
        </form>
        <hr className="separator" />
        <div className="stock-list-container scrollable-container">
          <div className="stock-list">
            {searchTerm
              ? // 검색어가 있을 때는 검색 결과를 표시
                leftSearchResults.map((stock) => (
                  <div className="stock-item" key={stock.symbol}>
                    <div className="stock-info">
                      <div className="stock-name">{stock.Company ? stock.Company.name : stock.name}</div>
                      <div className="stock-quantity">{stock.quantity} 주</div>
                    </div>
                    <button onClick={() => handleSelectStock(stock)}>선택</button>
                  </div>
                ))
              : // 검색어가 없을 때는 모든 주식 목록을 표시
                stocks.map((stock) => (
                  <div className="stock-item" key={stock.symbol}>
                    <div className="stock-info">
                      <div className="stock-name">{stock.name}</div>
                      <div className="stock-quantity">{stock.quantity} 주</div>
                    </div>
                    <button onClick={() => handleSelectStock(stock)}>선택</button>
                  </div>
                ))}
          </div>
        </div>

        <div className="stock-details-container">
          {selectedStock && selectedStock.details ? (
            <div className="stock-details">
              <div className="stock-detail-name">{selectedStock.details.name}</div>
              <div className="stock-detail-price">가격: {formatPrice(selectedStock.details.price)}</div>
              <div className="stock-detail-symbol">수량: {selectedStock.quantity}</div>
              <div className="stock-detail-date">날짜: {formatDate(selectedStock.date)}</div>
              <div className={`stock-transaction-type ${selectedStock.details.transactionType}`}>{getTransactionType(selectedStock.details)}</div>
              <button className="edit-button" onClick={() => setEditingStock(selectedStock.details)}>
                정정하기
              </button>
            </div>
          ) : (
            <div className="no-selection">세부정보를 보려면 주식을 선택하세요.</div>
          )}
        </div>
      </div>
      <div className="main-content">
        <form onSubmit={handleSubmit2} className="mb-3">
          <input type="text" placeholder="Search by company name..." value={searchTerm2} onChange={handleChange2} className="form-control" />
          <button type="submit" className="btn btn-primary mt-2">
            Search
          </button>
        <p className="box-label2">체결 완료</p> {/* 오른쪽 박스에 체결 완료 문구 추가 */}
        </form>
        <hr className="separator" />
        <div className="right-side-box scrollable-container"></div>
        <div className="stock-list">
          {searchTerm2
            ? // 검색어가 있을 때는 검색 결과를 표시
              rightSearchResults.map((stock) => (
                <div className="stock-item" key={stock.symbol}>
                  <div className="stock-info">
                    <div className="stock-name">{stock.name}</div>
                    <div className="stock-quantity">{stock.quantity} 주</div>
                  </div>
                  <button onClick={() => handleSelectConcludedStock(stock)}>선택</button>
                </div>
              ))
            : // 검색어가 없을 때는 모든 주식 목록을 표시
              stocks2.map((stock) => (
                <div className="stock-item" key={stock.symbol}>
                  <div className="stock-info">
                    <div className="stock-name">{stock.name}</div>
                    <div className="stock-quantity">{stock.quantity} 주</div>
                  </div>
                  <button onClick={() => handleSelectConcludedStock(stock)}>선택</button>
                </div>
              ))}
          {/* 오른쪽 박스 아래 세부 정보 표시를 위한 조건부 렌더링 */}
          <div className="stock-details-container2">
            {selectedConcludedStockDetails && (
              <div className="stock-details">
                <div className="stock-detail-name2">{selectedConcludedStockDetails.name}</div>
                <div className="stock-detail-price2">가격: {selectedConcludedStockDetails.price}</div>
                <div className="stock-detail-symbol2">수량: {selectedConcludedStockDetails.quantity}</div>
                <div className="stock-detail-date2">날짜: {selectedConcludedStockDetails.date}</div>
                {/* 기타 세부 정보 */}
              </div>
            )}
          </div>
        </div>
      </div>
      {editingStock && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">주식 수정</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setEditingStock(null)}></button>
              </div>
              <div className="modal-body">
                <form id="editStockForm">
                  <div className="mb-3">
                    <label htmlFor="companyName" className="form-label">
                      회사 이름:{selectedStock.details.Company.name}
                    </label>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="stockQuantity" className="form-label">
                      수량:
                    </label>
                    <input type="number" className="form-control" id="stockQuantity" value={editingStock.quantity} onChange={(e) => setEditingStock({ ...editingStock, quantity: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="stockPrice" className="form-label">
                      가격:
                    </label>
                    <input type="text" className="form-control" id="stockPrice" value={editingStock.price} onChange={(e) => setEditingStock({ ...editingStock, price: e.target.value })} />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingStock(null)}>
                  취소
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleEditSubmit(document.getElementById('editStockForm'))}>
                  수정 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderPage;
