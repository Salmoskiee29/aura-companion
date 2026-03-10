import { CharacterSelections } from './types';

const NEGATIVE_PROMPT = 'cartoon, anime, illustration, 3d render, cgi, blurry, bad anatomy, extra fingers, distorted face, watermark, text, logo, drawing, painting, digital art, concept art, sketch, comic, fantasy, surreal, abstract, deformed, ugly, duplicate, disfigured, poorly drawn, bad proportions, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, mutated hands, poorly drawn hands, poorly drawn face';

const REALISM_SUFFIXES: Record<string, string> = {
  standard: 'realistic photo, detailed, natural skin',
  high: 'ultra realistic photograph, DSLR camera, natural skin texture, pores, fine details, professional photography',
  ultra: 'RAW photograph, hyper realistic, 85mm portrait lens, shallow depth of field, cinematic lighting, real human skin with pores and fine hair, DSLR quality, Canon EOS R5, natural imperfections, professional studio photography, 8K resolution',
};

const MOOD_DESCRIPTORS: Record<string, string> = {
  'Flirty': 'playful and flirtatious vibe, confident body language, slight head tilt',
  'Sweet': 'warm and gentle demeanor, soft approachable expression, inviting gaze',
  'Romantic': 'romantic and dreamy atmosphere, intimate warm gaze, tender expression',
  'Shy': 'slightly shy and bashful, gentle averted gaze, delicate posture',
  'Dominant': 'confident and assertive stance, powerful gaze, commanding presence',
  'Playful': 'fun and energetic pose, bright joyful expression, lively atmosphere',
  'Mysterious': 'enigmatic and alluring, subtle expression, moody atmospheric lighting',
};

export function buildPositivePrompt(s: CharacterSelections): string {
  const accessoryText = s.accessories.filter(a => a !== 'None').join(', ');
  const moodDesc = MOOD_DESCRIPTORS[s.mood] || 'natural relaxed expression';

  const parts = [
    'A real photograph taken with a smartphone camera',
    `${s.shotType.toLowerCase()} portrait`,
    `of a real ${s.ageRange} year old ${s.ethnicity.toLowerCase()} ${s.gender.toLowerCase()}`,
    `with ${s.skinTone.toLowerCase()} skin tone`,
    `${s.faceShape.toLowerCase()} face shape`,
    `${s.eyeColor.toLowerCase()} eyes`,
    `${s.noseType.toLowerCase()} nose`,
    `${s.lipsStyle.toLowerCase()} lips`,
    `${s.hairLength.toLowerCase()} ${s.hairStyle.toLowerCase()} ${s.hairColor.toLowerCase()} hair`,
    `${s.bodyType.toLowerCase()} body type, ${s.height.toLowerCase()} height`,
    `wearing ${s.clothingStyle.toLowerCase()} outfit`,
    accessoryText ? `wearing ${accessoryText}` : '',
    `${s.facialExpression.toLowerCase()} expression, ${s.eyeDirection.toLowerCase()}`,
    moodDesc,
    `in a ${s.location.toLowerCase()}, ${s.timeOfDay.toLowerCase()}, ${s.lighting.toLowerCase()} lighting`,
    `shot from ${s.angle.toLowerCase()} angle with ${s.lens} lens`,
    'real human being, not AI generated looking',
    'natural skin texture with pores, real camera bokeh, authentic photo',
    REALISM_SUFFIXES[s.realismLevel],
  ];

  return parts.filter(Boolean).join(', ');
}

export function getNegativePrompt(): string {
  return NEGATIVE_PROMPT;
}

export function buildCharacterDescription(s: CharacterSelections): string {
  return `${s.ageRange} year old ${s.ethnicity} ${s.gender} with ${s.skinTone} skin, ${s.faceShape} face, ${s.eyeColor} eyes, ${s.noseType} nose, ${s.lipsStyle} lips, ${s.hairLength} ${s.hairStyle} ${s.hairColor} hair, ${s.bodyType} body type. Mood: ${s.mood}.`;
}
