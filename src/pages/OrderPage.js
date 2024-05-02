import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './OrderPage.css';
import Chatting from '../components/Chatting.js';
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
  const [selectedType, setSelectedType] = useState('');
  const [selectedType2, setSelectedType2] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [sortOrder2, setSortOrder2] = useState('');
  const [deleteOrderId, setDeleteOrderId] = useState(null); // 삭제할 주문 ID
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 모달 표시 여부

  useEffect(() => {
    // 검색어가 비어 있을 때에만 모든 주식 목록을 불러옴
    if (!searchTerm) {
      axios
        .get('/api/order')
        .then((response) => {
          console.log('Fetched orders:', response.data); // 데이터 로깅 추가
          return response.data;
        })
        .then((data) => {
          setStocks(
            // 여기서 setStocks 대신 setSearchResults를 호출해야 함
            data.map((order) => ({
              orderId: order.orderId,
              name: order.Company.name,
              symbol: order.Company.companyId,
              price: order.price,
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
        .get('/api/concluded')
        .then((response) => response.data)
        .then((data) => {
          setStocks2(
            data.map((order) => ({
              name: order.Company.name,
              symbol: order.Company.companyId,
              price: order.price,
              quantity: order.quantity,
              date: order.createdAt,
              details: order,
            }))
          );
        })
        .catch((error) => console.error('Error fetching concluded data:', error));
    }
  }, [searchTerm2]);

  // 체결 전 주식 목록을 필터링 및 정렬하는 함수
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`/api/order?type=${selectedType}&order=${sortOrder}`);
        // 응답 데이터를 상태에 저장
        setStocks(
          response.data.map((order) => ({
            orderId: order.orderId, // 예를 들어, 여기서 order.id가 주식의 고유 ID라고 가정합니다.
            name: order.Company.name,
            symbol: order.Company.companyId,
            price: order.price,
            quantity: order.quantity,
            date: order.updatedAt,
            details: order,
          }))
        );
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    };

    fetchStocks();
  }, [selectedType, sortOrder]);

  useEffect(() => {
    const fetchConcludedStocks = async () => {
      try {
        const response = await axios.get(`/api/concluded?type=${selectedType2}&order=${sortOrder2}`);
        // 응답 데이터를 상태에 저장
        setStocks2(
          response.data.map((order) => ({
            name: order.Company.name,
            symbol: order.Company.companyId,
            price: order.price,
            quantity: order.quantity,
            date: order.createdAt,
            details: order,
          }))
        );
      } catch (error) {
        console.error('Error fetching concluded stocks:', error);
      }
    };

    fetchConcludedStocks();
  }, [selectedType2, sortOrder2]);

  // 타입 변경 및 정렬 순서 변경 핸들러...
  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleTypeChange2 = (e) => {
    setSelectedType2(e.target.value);
  };

  const handleSortChange = (order) => {
    if (!selectedType) {
      alert('매도 또는 매수 버튼을 선택한 후에 최신순 또는 오래된순을 눌러주세요!');
      return;
    }

    setSortOrder(order === '최신순' ? '내림차순' : '오름차순');
  };

  const handleSortChange2 = (order) => {
    if (!selectedType2) {
      alert('매도 또는 매수 버튼을 선택한 후에 최신순 또는 오래된순을 눌러주세요!');
      return;
    }
    setSortOrder2(order === '최신순' ? '내림차순' : '오름차순');
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`/api/order/?name=${searchTerm}`);
      const data = response.data;
      console.log(data); // 응답 데이터 로깅으로 구조 확인
      const formattedData = data.map((order) => ({
        orderId: order.orderId,
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
      const response = await axios.get(`/api/concluded/?name=${searchTerm2}`);
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

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    // 수정할 주문의 ID를 URL에 포함
    const url = `/api/order?orderId=${editingStock.orderId}`;
    // 수정할 데이터 구성
    const updatedOrder = {
      price: editingStock.price, // 사용자가 입력한 새로운 가격
      companyId: editingStock.companyId, // 기존의 회사 ID
      quantity: editingStock.quantity, // 사용자가 입력한 새로운 수량
      type: editingStock.type, // 기존의 주문 유형
    };

    try {
      // axios.put 메서드를 사용하여 수정된 주문 정보를 서버로 전송
      const response = await axios.put(url, updatedOrder);
      console.log('Order successfully updated:', response.data);

      // 주문 목록 상태 업데이트
      setStocks((prevStocks) => {
        return prevStocks.map((stock) => {
          if (stock.orderId === editingStock.orderId) {
            // 해당 주문을 새로운 데이터로 업데이트
            return { ...stock, ...updatedOrder };
          }
          return stock;
        });
      });
      setSelectedStock(null);

      // 모달 닫기 및 초기 상태로 리셋
      setEditingStock(null);
      // 여기에 주문 목록 상태를 업데이트하는 코드를 추가할 수 있습니다.
      // 수정이 완료되었다는 알림 표시
      alert(response.data.message);

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
        console.error('Error updating order:', error.response.data.message);
      } else {
        console.error('Error updating order:', error.message);
      }
    }
  };

  // 삭제 함수
  const handleDeleteClick = (orderId) => {
    if (!orderId) {
      console.log('OrderId is undefined, fetching data...');
      fetchData(() => setShowDeleteModal(true)); // 데이터 새로고침 후 모달 표시
    } else {
      setDeleteOrderId(orderId);
      setShowDeleteModal(true); // 정상적인 orderId가 있을 경우 모달 창 표시
    }
  };
  const fetchData = (callback) => {
    axios
      .get('/api/order')
      .then((response) => {
        setStocks(response.data);
        const foundOrder = response.data.find((order) => order.orderId !== undefined); // 새 데이터에서 orderId를 찾습니다.
        if (foundOrder) {
          setDeleteOrderId(foundOrder.orderId);
          console.log('Data refreshed and orderId updated.');
          callback(); // 콜백 함수로 모달 표시
        } else {
          alert('주문 데이터를 불러올 수 없습니다. 나중에 다시 시도해주세요.');
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        alert('데이터 새로고침에 실패했습니다.');
      });
  };

  const removeDeletedOrder = (orderId) => {
    const updatedStocks = stocks.filter((stock) => stock.orderId !== orderId);
    setStocks(updatedStocks);
  };
  // 실제 삭제 작업 수행
  const handleDeleteConfirm = () => {
    console.log(`Setting deleteOrderId: ${deleteOrderId}`);
    if (!deleteOrderId) {
      console.error('Delete operation failed: No orderId specified');
      return;
    }

    axios
      .delete(`/api/order?orderId=${deleteOrderId}`)
      .then((response) => {
        console.log('Order successfully deleted:', response);
        alert('주문 취소에 성공했습니다!'); // 여기에 알림 추가
        setShowDeleteModal(false); // 삭제 성공 후 모달 창 숨기기
        removeDeletedOrder(deleteOrderId); // 삭제된 주문 상태 업데이트
      })
      .catch((error) => {
        console.error('Error deleting order:', error);
      })
      .finally(() => {
        setDeleteOrderId(null); // 작업 완료 후 상태 초기화
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
        orderId: stock.orderId,
        name: hasCompanyObject ? stock.Company.name : stock.name,
        companyId: hasCompanyObject ? stock.Company.companyId : stock.symbol,
        price: hasCompanyObject ? stock.Company.currentPrice : stock.price,
        quantity: stock.quantity,
        date: formatDate(dateValue), // formatDate 함수를 사용하여 날짜를 포맷팅합니다.
        type: stock.details ? stock.details.type : '', // 여기에 type 속성 설정
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

  const getTransactionType2 = (details) => {
    return details.type === 'buy' ? '매수주문' : '매도주문';
  };

  // 오른쪽 박스에서 주식을 선택했을 때 호출할 함수
  const handleSelectConcludedStock = (stock) => {
    // Company 객체가 있는지 확인하고, 그에 따라 이름과 기타 속성 접근
    const hasCompanyObject = stock.Company !== undefined;
    const transactionType = getTransactionType2(stock.details);

    setSelectedConcludedStockDetails({
      name: hasCompanyObject ? stock.Company.name : stock.name,
      symbol: hasCompanyObject ? stock.Company.companyId : stock.symbol,
      price: hasCompanyObject ? stock.Company.currentPrice : stock.price,
      quantity: stock.quantity,
      date: formatDate(hasCompanyObject ? stock.createdAt : stock.date),
      details: stock,
      transactionType: transactionType, // 거래 유형 정보 추가
    });
  };

  return (
    <div className="order-page">
      <div className="main-content">
        <form onSubmit={handleSubmit} className="mb-3">
          <input type="text" placeholder="Search by company name..." value={searchTerm} onChange={handleChange} className="form-control" />
          <button type="submit" className="btn btn-primary mt-2 search-button">
            Search
          </button>
          <div>
            <label>
              <input type="radio" name="type" value="buy" checked={selectedType === 'buy'} onChange={handleTypeChange} /> 매수
            </label>
            <label>
              <input type="radio" name="type" value="sell" checked={selectedType === 'sell'} onChange={handleTypeChange} /> 매도
            </label>
            <button className="sort-button latest" onClick={() => handleSortChange('최신순')}>
              최신순
            </button>
            <button className="sort-button oldest" onClick={() => handleSortChange('오래된순')}>
              오래된순
            </button>
          </div>
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
                      <div className="stock-date">{formatDate(stock.date)}</div> {/* 날짜 추가 */}
                      <div className="stock-price">{formatPrice(stock.price)}</div> {/* 가격 추가 */}
                      <div className={`stock-transaction-type ${getTransactionType(stock.details)}`}>
                        {stock.details.type === 'buy' ? '🔼' : '🔽'} {getTransactionType(stock.details)}
                      </div>
                    </div>
                    <button className="btn btn-success" onClick={() => handleSelectStock(stock)}>
                      선택
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteClick(stock.orderId)}>
                      주문 취소
                    </button>
                  </div>
                ))
              : // 검색어가 없을 때는 모든 주식 목록을 표시
                stocks.map((stock) => (
                  <div className="stock-item" key={stock.symbol}>
                    <div className="stock-info">
                      <div className="stock-name">{stock.name}</div>
                      <div className="stock-quantity">{stock.quantity} 주</div>
                      <div className="stock-date">{formatDate(stock.date)}</div> {/* 날짜 추가 */}
                      <div className="stock-price">{formatPrice(stock.price)}</div> {/* 가격 추가 */}
                    <div className={`stock-transaction-type ${getTransactionType(stock.details)}`}>
                      {stock.details.type === 'buy' ? '🔼' : '🔽'} {getTransactionType(stock.details)}
                    </div>
                    </div>
                    <button className="btn btn-success" onClick={() => handleSelectStock(stock)}>
                      선택
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteClick(stock.orderId)}>
                      주문 취소
                    </button>
                  </div>
                ))}
          </div>
        </div>
        {/* 모달 창 코드를 여기에 삽입 */}
        {showDeleteModal && (
          <div className="delete-confirmation-modal">
            <div className="modal-content rounded">
              <div className="modal-header">
                <h5 className="modal-title">주문 삭제 확인</h5>
              </div>
              <div className="modal-body">
                <p>정말 해당 주문을 취소하시겠습니까?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleDeleteConfirm}>
                  예
                </button>
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  아니오
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="stock-details-container">
          {selectedStock && selectedStock.details ? (
            <div className="stock-details">
              <div className="stock-detail-name">🏢 {selectedStock.details.name}</div>
              <div className="stock-detail-price">💰 가격: {formatPrice(selectedStock.details.price)}</div>
              <div className="stock-detail-symbol">📦 수량: {selectedStock.quantity}</div>
              <div className="stock-detail-date">📅 날짜: {formatDate(selectedStock.date)}</div>
              <div className={`stock-transaction-type ${selectedStock.details.transactionType}`}>
                {selectedStock.details.type === 'buy' ? '🔼' : '🔽'} {getTransactionType(selectedStock.details)}
              </div>
              <button className="edit-button" onClick={() => setEditingStock(selectedStock.details)}>
                ✏️ 정정하기
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
          <button type="submit" className="btn btn-primary mt-2 search-button">
            Search
          </button>
          <div>
            <label>
              <input type="radio" name="type2" value="buy" checked={selectedType2 === 'buy'} onChange={handleTypeChange2} /> 매수
            </label>
            <label>
              <input type="radio" name="type2" value="sell" checked={selectedType2 === 'sell'} onChange={handleTypeChange2} /> 매도
            </label>
            <button className="sort-button latest" onClick={() => handleSortChange2('최신순')}>
              최신순
            </button>
            <button className="sort-button oldest" onClick={() => handleSortChange2('오래된순')}>
              오래된순
            </button>
          </div>
          <p className="box-label2">체결 완료</p> {/* 오른쪽 박스에 체결 완료 문구 추가 */}
        </form>
        <hr className="separator" />
        <div className="stock-list-container scrollable-container">
          <div className="stock-list">
            {searchTerm2
              ? // 검색어가 있을 때는 검색 결과를 표시
                rightSearchResults.map((stock) => (
                  <div className="stock-item" key={stock.symbol}>
                    <div className="stock-info">
                      <div className="stock-name">{stock.name}</div>
                      <div className="stock-quantity">{stock.quantity} 주</div>
                      <div className="stock-date">{formatDate(stock.date)}</div> {/* 날짜 추가 */}
                      <div className="stock-price">{formatPrice(stock.price)}</div> {/* 가격 추가 */}
                    <div className={`stock-transaction-type ${getTransactionType2(stock.details)}`}>
                      🔄 거래 유형:
                      {getTransactionType2(stock.details)}
                    </div>
                    </div>
                    <button className="btn btn-success" onClick={() => handleSelectConcludedStock(stock)}>
                      선택
                    </button>
                  </div>
                ))
              : // 검색어가 없을 때는 모든 주식 목록을 표시
                stocks2.map((stock) => (
                  <div className="stock-item" key={stock.symbol}>
                    <div className="stock-info">
                      <div className="stock-name">{stock.name}</div>
                      <div className="stock-quantity">{stock.quantity} 주</div>
                      <div className="stock-date">{formatDate(stock.date)}</div> {/* 날짜 추가 */}
                      <div className="stock-price">{formatPrice(stock.price)}</div> {/* 가격 추가 */}
                    <div className={`stock-transaction-type ${getTransactionType2(stock.details)}`}>
                      🔄 거래 유형:
                      {getTransactionType2(stock.details)}
                    </div>
                    </div>
                    <button className="btn btn-success" onClick={() => handleSelectConcludedStock(stock)}>
                      선택
                    </button>
                  </div>
                ))}
          </div>
        </div>
        {/* 오른쪽 박스 아래 세부 정보 표시를 위한 조건부 렌더링 */}

        <div className="stock-details-container2">
          {!selectedConcludedStockDetails && <div className="no-selection">세부정보를 보려면 주식을 선택하세요.</div>}
          {selectedConcludedStockDetails && (
            <div className="stock-details">
              <div className="stock-detail-name2">🏢 {selectedConcludedStockDetails.name}</div>
              <div className="stock-detail-price2">💰 가격: {selectedConcludedStockDetails.price}</div>
              <div className="stock-detail-symbol2">📦 수량: {selectedConcludedStockDetails.quantity}</div>
              <div className="stock-detail-date2">📅 날짜: {selectedConcludedStockDetails.date}</div>
              <div className="stock-detail-transaction-type2">🔄 거래 유형: {selectedConcludedStockDetails.transactionType}</div>
              {/* 기타 세부 정보 - add emojis as needed */}
            </div>
          )}
        </div>
      </div>
      {editingStock && (
        <div class="modal-wrapper show">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">주식 정정</h5>
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
              <button type="button" className="btn btn-primary" onClick={(e) => handleEditSubmit(e)}>
                수정 완료
              </button>
            </div>
          </div>
        </div>
        //   </div>
        // </div>
      )}
      <div>
        <Chatting />
      </div>
    </div>
  );
}
export default OrderPage;
