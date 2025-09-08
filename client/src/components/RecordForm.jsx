import React, { useState, useEffect } from 'react';

const RecordForm = ({ record, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'A',
    name: '',
    content: '',
    ttl: 3600,
    proxied: false
  });

  const [errors, setErrors] = useState({});

  // 如果是编辑模式，预填充表单数据
  useEffect(() => {
    if (record) {
      setFormData({
        type: record.type,
        name: record.name,
        content: record.content,
        ttl: record.ttl === 1 ? 3600 : record.ttl,
        proxied: record.proxied || false
      });
    }
  }, [record]);

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // 清除相关错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '记录名称不能为空';
    }

    if (!formData.content.trim()) {
      newErrors.content = '记录内容不能为空';
    }

    if (formData.ttl < 60) {
      newErrors.ttl = 'TTL 最小值为 60 秒';
    }

    // 根据记录类型进行特定验证
    switch (formData.type) {
      case 'A':
        const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (!ipv4Regex.test(formData.content)) {
          newErrors.content = '请输入有效的 IPv4 地址';
        }
        break;
      case 'AAAA':
        // 简单的 IPv6 验证
        if (!formData.content.includes(':')) {
          newErrors.content = '请输入有效的 IPv6 地址';
        }
        break;
      case 'CNAME':
        if (formData.content.includes(' ')) {
          newErrors.content = 'CNAME 记录不能包含空格';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // 构建提交数据
      const submitData = {
        type: formData.type,
        name: formData.name,
        content: formData.content,
        ttl: parseInt(formData.ttl)
      };

      // 只有 A 和 AAAA 记录可以设置代理状态
      if (['A', 'AAAA'].includes(formData.type)) {
        submitData.proxied = formData.proxied;
      }

      onSubmit(submitData);
    }
  };

  // DNS 记录类型选项
  const recordTypes = [
    'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'NS', 'PTR'
  ];

  // TTL 预设选项
  const ttlOptions = [
    { value: 60, label: '1 分钟' },
    { value: 300, label: '5 分钟' },
    { value: 1800, label: '30 分钟' },
    { value: 3600, label: '1 小时' },
    { value: 14400, label: '4 小时' },
    { value: 86400, label: '1 天' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {record ? '修改 DNS 记录' : '添加新 DNS 记录'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 记录类型 */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                记录类型
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {recordTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 记录名称 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                名称
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="例如：www 或 @ (根域名)"
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* 记录内容 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                内容
              </label>
              <input
                type="text"
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder={
                  formData.type === 'A' ? '例如：192.168.1.1' :
                  formData.type === 'CNAME' ? '例如：example.com' :
                  formData.type === 'MX' ? '例如：10 mail.example.com' :
                  '记录内容'
                }
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {/* TTL */}
            <div>
              <label htmlFor="ttl" className="block text-sm font-medium text-gray-700 mb-1">
                TTL (秒)
              </label>
              <select
                id="ttl"
                name="ttl"
                value={formData.ttl}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {ttlOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.value}s)
                  </option>
                ))}
              </select>
              {errors.ttl && (
                <p className="mt-1 text-sm text-red-600">{errors.ttl}</p>
              )}
            </div>

            {/* 代理状态 (仅对 A 和 AAAA 记录显示) */}
            {['A', 'AAAA'].includes(formData.type) && (
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="proxied"
                    checked={formData.proxied}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    启用 Cloudflare 代理 (橙色云朵)
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  启用后将通过 Cloudflare 代理流量，提供 CDN 和安全保护
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {record ? '更新' : '添加'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecordForm;
