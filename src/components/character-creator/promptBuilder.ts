import { CharacterSelections } from './types';

const NEGATIVE_PROMPT = 'low quality, blurry, soft focus, pixelated, jpeg artifacts, cartoon, anime, illustration, CGI, 3D render, plastic skin, overly smooth skin, fake texture, generic face, repeated face, duplicate identity, bad anatomy, deformed face, distorted proportions, extra limbs, missing fingers, broken hands, cross-eyed, lazy eye, poorly drawn eyes, overexposed, underexposed, bad lighting, unnatural colors, unrealistic shadows, low detail, flat lighting, watermark, text, logo, drawing, painting, digital art, concept art, sketch, comic, fantasy, surreal, abstract, deformed, ugly, duplicate, disfigured, poorly drawn, bad proportions, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, mutated hands, poorly drawn hands, poorly drawn face, AI generated looking, doll-like, mannequin, wax figure, uncanny valley, overprocessed, airbrushed, extreme close-up face only, flat colors, low resolution';

const REALISM_SUFFIXES: Record<string, string> = {
  standard: 'realistic photo, detailed, natural skin texture, taken with smartphone camera, visible skin texture, natural color grading',
  high: 'ultra realistic photograph, DSLR camera, natural skin texture with visible pores, fine details, professional photography, real camera bokeh, natural imperfections, slight skin blemishes, real human features, cinematic tone mapping',
  ultra: 'RAW photograph, hyper realistic, 85mm portrait lens f/1.8 aperture, shallow depth of field, cinematic soft lighting with natural light falloff and realistic shadows, real human skin with visible pores and fine peach fuzz hair and micro skin details, subsurface scattering, DSLR quality Canon EOS R5, natural imperfections and slight facial asymmetry, professional studio photography, 8K resolution, real person photograph, authentic candid photo quality, depth of field with realistic bokeh background, sharp focus on eyes, lifelike appearance with realistic eyes and natural makeup, cinematic tone mapping, noise-free but not over-smoothed, natural color grading, physically accurate shading',
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
  'natural standing pose with relaxed shoulders, realistic human anatomy',
  'relaxed casual pose with natural weight shift, believable body mechanics',
  'candid natural moment captured mid-expression, authentic and unposed',
  'natural selfie pose with slight angle, casual and organic feel',
  'leaning slightly with relaxed confident posture, natural weight distribution',
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
    // Core identity
    'Generate an ultra-realistic high-end professional portrait image of a unique real human person',
    'photographed with a high-end DSLR camera, shot on Canon EOS R5',
    `${s.shotType.toLowerCase()} portrait, professional composition following rule of thirds with centered subject`,

    // Character profile
    `of a real ${ageDesc} ${s.ethnicity.toLowerCase()} ${s.gender.toLowerCase()}`,

    // Appearance - skin
    `with accurate ${s.skinTone.toLowerCase()} skin tone, ultra-photorealistic natural skin texture with visible pores and micro skin details including fine lines and subtle blemishes and real human imperfections, realistic subsurface scattering, physically accurate shading, no plastic or overly smooth skin`,

    // Face - unique randomized
    `${s.faceShape.toLowerCase()} face shape with completely unique facial structure, slight natural asymmetry in features, varied jawline and cheekbones, attractive but not AI-perfect look`,

    // Eyes
    `${s.eyeColor.toLowerCase()} realistic eyes that are sharp symmetrical and lifelike with natural light reflections and detailed iris texture, sharp focus on eyes`,

    // Nose & lips
    `${s.noseType.toLowerCase()} nose with natural contours that matches head shape naturally`,
    `${s.lipsStyle.toLowerCase()} lips with natural color and texture`,

    // Hair
    `${s.hairLength.toLowerCase()} ${s.hairStyle.toLowerCase()} ${s.hairColor.toLowerCase()} hair with natural shine and individual strand detail, hairstyle matches naturally with head shape, hair color is realistic and consistent with lighting`,

    // Body
    `${s.bodyType.toLowerCase()} body type, ${s.height.toLowerCase()} height, natural body proportions, realistic human anatomy`,

    // Outfit
    `wearing ${s.clothingStyle.toLowerCase()} outfit with realistic fabric texture and natural wrinkles, outfit matches environment and lighting`,
    accessoryText ? `wearing ${accessoryText}` : '',

    // Expression & mood
    `${s.facialExpression.toLowerCase()} expression that looks natural and emotionally believable, ${s.eyeDirection.toLowerCase()}`,
    moodDesc,
    `${pose}`,

    // Environment & lighting
    `in a ${s.location.toLowerCase()}, ${s.timeOfDay.toLowerCase()} atmosphere`,
    `${s.lighting.toLowerCase()} lighting, cinematic soft lighting, natural light falloff, realistic shadows and highlights, no harsh or artificial glow`,

    // Camera settings
    `shot from ${s.angle.toLowerCase()} angle with ${s.lens} lens at f/1.8 aperture, shallow depth of field, realistic bokeh background`,

    // Image quality
    '8K resolution, extremely high detail, noise-free but not over-smoothed, natural color grading, cinematic tone mapping',

    // Realism enforcement
    'real human being, authentic photograph, not AI generated, completely unique face avoiding generic or repeated facial structures',

    // Strict compliance
    'the generated image MUST strictly follow all selected attributes with no deviation, do not override or ignore any selection',

    // Realism tier suffix
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
