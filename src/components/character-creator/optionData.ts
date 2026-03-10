import { OptionCategory } from './types';

export const categories: OptionCategory[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: '👩',
    options: [
      { key: 'gender', label: 'Gender', type: 'select', choices: ['Male', 'Female'] },
      { key: 'ageRange', label: 'Age Range', type: 'select', choices: ['18–25', '26–35', '36–45'] },
      { key: 'ethnicity', label: 'Ethnicity', type: 'select', choices: ['Asian', 'Caucasian', 'Latina', 'African', 'Middle Eastern', 'Mixed'] },
      { key: 'skinTone', label: 'Skin Tone', type: 'select', choices: ['Fair', 'Light', 'Medium', 'Tan', 'Deep'] },
      { key: 'faceShape', label: 'Face Shape', type: 'select', choices: ['Oval', 'Round', 'Heart', 'Square', 'Diamond'] },
    ],
  },
  {
    id: 'eyes',
    label: 'Eyes',
    icon: '👁️',
    options: [
      { key: 'eyeColor', label: 'Eye Color', type: 'select', choices: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber'] },
      { key: 'eyeDirection', label: 'Eye Direction', type: 'select', choices: ['Looking at camera', 'Looking away', 'Looking down'] },
    ],
  },
  {
    id: 'face',
    label: 'Face Details',
    icon: '💋',
    options: [
      { key: 'noseType', label: 'Nose Type', type: 'select', choices: ['Straight', 'Button', 'Upturned', 'Roman', 'Wide'] },
      { key: 'lipsStyle', label: 'Lips Style', type: 'select', choices: ['Full', 'Thin', 'Cupid Bow', 'Wide', 'Heart-shaped'] },
    ],
  },
  {
    id: 'hair',
    label: 'Hair',
    icon: '💇',
    options: [
      { key: 'hairColor', label: 'Hair Color', type: 'select', choices: ['Black', 'Brown', 'Blonde', 'Red', 'Silver', 'Pink', 'Auburn'] },
      { key: 'hairLength', label: 'Hair Length', type: 'select', choices: ['Short', 'Medium', 'Long'] },
      { key: 'hairStyle', label: 'Hair Style', type: 'select', choices: ['Straight', 'Wavy', 'Curly', 'Ponytail', 'Bun', 'Braided', 'Messy'] },
    ],
  },
  {
    id: 'body',
    label: 'Body',
    icon: '🧍',
    options: [
      { key: 'bodyType', label: 'Body Type', type: 'select', choices: ['Slim', 'Athletic', 'Curvy', 'Chubby'] },
      { key: 'height', label: 'Height', type: 'select', choices: ['Short', 'Average', 'Tall'] },
    ],
  },
  {
    id: 'outfit',
    label: 'Outfit',
    icon: '👗',
    options: [
      { key: 'clothingStyle', label: 'Clothing Type', type: 'select', choices: ['Casual', 'Dress', 'Bikini', 'Lingerie', 'Streetwear', 'Elegant', 'Business', 'Fantasy Armor'] },
      { key: 'clothingColor', label: 'Clothing Color', type: 'color' },
      { key: 'accessories', label: 'Accessories', type: 'multi-select', choices: ['Glasses', 'Necklace', 'Earrings', 'Hat', 'Choker', 'None'] },
    ],
  },
  {
    id: 'expression',
    label: 'Expression & Mood',
    icon: '🎭',
    options: [
      { key: 'facialExpression', label: 'Facial Expression', type: 'select', choices: ['Neutral', 'Soft Smile', 'Big Smile', 'Serious', 'Seductive', 'Laughing', 'Pouty'] },
      { key: 'mood', label: 'Mood / Vibe', type: 'select', choices: ['Flirty', 'Sweet', 'Romantic', 'Shy', 'Dominant', 'Playful', 'Mysterious'] },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: '🌆',
    options: [
      { key: 'location', label: 'Location', type: 'select', choices: ['Coffee shop', 'Bedroom', 'Studio', 'Beach', 'Office', 'City street', 'Garden', 'Rooftop'] },
      { key: 'timeOfDay', label: 'Time of Day', type: 'select', choices: ['Morning', 'Golden hour', 'Night', 'Sunset'] },
      { key: 'lighting', label: 'Lighting', type: 'select', choices: ['Soft light', 'Cinematic', 'Natural', 'Studio light', 'Warm ambient'] },
    ],
  },
  {
    id: 'camera',
    label: 'Camera',
    icon: '📷',
    options: [
      { key: 'shotType', label: 'Shot Type', type: 'select', choices: ['Close-up', 'Half body', 'Full body'] },
      { key: 'angle', label: 'Angle', type: 'select', choices: ['Eye level', 'High angle', 'Low angle', 'Selfie angle'] },
      { key: 'lens', label: 'Lens', type: 'select', choices: ['35mm', '50mm', '85mm', '135mm'] },
    ],
  },
];
