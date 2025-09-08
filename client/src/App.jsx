import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecordForm from './components/RecordForm';

const App = () => {
  // 状态管理
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [dnsRecords, setDnsRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // 获取域名列表
  const fetchZones = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/zones');
      if (response.data.success) {
        setZones(response.data.result);
      } else {
        setError('获取域名列表失败');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || '获取域名列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取 DNS 解析记录
  const fetchDnsRecords = async (zoneId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/zones/${zoneId}/dns_records`);
      if (response.data.success) {
        setDnsRecords(response.data.result);
      } else {
        setError('获取 DNS 记录失败');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || '获取 DNS 记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除 DNS 记录
  const deleteRecord = async (recordId) => {
    if (!window.confirm('确定要删除这个 DNS 记录吗？')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/zones/${selectedZone.id}/dns_records/${recordId}`);
      if (response.data.success) {
        // 重新获取记录列表
        fetchDnsRecords(selectedZone.id);
      } else {
        setError('删除记录失败');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || '删除记录失败');
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingRecord) {
        // 修改记录
        response = await axios.put(`/api/zones/${selectedZone.id}/dns_records/${editingRecord.id}`, formData);
      } else {
        // 添加新记录
        response = await axios.post(`/api/zones/${selectedZone.id}/dns_records`, formData);
      }

      if (response.data.success) {
        setShowForm(false);
        setEditingRecord(null);
        fetchDnsRecords(selectedZone.id);
      } else {
        setError(editingRecord ? '修改记录失败' : '添加记录失败');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || (editingRecord ? '修改记录失败' : '添加记录失败'));
    }
  };

  // 组件首次加载时获取域名列表
  useEffect(() => {
    fetchZones();
  }, []);

  // 当选中的域名变化时，获取该域名的 DNS 记录
  useEffect(() => {
    if (selectedZone) {
      fetchDnsRecords(selectedZone.id);
    } else {
      setDnsRecords([]);
    }
  }, [selectedZone]);

  // 处理域名选择
  const handleZoneSelect = (e) => {
    const zoneId = e.target.value;
    const zone = zones.find(z => z.id === zoneId);
    setSelectedZone(zone || null);
  };

  // 打开编辑表单
  const openEditForm = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  // 打开添加表单
  const openAddForm = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cloudflare DNS 管理面板</h1>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        )}

        {/* 域名选择器 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label htmlFor="zone-select" className="block text-sm font-medium text-gray-700 mb-2">
            选择域名：
          </label>
          <select
            id="zone-select"
            value={selectedZone?.id || ''}
            onChange={handleZoneSelect}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">请选择一个域名</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        {/* DNS 记录管理 */}
        {selectedZone && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedZone.name} 的 DNS 记录
              </h2>
              <button
                onClick={openAddForm}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                添加新记录
              </button>
            </div>

            {/* DNS 记录表格 */}
            {dnsRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        内容
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TTL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        代理状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dnsRecords.map(record => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.content}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.ttl === 1 ? 'Auto' : record.ttl}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.proxied 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.proxied ? '已代理' : 'DNS 直连'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openEditForm(record)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            修改
                          </button>
                          <button
                            onClick={() => deleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">该域名下暂无 DNS 记录</p>
            )}
          </div>
        )}

        {/* 记录表单模态框 */}
        {showForm && (
          <RecordForm
            record={editingRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingRecord(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
