// import { sanityClient } from './'; // Adjust the path as needed
import { sanityClient } from '@/sanity';
import { groq } from 'next-sanity';

export interface HomeData {
  _id: string;
  title: string;
  image: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
}

// GROQ Query to fetch all `home` documents
const homeDataQuery = groq`
  *[_type == "home"]{
    _id,
    title,
    image {
      asset->{
        _id,
        url
      }
    }
  }
`;

/**
 * Fetch all `home` data in real-time.
 */
export const fetchHomeData = async (): Promise<HomeData[]> => {
  try {
    const data: HomeData[] = await sanityClient.fetch(homeDataQuery);
    return data;
  } catch (error) {
    console.error('Error fetching home data:', error);
    throw new Error('Failed to fetch home data');
  }
};
