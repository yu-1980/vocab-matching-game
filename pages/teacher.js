import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 获取所有完成游戏的学生
  const fetchCompletedStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('*')
        .eq('exercise_id', 'vocab-matching-game')
        .eq('completed', true)
        .order('submit_time', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
      setError('');
    } catch (err) {
      setError('加载失败：' + err.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">词汇连连看 - 完成情况统计</h1>
        
        <button
          onClick={fetchCompletedStudents}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all mb-6"
        >
          刷新列表
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-6 py-4 text-left border-b border-gray-300 dark:border-gray-600">序号</th>
                  <th className="px-6 py-4 text-left border-b border-gray-300 dark:border-gray-600">姓名</th>
                  <th className="px-6 py-4 text-left border-b border-gray-300 dark:border-gray-600">学号</th>
                  <th className="px-6 py-4 text-left border-b border-gray-300 dark:border-gray-600">完成状态</th>
                  <th className="px-6 py-4 text-left border-b border-gray-300 dark:border-gray-600">提交时间</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      暂无学生完成游戏
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-600">{student.student_name}</td>
                      <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-600">{student.student_id}</td>
                      <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-600">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                          已完成
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-600">
                        {new Date(student.submit_time).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
