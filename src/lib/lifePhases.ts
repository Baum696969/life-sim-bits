// Maps player age to a generated lifephase portrait.
import babyImg from '@/assets/phase-baby.jpg';
import childImg from '@/assets/phase-child.jpg';
import teenImg from '@/assets/phase-teen.jpg';
import youngAdultImg from '@/assets/phase-young-adult.jpg';
import adultImg from '@/assets/phase-adult.jpg';
import seniorImg from '@/assets/phase-senior.jpg';

export interface LifePhaseInfo {
  label: string;
  image: string;
  color: string;
}

export const getLifePhaseInfo = (age: number): LifePhaseInfo => {
  if (age <= 3) return { label: 'Baby', image: babyImg, color: 'text-pink-400' };
  if (age <= 12) return { label: 'Kind', image: childImg, color: 'text-blue-400' };
  if (age <= 17) return { label: 'Teenager', image: teenImg, color: 'text-purple-400' };
  if (age <= 25) return { label: 'Junger Erwachsener', image: youngAdultImg, color: 'text-green-400' };
  if (age <= 55) return { label: 'Erwachsener', image: adultImg, color: 'text-yellow-400' };
  return { label: 'Senior', image: seniorImg, color: 'text-gray-300' };
};
