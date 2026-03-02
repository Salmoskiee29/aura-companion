import { OptionCategory } from './types';

export const categories: OptionCategory[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: '👩',
    options: [
      { key: 'gender', label: 'Gender', type: 'select', choices: ['Male', 'Female'] },
      { key: 'ageRange', label: 'Age Range', type: 'select', choices: ['18–25', '26–35', '36–45'] },
      { key: 'ethnicity', label: 'Ethnicity', type: 'select', choices: ['Asian', 'Caucasian', 'Latina', 'African', 'Mixed'] },
      { key: 'skinTone', label: 'Skin Tone', type: 'select', choices: ['Fair', 'Light', 'Medium', 'Tan', 'Deep'] },
    ],
  },
  {
    id: 'hair',
    label: 'Hair',
    icon: '💇',
    options: [
      { key: 'hairColor', label: 'Hair Color', type: 'select', choices: ['Black', 'Brown', 'Blonde', 'Red', 'Silver'] },
      { key: 'hairLength', label: 'Hair Length', type: 'select', choices: ['Short', 'Medium', 'Long'] },
      { key: 'hairStyle', label: 'Hair Style', type: 'select', choices: ['Straight', 'Wavy', 'Curly', 'Ponytail', 'Bun'] },
    ],
  },
  {
    id: 'body',
    label: 'Body',
    icon: '🧍',
    options: [
      { key: 'bodyType', label: 'Body Type', type: 'select', choices: ['Slim', 'Athletic', 'Curvy', 'Plus-size'] },
      { key: 'height', label: 'Height', type: 'select', choices: ['Short', 'Average', 'Tall'] },
    ],
  },
  {
    id: 'outfit',
    label: 'Outfit',
    icon: '👗',
    options: [
      { key: 'clothingStyle', label: 'Clothing Style', type: 'select', choices: ['Casual', 'Streetwear', 'Formal', 'Business', 'Bikini', 'Lingerie', 'Fantasy Armor'] },
      { key: 'clothingColor', label: 'Clothing Color', type: 'color' },
      { key: 'accessories', label: 'Accessories', type: 'multi-select', choices: ['Glasses', 'Necklace', 'Earrings', 'None'] },
    ],
  },
  {
    id: 'expression',
    label: 'Expression',
    icon: '🎭',
    options: [
      { key: 'facialExpression', label: 'Facial Expression', type: 'select', choices: ['Neutral', 'Soft Smile', 'Big Smile', 'Serious', 'Seductive'] },
      { key: 'eyeDirection', label: 'Eye Direction', type: 'select', choices: ['Looking at camera', 'Looking away'] },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: '🌆',
    options: [
      { key: 'location', label: 'Location', type: 'select', choices: ['Coffee shop', 'Bedroom', 'Studio', 'Beach', 'Office'] },
      { key: 'timeOfDay', label: 'Time of Day', type: 'select', choices: ['Morning', 'Golden hour', 'Night'] },
      { key: 'lighting', label: 'Lighting', type: 'select', choices: ['Soft light', 'Cinematic', 'Natural', 'Studio light'] },
    ],
  },
  {
    id: 'camera',
    label: 'Camera',
    icon: '📷',
    options: [
      { key: 'shotType', label: 'Shot Type', type: 'select', choices: ['Close-up', 'Half body', 'Full body'] },
      { key: 'angle', label: 'Angle', type: 'select', choices: ['Eye level', 'High angle', 'Low angle'] },
      { key: 'lens', label: 'Lens', type: 'select', choices: ['35mm', '50mm', '85mm'] },
    ],
  },
];
