const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite 和 React 默认端口
  credentials: true
}));
app.use(express.json());

// 创建 Cloudflare API 实例
const cloudflareAPI = axios.create({
  baseURL: 'https://api.cloudflare.com/client/v4',
  headers: {
    'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// API 路由

// 获取所有域名列表
app.get('/api/zones', async (req, res) => {
  try {
    const response = await cloudflareAPI.get('/zones');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching zones:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || { message: 'Internal server error' }
    });
  }
});

// 获取指定域名的 DNS 解析记录
app.get('/api/zones/:zoneId/dns_records', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const response = await cloudflareAPI.get(`/zones/${zoneId}/dns_records`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching DNS records:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || { message: 'Internal server error' }
    });
  }
});

// 添加新的 DNS 解析记录
app.post('/api/zones/:zoneId/dns_records', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const recordData = req.body;
    const response = await cloudflareAPI.post(`/zones/${zoneId}/dns_records`, recordData);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating DNS record:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || { message: 'Internal server error' }
    });
  }
});

// 修改 DNS 解析记录
app.put('/api/zones/:zoneId/dns_records/:recordId', async (req, res) => {
  try {
    const { zoneId, recordId } = req.params;
    const recordData = req.body;
    const response = await cloudflareAPI.put(`/zones/${zoneId}/dns_records/${recordId}`, recordData);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating DNS record:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || { message: 'Internal server error' }
    });
  }
});

// 删除 DNS 解析记录
app.delete('/api/zones/:zoneId/dns_records/:recordId', async (req, res) => {
  try {
    const { zoneId, recordId } = req.params;
    const response = await cloudflareAPI.delete(`/zones/${zoneId}/dns_records/${recordId}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting DNS record:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || { message: 'Internal server error' }
    });
  }
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    console.warn('Warning: CLOUDFLARE_API_TOKEN environment variable is not set!');
  }
});
