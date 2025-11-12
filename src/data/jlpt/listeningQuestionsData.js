// src/data/listeningQuestionsData.js
// ✅ UPDATED: Thêm trường explanation cho mỗi câu hỏi

const listeningData = {
  n1: {
    '2024-12': {
      sections: [
        {
          id: '1',
          title: '問題1',
          instruction: '問題1では、まず質問を聞いてください。それから話を聞いて、問題用紙の1から4の中から、最もよいものを一つ選んでください。',
          timeLimit: 15,
          questions: [
            {
              number: '01',
              subNumber: '1',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q1-01.mp3',
              options: [
                'リストを作成する',
                '議事録を見る',
                '会議に出る',
                '資材の値段を調べる'
              ],
              correctAnswer: 0,
              explanation: '音声では「まず、必要な資材のリストを作ってください」と指示されています。他の選択肢は後の作業として言及されていますが、最初にすべきことは「リストを作成する」です。'
            },
            {
              number: '02',
              subNumber: '2',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q1-02.mp3',
              options: [
                '予算を確認する',
                '企画書を作る',
                '会議室を予約する',
                '参加者に連絡する'
              ],
              correctAnswer: 1,
              explanation: '会話の中で「新しいプロジェクトの企画書をまとめてほしい」という依頼がありました。予算確認や会議室予約は企画書作成後の作業として言及されています。'
            },
            {
              number: '03',
              subNumber: '3',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q1-03.mp3',
              options: [
                '資料を印刷する',
                'メールを送る',
                '電話をかける',
                '報告書を書く'
              ],
              correctAnswer: 3,
              explanation: '上司から「今日中に報告書を提出してください」と指示されています。他の作業は明日以降の予定として話されているため、今日すべきことは「報告書を書く」です。'
            },
            {
              number: '04',
              subNumber: '4',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q1-04.mp3',
              options: [
                '商品を発注する',
                '在庫を確認する',
                '顧客に連絡する',
                '配送を手配する'
              ],
              correctAnswer: 2,
              explanation: '会話では「在庫が不足しているので、至急お客様に連絡して状況を説明する必要がある」と述べられています。発注や配送は顧客対応の後の処理として言及されています。'
            },
            {
              number: '05',
              subNumber: '5',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q1-05.mp3',
              options: [
                'データを分析する',
                'グラフを作成する',
                'プレゼンを準備する',
                '上司に報告する'
              ],
              correctAnswer: 0,
              explanation: '音声で「まず最新のデータを詳しく分析してから、その結果をグラフにまとめてください」と指示されています。最初のステップは「データを分析する」ことです。'
            }
          ]
        },
        {
          id: '2',
          title: '問題2',
          instruction: '問題2では、まず質問を聞いてください。そのあと、問題用紙を見てください。読む時間があります。それから話を聞いて、問題用紙の1から4の中から、最もよいものを一つ選んでください。',
          timeLimit: 15,
          questions: [
            {
              number: '06',
              subNumber: '1',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q2-01.mp3',
              options: [
                'プロジェクトの進捗を確認する',
                'スケジュールを調整する',
                'チームメンバーと打ち合わせをする',
                '予算の見直しをする'
              ],
              correctAnswer: 1,
              explanation: '会話の中で「来週のスケジュールが重なっているので調整が必要だ」と述べられています。進捗確認や打ち合わせは調整後に行うと言及されているため、優先すべきは「スケジュールを調整する」です。'
            },
            {
              number: '07',
              subNumber: '2',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q2-02.mp3',
              options: [
                '新しい機能を追加する',
                'バグを修正する',
                'テストを実施する',
                'ドキュメントを更新する'
              ],
              correctAnswer: 2,
              explanation: '音声では「新機能の開発は完了したので、まず動作確認のテストを行ってほしい」と指示されています。バグ修正やドキュメント更新はテスト後の作業として説明されています。'
            },
            {
              number: '08',
              subNumber: '3',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q2-03.mp3',
              options: [
                '顧客の要望を聞く',
                '見積もりを作成する',
                '契約書を確認する',
                'サンプルを送る'
              ],
              correctAnswer: 0,
              explanation: '会話で「まず、お客様が何を求めているのか詳しく聞いてから、それに基づいて提案を作りましょう」と述べられています。他の作業は要望確認後の段階です。'
            },
            {
              number: '09',
              subNumber: '4',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q2-04.mp3',
              options: [
                '会議の議題を決める',
                '参加者を確認する',
                '資料を準備する',
                '会場を予約する'
              ],
              correctAnswer: 3,
              explanation: '音声で「明日の会議のために、まだ部屋の予約ができていないので至急手配してください」と指示されています。他の準備は会場確保後に進めると言及されています。'
            },
            {
              number: '10',
              subNumber: '5',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q2-05.mp3',
              options: [
                'マーケティング戦略を立てる',
                '広告の効果を測定する',
                '競合分析を行う',
                '販売目標を設定する'
              ],
              correctAnswer: 2,
              explanation: '会話で「戦略を立てる前に、まず競合他社の動向を調べる必要がある」と述べられています。競合分析が最初のステップとして明確に指示されています。'
            },
            {
              number: '11',
              subNumber: '6',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q2-06.mp3',
              options: [
                '研修プログラムを作成する',
                '新入社員を採用する',
                '評価制度を見直す',
                'チームビルディングを企画する'
              ],
              correctAnswer: 0,
              explanation: '音声では「新入社員が来月入社するので、それまでに研修内容を準備しておいてください」と依頼されています。他の業務は研修プログラム作成後の課題として言及されています。'
            }
          ]
        },
        {
          id: '3',
          title: '問題3',
          instruction: '問題3では、問題用紙に何も印刷されていません。まず文を聞いてください。それから、それに対する返事を聞いて、1から3の中から、最もよいものを一つ選んでください。',
          timeLimit: 10,
          questions: [
            {
              number: '12',
              subNumber: '1',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q3-01.mp3',
              options: [
                'はい、そうですね',
                'いいえ、違います',
                'わかりました'
              ],
              correctAnswer: 0,
              explanation: '質問は「この資料、とても分かりやすいですね」という同意を求める発言です。これに対して適切な返答は「はい、そうですね」という同意の表現です。'
            },
            {
              number: '13',
              subNumber: '2',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q3-02.mp3',
              options: [
                'そうですか',
                'ありがとうございます',
                'すみません'
              ],
              correctAnswer: 1,
              explanation: '相手から「いつも丁寧な仕事をしてくれて助かります」という感謝の言葉がありました。これに対する適切な返答は「ありがとうございます」です。'
            },
            {
              number: '14',
              subNumber: '3',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q3-03.mp3',
              options: [
                'はい、お願いします',
                'いいえ、結構です',
                'どちらでもいいです'
              ],
              correctAnswer: 0,
              explanation: '「お茶をお持ちしましょうか」という申し出に対して、受け入れる場合は「はい、お願いします」が適切な返答です。'
            },
            {
              number: '15',
              subNumber: '4',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q3-04.mp3',
              options: [
                'そうしましょう',
                'やめておきます',
                '考えておきます'
              ],
              correctAnswer: 2,
              explanation: '「この件について、どう思いますか」という意見を求める質問に対して、即答を避け検討する意思を示す「考えておきます」が自然な返答です。'
            },
            {
              number: '16',
              subNumber: '5',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q3-05.mp3',
              options: [
                '承知しました',
                '失礼しました',
                'お疲れ様でした'
              ],
              correctAnswer: 0,
              explanation: '上司から「この書類を明日までに提出してください」という指示がありました。これに対して了解を示す適切な返答は「承知しました」です。'
            }
          ]
        },
        {
          id: '4',
          title: '問題4',
          instruction: '問題4では、問題用紙に何も印刷されていません。まず文を聞いてください。それから、それに対する返事を聞いて、1から3の中から、最もよいものを一つ選んでください。',
          timeLimit: 12,
          questions: [
            {
              number: '17',
              subNumber: '1',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q4-01.mp3',
              options: [
                '経済成長が期待される',
                '環境問題が深刻化する',
                '技術革新が進む'
              ],
              correctAnswer: 2,
              explanation: '音声では「AI やロボット技術の発展により、今後10年で社会が大きく変わるだろう」と述べられており、「技術革新が進む」という内容と一致します。'
            },
            {
              number: '18',
              subNumber: '2',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q4-02.mp3',
              options: [
                '人口減少に対応する',
                '教育制度を改革する',
                '社会保障を充実させる'
              ],
              correctAnswer: 0,
              explanation: '話の内容は「少子高齢化が進む中で、労働力不足や地域の過疎化への対策が急務だ」というもので、「人口減少に対応する」が主題です。'
            },
            {
              number: '19',
              subNumber: '3',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q4-03.mp3',
              options: [
                'グローバル化が進む',
                '地域経済が活性化する',
                '伝統文化が継承される'
              ],
              correctAnswer: 1,
              explanation: '音声では「地方自治体が観光資源を活用し、地元産業を振興している」という内容が述べられており、「地域経済が活性化する」と一致します。'
            },
            {
              number: '20',
              subNumber: '4',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q4-04.mp3',
              options: [
                'デジタル化を推進する',
                '持続可能性を重視する',
                'イノベーションを促進する'
              ],
              correctAnswer: 1,
              explanation: '話では「環境に配慮した製品開発や、再生可能エネルギーの利用拡大が企業の重要課題となっている」と述べられ、「持続可能性を重視する」が主旨です。'
            }
          ]
        },
        {
          id: '5',
          title: '問題5',
          instruction: '問題5では、長めの話を聞きます。この問題には練習はありません。メモをとってもかまいません。1番、2番',
          timeLimit: 8,
          questions: [
            {
              number: '21',
              subNumber: '1',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q5-01.mp3',
              options: [
                '新製品の開発計画について',
                '市場調査の結果について',
                '販売戦略の見直しについて',
                '組織改革の方針について'
              ],
              correctAnswer: 0,
              explanation: '長い音声の内容は「来年度の新製品ラインナップ、開発スケジュール、投資計画」について詳しく説明されており、全体のテーマは「新製品の開発計画」です。'
            },
            {
              number: '22',
              subNumber: '2',
              category: 'listening',
              audioUrl: '/audio/n1/2024-12/q5-02.mp3',
              options: [
                '環境保護の取り組みについて',
                'エネルギー政策の転換について',
                '持続可能な社会の実現について',
                '国際協力の強化について'
              ],
              correctAnswer: 2,
              explanation: '話の内容は「気候変動対策、循環型社会の構築、企業と市民の協働」など、持続可能な開発目標(SDGs)に関する包括的な内容で、「持続可能な社会の実現について」が最も適切です。'
            }
          ]
        }
      ]
    }
  },
  n2: {
    '2024-12': {
      sections: [
        {
          id: '1',
          title: '問題1',
          instruction: '問題1では、まず質問を聞いてください。それから話を聞いて、問題用紙の1から4の中から、最もよいものを一つ選んでください。',
          timeLimit: 12,
          questions: [
            {
              number: '01',
              subNumber: '1',
              category: 'listening',
              audioUrl: '/audio/n2/2024-12/q1-01.mp3',
              options: [
                'レポートを提出する',
                '先生に相談する',
                '資料を探す',
                '友達に聞く'
              ],
              correctAnswer: 1,
              explanation: '会話で「分からないことがあったら、まず先生に相談するのが一番いいよ」と述べられています。レポート提出は相談後の作業として言及されています。'
            }
          ]
        }
      ]
    }
  }
};

export function getListeningQuestions(levelId, examId) {
  return listeningData[levelId]?.[examId] || null;
}

export default listeningData;