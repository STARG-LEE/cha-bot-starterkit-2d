// TTS — 텍스트를 음성(wav)으로 바꿔 프론트로 돌려준다.
//
// 프론트는 받은 wav를 재생하면서 동시에 Web Audio AnalyserNode로 분석해
// 아바타 입모양(viseme) blendshape를 구동한다.
//
// 업스트림 우선순위
//   1) OMNI_URL          — 자체 TTS 서버(구 미들턴 omnivoice 규격). 설정된 경우만 사용.
//   2) OPENAI_API_KEY    — OpenAI /v1/audio/speech 폴백.
//   3) 둘 다 없으면 503  — 프론트는 음성 없이 텍스트 대화만 계속한다.
//
// 주: 2026-07 서버 재편으로 루멘에는 omnivoice 라우트가 없다. 자체 TTS를 다시
// 붙이기 전까지는 OPENAI_API_KEY 를 넣어야 목소리가 나온다.

const OMNI_URL = process.env.OMNI_URL || ''
const OMNI_MODEL = process.env.OMNI_MODEL || 'omnivoice'
// 기본 음성 — omnivoice instruct 어휘 (emo_manifest 검증값).
// 본인 봇 톤에 맞춰 OMNI_INSTRUCT 환경변수로 쉽게 교체 가능.
const OMNI_INSTRUCT =
  process.env.OMNI_INSTRUCT || 'female, young adult, moderate pitch, korean accent'

const OPENAI_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts'
const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'shimmer'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  try {
    const body = req.body || {}
    const input = String(body.text || '').trim()
    if (!input) return res.status(400).json({ error: 'empty text' })

    if (!OMNI_URL && !OPENAI_KEY) {
      return res.status(503).json({
        error: 'tts not configured',
        detail: 'OMNI_URL 또는 OPENAI_API_KEY 를 설정하세요.',
      })
    }

    const upstream = OMNI_URL
      ? await fetch(OMNI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OMNI_MODEL,
            input,
            voice: 'alloy', // omnivoice는 voice 무시, instruct로 음색 제어
            response_format: 'wav',
            language: 'ko',
            instruct: body.instruct || OMNI_INSTRUCT,
          }),
        })
      : await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_TTS_MODEL,
            input,
            voice: OPENAI_TTS_VOICE,
            response_format: 'wav',
          }),
        })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '')
      return res.status(502).json({
        error: 'tts upstream error',
        status: upstream.status,
        detail: detail.slice(0, 300),
      })
    }

    const audioBuf = Buffer.from(await upstream.arrayBuffer())
    res.setHeader('Content-Type', 'audio/wav')
    return res.status(200).send(audioBuf)
  } catch (e) {
    return res.status(502).json({ error: e.message || 'tts proxy failed' })
  }
}
