import { CharacterSelections } from './types';

const NEGATIVE_PROMPT = 'cartoon, anime, illustration, 3d render, cgi, blurry, bad anatomy, extra fingers, distorted face, watermark, text, logo, drawing, painting, digital art, concept art, sketch, comic, fantasy, surreal, abstract, deformed, ugly, duplicate, disfigured, poorly drawn, bad proportions, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, mutated hands, poorly drawn hands, poorly drawn face, AI generated looking, plastic skin, overly smooth skin, doll-like, mannequin, wax figure, uncanny valley, overprocessed, airbrushed, extreme close-up face only';

const REALISM_SUFFIXES: Record<string, string> = {
  standard: 'realistic photo, detailed, natural skin, taken with smartphone camera',
  high: 'ultra realistic photograph, DSLR camera, natural skin texture, pores, fine details, professional photography, real camera bokeh, natural imperfections',
  ultra: 'RAW photograph, hyper realistic, 85mm portrait lens, shallow depth of field, cinematic lighting, real human skin with pores and fine hair, DSLR quality, Canon EOS R5, natural imperfections, professional studio photography, 8K resolution, real person photograph, authentic candid photo quality',
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

const POSE_VARIATIONS = [
  'natural standing pose',
  'relaxed casual pose',
  'candid natural moment',
  'natural selfie pose',
  'leaning slightly, relaxed posture',
];

export function getRandomPose(): string {
  return POSE_VARIATIONS[Math.floor(Math.random() * POSE_VARIATIONS.length)];
}

function getAgeAppearance(age: number): string {
  if (age <= 22) return `${age} year old, youthful and fresh-faced appearance`;
  if (age <= 28) return `${age} year old, young adult appearance`;
  if (age <= 35) return `${age} year old, mature young adult appearance`;
  if (age <= 45) return `${age} year old, mature and elegant appearance`;
  return `${age} year old, distinguished mature appearance`;
}

export function buildPositivePrompt(s: CharacterSelections): string {
  const accessoryText = s.accessories.filter(a => a !== 'None').join(', ');
  const moodDesc = MOOD_DESCRIPTORS[s.mood] || 'natural relaxed expression';
  const ageDesc = getAgeAppearance(s.age);
  const pose = getRandomPose();

  const parts = [
    'A real photograph of a real person, taken with a high-end camera',
    `${s.shotType.toLowerCase()} portrait`,
    `of a real ${ageDesc} ${s.ethnicity.toLowerCase()} ${s.gender.toLowerCase()}`,
    `with ${s.skinTone.toLowerCase()} skin tone, natural skin texture with visible pores`,
    `${s.faceShape.toLowerCase()} face shape`,
    `${s.eyeColor.toLowerCase()} eyes with natural light reflections`,
    `${s.noseType.toLowerCase()} nose`,
    `${s.lipsStyle.toLowerCase()} lips`,
    `${s.hairLength.toLowerCase()} ${s.hairStyle.toLowerCase()} ${s.hairColor.toLowerCase()} hair with natural shine`,
    `${s.bodyType.toLowerCase()} body type, ${s.height.toLowerCase()} height`,
    `wearing ${s.clothingStyle.toLowerCase()} outfit with natural fabric texture`,
    accessoryText ? `wearing ${accessoryText}` : '',
    `${s.facialExpression.toLowerCase()} expression, ${s.eyeDirection.toLowerCase()}`,
    moodDesc,
    pose,
    `in a ${s.location.toLowerCase()}, ${s.timeOfDay.toLowerCase()}, ${s.lighting.toLowerCase()} lighting`,
    `shot from ${s.angle.toLowerCase()} angle with ${s.lens} lens`,
    'real human being, authentic photograph, not AI generated',
    'natural lighting, real camera depth of field, genuine photo',
    'visible skin texture, natural body proportions, real environment',
    REALISM_SUFFIXES[s.realismLevel],
  ];

  return parts.filter(Boolean).join(', ');
}

export function getNegativePrompt(): string {
  return NEGATIVE_PROMPT;
}

export function buildCharacterDescription(s: CharacterSelections): string {
  return `${s.age} year old ${s.ethnicity} ${s.gender} with ${s.skinTone} skin, ${s.faceShape} face, ${s.eyeColor} eyes, ${s.noseType} nose, ${s.lipsStyle} lips, ${s.hairLength} ${s.hairStyle} ${s.hairColor} hair, ${s.bodyType} body type. Mood: ${s.mood}.`;
}
