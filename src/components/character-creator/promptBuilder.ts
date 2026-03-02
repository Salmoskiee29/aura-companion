import { CharacterSelections } from './types';

const NEGATIVE_PROMPT = 'cartoon, anime, illustration, 3d render, cgi, blurry, bad anatomy, extra fingers, distorted face, watermark, text, logo';

const REALISM_SUFFIXES: Record<string, string> = {
  standard: 'realistic, detailed',
  high: 'ultra realistic, DSLR photo, natural skin texture',
  ultra: 'RAW photo, hyper realistic, 85mm portrait lens, shallow depth of field, cinematic lighting',
};

export function buildPositivePrompt(s: CharacterSelections): string {
  const accessoryText = s.accessories.filter(a => a !== 'None').join(', ');

  const parts = [
    `A ${s.shotType.toLowerCase()} portrait`,
    `of a ${s.ageRange} year old ${s.ethnicity.toLowerCase()} ${s.gender.toLowerCase()}`,
    `with ${s.skinTone.toLowerCase()} skin`,
    `${s.hairLength.toLowerCase()} ${s.hairStyle.toLowerCase()} ${s.hairColor.toLowerCase()} hair`,
    `${s.bodyType.toLowerCase()} body type, ${s.height.toLowerCase()} height`,
    `wearing ${s.clothingStyle.toLowerCase()} outfit`,
    accessoryText ? `wearing ${accessoryText}` : '',
    `${s.facialExpression.toLowerCase()} expression, ${s.eyeDirection.toLowerCase()}`,
    `in a ${s.location.toLowerCase()}, ${s.timeOfDay.toLowerCase()}, ${s.lighting.toLowerCase()}`,
    `shot at ${s.angle.toLowerCase()} with ${s.lens} lens`,
    REALISM_SUFFIXES[s.realismLevel],
  ];

  return parts.filter(Boolean).join(', ');
}

export function getNegativePrompt(): string {
  return NEGATIVE_PROMPT;
}
