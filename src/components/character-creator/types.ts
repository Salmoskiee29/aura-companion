export interface CharacterSelections {
  // Appearance
  gender: string;
  ageRange: string;
  ethnicity: string;
  skinTone: string;
  // Hair
  hairColor: string;
  hairLength: string;
  hairStyle: string;
  // Body
  bodyType: string;
  height: string;
  // Outfit
  clothingStyle: string;
  clothingColor: string;
  accessories: string[];
  // Expression
  facialExpression: string;
  eyeDirection: string;
  // Environment
  location: string;
  timeOfDay: string;
  lighting: string;
  // Camera
  shotType: string;
  angle: string;
  lens: string;
  // Realism
  realismLevel: 'standard' | 'high' | 'ultra';
}

export const defaultSelections: CharacterSelections = {
  gender: 'Female',
  ageRange: '18–25',
  ethnicity: 'Caucasian',
  skinTone: 'Light',
  hairColor: 'Brown',
  hairLength: 'Long',
  hairStyle: 'Straight',
  bodyType: 'Slim',
  height: 'Average',
  clothingStyle: 'Casual',
  clothingColor: '#000000',
  accessories: ['None'],
  facialExpression: 'Soft Smile',
  eyeDirection: 'Looking at camera',
  location: 'Studio',
  timeOfDay: 'Golden hour',
  lighting: 'Soft light',
  shotType: 'Half body',
  angle: 'Eye level',
  lens: '85mm',
  realismLevel: 'high',
};

export interface OptionCategory {
  id: string;
  label: string;
  icon: string;
  options: OptionField[];
}

export interface OptionField {
  key: keyof CharacterSelections;
  label: string;
  type: 'select' | 'multi-select' | 'color';
  choices?: string[];
}
