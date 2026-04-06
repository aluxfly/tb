"use client";

import { useState, useEffect } from "react";
import { Qualification } from "../types/qualification";
import {
  getQualifications,
  addQualification,
  updateQualification,
  deleteQualification,
  getExpiryAlertCount,
} from "../lib/qualifications";

export default function QualificationsPage() {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    level: "",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: "",
    region: "全国",
  });
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setQualifications(getQualifications());
    setAlertCount(getExpiryAlertCount());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateQualification(editingId, formData);
    } else {
      addQualification(formData);
    }
    loadData();
    resetForm();
  };

  const handleEdit = (q: Qualification) => {
    setEditingId(q.id);
    setFormData({
      name: q.name,
      type: q.type,
      level: q.level,
      issuingAuthority: q.issuingAuthority,
      issueDate: q.issueDate,
      expiryDate: q.expiryDate,
      region: q.region,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("确定删除这条资质？")) {
      deleteQualification(id);
      loadData();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      type: "",
      level: "",
      issuingAuthority: "",
      issueDate: "",
      expiryDate: "",
      region: "全国",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      valid: "bg-green-100 text-green-800",
      expiring: "bg-yellow-100 text-yellow-800",
      expired: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      valid: "有效",
      expiring: "即将过期",
      expired: "已过期",
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getDaysLeft = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const days = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">智标通 · 资质管理</h1>
            <p className="text-sm text-gray-500 mt-1">管理您的企业资质证书</p>
          </div>
          <a href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            ← 返回标讯
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 告警提示 */}
        {alertCount > 0 && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-yellow-700">
                您有 <strong>{alertCount}</strong> 条资质即将过期或已过期，请及时处理！
              </p>
            </div>
          </div>
        )}

        {/* 添加按钮 */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">我的资质 ({qualifications.length})</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              + 添加资质
            </button>
          )}
        </div>

        {/* 表单 */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingId ? "编辑资质" : "新增资质"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">资质名称 *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="如：电子与智能化工程专业承包二级"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">资质类型 *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="如：施工资质、设计资质、ISO认证等"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">资质等级</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="">请选择</option>
                    <option value="一级">一级</option>
                    <option value="二级">二级</option>
                    <option value="三级">三级</option>
                    <option value="无/不分等级">无/不分等级</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">适用地区</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  >
                    <option value="全国">全国</option>
                    <option value="北京市">北京市</option>
                    <option value="上海市">上海市</option>
                    <option value="广东省">广东省</option>
                    <option value="浙江省">浙江省</option>
                    <option value="江苏省">江苏省</option>
                    <option value="四川省">四川省</option>
                    <option value="湖北省">湖北省</option>
                    {/* 可根据需要扩展更多省份 */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">发证机关 *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="如：住房和城乡建设部"
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">发证日期 *</label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">有效期至 *</label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {editingId ? "保存修改" : "添加"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 资质列表 */}
        {qualifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无资质</h3>
            <p className="mt-1 text-sm text-gray-500">点击上方"添加资质"按钮开始录入您的企业资质。</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">资质名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型/等级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">地区</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">有效期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {qualifications.map((q) => {
                  const daysLeft = getDaysLeft(q.expiryDate);
                  return (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{q.name}</div>
                        <div className="text-xs text-gray-500">{q.issuingAuthority}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{q.type}</div>
                        <div className="text-xs text-gray-500">{q.level || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{q.region}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{q.expiryDate}</div>
                        {q.status === "expiring" && daysLeft >= 0 && (
                          <div className="text-xs text-yellow-600">剩余 {daysLeft} 天</div>
                        )}
                        {q.status === "expired" && (
                          <div className="text-xs text-red-600">已过期 {Math.abs(daysLeft)} 天</div>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(q.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(q)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mr-4"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 使用说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 录入您的企业资质证书（类型、等级、有效期等）</li>
            <li>• 系统将自动根据资质与标讯要求计算匹配度</li>
            <li>• 有效期提醒：提前30天告警，过期自动标记为"无效"</li>
            <li>• 数据保存在浏览器本地存储（localStorage），不会上传到服务器</li>
          </ul>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
        <p>智标通 MVP · 资质管理模块</p>
      </footer>
    </div>
  );
}
