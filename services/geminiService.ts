
import { GoogleGenAI } from "@google/genai";
import { FocusSession, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function formatSessionsForPrompt(sessions: FocusSession[]): string {
  if (sessions.length === 0) {
    return "最近のセッションデータはありません。";
  }
  return sessions
    .slice(-10) // 簡潔さのため最新10件のセッションを使用
    .map(s => {
      const sessionTime = new Date(s.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      return `- ${sessionTime} - タスク: ${s.task}, 集中度: ${s.concentration}/5, 気分: ${s.mood}`;
    })
    .join('\n');
}

export async function getMorningBriefing(sleepHours: number, previousSessions: FocusSession[]): Promise<string> {
  const sessionSummary = formatSessionsForPrompt(previousSessions);
  const prompt = `
    あなたは、学生をサポートする科学的根拠に基づいたフォーカスコーチAIです。
    ユーザーは昨夜、${sleepHours}時間睡眠しました。
    最近の集中セッションのデータは以下の通りです（時刻、タスク、集中度、気分）:
    ${sessionSummary}

    睡眠と過去のデータ（特に集中度と時刻の関係）に基づき、以下を提供してください:
    1. 100点満点の「集中コンディションスコア」。現実的に評価してください。例えば6.5時間睡眠が100点満点になることはありません。
    2. 今日、困難なタスクに取り組むための2時間の「ゴールデンタイム」の提案。
    3. 提案の根拠となる、簡潔で励みになる説明。

    応答は、短くフレンドリーなメッセージ形式でお願いします。例：「おはようございます！昨夜は${sleepHours}時間の睡眠でしたので、今日の集中コンディションスコアは75/100点といったところでしょう。データを見ると午前中に集中力が高い傾向がありますね。午前10時から12時の間に最も難しいタスクに取り組むことをお勧めします。生産的な一日にしましょう！」
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("モーニングブリーフィングの取得中にエラー:", error);
    return "朝のアドバイスを取得できませんでした。接続とAPIキーを確認してください。集中力を高めるには7〜9時間の睡眠が理想的です！";
  }
}


export async function getInterventionAdvice(recentSessions: FocusSession[]): Promise<string> {
    const sessionSummary = formatSessionsForPrompt(recentSessions);
    const prompt = `
      あなたは、ユーザーをサポートするフォーカスコーチAIです。ユーザーが集中力を失っているようです。
      直近3回のセッションで、集中度の評価が低い（3/5未満）状態が続いています。
      データはこちらです:
      ${sessionSummary}
      
      以下の3つの介入策のうち1つを、簡潔で実行可能な説明とともに提案してください。共感的で、励ますようなトーンでお願いします。ロボットのような話し方は避けてください。
      1. 栄養補給：オメガ3（くるみなど）やポリフェノール（ベリーやダークチョコレートなど）を含むスナックを提案する。
      2. 軽い運動：5〜10分の短い散歩やストレッチを提案する。
      3. マインドフルネス：5分間のガイド付きマインドフルネスや呼吸法を提案する。

      応答例：「少し壁にぶつかっているようですね。誰にでもあることなので、大丈夫ですよ。リセットするために、5分ほど散歩に出てみてはいかがでしょうか？少し体を動かすと、頭がすっきりしてエネルギーが湧いてきます。あなたならできますよ！」
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("介入アドバイスの取得中にエラー:", error);
        return "集中するのが難しいようですね。短い休憩を取ったり、健康的なスナックを食べたり、少しストレッチをしたりすると、きっと助けになります。自分を責めすぎないでくださいね！";
    }
}

export async function getChatResponse(question: string, sessions: FocusSession[], chatHistory: ChatMessage[]): Promise<string> {
  const sessionSummary = formatSessionsForPrompt(sessions);

  // チャット履歴をフォーマット
  const historyText = chatHistory.map(msg => `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`).join('\n');

  const prompt = `
    あなたは、ユーザーの生産性を最大化するための専門的なフォーカスコーチAIです。あなたは共感的で、科学的根拠に基づいた、実行可能なアドバイスを提供します。

    # あなたが利用できるユーザーデータ:
    ${sessionSummary}

    # これまでの会話:
    ${historyText}

    # ユーザーからの新しい相談:
    ${question}

    上記のデータを踏まえて、ユーザーの相談に簡潔かつ丁寧な言葉で答えてください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AIチャット応答の取得中にエラー:", error);
    return "申し訳ありません、応答を生成できませんでした。後ほどもう一度お試しください。";
  }
}
