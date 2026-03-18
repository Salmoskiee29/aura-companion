import { CharacterSelections } from './types';

const NEGATIVE_PROMPT = 'cartoon, anime, illustration, 3d render, cgi, blurry, bad anatomy, extra fingers, distorted face, watermark, text, logo, drawing, painting, digital art, concept art, sketch, comic, fantasy, surreal, abstract, deformed, ugly, duplicate, disfigured, poorly drawn, bad proportions, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, mutated hands, poorly drawn hands, poorly drawn face, AI generated looking, plastic skin, overly smooth skin, doll-like, mannequin, wax figure, uncanny valley, overprocessed, airbrushed, extreme close-up face only, over-smoothed skin, flat lighting, flat colors, low resolution, pixelated';

const REALISM_SUFFIXES: Record<string, string> = {
  standard: 'realistic photo, detailed, natural skin, taken with smartphone camera, visible skin texture',
  high: 'ultra realistic photograph, DSLR camera, natural skin texture with visible pores, fine details, professional photography, real camera bokeh, natural imperfections, slight skin blemishes, real human features',
  ultra: 'RAW photograph, hyper realistic, 85mm portrait lens f/1.8 aperture, shallow depth of field, cinematic soft lighting with natural shadows, real human skin with visible pores and fine peach fuzz hair, DSLR quality Canon EOS R5, natural imperfections and slight asymmetry, professional studio photography, 8K resolution, real person photograph, authentic candid photo quality, depth of field with bokeh background, sharp focus on subject, lifelike appearance with realistic eyes and natural makeup',
};

const MOOD_DESCRIPTORS: Record<string, string> = {
  'Flirty': 'playful and flirtatious vibe, confident body language, slight head tilt, knowing gaze',
  'Sweet': 'warm and gentle demeanor, soft approachable expression, inviting natural gaze',
  'Romantic': 'romantic and dreamy atmosphere, intimate warm gaze, tender expression, soft ambient glow',
  'Shy': 'slightly shy and bashful, gentle averted gaze, delicate posture, subtle blush',
  'Dominant': 'confident and assertive stance, powerful direct gaze, commanding presence',
  'Playful': 'fun and energetic pose, bright joyful expression, lively atmosphere, genuine smile',
  'Mysterious': 'enigmatic and alluring, subtle expression, moody atmospheric lighting, dramatic shadows',
};

const POSE_VARIATIONS = [
  'natural standing pose with relaxed shoulders',
  'relaxed casual pose with natural weight shift',
  'candid natural moment captured mid-expression',
  'natural selfie pose with slight angle',
  'leaning slightly with relaxed confident posture',
];

export function getRandomPose(): string {
  return POSE_VARIATIONS[Math.floor(Math.random() * POSE_VARIATIONS.length)];
}

function getAgeAppearance(age: number): string {
  if (age <= 22) return `${age} year old, youthful and fresh-faced appearance with age-appropriate features`;
  if (age <= 28) return `${age} year old, young adult appearance with defined mature features`;
  if (age <= 35) return `${age} year old, mature young adult appearance with refined features`;
  if (age <= 45) return `${age} year old, mature and elegant appearance with graceful features`;
  return `${age} year old, distinguished mature appearance with natural aging`;
}

export function buildPositivePrompt(s: CharacterSelections): string {
  const accessoryText = s.accessories.filter(a => a !== 'None').join(', ');
  const moodDesc = MOOD_DESCRIPTORS[s.mood] || 'natural relaxed expression';
  const ageDesc = getAgeAppearance(s.age);
  const pose = getRandomPose();

  const parts = [
    'Generate an ultra-realistic photorealistic image of a real person',
    'photographed with a high-end DSLR camera',
    `${s.shotType.toLowerCase()} portrait, professional portrait composition`,
    `of a real ${ageDesc} ${s.ethnicity.toLowerCase()} ${s.gender.toLowerCase()}`,
    `with accurate ${s.skinTone.toLowerCase()} skin tone, natural skin texture with visible pores and slight imperfections, no over-smoothing or plastic look`,
    `${s.faceShape.toLowerCase()} face shape with natural proportions`,
    `${s.eyeColor.toLowerCase()} realistic eyes with natural light reflections, detailed iris texture`,
    `${s.noseType.toLowerCase()} nose with natural contours`,
    `${s.lipsStyle.toLowerCase()} lips with natural color and texture`,
    `${s.hairLength.toLowerCase()} ${s.hairStyle.toLowerCase()} ${s.hairColor.toLowerCase()} hair with natural shine and individual strand detail`,
    `${s.bodyType.toLowerCase()} body type, ${s.height.toLowerCase()} height, natural body proportions`,
    `wearing ${s.clothingStyle.toLowerCase()} outfit with realistic fabric texture and natural wrinkles`,
    accessoryText ? `wearing ${accessoryText}` : '',
    `${s.facialExpression.toLowerCase()} expression, ${s.eyeDirection.toLowerCase()}`,
    moodDesc,
    pose,
    `in a ${s.location.toLowerCase()}, ${s.timeOfDay.toLowerCase()} atmosphere, ${s.lighting.toLowerCase()} lighting`,
    `shot from ${s.angle.toLowerCase()} angle with ${s.lens} lens at f/1.8 aperture`,
    'photorealistic ultra-detailed face and body, sharp focus, cinematic soft lighting, natural shadows',
    'depth of field with bokeh background, natural makeup, lifelike appearance',
    'real human being, authentic photograph, not AI generated',
    'the generated image MUST strictly follow all selected attributes with no deviation',
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
