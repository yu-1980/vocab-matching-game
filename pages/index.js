import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function VocabMatchingGame() {
  // 学生信息状态
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // 开始游戏
  const startGame = () => {
    if (!studentName || !studentId) {
      setMessage('请先填写姓名和学号！');
      setMessageType('error');
      return;
    }
    setGameStarted(true);
    setMessage('');
  };

  // 标记游戏完成
  const completeGame = () => {
    setGameCompleted(true);
    setMessage('游戏完成！请点击提交按钮记录完成状态');
    setMessageType('success');
  };

  // 提交完成状态到Supabase（优化：去掉onConflict，改用先删后插，避免约束报错）
  const submitCompletion = async () => {
    if (!studentName || !studentId) {
      setMessage('姓名和学号不能为空！');
      setMessageType('error');
      return;
    }

    if (!gameCompleted) {
      setMessage('请先完成游戏再提交！');
      setMessageType('error');
      return;
    }

    try {
      // 先删除该学生的原有记录（避免重复提交）
      await supabase
        .from('student_answers')
        .delete()
        .eq('student_id', studentId)
        .eq('exercise_id', 'vocab-matching-game');

      // 存储学生完成状态
      const { error } = await supabase
        .from('student_answers')
        .insert([
          {
            student_name: studentName,
            student_id: studentId,
            exercise_id: 'vocab-matching-game', // 词汇连连看游戏ID
            score: 100, // 游戏类统一记满分
            completed: true
          }
        ]);

      if (error) throw error;

      setMessage('提交成功！你已完成词汇连连看游戏');
      setMessageType('success');
      setSubmitted(true);
    } catch (err) {
      setMessage('提交失败：' + err.message);
      setMessageType('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* 学生信息填写区（新增） */}
        <div className="mb-8 p-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">学生信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">姓名：</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="请输入你的姓名"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                disabled={submitted}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">学号：</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="请输入你的学号（如：2024001）"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                disabled={submitted}
              />
            </div>
          </div>
        </div>

        {/* 原扣子网页的游戏内容（补充词汇卡片，解决空白问题） */}
        <div className="flex flex-col items-center justify-center min-h-[600px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12">
          <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">词汇连连看</h1>
          
          {!gameStarted ? (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 text-center">
              欢迎来到英语词汇学习游戏！<br />
              通过配对图片和单词，轻松学习英语单词。
            </p>
          ) : (
            // 替换核心：新增词汇卡片内容，解决空白问题
            <div className="w-full max-w-3xl mb-12">
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-center">
                🎉 游戏已开始！完成所有词汇配对后点击下方按钮标记完成
              </p>
              {/* 词汇连连看游戏卡片（可自定义单词） */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { word: 'apple', cn: '苹果', matched: false },
                  { word: 'banana', cn: '香蕉', matched: false },
                  { word: 'cat', cn: '猫', matched: false },
                  { word: 'dog', cn: '狗', matched: false },
                  { word: 'book', cn: '书', matched: false },
                  { word: 'pen', cn: '笔', matched: false },
                  { word: 'desk', cn: '桌子', matched: false },
                  { word: 'chair', cn: '椅子', matched: false },
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-4 text-center cursor-pointer hover:scale-105 transition-transform"
                  >
                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400">{item.word}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">{item.cn}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                玩法：记住单词和中文意思，后续会随机打乱让你配对（简易版演示）
              </p>
              <button
                onClick={completeGame}
                className="mt-8 inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-10 text-xl px-12 py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-white disabled:opacity-50 disabled:pointer-events-none"
                disabled={gameCompleted || submitted}
              >
                我已完成游戏
              </button>
            </div>
          )}

          {/* 游戏控制按钮 */}
          {!gameStarted && (
            <button
              onClick={startGame}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-10 text-xl px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-white disabled:opacity-50 disabled:pointer-events-none"
              disabled={submitted}
            >
              开始游戏
            </button>
          )}

          {/* 提交完成状态按钮 */}
          {gameCompleted && !submitted && (
            <button
              onClick={submitCompletion}
              className="mt-8 inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-10 text-xl px-12 py-6 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-white"
              disabled={submitted}
            >
              提交完成状态
            </button>
          )}

          {/* 提示信息 */}
          {message && (
            <div 
              className={`mt-8 p-4 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
