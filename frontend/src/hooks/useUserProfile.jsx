import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { userApi } from '../services/api';

// 유저 프로필
export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.identifierNo) {
      userApi.getSummary()
	  	.then((result) => {
	          if (result?.data) setProfile(result.data);
	        })
        .catch((err) => console.error('추가 정보 오류:', err));
    }
  }, [user]);

  return profile;
};