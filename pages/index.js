import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function VocabMatchingGame() {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // 游戏状态
  const [firstCard, setFirstCard] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [disabled, setDisabled] = useState(false);

  // 单词数据（英文 + 中文）
  const wordPairs = [
    { id: 1, word: 'apple', type: 'word', pairId: 1 },
    { id: 2, word: '苹果', type: 'cn', pairId: 1 },
    { id: 3, word: 'banana', type: 'word', pairId: 2 },
    { id: 4, word: '香蕉', type: 'cn', pairId: 2 },
    { id: 5, word: 'cat', type: 'word', pairId: 3 },
    { id: 6, word: '猫', type: 'cn', pairId: 3 },
    { id: 7, word: 'dog', type: 'word', pairId: 4 },
    { id: 8, word: '狗', type: 'cn', pairId: 4 },
  ];

  // 打乱顺序
  const shuffleCards = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState(shuffleCards(wordPairs));

  // 点击卡片
  const handleCardClick = (card) => {
    if (disabled || matchedPairs.includes(card.id)) return;

    if (!firstCard) {
      setFirstCard(card);
    } else {
      // 判断是否配对成功
      if (firstCard.pairId === card.pairId && firstCard.id !== card.id) {
        setMatchedPairs([...matchedPairs, firstCard.id, card.id]);
        setFirstCard(null);
      } else {
        setDisabled(true);
        setTimeout(() => setDisabled(false), 600);
        setFirstCard(null);
      }
    }
  };

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

  // 完成游戏
  const completeGame = () => {
    setGameCompleted(true);
    setMessage('游戏完成！点击提交记录成绩');
    setMessageType('success');
  };

  // 提交
  const submitCompletion = async () => {
    if (!studentName || !studentId) {
      setMessage('姓名和学号不能为空！');
      setMessageType('error');
      return;
    }
    if (!gameCompleted) {
      setMessage('请先完成游戏！');
      setMessageType('error');
      return;
    }

    try {
      await supabase
        .from('student_answers')
        .delete()
        .eq('student_id', studentId)
        .eq('exercise_id', 'vocab-matching-game');

      const { error } = await supabase.from('student_answers').insert([
        {
          student_name: studentName,
          student_id: studentId,
          exercise_id: 'vocab-matching-game',
          score: 100,
          completed: true,
        },
      ]);

      if (error) throw error;
      setMessage('提交成功！');
      setMessageType('success');
      setSubmitted(true);
    } catch (err) {
      setMessage('提交失败：' + err.message);
      setMessageType('error');
    }
  };

  // 判断游戏是否全部完成
  const allMatched = matchedPairs.length === wordPairs.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 p-6 bg-white/90 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">学生信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">姓名</label>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={submitted}
              />
            </div>
            <div>
              <label className="block mb-2">学号</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={submitted}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center bg-white rounded-3xl shadow-2xl p-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-6">
            词汇连连看
          </h1>

          {!gameStarted ? (
            <p className="text-lg text-gray-600 mb-8 text-center">
              把英文和中文配对，轻松记单词！
            </p>
          ) : (
            <div className="w-full mb-8">
              <p className="text-center mb-4">
                已完成配对：{matchedPairs.length / 2}/{wordPairs.length / 2}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className={`p-5 rounded-xl text-center transition-all cursor-pointer border-2 
                    ${matchedPairs.includes(card.id)
                      ? 'bg-green-100 border-green-400'
                      : firstCard === card
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <p className="text-lg font-medium">{card.word}</p>
                  </div>
                ))}
              </div>

              {allMatched && !gameCompleted && (
                <button
                  onClick={completeGame}
                  className="mt-6 px-8 py-3 bg-green-500 text-white rounded-full shadow-lg w-full"
                >
                  ✅ 全部配对成功！我完成了
                </button>
              )}
            </div>
          )}

          {!gameStarted && (
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-lg"
            >
              开始游戏
            </button>
          )}

          {gameCompleted && !submitted && (
            <button
              onClick={submitCompletion}
              className="px-8 py-4 bg-pink-500 text-white rounded-full"
            >
              提交完成状态
            </button>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
