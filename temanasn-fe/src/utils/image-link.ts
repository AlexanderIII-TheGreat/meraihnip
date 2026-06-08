import { SERVER_URL } from '@/const';

export const imageLink = (image: string) => {
  return `${SERVER_URL}/${image}`;
};
