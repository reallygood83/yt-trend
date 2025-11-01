'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPremiumPage() {
  const { user } = useAuth();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleGrantPremium = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/grant-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || user?.uid, // userId 입력 없으면 현재 로그인 사용자
          email: email || user?.email,
          grantedBy: 'admin'
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, message: data.message });
        setUserId('');
        setEmail('');
      } else {
        setResult({ success: false, message: data.error || '오류가 발생했습니다.' });
      }

    } catch {
      setResult({ success: false, message: '네트워크 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantCurrentUser = async () => {
    if (!user) {
      setResult({ success: false, message: '로그인이 필요합니다.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/grant-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          grantedBy: 'self-service'
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, message: `✅ ${user.email}에게 프리미엄 권한이 부여되었습니다!` });
      } else {
        setResult({ success: false, message: data.error || '오류가 발생했습니다.' });
      }

    } catch {
      setResult({ success: false, message: '네트워크 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎯 프리미엄 권한 관리
            </h1>
            <p className="text-gray-600">
              무제한 노트 생성 권한 부여
            </p>
          </div>

          {/* 현재 사용자 정보 */}
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">현재 로그인 사용자</p>
              <p className="font-semibold text-gray-800">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">UID: {user.uid}</p>
            </div>
          )}

          {/* 빠른 프리미엄 부여 버튼 (현재 사용자) */}
          {user && (
            <div className="mb-8">
              <button
                onClick={handleGrantCurrentUser}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? '처리 중...' : '⚡ 내 계정을 프리미엄으로 전환'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                클릭 한 번으로 현재 로그인 계정에 프리미엄 권한 부여
              </p>
            </div>
          )}

          {/* 구분선 */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">또는</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* 수동 입력 폼 */}
          <form onSubmit={handleGrantPremium} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자 ID (Firebase UID)
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Firebase Authentication UID를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                비워두면 현재 로그인 사용자 ID 사용
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                비워두면 현재 로그인 사용자 이메일 사용
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : '프리미엄 권한 부여'}
            </button>
          </form>

          {/* 결과 메시지 */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="font-medium">{result.message}</p>
            </div>
          )}

          {/* 안내 정보 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">📌 사용 방법</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 간편 방법: &quot;내 계정을 프리미엄으로 전환&quot; 버튼 클릭</li>
              <li>• 수동 방법: 사용자 UID와 이메일 입력 후 부여</li>
              <li>• 프리미엄 사용자는 무제한 노트 저장 가능</li>
              <li>• Firebase Console에서도 직접 확인 가능 (premiumUsers 컬렉션)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
